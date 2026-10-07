import assert from "node:assert/strict";
import test from "node:test";
import { SKILLS } from "./loop-skills.js";
import { FRONTS, POLICY_VERSION, authorize, frontById } from "./loop-policy.js";

// Pure policy checks run everywhere. The worker tests need a throwaway Postgres:
// HQ_TEST_DATABASE_URL=postgres://... node --test lib/hq/loop.test.js
const url = process.env.HQ_TEST_DATABASE_URL;

test("policy: every allowed skill is in the catalog; sources cover the four fronts", () => {
  const ids = SKILLS.map((s) => s.id);
  assert.deepEqual(FRONTS.map((f) => f.id), ["hq-mcp", "sookly-journey", "seos-social", "rdusa-internal"]);
  for (const front of FRONTS) {
    for (const skill of front.allowedSkills) assert.ok(ids.includes(skill), `${front.id} allows unknown skill ${skill}`);
    assert.ok(front.sources.files.length >= 2);
  }
  assert.ok(!frontById("rdusa-internal").allowedSkills.includes("scoped-implementation"));
  for (const skill of SKILLS) {
    for (const field of ["id", "version", "owner", "purpose", "trigger", "capabilities", "verify", "onFailure"]) assert.ok(skill[field] !== undefined, `${skill.id}.${field}`);
  }
});

test("policy: authorize refuses unknown skills, wrong front, missing capability, revoked, changed policy", () => {
  const front = frontById("hq-mcp");
  const skill = SKILLS.find((s) => s.id === "scoped-implementation");
  const base = { front: "hq-mcp", ownerSeat: "claude", authority: { policyVersion: POLICY_VERSION } };
  assert.equal(authorize({ task: base, skill, front }).ok, true);
  assert.equal(authorize({ task: base, skill: null, front }).code, "unknown-skill");
  assert.equal(authorize({ task: { ...base, front: "rdusa-internal" }, skill, front: frontById("rdusa-internal") }).code, "skill-not-allowed");
  assert.equal(authorize({ task: { ...base, ownerSeat: "gemini" }, skill, front }).code, "invalid-capability");
  assert.equal(authorize({ task: { ...base, revoked: true }, skill, front }).code, "revoked");
  assert.equal(authorize({ task: { ...base, authority: { policyVersion: "old" } }, skill, front }).code, "authority-changed");
  assert.equal(authorize({ task: base, skill: { ...skill, gates: ["spend"] }, front }).code, "escalation");
});

function clock(start = Date.parse("2026-10-03T12:00:00Z")) {
  let t = start;
  return { now: () => new Date(t), advance: (ms) => (t += ms) };
}

function fakeIo({ clk, env = {}, ci = "pass", prs = {}, deployments = {}, http, githubFails = 0, missingPaths = [] } = {}) {
  let fails = githubFails;
  return {
    env: { HQ_SEAT_ADAPTER_CLAUDE: "pull", HQ_ROOM_CONNECTION_CLAUDE: "c", HQ_SEAT_ADAPTER_CODEX: "pull", HQ_ROOM_CONNECTION_CODEX: "x", ...env },
    now: clk.now,
    github: async (path) => {
      if (fails > 0) {
        fails -= 1;
        throw Object.assign(new Error("GitHub 502"), { status: 502 });
      }
      if (path.includes("/contents/")) return missingPaths.some((p) => path.includes(encodeURIComponent(p.split("/").pop()))) ? null : { sha: `sha-${path.length}` };
      const pr = path.match(/\/pulls\/(\d+)$/);
      if (pr) return prs[pr[1]] || null;
      if (path.includes("/deployments/") && path.includes("/statuses")) return [{ state: "success", environment_url: "https://hq.example", created_at: clk.now().toISOString() }];
      if (path.includes("/deployments")) {
        const sha = (path.match(/sha=([^&]+)/) || [])[1];
        return sha ? deployments[sha] || [] : Object.values(deployments).flat();
      }
      return null;
    },
    ciState: async () => ci,
    http: http || (async () => ({ status: 200, text: async () => "Finish Line Command Center" })),
  };
}

