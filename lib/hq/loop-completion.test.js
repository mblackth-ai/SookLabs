import assert from "node:assert/strict";
import test from "node:test";
import { advancePatterns, classifyBlocker, completionReport, isRecoverable } from "./loop-heartbeat.js";
import { POLICY_VERSION } from "./loop-policy.js";

// HQ room completion harness. The pure checks run everywhere; the end-to-end
// runs need a throwaway Postgres:
// HQ_TEST_DATABASE_URL=postgres://... node --test --test-concurrency=1 lib/hq/loop-completion.test.js
const url = process.env.HQ_TEST_DATABASE_URL;
const HALF_HOUR = 30 * 60_000;

test("heartbeat: blockers written by the worker are classified; only cleared causes are recoverable", () => {
  const limits = { dispatchesPerDay: 20, githubReadsPerDay: 2000 };
  const ctx = (env = {}, budget = {}) => ({ env, budget, limits });
  const offline = "cursor is not connected (HQ_SEAT_ADAPTER_CURSOR not set). Nothing was sent.";
  assert.equal(classifyBlocker(offline).id, "seat-not-connected");
  assert.equal(isRecoverable(offline, ctx()), false);
  assert.equal(isRecoverable(offline, ctx({ HQ_SEAT_ADAPTER_CURSOR: "pull", HQ_ROOM_CONNECTION_CURSOR: "k" })), true);

  const budget = "Daily dispatch budget (20) used; resumes tomorrow or when Mark raises HQ_LOOP_DISPATCHES_PER_DAY.";
  assert.equal(isRecoverable(budget, ctx({}, { dispatch: 20 })), false);
  assert.equal(isRecoverable(budget, ctx({}, {})), true);
  assert.equal(classifyBlocker("Daily github-read budget (2000) exhausted.").id, "github-budget");

  assert.equal(classifyBlocker("Retry exhausted after 3 attempts: GitHub 502").id, "transient-exhausted");
  assert.equal(classifyBlocker("Retry exhausted after 2 attempts: Step timed out after 20000 ms").id, "transient-exhausted");
  assert.equal(classifyBlocker("Retry exhausted after 3 attempts: GitHub GET /repos/a/b → 503").id, "transient-exhausted");
  assert.equal(classifyBlocker("Retry exhausted after 3 attempts: Unpatchable field x").id, "retry-exhausted");
  assert.equal(isRecoverable("Retry exhausted after 3 attempts: Unpatchable field x", ctx()), false);

  for (const [text, id] of [
    ["invalid-capability: gemini does not have the implement capability.", "authority"],
    ["Authority revoked by Mark.", "authority"],
    ["Production smoke failed: HTTP 503. Not retried into a PASS.", "smoke-failed"],
    ["Deployed, but the acceptance has no production smoke test. Mark must define one; deployment is not acceptance.", "smoke-undefined"],
    ["codex timed_out. No reply was invented.", "seat-dispatch-ended"],
    ["claude replied without a PR or commit ref; nothing to verify.", "reply-without-refs"],
    ["Canonical source unreadable: docs/X.md", "source-unreadable"],
    ["Something new", "other"],
  ]) {
    assert.equal(classifyBlocker(text).id, id, text);
    assert.equal(isRecoverable(text, ctx({ HQ_SEAT_ADAPTER_CURSOR: "pull", HQ_ROOM_CONNECTION_CURSOR: "k" })), false, text);
  }
});

test("completion: proposals and cancelled tasks are not counted; complete only when every counted task is production-accepted", () => {
  const t = (id, extra) => ({ id, front: "hq-mcp", refs: [], blocker: "", nextAction: "", ...extra });
  const tasks = [
    t("a", { status: "done", stage: "production_accepted" }),
    t("b", { status: "blocked", stage: "tested", blocker: "invalid-capability: x" }),
    t("c", { status: "active", stage: "working", waitingOn: "D-c" }),
    t("d", { status: "proposed", stage: "queued" }),
    t("e", { status: "cancelled", stage: "queued" }),
    t("f", { front: "seos-social", status: "blocked", stage: "queued", blocker: "codex is not connected (HQ_SEAT_ADAPTER_CODEX not set). Nothing was sent." }),
  ];
  const report = completionReport(tasks, { c: { beats: 4, since: "2026-10-03T12:00:00.000Z" } }, { stallBeats: 4, heartbeatMs: HALF_HOUR });
  assert.equal(report.counted, 4);
  assert.equal(report.accepted, 1);
  assert.equal(report.percent, 25);
  assert.equal(report.complete, false);
  assert.equal(report.proposed, 1);
  assert.deepEqual(report.needsMark.map((item) => [item.taskId, item.class]), [["b", "authority"], ["f", "seat-not-connected"]]);
  assert.deepEqual(report.stalled.map((item) => [item.taskId, item.waitsOn]), [["c", "seat"]]);
  assert.deepEqual(report.fronts.find((f) => f.front === "seos-social"), { front: "seos-social", counted: 1, accepted: 0, open: 1, blocked: 1, complete: false });

  const finished = completionReport([t("a", { status: "done", stage: "production_accepted" }), t("d", { status: "proposed", stage: "queued" })]);
  assert.equal(finished.complete, true);
  // "done" without production acceptance is not completion.
  assert.equal(completionReport([t("x", { status: "done", stage: "deployed" })]).complete, false);
  assert.equal(completionReport([]).complete, false);
});

