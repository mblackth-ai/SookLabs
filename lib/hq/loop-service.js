import "server-only";
import { randomBytes } from "crypto";
import { readOpsData } from "./ops";
import { HEARTBEAT_STATE_KEY, completionReport } from "./loop-heartbeat.js";
import { FRONTS, POLICY_VERSION, SEAT_CAPABILITIES, sourceLinks } from "./loop-policy.js";
import { SKILLS } from "./loop-skills.js";
import * as store from "./loop-store.js";
import { defaultIo, loopLimits, tick } from "./loop-worker.js";
import { seatEnv } from "./seat-auth.js";
import { processQueued } from "./swarm-router";

// App-side entry points for the HQ loop: read model for the room panel,
// operator controls, seeding from the ops board, and wakes.

const WAKE_EXPECTED_MS = 10 * 60_000; // scheduled wake is every 5 minutes; 2 missed = stale

const OWNER_TO_SEAT = {
  "chief of staff": "grok",
  grok: "grok",
  claude: "claude",
  cursor: "cursor",
  codex: "codex",
  gemini: "gemini",
  chatgpt: "chatgpt",
};

function refsFromLinks(items = []) {
  const refs = [];
  for (const item of items) {
    const m = String(item?.url || "").match(/github\.com\/([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)\/pull\/(\d+)/);
    if (m && !refs.some((r) => r.repo === m[1] && r.pr === Number(m[2]))) refs.push({ repo: m[1], pr: Number(m[2]) });
  }
  return refs;
}

export async function loopStatus() {
  try {
    return { installed: await store.loopInstalled(), error: "" };
  } catch (error) {
    return { installed: false, error: error?.code === "no-database" ? "No database configured." : "Loop state could not be read." };
  }
}

/** Fresh read of the ops executionMode items; creates missing tasks, never edits ops or existing tasks. */
export async function seedFromOps(by) {
  const ops = await readOpsData();
  const items = ops?.workstreams?.executionMode?.items || [];
  const created = [];
  for (const item of items) {
    if (!FRONTS.some((front) => front.id === item.front)) continue;
    const task = await store.createTask({
      id: item.id,
      front: item.front,
      title: item.title,
      source: "ops-seed",
      opsItemId: item.id,
      ownerSeat: OWNER_TO_SEAT[String(item.owner || "").toLowerCase()] || "",
      reviewerSeat: "codex",
      deliverable: item.deliverable,
      acceptance: { test: item.acceptanceTest, environment: "as defined by the front's acceptance authority" },
      authority: { policyVersion: POLICY_VERSION, approvedBy: "mark", approvalRef: "ops executionMode seed (docs/HQ-MCP-CONTROL-PLANE.md)", scope: item.authority || "" },
      refs: refsFromLinks([...(item.evidence || []), ...(item.links || [])]),
      rationale: `Seeded from ops item ${item.id}: ${String(item.currentState || "").slice(0, 300)}`,
      nextAction: item.nextAction || "",
      priority: item.priority === "P0" ? 10 : 50,
    });
    if (task) created.push(task.id);
  }
  await store.recordEvent({ kind: "seed", actor: by, payload: { created, available: items.map((item) => item.id) } });
  return { created, available: items.length };
}

/** A task authorised from the room by Mark. The source message is the approval record. */
export async function createRoomTask(input, by) {
  const front = FRONTS.find((item) => item.id === input.front);
  if (!front) return { error: { status: 400, error: "Unknown front." } };
  for (const field of ["title", "deliverable", "acceptanceTest"]) {
    if (!String(input[field] || "").trim()) return { error: { status: 400, error: `${field} is required.` } };
  }
  if (input.ownerSeat && !SEAT_CAPABILITIES[input.ownerSeat]) return { error: { status: 400, error: "Owner must be an agent seat." } };
  const smoke = input.smokeUrl ? { url: String(input.smokeUrl), expectStatus: 200, expectText: String(input.smokeText || "") } : undefined;
  const id = `room-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
  const task = await store.createTask({
    id,
    front: front.id,
    title: String(input.title).slice(0, 200),
    source: "room",
    ownerSeat: input.ownerSeat || "",
    reviewerSeat: input.reviewerSeat || "codex",
    deliverable: String(input.deliverable).slice(0, 500),
    acceptance: { test: String(input.acceptanceTest).slice(0, 500), environment: String(input.environment || "production").slice(0, 80), smoke },
    authority: { policyVersion: POLICY_VERSION, approvedBy: by, approvalRef: input.sourceMessageId || "room task form", scope: String(input.scope || "Reversible work within the front's standing authority.").slice(0, 300) },
    refs: Array.isArray(input.refs) ? input.refs.filter((r) => r && r.repo && (r.pr || r.sha)).slice(0, 5) : [],
    rationale: String(input.rationale || "").slice(0, 500),
    nextAction: String(input.nextAction || "").slice(0, 300),
    resourceKey: input.resourceKey || null,
    priority: 20,
  });
  await store.recordEvent({ taskId: id, kind: "task-created", actor: by, payload: { front: front.id, approvalRef: input.sourceMessageId || "" } });
  return { task };
}

/** Agent seats propose; nothing runs until Mark approves. */
export async function proposeTask(input, seat) {
  const result = await createRoomTask({ ...input, ownerSeat: input.ownerSeat || seat }, seat);
  if (result.error) return result;
  const task = await store.updateTask(result.task.id, { status: "proposed", nextAction: "Waiting for Mark to approve this proposal." });
  return { task };
}

const ACTIONS = {
  pause: async (id) => store.updateTask(id, { nextAction: "Paused by Mark." }, { paused: true, bumpFence: true }),
  resume: async (id) => store.updateTask(id, { nextWakeAt: new Date().toISOString() }, { paused: false }),
  retry: async (id) => store.updateTask(id, { status: "active", blocker: "", nextWakeAt: new Date().toISOString() }, { resetAttempts: true, bumpFence: true }),
  cancel: async (id) => store.updateTask(id, { status: "cancelled", waitingOn: null, nextAction: "Cancelled by Mark." }, { bumpFence: true }),
  revoke: async (id) => store.updateTask(id, { status: "blocked", blocker: "Authority revoked by Mark.", waitingOn: null }, { revoked: true, bumpFence: true }),
  approve: async (id) => {
    const task = await store.getTask(id);
    if (task?.status !== "proposed") return null;
    return store.updateTask(id, { status: "active", nextWakeAt: new Date().toISOString(), authority: { ...task.authority, approvedBy: "mark", approvalRef: "proposal approved in room", policyVersion: POLICY_VERSION } });
  },
};

/** Operator control with an audit record. A repeated idempotency key is a no-op. */
export async function controlTask(id, action, by, idempotencyKey) {
  if (!ACTIONS[action]) return { error: { status: 400, error: "Unknown action." } };
  const fresh = await store.recordEvent({ taskId: id, kind: `control:${action}`, actor: by, dedupeKey: idempotencyKey ? `control:${idempotencyKey}` : null, payload: { action } });
  if (!fresh) return { task: await store.getTask(id), duplicate: true };
  const task = await ACTIONS[action](id);
  if (!task) return { error: { status: 404, error: "Task not found or not in a state for that action." } };
  return { task, duplicate: false };
}

export async function controlLoop(action, by, idempotencyKey) {
  if (!["pause-all", "resume-all"].includes(action)) return { error: { status: 400, error: "Unknown action." } };
  const fresh = await store.recordEvent({ kind: `control:${action}`, actor: by, dedupeKey: idempotencyKey ? `control:${idempotencyKey}` : null, payload: { action } });
  if (fresh) await store.setControl("loop.paused", action === "pause-all", by);
  return { paused: action === "pause-all", duplicate: !fresh };
}

/** Run one bounded tick, then push any queued seat dispatches it created. */
export async function runTick(trigger) {
  const status = await loopStatus();
  if (!status.installed) return { installed: false, note: status.error || "Loop tables are not installed (migration pending approval).", trigger };
  const deployment = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local";
  const workerId = `${trigger}:${deployment}:${randomBytes(3).toString("hex")}`;
  const summary = await tick({ workerId, host: process.env.VERCEL ? "vercel-function" : "node", io: defaultIo(await seatEnv()) });
  if (summary.steps?.some((step) => step.result === "active")) {
    await processQueued().catch(() => console.error("loop: dispatch push failed"));
  }
  return { ...summary, trigger, workerId };
}

/** Event wakes. They never throw into the caller's request. */
export async function wakeFromDispatch(dispatchId) {
  try {
    if (!(await store.loopInstalled())) return;
    const ids = await store.wakeWaitingOn(dispatchId);
    if (ids.length) await runTick("dispatch-reply");
  } catch {
    console.error("loop: dispatch wake failed");
  }
}

export async function wakeFromRepo(repo) {
  try {
    if (!(await store.loopInstalled())) return;
    const ids = await store.wakeByRepo(repo);
    if (ids.length) await runTick("github-event");
  } catch {
    console.error("loop: github wake failed");
  }
}

function heartbeatView(state, limits, now) {
  const last = state?.at ? Date.parse(state.at) : 0;
  return {
    everyMs: limits.heartbeatMs,
    lastAt: state?.at || "",
    nextDueAt: last ? new Date((Math.floor(last / limits.heartbeatMs) + 1) * limits.heartbeatMs).toISOString() : "",
    health: !last ? "never-run" : now - last > 2 * limits.heartbeatMs ? "stale" : "ok",
    last: state?.last || null,
  };
}

/** Finish-line read model for seats and Mark: the room's completion harness. */
export async function completionReadModel() {
  const status = await loopStatus();
  if (!status.installed) return { installed: false, note: status.error || "Loop tables are not installed (migration pending approval)." };
  const [tasks, beat] = await Promise.all([store.listTasks(), store.getControl(HEARTBEAT_STATE_KEY)]);
  const limits = loopLimits();
  return { installed: true, heartbeat: heartbeatView(beat?.value, limits, Date.now()), completion: completionReport(tasks, beat?.value?.tasks || {}, limits) };
}

/** Panel read model. Seats and Mark only; spectators never reach this. */
export async function boardReadModel() {
  const status = await loopStatus();
  const frontsBase = FRONTS.map((front) => ({
    id: front.id,
    name: front.name,
    goal: front.goal,
    acceptanceAuthority: front.acceptanceAuthority,
    repo: front.sources.repo,
    allowedSkills: front.allowedSkills,
    prohibited: front.prohibited,
  }));
  if (!status.installed) {
    return {
      installed: false,
      note: status.error || "The execution loop is not installed yet: Mark installs its tables with Install loop tables below. Installing does not start it.",
      policyVersion: POLICY_VERSION,
      fronts: frontsBase.map((front) => ({ ...front, sources: sourceLinks(front.id), tasks: [] })),
      skills: SKILLS.map(({ id, version, purpose }) => ({ id, version, purpose })),
    };
  }
  const [tasks, workers, budget, paused, beat] = await Promise.all([
    store.listTasks(),
    store.listWorkers(),
    store.budgetUsage(),
    store.getControl("loop.paused"),
    store.getControl(HEARTBEAT_STATE_KEY),
  ]);
  const evidence = await store.listEvidence(tasks.map((task) => task.id));
  const limits = loopLimits();
  const now = Date.now();
  const fronts = frontsBase.map((front) => {
    const frontTasks = tasks.filter((task) => task.front === front.id);
    const resolved = {};
    for (const task of frontTasks) for (const src of task.authority?.sources || []) resolved[src.path] = { sha: src.sha, status: src.status };
    return {
      ...front,
      sources: sourceLinks(front.id, resolved),
      tasks: frontTasks.map((task) => ({
        ...task,
        evidence: evidence.filter((item) => item.taskId === task.id).slice(0, 8),
      })),
    };
  });
  const latestBeat = workers[0]?.lastBeatAt ? Date.parse(workers[0].lastBeatAt) : 0;
  return {
    installed: true,
    policyVersion: POLICY_VERSION,
    paused: paused?.value === true,
    pausedBy: paused?.by || "",
    worker: {
      lastBeatAt: workers[0]?.lastBeatAt || "",
      lastWorker: workers[0]?.id || "",
      lastResult: workers[0]?.lastResult || null,
      health: !latestBeat ? "never-run" : now - latestBeat > WAKE_EXPECTED_MS ? "stale" : "ok",
    },
    heartbeat: heartbeatView(beat?.value, limits, now),
    completion: completionReport(tasks, beat?.value?.tasks || {}, limits),
    budget: {
      dispatch: { used: budget.dispatch || 0, limit: limits.dispatchesPerDay },
      githubRead: { used: budget["github-read"] || 0, limit: limits.githubReadsPerDay },
    },
    fronts,
    skills: SKILLS.map(({ id, version, purpose }) => ({ id, version, purpose })),
  };
}
