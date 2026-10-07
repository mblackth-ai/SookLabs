import { createHash } from "crypto";
import { commitCiState, gh } from "./github.js";
import { heartbeat } from "./loop-heartbeat.js";
import { POLICY_VERSION, SEAT_CAPABILITIES, authorize, frontById } from "./loop-policy.js";
import { skillById } from "./loop-skills.js";
import * as realStore from "./loop-store.js";
import { adapterFor } from "./swarm-routing.js";

// HQ loop worker. One tick: claim due tasks one at a time, check authority in
// code, run one bounded step, commit only while still holding the fenced claim.
// The same tick runs from the scheduled wake (/hq/api/loop/tick), from event
// wakes, and from the standalone process (scripts/hq-loop-worker.mjs).
//
// Pattern reference (not a dependency): OpenClaw's run claim
// (activeWriterRunId / expectedWriterRunId) at openclaw/openclaw@28a6f71 —
// here the claim is the task's fence.

export function loopLimits(env = process.env) {
  const num = (key, fallback) => {
    const value = Number.parseInt(env[key] || "", 10);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  };
  // Concrete defaults: a missing setting never means unlimited.
  return {
    stepsPerTick: num("HQ_LOOP_STEPS_PER_TICK", 4),
    tickBudgetMs: num("HQ_LOOP_TICK_BUDGET_MS", 40_000),
    stepTimeoutMs: num("HQ_LOOP_STEP_TIMEOUT_MS", 20_000),
    leaseMs: num("HQ_LOOP_LEASE_MS", 60_000),
    dispatchesPerDay: num("HQ_LOOP_DISPATCHES_PER_DAY", 20),
    githubReadsPerDay: num("HQ_LOOP_GITHUB_READS_PER_DAY", 2000),
    waitWatchdogMs: num("HQ_LOOP_WAIT_WATCHDOG_MS", 30 * 60_000),
    backoffBaseMs: num("HQ_LOOP_BACKOFF_BASE_MS", 60_000),
    backoffMaxMs: num("HQ_LOOP_BACKOFF_MAX_MS", 30 * 60_000),
    heartbeatMs: num("HQ_LOOP_HEARTBEAT_MS", 30 * 60_000),
    stallBeats: num("HQ_LOOP_STALL_BEATS", 4),
  };
}

const sha256 = (text) => createHash("sha256").update(text).digest("hex").slice(0, 16);

export function defaultIo(env = process.env) {
  const token = (env.HQ_GITHUB_TOKEN || "").trim();
  return {
    env,
    now: () => new Date(),
    github: (path) => gh(path, { token }),
    ciState: (repo, sha) => commitCiState({ repo, sha, token }),
    http: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(15_000) }),
  };
}

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error(`Step timed out after ${ms} ms`), { code: "timeout" })), ms);
    }),
  ]);
}

// ---- skills ------------------------------------------------------------------

async function triage(task, ctx) {
  const front = frontById(task.front);
  const sources = [];
  for (const file of front.sources.files) {
    await ctx.budget("github-read", ctx.limits.githubReadsPerDay);
    let entry;
    try {
      const data = await ctx.io.github(`/repos/${front.sources.repo}/contents/${file.path.split("/").map(encodeURIComponent).join("/")}`);
      entry = data?.sha ? { ...file, sha: data.sha, status: "resolved" } : { ...file, sha: "", status: "missing" };
    } catch (error) {
      // Auth/permission failures are a real blocker; outages (5xx, network) retry with backoff.
      if (!error?.rateLimited && (error?.status === 401 || error?.status === 403)) entry = { ...file, sha: "", status: `unreadable (${error.status})` };
      else throw error;
    }
    sources.push({ ...entry, repo: front.sources.repo, checkedAt: ctx.io.now().toISOString() });
  }
  const authority = { ...task.authority, sources, policyVersion: task.authority.policyVersion || POLICY_VERSION };
  const missing = sources.filter((src) => src.status !== "resolved");
  const evidence = [
    {
      kind: "source-manifest",
      environment: "github",
      label: `${sources.length - missing.length}/${sources.length} canonical sources resolved`,
      verdict: missing.length ? "fail" : "pass",
      detail: { sources: sources.map(({ path, sha, status }) => ({ path, sha, status })) },
      observedAt: ctx.io.now().toISOString(),
    },
  ];
  if (missing.length) {
    return {
      patch: { authority, status: "blocked", blocker: `Canonical source unreadable: ${missing.map((m) => m.path).join(", ")}` },
      evidence,
    };
  }
  const changed = (task.authority.sources || []).some((old) => sources.find((s) => s.path === old.path)?.sha !== old.sha);
  if (changed) await ctx.event("authority-source-changed", { before: task.authority.sources, after: sources });
  return { patch: { authority, ...nextAfterTriage(task, front) }, evidence };
}