const opts = { skip: !url && "set HQ_TEST_DATABASE_URL" };

async function setup() {
  process.env.HQ_DATABASE_URL = url;
  const swarm = await import("./swarm-pg.js");
  await swarm.ensureSwarmSchema();
  const store = await import("./loop-store.js");
  await store.migrateLoop();
  const { default: Pg } = await import("pg");
  const admin = new Pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(
    "TRUNCATE hq_loop_tasks, hq_loop_evidence, hq_loop_events, hq_loop_effects, hq_loop_budget, hq_loop_workers, hq_loop_control, hq_room_messages, hq_room_dispatches"
  );
  const worker = await import("./loop-worker.js");
  const limits = { ...worker.loopLimits({}), stepsPerTick: 10, stepTimeoutMs: 2000 };
  const done = async () => {
    await admin.end();
    await store.closeLoopPool();
    await swarm.closeSwarmPool();
  };
  return { store, worker, admin, limits, done };
}

const task = (id, extra = {}) => ({
  id,
  front: "hq-mcp",
  title: `Task ${id}`,
  source: "test",
  ownerSeat: "claude",
  reviewerSeat: "codex",
  deliverable: "Thing",
  acceptance: { test: "It works", environment: "production", smoke: { url: "https://hq.example/room", expectText: "Finish Line" } },
  authority: { policyVersion: POLICY_VERSION, approvedBy: "mark", approvalRef: "test" },
  ...extra,
});

test("loop: triage → dispatch once → reply → evidence → review → merge → deploy → production smoke", opts, async () => {
  const { store, worker, admin, limits, done } = await setup();
  try {
    const clk = clock();
    const prs = { 19: { merged: false, head: { sha: "aaa111" } } };
    const deployments = {};
    const io = fakeIo({ clk, prs, deployments });
    await store.createTask(task("t1", { nextWakeAt: clk.now().toISOString() }));
    const run = () => worker.tick({ workerId: "w1", io, store, limits });

    let r = await run(); // triage + dispatch in one tick
    assert.deepEqual(r.steps.map((s) => s.skill), ["acceptance-gap-triage", "scoped-implementation"]);
    let t = await store.getTask("t1");
    assert.ok(t.waitingOn.startsWith("D-t1-"));
    assert.equal((await admin.query("SELECT count(*)::int n FROM hq_room_messages WHERE id LIKE 'L-t1-%'")).rows[0].n, 1);

    clk.advance(limits.waitWatchdogMs + 1);
    r = await run(); // watchdog wake: deterministic check, nothing new posted
    assert.equal(r.steps[0].skill, "wait-check");
    assert.equal((await admin.query("SELECT count(*)::int n FROM hq_room_dispatches")).rows[0].n, 1);

    // Claude replies through the room with a PR ref.
    await admin.query("INSERT INTO hq_room_messages (id, channel, seat_id, kind, body, refs, created_at) VALUES ('r1','room','claude','chat','Done in mblackth-ai/SookLabs#19','[]',now())");
    await admin.query("UPDATE hq_room_dispatches SET status='responded', reply_message_id='r1' WHERE id=$1", [t.waitingOn]);
    assert.deepEqual(await store.wakeWaitingOn(t.waitingOn), ["t1"]);
    await admin.query("UPDATE hq_loop_tasks SET next_wake_at = $1 WHERE id='t1'", [clk.now().toISOString()]);
    r = await run(); // reply → evidence → review dispatch to codex
    t = await store.getTask("t1");
    assert.deepEqual(t.refs, [{ repo: "mblackth-ai/SookLabs", pr: 19 }]);
    assert.equal(t.stage, "tested");
    const reviewDispatch = await store.getDispatch(t.waitingOn);
    assert.equal(reviewDispatch.seatId, "codex");

    await admin.query("INSERT INTO hq_room_messages (id, channel, seat_id, kind, body, refs, created_at) VALUES ('r2','room','codex','chat','APPROVE. Looks right.','[]',now())");
    await admin.query("UPDATE hq_room_dispatches SET status='responded', reply_message_id='r2' WHERE id=$1", [t.waitingOn]);
    await store.wakeWaitingOn(t.waitingOn);
    await admin.query("UPDATE hq_loop_tasks SET next_wake_at = $1 WHERE id='t1'", [clk.now().toISOString()]);
    r = await run();
    t = await store.getTask("t1");
    assert.equal(t.review.verdict, "approve");
    assert.equal(t.stage, "reviewed"); // reviewed is not merged
    assert.equal(t.status, "active");

    prs[19] = { merged: true, merge_commit_sha: "bbb222", head: { sha: "aaa111" } };
    clk.advance(31 * 60_000);
    await run();
    t = await store.getTask("t1");
    assert.equal(t.stage, "merged"); // merged is not deployed

    deployments.bbb222 = [{ id: 7, environment: "Production – sooklabs", sha: "bbb222" }];
    clk.advance(11 * 60_000);
    await run();
    t = await store.getTask("t1");
    assert.equal(t.stage, "production_accepted");
    assert.equal(t.status, "done");
    const ev = await store.listEvidence(["t1"]);
    const smoke = ev.find((e) => e.kind === "production-smoke");
    assert.equal(smoke.environment, "production");
    assert.equal(smoke.verdict, "pass");
    assert.equal(smoke.revision, "bbb222");
    assert.ok(ev.some((e) => e.kind === "ci" && e.environment === "ci" && /not production/.test(e.label)));
    assert.ok(ev.some((e) => e.kind === "deployment-record" && /not acceptance/.test(e.label)));
  } finally {
    await done();
  }
});