test("self-improvement: a pattern must persist on consecutive heartbeats before it is proposed; a gap resets it", () => {
  const seen = { "class:authority": { kind: "class", cls: "authority", taskIds: ["a", "b"] } };
  let state = advancePatterns({}, seen, 10);
  assert.deepEqual(state.persistent, []);
  state = advancePatterns(state.patterns, seen, 11);
  assert.deepEqual(state.persistent, ["class:authority"]);
  const gap = advancePatterns(advancePatterns({}, seen, 10).patterns, seen, 12);
  assert.deepEqual(gap.persistent, []);
  // Once proposed, absence is counted as quiet heartbeats (the measurement).
  state.patterns["class:authority"].proposalId = "improve-x";
  let next = advancePatterns(state.patterns, {}, 12);
  assert.equal(next.patterns["class:authority"].quiet, 1);
  next = advancePatterns(next.patterns, {}, 13);
  assert.equal(next.patterns["class:authority"].quiet, 2);
  assert.deepEqual(advancePatterns(next.patterns, seen, 14).patterns["class:authority"].quiet, 0);
});

// ---- end-to-end against real Postgres ----------------------------------------

const opts = { skip: !url && "set HQ_TEST_DATABASE_URL" };
const CONNECTED = { HQ_SEAT_ADAPTER_CLAUDE: "pull", HQ_ROOM_CONNECTION_CLAUDE: "c", HQ_SEAT_ADAPTER_CODEX: "pull", HQ_ROOM_CONNECTION_CODEX: "x" };

function clock(start = Date.parse("2026-10-03T12:00:00Z")) {
  let t = start;
  return { now: () => new Date(t), advance: (ms) => (t += ms) };
}

function fakeIo({ clk, env = CONNECTED, prs = {}, deployments = {}, githubFails = 0 } = {}) {
  let fails = githubFails;
  return {
    env,
    now: clk.now,
    github: async (path) => {
      if (fails > 0) {
        fails -= 1;
        throw Object.assign(new Error("GitHub 502"), { status: 502 });
      }
      if (path.includes("/contents/")) return { sha: `sha-${path.length}` };
      const pr = path.match(/\/pulls\/(\d+)$/);
      if (pr) return prs[pr[1]] || { merged: false, head: { sha: "fff000" } };
      if (path.includes("/deployments/") && path.includes("/statuses")) return [{ state: "success", environment_url: "https://hq.example", created_at: clk.now().toISOString() }];
      if (path.includes("/deployments")) {
        const sha = (path.match(/sha=([^&]+)/) || [])[1];
        return sha ? deployments[sha] || [] : Object.values(deployments).flat();
      }
      return null;
    },
    ciState: async () => "pass",
    http: async () => ({ status: 200, text: async () => "Finish Line Command Center" }),
  };
}

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
  const count = async (sql, params) => (await admin.query(sql, params)).rows[0].n;
  const done = async () => {
    await admin.end();
    await store.closeLoopPool();
    await swarm.closeSwarmPool();
  };
  return { store, worker, admin, limits, count, done };
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

async function reply(admin, store, dispatchId, { id, seat, body }) {
  await admin.query("INSERT INTO hq_room_messages (id, channel, seat_id, kind, body, refs, created_at) VALUES ($1,'room',$2,'chat',$3,'[]',now())", [id, seat, body]);
  await admin.query("UPDATE hq_room_dispatches SET status='responded', reply_message_id=$2 WHERE id=$1", [dispatchId, id]);
  await store.wakeWaitingOn(dispatchId);
}