function nextAfterTriage(task, front) {
  if (task.refs.length) return { nextSkill: "evidence-collect", nextAction: "Collect CI and deployment evidence for the task's refs." };
  const caps = SEAT_CAPABILITIES[task.ownerSeat] || [];
  if (front.allowedSkills.includes("scoped-implementation") && caps.includes("implement")) {
    return { nextSkill: "scoped-implementation", nextAction: task.nextAction || `Ask ${task.ownerSeat} for the next in-scope step toward: ${task.deliverable}` };
  }
  if (task.ownerSeat && caps.includes("review") && front.allowedSkills.includes("review-request")) {
    return { nextSkill: "review-request", nextAction: `Ask ${task.ownerSeat} to route or reconcile: ${task.nextAction || task.deliverable}` };
  }
  return { status: "blocked", blocker: `No refs, and owner "${task.ownerSeat || "none"}" has no capability the front allows. Assign an owner (Mark).` };
}

async function deploymentRecord(ctx, repo, sha) {
  await ctx.budget("github-read", ctx.limits.githubReadsPerDay);
  const list = (await ctx.io.github(`/repos/${repo}/deployments?sha=${sha}&per_page=10`)) || [];
  for (const dep of list.filter((d) => /^production/i.test(d.environment || ""))) {
    await ctx.budget("github-read", ctx.limits.githubReadsPerDay);
    const statuses = (await ctx.io.github(`/repos/${repo}/deployments/${dep.id}/statuses?per_page=1`)) || [];
    if (statuses[0]) return { environment: dep.environment, state: statuses[0].state, url: statuses[0].environment_url || "", at: statuses[0].created_at };
  }
  return null;
}

async function collectEvidence(task, ctx) {
  const evidence = [];
  const now = () => ctx.io.now().toISOString();
  let anyFail = false;
  let anyPending = false;
  let merged = false;
  let deployed = false;
  let headRef = null;
  for (const ref of task.refs) {
    let sha = ref.sha || "";
    if (ref.pr) {
      await ctx.budget("github-read", ctx.limits.githubReadsPerDay);
      const pr = await ctx.io.github(`/repos/${ref.repo}/pulls/${ref.pr}`);
      if (!pr) {
        evidence.push({ kind: "ref", environment: "github", label: `${ref.repo}#${ref.pr} not found`, verdict: "fail", observedAt: now() });
        anyFail = true;
        continue;
      }
      merged = merged || pr.merged === true;
      sha = pr.merged && pr.merge_commit_sha ? pr.merge_commit_sha : pr.head.sha;
      headRef = { repo: ref.repo, pr: ref.pr, sha: pr.head.sha };
    }
    if (!sha) continue;
    await ctx.budget("github-read", ctx.limits.githubReadsPerDay);
    const ci = await ctx.io.ciState(ref.repo, sha);
    anyFail = anyFail || ci === "fail";
    anyPending = anyPending || ci === "pending";
    evidence.push({
      kind: "ci",
      environment: "ci",
      label: `CI on ${ref.repo}@${sha.slice(0, 7)}: ${ci} (CI evidence, not production)`,
      verdict: ci,
      revision: sha,
      url: `https://github.com/${ref.repo}/commit/${sha}`,
      observedAt: now(),
    });
    const record = await deploymentRecord(ctx, ref.repo, sha);
    if (record) {
      deployed = deployed || record.state === "success";
      evidence.push({
        kind: "deployment-record",
        environment: "production-record",
        label: `${record.environment}: ${record.state} for ${sha.slice(0, 7)} (deployment record, not acceptance)`,
        verdict: record.state,
        revision: sha,
        url: record.url,
        detail: { recordedAt: record.at },
        observedAt: now(),
      });
    }
  }
  const patch = { stage: task.stage };
  if (anyFail) return { patch: { ...patch, nextSkill: "failing-check-diagnosis", nextAction: "A check failed; ask the owner to diagnose.", refsHead: headRef }, evidence };
  if (anyPending) return { patch: { ...patch, nextSkill: "evidence-collect", nextAction: "CI still running; re-check." }, evidence, wakeInMs: 5 * 60_000 };
  const stage = deployed ? "deployed" : merged ? "merged" : task.review?.verdict === "approve" ? "reviewed" : "tested";
  if (!task.review && !merged) {
    return { patch: { stage, nextSkill: "review-request", nextAction: "CI green; request review before any merge." }, evidence };
  }
  if (!merged) return { patch: { stage, nextSkill: "evidence-collect", nextAction: "Reviewed; waiting for Mark's merge (re-checks on the next PR event or in 30 minutes)." }, evidence, wakeInMs: 30 * 60_000 };
  if (!deployed) return { patch: { stage, nextSkill: "evidence-collect", nextAction: "Merged; waiting for the production deployment record." }, evidence, wakeInMs: 10 * 60_000 };
  if (!task.acceptance.smoke?.url) {
    return { patch: { stage, status: "blocked", blocker: "Deployed, but the acceptance has no production smoke test. Mark must define one; deployment is not acceptance." }, evidence };
  }
  return { patch: { stage, nextSkill: "deploy-verify", nextAction: "Run the production smoke test." }, evidence };
}