test("loop: stale worker cannot commit; restart recovers without a duplicate dispatch", opts, async () => {
  const { store, worker, admin, limits, done } = await setup();
  try {
    const clk = clock();
    const io = fakeIo({ clk });
    await store.createTask(task("t2", { nextSkill: "scoped-implementation", nextWakeAt: clk.now().toISOString() }));

    // Worker A claims, then "dies" before committing.
    const a = await store.claimNext({ workerId: "A", leaseMs: limits.leaseMs, now: clk.now() });
    assert.equal(a.id, "t2");
    assert.equal(await store.claimNext({ workerId: "B", leaseMs: limits.leaseMs, now: clk.now() }), null); // still leased

    clk.advance(limits.leaseMs + 1);
    const b = await store.claimNext({ workerId: "B", leaseMs: limits.leaseMs, now: clk.now() });
    assert.equal(b.fence, a.fence + 1);
    assert.equal(await store.commitStep({ id: "t2", fence: a.fence, workerId: "A", patch: { nextAction: "stale" } }), false);
    assert.equal(await store.commitStep({ id: "t2", fence: b.fence, workerId: "B", patch: { nextAction: "fresh" }, release: true }), true);

    // Crash between the side effect and the commit: the effect must not repeat.
    const crashing = { ...store, commitStep: async () => { throw new Error("process killed"); } };
    await admin.query("UPDATE hq_loop_tasks SET next_wake_at=$1 WHERE id='t2'", [clk.now().toISOString()]);
    await assert.rejects(worker.tick({ workerId: "C", io, store: crashing, limits }));
    assert.equal((await admin.query("SELECT count(*)::int n FROM hq_room_messages WHERE id LIKE 'L-t2-%'")).rows[0].n, 1);
    clk.advance(limits.leaseMs + 1);
    const r = await worker.tick({ workerId: "D", io, store, limits });
    assert.equal(r.steps[0].taskId, "t2");
    assert.equal((await admin.query("SELECT count(*)::int n FROM hq_room_messages WHERE id LIKE 'L-t2-%'")).rows[0].n, 1);
    assert.equal((await admin.query("SELECT count(*)::int n FROM hq_room_dispatches")).rows[0].n, 1);
    assert.ok((await store.getTask("t2")).waitingOn);
  } finally {
    await done();
  }
});