test("harness: one room objective, two authenticated seats, baton handoff, heartbeats, to a complete finish line", opts, async () => {
  const { store, worker, admin, limits, count, done } = await setup();
  try {
    const clk = clock();
    const prs = { 41: { merged: false, head: { sha: "aaa111" } } };
    const deployments = {};
    const io = fakeIo({ clk, prs, deployments });
    const run = (id = "w1") => worker.tick({ workerId: id, io, store, limits });
    const due = async (id) => admin.query("UPDATE hq_loop_tasks SET next_wake_at = $1 WHERE id = $2", [clk.now().toISOString(), id]);

    await store.createTask(task("goal", { nextWakeAt: clk.now().toISOString() }));
    let r = await run();
    assert.equal(r.heartbeat.percent, 0);
    assert.equal(r.heartbeat.posted, true);
    assert.deepEqual(r.steps.map((s) => s.skill), ["acceptance-gap-triage", "scoped-implementation"]);
    const hb = (await admin.query("SELECT seat_id, kind, body FROM hq_room_messages WHERE id LIKE 'HB-%'")).rows;
    assert.deepEqual(hb.map((m) => [m.seat_id, m.kind]), [["hq", "status"]]);
    assert.match(hb[0].body, /0\/1 tasks production-accepted \(0%\), 1 open/);
    assert.equal((await run("w2")).heartbeat, null); // one heartbeat per window, whichever worker claims it

    let t = await store.getTask("goal");
    await reply(admin, store, t.waitingOn, { id: "m-claude", seat: "claude", body: "Implemented in mblackth-ai/SookLabs#41" });
    await due("goal");
    await run(); // claim → evidence → review baton to the second seat
    t = await store.getTask("goal");
    const reviewDispatch = await store.getDispatch(t.waitingOn);
    assert.equal(reviewDispatch.seatId, "codex");

    await reply(admin, store, t.waitingOn, { id: "m-codex", seat: "codex", body: "APPROVE. Matches the acceptance test." });
    await due("goal");
    await run();
    assert.equal((await store.getTask("goal")).stage, "reviewed");

    prs[41] = { merged: true, merge_commit_sha: "bbb222", head: { sha: "aaa111" } };
    clk.advance(31 * 60_000);
    r = await run();
    assert.equal(r.heartbeat.complete, false);
    assert.equal((await store.getTask("goal")).stage, "merged");

    deployments.bbb222 = [{ id: 9, environment: "Production – sooklabs", sha: "bbb222" }];
    clk.advance(11 * 60_000);
    await run();
    t = await store.getTask("goal");
    assert.equal(t.stage, "production_accepted");
    assert.equal(t.status, "done");

    clk.advance(HALF_HOUR);
    r = await run();
    assert.equal(r.heartbeat.complete, true);
    assert.equal(r.heartbeat.percent, 100);
    assert.equal(r.heartbeat.posted, true);
    const last = (await admin.query("SELECT body FROM hq_room_messages WHERE id = $1", [`HB-${r.heartbeat.slot}`])).rows[0];
    assert.match(last.body, /complete\. 1\/1 tasks production-accepted/);
    clk.advance(HALF_HOUR);
    assert.equal((await run()).heartbeat.posted, false); // nothing changed: the room is not spammed

    // Audit: each seat answered only its own dispatch; the loop posted only as hq.
    const dispatches = (await admin.query("SELECT seat_id, reply_message_id FROM hq_room_dispatches ORDER BY created_at")).rows;
    assert.deepEqual(dispatches.map((d) => d.seat_id), ["claude", "codex"]);
    for (const d of dispatches) {
      assert.equal((await admin.query("SELECT seat_id FROM hq_room_messages WHERE id = $1", [d.reply_message_id])).rows[0].seat_id, d.seat_id);
    }
    assert.equal(await count("SELECT count(*)::int n FROM hq_room_messages WHERE (id LIKE 'L-%' OR id LIKE 'HB-%') AND seat_id <> 'hq'"), 0);
    const kinds = new Set((await admin.query("SELECT kind FROM hq_loop_events")).rows.map((e) => e.kind));
    for (const kind of ["heartbeat", "heartbeat-summary", "step"]) assert.ok(kinds.has(kind), kind);
    const evidence = await store.listEvidence(["goal"]);
    assert.ok(evidence.some((e) => e.kind === "production-smoke" && e.verdict === "pass" && e.revision === "bbb222"));
    assert.ok(evidence.some((e) => e.kind === "seat-reply" && /a claim, not proof/.test(e.label)));
  } finally {
    await done();
  }
});