const DISPATCH_PROMPT = {
  "scoped-implementation": (t) =>
    `Task ${t.id} (${t.front}): ${t.nextAction || t.deliverable}\nDeliverable: ${t.deliverable}\nAcceptance: ${t.acceptance.test || "—"} (${t.acceptance.environment || "env not set"})\nReply with refs (PR or commit) when done. Reversible, in-scope work only; merges, deploys, migrations, credentials and publishing go to Mark.`,
  "failing-check-diagnosis": (t) =>
    `Task ${t.id}: a check failed on ${t.refs.map((r) => `${r.repo}${r.pr ? `#${r.pr}` : `@${(r.sha || "").slice(0, 7)}`}`).join(", ")}. Diagnose the failure and reply with the cause and a fix ref.`,
  "review-request": (t) =>
    t.refs.length
      ? `Task ${t.id}: review ${t.refs.map((r) => `${r.repo}${r.pr ? `#${r.pr}` : `@${(r.sha || "").slice(0, 7)}`}`).join(", ")} against: ${t.acceptance.test || t.deliverable}. Reply starting with APPROVE or CHANGES.`
      : `Task ${t.id} (${t.front}) has no PR or commit yet, so there is nothing to review. As owner, route or reconcile: ${t.nextAction || t.deliverable}\nAcceptance: ${t.acceptance.test || "—"}\nReply with the ref (PR or commit) that moves it, or name the blocker.`,
};

// A review needs something to review. Without refs, the baton goes to the owner to route.
const dispatchSeat = (task, skill) => (skill.id === "review-request" && task.refs.length ? task.reviewerSeat || task.ownerSeat : task.ownerSeat);