test("loop: one blocked front does not stall another; shared resource is exclusive", opts, async () => {
  const { store, worker, limits, done } = await setup();
  try {
    const clk = clock();
    const io = fakeIo({ clk, missingPaths: ["release-matrix.md"] });
    await store.createTask(task("sookly", { front: "sookly-journey", nextWakeAt: clk.now().toISOString(), priority: 1 }));
    await store.createTask(task("hq", { nextWakeAt: clk.now().toISOString(), priority: 2 }));
    const r = await worker.tick({ workerId: "w", io, store, limits });
    const sookly = await store.getTask("sookly");
    assert.equal(sookly.status, "blocked");
    assert.match(sookly.blocker, /Canonical source unreadable: sookly-control\/release-matrix.md/);
    assert.ok(r.steps.some((s) => s.taskId === "hq" && s.result === "active"));

    await store.createTask(task("r1", { resourceKey: "SookLabs:branch-x", nextWakeAt: clk.now().toISOString() }));
    await store.createTask(task("r2", { resourceKey: "SookLabs:branch-x", nextWakeAt: clk.now().toISOString() }));
    const first = await store.claimNext({ workerId: "a", leaseMs: 60_000, now: clk.now() });
    const second = await store.claimNext({ workerId: "b", leaseMs: 60_000, now: clk.now() });
    assert.ok(["r1", "r2", "hq"].includes(first.id));
    const claimedIds = [first?.id, second?.id];
    assert.ok(!(claimedIds.includes("r1") && claimedIds.includes("r2")), "both tasks on one branch were claimed together");
  } finally {
    await done();
  }
});