test("heartbeat: no rest — distant wakes pulled in, cleared blockers revived, gates stay with Mark, pause respected", opts, async () => {
  const { store, worker, admin, limits, count, done } = await setup();
  try {
    const clk = clock();
    const due = () => clk.now().toISOString();
    const tomorrow = () => new Date(clk.now().getTime() + 86_400_000).toISOString();

    await store.createTask(task("flaky", { nextSkill: "evidence-collect", refs: [{ repo: "a/b", pr: 1 }], maxAttempts: 1, priority: 1, nextWakeAt: due() }));
    await store.createTask(task("seat", { ownerSeat: "cursor", nextSkill: "failing-check-diagnosis", nextWakeAt: due() }));
    await store.createTask(task("gate", { ownerSeat: "gemini", nextSkill: "scoped-implementation", nextWakeAt: due() }));
    await store.createTask(task("far", { nextWakeAt: tomorrow() }));
    await store.createTask(task("hard", { nextWakeAt: tomorrow() }));
    await store.updateTask("hard", { status: "blocked", blocker: "Retry exhausted after 3 attempts: Unpatchable field x" });

    let r = await worker.tick({ workerId: "w1", io: fakeIo({ clk, githubFails: 1 }), store, limits });
    assert.equal(r.heartbeat.woken, 1);
    assert.ok(r.steps.some((s) => s.taskId === "far"), "a task scheduled a day out ran in the heartbeat's tick");
    assert.match((await store.getTask("flaky")).blocker, /^Retry exhausted after 1 attempts: GitHub 502/);
    assert.match((await store.getTask("seat")).blocker, /^cursor is not connected/);
    assert.match((await store.getTask("gate")).blocker, /^invalid-capability/);

    // Same window: no second heartbeat, nothing revived.
    r = await worker.tick({ workerId: "w2", io: fakeIo({ clk }), store, limits });
    assert.equal(r.heartbeat, null);
    assert.equal((await store.getTask("flaky")).status, "blocked");

    // Next window: cursor is now connected and GitHub is back.
    clk.advance(HALF_HOUR);
    const env = { ...CONNECTED, HQ_SEAT_ADAPTER_CURSOR: "pull", HQ_ROOM_CONNECTION_CURSOR: "k" };
    r = await worker.tick({ workerId: "w1", io: fakeIo({ clk, env }), store, limits });
    assert.equal(r.heartbeat.revived, 2);
    const seat = await store.getTask("seat");
    assert.equal(seat.status, "active");
    assert.equal((await store.getDispatch(seat.waitingOn)).seatId, "cursor");
    const flaky = await store.getTask("flaky");
    assert.equal(flaky.status, "active");
    assert.equal(flaky.attempts, 0);
    assert.equal((await store.getTask("gate")).status, "blocked");
    assert.equal((await store.getTask("hard")).status, "blocked");
    assert.equal(await count("SELECT count(*)::int n FROM hq_loop_events WHERE kind = 'heartbeat-revive'"), 2);
    const beat = (await store.getControl("loop.heartbeat")).value;
    assert.deepEqual(beat.completion.needsMark.map((item) => [item.taskId, item.class]).sort(), [["gate", "authority"], ["hard", "retry-exhausted"]]);

    // Budget: not revived while today's budget is used; revived once it resets.
    await store.updateTask("far", { status: "blocked", blocker: "Daily dispatch budget (20) used; resumes tomorrow or when Mark raises HQ_LOOP_DISPATCHES_PER_DAY.", waitingOn: null });
    await admin.query("INSERT INTO hq_loop_budget (day, kind, used) VALUES ($1, 'dispatch', $2) ON CONFLICT (day, kind) DO UPDATE SET used = EXCLUDED.used", [new Date().toISOString().slice(0, 10), limits.dispatchesPerDay]);
    clk.advance(HALF_HOUR);
    await worker.tick({ workerId: "w1", io: fakeIo({ clk, env }), store, limits });
    assert.equal((await store.getTask("far")).status, "blocked");
    await admin.query("TRUNCATE hq_loop_budget");
    clk.advance(HALF_HOUR);
    r = await worker.tick({ workerId: "w1", io: fakeIo({ clk, env }), store, limits });
    assert.equal(r.heartbeat.revived, 1);
    assert.equal((await store.getTask("far")).status, "active");

    // Pause-all stops the heartbeat too.
    const beats = await count("SELECT count(*)::int n FROM hq_loop_events WHERE kind = 'heartbeat'");
    await store.setControl("loop.paused", true, "mark");
    clk.advance(HALF_HOUR);
    assert.equal((await worker.tick({ workerId: "w1", io: fakeIo({ clk, env }), store, limits })).paused, true);
    assert.equal(await count("SELECT count(*)::int n FROM hq_loop_events WHERE kind = 'heartbeat'"), beats);
  } finally {
    await done();
  }
});