async function dispatchSkill(task, skill, ctx) {
  const seatId = dispatchSeat(task, skill);
  const adapter = adapterFor(seatId, ctx.io.env);
  if (!adapter.ready) {
    return { patch: { status: "blocked", blocker: `${seatId} is not connected (${adapter.missing} not set). Nothing was sent.` } };
  }
  const prompt = DISPATCH_PROMPT[skill.id](task);
  const effectKey = `${skill.id}:${sha256(`${prompt}|${JSON.stringify(task.refs)}`)}`;
  const messageId = `L-${task.id}-${sha256(effectKey)}`;
  const dispatchId = `D-${task.id}-${sha256(effectKey)}`;
  const prior = await ctx.store.getEffect(task.id, effectKey);
  if (prior?.status !== "done") {
    // Reconcile before replaying: a crashed run may already have posted.
    const already = await ctx.store.roomMessageExists(messageId);
    if (!already) {
      const budget = await ctx.store.consumeBudget("dispatch", ctx.limits.dispatchesPerDay);
      if (!budget.ok) return { patch: { status: "blocked", blocker: `Daily dispatch budget (${ctx.limits.dispatchesPerDay}) used; resumes tomorrow or when Mark raises HQ_LOOP_DISPATCHES_PER_DAY.` } };
      const hold = await ctx.store.stillHolds({ id: task.id, fence: task.fence, workerId: ctx.workerId, now: ctx.io.now() });
      if (!hold.ok) throw Object.assign(new Error(`Claim lost before side effect: ${hold.reason}`), { code: "stale" });
      await ctx.store.beginEffect(task.id, effectKey, "room-dispatch");
      await ctx.store.postLoopMessage({
        id: messageId,
        body: `@${seatId} ${prompt}`,
        refs: task.refs.filter((r) => r.pr).map((r) => ({ type: "pr", ref: `${r.repo}#${r.pr}`, url: `https://github.com/${r.repo}/pull/${r.pr}` })),
        baton: { to: seatId, status: "todo", task: task.title.slice(0, 160), next: (task.nextAction || "").slice(0, 160), approval: null },
      });
    }
    await ctx.store.insertLoopDispatch({ id: dispatchId, sourceMessageId: messageId, seatId, adapter: adapter.kind, status: "queued" });
    await ctx.store.finishEffect(task.id, effectKey, dispatchId);
  }
  return {
    patch: { waitingOn: dispatchId, nextAction: `Waiting for ${seatId} on dispatch ${dispatchId}.`, stage: task.stage === "queued" ? "working" : task.stage },
    wakeInMs: ctx.limits.waitWatchdogMs,
    dispatched: { seatId, dispatchId, adapter: adapter.kind },
  };
}