test("loop: offline seat, invalid capability, budget, pause, revoke, retry exhaustion, duplicate events, timeout, failed smoke", opts, async () => {
  const { store, worker, admin, limits, done } = await setup();
  try {
    const clk = clock();
    const due = () => clk.now().toISOString();
    const posted = async () => (await admin.query("SELECT count(*)::int n FROM hq_room_messages WHERE id LIKE 'L-%'")).rows[0].n;

    // Offline seat: nothing sent, truthful blocker.
    await store.createTask(task("off", { ownerSeat: "cursor", nextSkill: "failing-check-diagnosis", nextWakeAt: due() }));
    // Invalid capability: gemini cannot implement.
    await store.createTask(task("cap", { ownerSeat: "gemini", nextSkill: "scoped-implementation", nextWakeAt: due() }));
    // No refs: a "review" goes to the owner to route, never to the reviewer with nothing to review.
    await store.createTask(task("route", { ownerSeat: "grok", nextSkill: "review-request", nextWakeAt: due() }));
    await worker.tick({ workerId: "w", io: fakeIo({ clk }), store, limits });
    assert.match((await store.getTask("route")).blocker, /^grok is not connected/);
    assert.match((await store.getTask("off")).blocker, /cursor is not connected/);
    assert.match((await store.getTask("cap")).blocker, /^invalid-capability/);
    assert.equal(await posted(), 0);

    // Budget: one dispatch per day.
    await store.createTask(task("b1", { nextSkill: "scoped-implementation", nextWakeAt: due(), nextAction: "one" }));
    await store.createTask(task("b2", { nextSkill: "scoped-implementation", nextWakeAt: due(), nextAction: "two" }));
    await worker.tick({ workerId: "w", io: fakeIo({ clk }), store, limits: { ...limits, dispatchesPerDay: 1 } });
    const blockedByBudget = [await store.getTask("b1"), await store.getTask("b2")].filter((t) => /budget/.test(t.blocker));
    assert.equal(blockedByBudget.length, 1);
    assert.equal(await posted(), 1);

    // Pause-all stops the tick.
    await store.setControl("loop.paused", true, "mark");
    await store.createTask(task("p1", { nextWakeAt: due() }));
    assert.equal((await worker.tick({ workerId: "w", io: fakeIo({ clk }), store, limits })).paused, true);
    await store.setControl("loop.paused", false, "mark");

    // Revocation during a step rejects the worker's commit.
    const claimed = await store.claimNext({ workerId: "w", leaseMs: 60_000, now: clk.now() });
    await store.updateTask(claimed.id, { status: "blocked", blocker: "Revoked by Mark" }, { revoked: true, bumpFence: true });
    assert.equal(await store.commitStep({ id: claimed.id, fence: claimed.fence, workerId: "w", patch: { status: "active" } }), false);
    assert.equal((await store.getTask(claimed.id)).status, "blocked");

    // Retry with backoff, then exhaustion.
    await admin.query("TRUNCATE hq_loop_tasks");
    await store.createTask(task("retry", { nextWakeAt: due(), maxAttempts: 3 }));
    const flaky = fakeIo({ clk, githubFails: 99 });
    await worker.tick({ workerId: "w", io: flaky, store, limits });
    let t = await store.getTask("retry");
    assert.equal(t.attempts, 1);
    assert.equal(t.status, "active"); // a GitHub outage retries; it is not turned into a guess or a blocker yet
    const firstWake = Date.parse(t.nextWakeAt);
    clk.advance(limits.backoffMaxMs);
    await worker.tick({ workerId: "w", io: flaky, store, limits });
    t = await store.getTask("retry");
    assert.equal(t.attempts, 2);
    assert.ok(Date.parse(t.nextWakeAt) - clk.now().getTime() > firstWake - (clk.now().getTime() - limits.backoffMaxMs)); // backoff grows
    clk.advance(limits.backoffMaxMs);
    await worker.tick({ workerId: "w", io: flaky, store, limits });
    t = await store.getTask("retry");
    assert.equal(t.status, "blocked");
    assert.match(t.blocker, /Retry exhausted after 3 attempts: GitHub 502/);

    await store.createTask(task("hang", { nextSkill: "evidence-collect", refs: [{ repo: "a/b", pr: 1 }], nextWakeAt: due(), maxAttempts: 2 }));
    const hanging = { ...fakeIo({ clk }), github: () => new Promise(() => {}) };
    await worker.tick({ workerId: "w", io: hanging, store, limits: { ...limits, stepTimeoutMs: 50 } });
    t = await store.getTask("hang");
    assert.equal(t.attempts, 1);
    assert.equal(t.status, "active");
    assert.ok(Date.parse(t.nextWakeAt) >= clk.now().getTime() + limits.backoffBaseMs);
    clk.advance(limits.backoffMaxMs);
    await worker.tick({ workerId: "w", io: hanging, store, limits: { ...limits, stepTimeoutMs: 50 } });
    t = await store.getTask("hang");
    assert.equal(t.status, "blocked");
    assert.match(t.blocker, /Retry exhausted after 2 attempts: Step timed out/);

    // A GitHub rate limit waits for the reset; it neither consumes an attempt nor becomes "unreadable".
    await store.createTask(task("quota", { nextWakeAt: due(), maxAttempts: 1 }));
    const resetAt = Math.floor(clk.now().getTime() / 1000) + 1800;
    const limited = { ...fakeIo({ clk }), github: async () => { throw Object.assign(new Error("GitHub GET → 403"), { status: 403, rateLimited: true, resetAt }); } };
    await worker.tick({ workerId: "w", io: limited, store, limits });
    t = await store.getTask("quota");
    assert.equal(t.status, "active");
    assert.equal(t.attempts, 0);
    assert.ok(Date.parse(t.nextWakeAt) >= resetAt * 1000);
    assert.match(t.nextAction, /rate limit/);

    // Duplicate external events are recorded once.
    assert.equal(await store.recordEvent({ kind: "github", actor: "webhook", dedupeKey: "delivery-1" }), true);
    assert.equal(await store.recordEvent({ kind: "github", actor: "webhook", dedupeKey: "delivery-1" }), false);

    // A failing production smoke records FAIL and never becomes PASS.
    await store.createTask(task("smoke", { nextSkill: "deploy-verify", refs: [{ repo: "a/b", pr: 1 }], nextWakeAt: due() }));
    await worker.tick({ workerId: "w", io: fakeIo({ clk, http: async () => ({ status: 503, text: async () => "" }) }), store, limits });
    t = await store.getTask("smoke");
    assert.equal(t.status, "blocked");
    assert.notEqual(t.stage, "production_accepted");
    const ev = (await store.listEvidence(["smoke"])).find((e) => e.kind === "production-smoke");
    assert.equal(ev.verdict, "fail");
  } finally {
    await done();
  }
});