test("heartbeat: self-improving — persistent patterns become one proposal, nothing runs until approved, then the pattern is measured; stalls are reported", opts, async () => {
  const { store, worker, admin, limits, count, done } = await setup();
  try {
    const clk = clock();
    const due = () => clk.now().toISOString();
    const io = fakeIo({ clk });
    const beat = async () => {
      const r = await worker.tick({ workerId: "w", io, store, limits });
      clk.advance(HALF_HOUR);
      return r;
    };
    const hbPosts = () => count("SELECT count(*)::int n FROM hq_room_messages WHERE id LIKE 'HB-%'");

    await store.createTask(task("g1", { ownerSeat: "gemini", nextSkill: "scoped-implementation", nextWakeAt: due() }));
    await store.createTask(task("g2", { ownerSeat: "gemini", nextSkill: "scoped-implementation", nextWakeAt: due() }));
    await store.createTask(task("slow", { nextWakeAt: due() }));

    await beat(); // S: tasks still active when the heartbeat looks; the steps block g1/g2 and dispatch "slow"
    await beat(); // S+1: "class:authority" seen once
    const r = await beat(); // S+2: seen twice → one proposal
    assert.equal(r.heartbeat.proposed, 1);
    const proposals = (await store.listTasks()).filter((t) => t.source === "heartbeat");
    assert.equal(proposals.length, 1);
    const proposal = proposals[0];
    assert.equal(proposal.status, "proposed");
    assert.match(proposal.title, /Recurring blocker "authority" on 2 tasks/);
    assert.match(proposal.acceptance.test, /no longer observes pattern "class:authority"/);
    assert.match((await admin.query("SELECT body FROM hq_room_messages WHERE id = $1", [`HB-${r.heartbeat.slot}`])).rows[0].body, new RegExp(`Proposed improvements .*${proposal.id}`));

    const posts = await hbPosts();
    const quiet = await beat(); // S+3: same report → no new proposal, no new room post
    assert.equal(quiet.heartbeat.proposed, 0);
    assert.equal(quiet.heartbeat.posted, false);
    assert.equal(await hbPosts(), posts);
    assert.equal((await store.getTask(proposal.id)).status, "proposed");
    assert.equal(await count("SELECT count(*)::int n FROM hq_room_dispatches WHERE seat_id = 'cursor'"), 0);

    // Mark approves and removes the cause (cancels the mis-owned tasks).
    await store.updateTask(proposal.id, { status: "active", nextWakeAt: due(), authority: { ...proposal.authority, approvedBy: "mark", approvalRef: "proposal approved in room", policyVersion: POLICY_VERSION } });
    await store.updateTask("g1", { status: "cancelled" });
    await store.updateTask("g2", { status: "cancelled" });
    for (let i = 0; i < 4; i += 1) await beat(); // S+4 … S+7: quiet 1 … 4
    const measured = (await admin.query("SELECT payload FROM hq_loop_events WHERE kind = 'heartbeat-measured' AND task_id = $1", [proposal.id])).rows;
    assert.equal(measured.length, 1);
    assert.equal(measured[0].payload.pass, true);
    assert.equal(measured[0].payload.quiet, 4);

    // "slow" was dispatched at S and its seat never replied: stalled after stallBeats unchanged heartbeats.
    const state = (await store.getControl("loop.heartbeat")).value;
    const stalled = state.completion.stalled.find((item) => item.taskId === "slow");
    assert.ok(stalled, "a seat that never replies shows up as stalled");
    assert.equal(stalled.waitsOn, "seat");
    assert.ok((await store.listTasks()).some((t) => t.source === "heartbeat" && /Task slow has not moved/.test(t.title)));
  } finally {
    await done();
  }
});