const REF_PATTERN = /(?:https:\/\/github\.com\/)?([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)(?:\/pull\/|#)(\d+)/g;

function refsFromReply(reply) {
  const out = [];
  for (const ref of reply.refs || []) {
    const m = String(ref.url || ref.ref || "").match(/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)(?:\/pull\/|#)(\d+)/);
    if (m) out.push({ repo: m[1], pr: Number(m[2]) });
  }
  for (const m of String(reply.body || "").matchAll(REF_PATTERN)) out.push({ repo: m[1], pr: Number(m[2]) });
  const seen = new Set();
  return out.filter((r) => {
    const key = `${r.repo.toLowerCase()}#${r.pr}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Deterministic check of a dispatch the task is waiting on. No model call. */
async function checkWaiting(task, ctx) {
  const dispatch = await ctx.store.getDispatch(task.waitingOn);
  const now = ctx.io.now().toISOString();
  if (!dispatch) return { patch: { waitingOn: null, status: "blocked", blocker: `Dispatch ${task.waitingOn} disappeared.` } };
  if (["offline", "failed", "timed_out"].includes(dispatch.status)) {
    return { patch: { waitingOn: null, status: "blocked", blocker: `${dispatch.seatId} ${dispatch.status}${dispatch.error ? `: ${dispatch.error}` : ""}. No reply was invented.` } };
  }
  if (dispatch.status !== "responded" || !dispatch.reply) return { patch: {}, wakeInMs: ctx.limits.waitWatchdogMs, idle: true };
  const evidence = [
    { kind: "seat-reply", environment: "room", label: `Reply from ${dispatch.seatId} (a claim, not proof)`, verdict: "received", detail: { messageId: dispatch.reply.id }, observedAt: now },
  ];
  const added = refsFromReply(dispatch.reply).filter((r) => !task.refs.some((x) => x.repo.toLowerCase() === r.repo.toLowerCase() && x.pr === r.pr));
  const refs = [...task.refs, ...added];
  if (task.nextSkill === "review-request" && task.refs.length) {
    const verdict = /^\s*approve/i.test(dispatch.reply.body) ? "approve" : "changes";
    return {
      patch: { waitingOn: null, refs, review: { by: dispatch.seatId, verdict, at: dispatch.reply.createdAt, messageId: dispatch.reply.id }, nextSkill: verdict === "approve" ? "evidence-collect" : "scoped-implementation", nextAction: verdict === "approve" ? "Reviewed; re-check evidence." : "Reviewer asked for changes." },
      evidence,
    };
  }
  if (!refs.length) {
    return { patch: { waitingOn: null, status: "blocked", blocker: `${dispatch.seatId} replied without a PR or commit ref; nothing to verify.` }, evidence };
  }
  return { patch: { waitingOn: null, refs, nextSkill: "evidence-collect", nextAction: "Verify the refs from the reply." }, evidence };
}

async function deployVerify(task, ctx) {
  const smoke = task.acceptance.smoke;
  const environment = String(task.acceptance.environment || "unspecified");
  const isProduction = environment === "production";
  const observedAt = ctx.io.now().toISOString();
  let revision = "";
  for (const ref of task.refs) {
    const list = (await ctx.io.github(`/repos/${ref.repo}/deployments?per_page=20`)) || [];
    const prod = list.find((d) => /^production/i.test(d.environment || ""));
    if (prod) {
      revision = prod.sha;
      break;
    }
  }
  let status = 0;
  let ok = false;
  let reason = "";
  try {
    const res = await ctx.io.http(smoke.url, { method: "GET", headers: { "user-agent": "sooklabs-hq-loop/1" } });
    status = res.status;
    const text = smoke.expectText ? await res.text() : "";
    ok = status === (smoke.expectStatus || 200) && (!smoke.expectText || text.includes(smoke.expectText));
    if (!ok) reason = status !== (smoke.expectStatus || 200) ? `HTTP ${status}` : `"${smoke.expectText}" not found`;
  } catch (error) {
    reason = error?.name === "TimeoutError" ? "timed out" : "request failed";
  }
  const evidence = [
    {
      kind: isProduction ? "production-smoke" : "smoke",
      environment,
      label: `${isProduction ? "Production" : `${environment} (not production)`} smoke ${smoke.url}: ${ok ? "PASS" : `FAIL (${reason})`}`,
      verdict: ok ? "pass" : "fail",
      revision,
      url: smoke.url,
      detail: { status, expectStatus: smoke.expectStatus || 200, expectText: smoke.expectText || "" },
      observedAt,
    },
  ];
  if (!ok) return { patch: { status: "blocked", blocker: `${isProduction ? "Production" : environment} smoke failed: ${reason}. Not retried into a PASS.` }, evidence };
  if (!isProduction) {
    return { patch: { status: "blocked", blocker: `Smoke passed in "${environment}", which is not production acceptance. A production smoke is still required.` }, evidence };
  }
  return { patch: { stage: "production_accepted", status: "done", nextSkill: null, nextAction: task.acceptance.handoff || "Accepted in production; next action returns to the ops board." }, evidence };
}

// ---- tick --------------------------------------------------------------------

async function runStep(task, ctx) {
  const front = frontById(task.front);
  if (task.waitingOn) return checkWaiting(task, ctx);
  const skill = skillById(task.nextSkill || "acceptance-gap-triage");
  const auth = authorize({ task, skill, front });
  if (!auth.ok) return { patch: { status: "blocked", blocker: `${auth.code}: ${auth.reason}` }, refused: auth.code };
  switch (skill.id) {
    case "acceptance-gap-triage":
      return triage(task, ctx);
    case "evidence-collect":
      return collectEvidence(task, ctx);
    case "deploy-verify":
      return deployVerify(task, ctx);
    default:
      return dispatchSkill(task, skill, ctx);
  }
}

/**
 * One bounded tick. Never throws for task-level failures: each becomes a
 * fenced commit (retry with backoff, or blocked). Returns a summary.
 */
export async function tick({ workerId, host = "unknown", io = defaultIo(), store = realStore, limits = loopLimits(io.env) } = {}) {
  if (!(await store.loopInstalled())) return { installed: false, steps: [], note: "Loop tables are not installed (migration pending approval)." };
  const control = await store.getControl("loop.paused");
  if (control?.value === true) {
    await store.workerBeat({ id: workerId, host, result: { paused: true } });
    return { installed: true, paused: true, steps: [] };
  }
  const started = Date.now();
  const steps = [];
  await store.workerBeat({ id: workerId, host });
  // Before claiming, so tasks the heartbeat wakes or revives run in this same tick.
  let beat = null;
  try {
    beat = await heartbeat({ io, store, limits, workerId });
  } catch (error) {
    console.error("loop: heartbeat failed");
    beat = { error: String(error?.message || error).slice(0, 200) };
  }
  while (steps.length < limits.stepsPerTick && Date.now() - started < limits.tickBudgetMs) {
    const task = await store.claimNext({ workerId, leaseMs: limits.leaseMs, now: io.now() });
    if (!task) break;
    const ctx = {
      io,
      store,
      limits,
      workerId,
      event: (kind, payload) => store.recordEvent({ taskId: task.id, kind, actor: workerId, payload }),
      budget: async (kind, limit) => {
        const result = await store.consumeBudget(kind, limit);
        if (!result.ok) throw Object.assign(new Error(`Daily ${kind} budget (${limit}) exhausted.`), { code: "budget" });
      },
    };
    let outcome;
    try {
      outcome = await withTimeout(runStep(task, ctx), limits.stepTimeoutMs);
    } catch (error) {
      if (error?.code === "stale") {
        steps.push({ taskId: task.id, result: "stale-claim" });
        continue;
      }
      if (error?.rateLimited) {
        // A GitHub quota wait is not a failed attempt: sleep until the reset, then continue.
        const until = error.resetAt ? error.resetAt * 1000 - io.now().getTime() + 5_000 : limits.backoffMaxMs;
        outcome = { patch: { nextAction: `GitHub rate limit; resumes ${new Date(io.now().getTime() + until).toISOString()}. Set HQ_GITHUB_TOKEN for a higher limit.` }, wakeInMs: Math.max(60_000, until), idle: true };
      }
      const attempts = task.attempts + 1;
      const exhausted = attempts >= task.maxAttempts || error?.code === "budget";
      const backoff = Math.min(limits.backoffBaseMs * 2 ** (attempts - 1), limits.backoffMaxMs);
      if (!outcome) outcome = {
        patch: exhausted
          ? { attempts, status: "blocked", blocker: error?.code === "budget" ? error.message : `Retry exhausted after ${attempts} attempts: ${String(error?.message || error).slice(0, 200)}` }
          : { attempts, nextAction: `Retrying after error: ${String(error?.message || error).slice(0, 160)}` },
        wakeInMs: exhausted ? null : backoff,
        failed: true,
      };
    }
    const patch = { ...outcome.patch };
    delete patch.refsHead;
    if (!outcome.failed && !outcome.idle && patch.status !== "blocked") patch.attempts = 0;
    patch.nextWakeAt = new Date(io.now().getTime() + (outcome.wakeInMs ?? 0)).toISOString();
    if (patch.status === "blocked" || patch.status === "done") patch.nextWakeAt = new Date(io.now().getTime() + 365 * 86_400_000).toISOString();
    const committed = await store.commitStep({ id: task.id, fence: task.fence, workerId, patch, evidence: outcome.evidence || [] });
    if (!committed) {
      await store.recordEvent({ taskId: task.id, kind: "stale-commit-rejected", actor: workerId, payload: { fence: task.fence } });
      steps.push({ taskId: task.id, result: "stale-commit-rejected" });
      continue;
    }
    await store.recordEvent({
      taskId: task.id,
      kind: "step",
      actor: workerId,
      payload: { skill: task.waitingOn ? "wait-check" : task.nextSkill, status: patch.status || "active", stage: patch.stage, blocker: patch.blocker || "", dispatched: outcome.dispatched || null },
    });
    steps.push({ taskId: task.id, skill: task.waitingOn ? "wait-check" : task.nextSkill, result: patch.status || "active", blocker: patch.blocker || "" });
  }
  const summary = {
    installed: true,
    paused: false,
    steps,
    idle: steps.length === 0,
    ms: Date.now() - started,
    heartbeat: beat && (beat.error ? { error: beat.error } : { slot: beat.slot, woken: beat.woken, revived: beat.revived.length, proposed: beat.proposed.length, posted: beat.posted, percent: beat.completion.percent, complete: beat.completion.complete }),
  };
  await store.workerBeat({ id: workerId, host, result: summary });
  return summary;
}
