import { createHash } from "crypto";
import { adapterFor } from "./swarm-routing.js";

// HQ loop heartbeat. Once per window (HQ_LOOP_HEARTBEAT_MS, default 30 min) the
// first tick to claim the window, on any worker, makes sure no open task rests:
//
//   - an active task scheduled beyond the window is woken now;
//   - a blocked task whose cause has cleared (seat now connected, daily budget
//     reset, GitHub/network outage behind a retry exhaustion) is revived;
//   - every other blocker is classified and reported as waiting on Mark or a seat;
//   - a task whose state has not changed for HQ_LOOP_STALL_BEATS heartbeats is stalled.
//
// Self-improvement is observe → propose → (Mark approves) → measure. A pattern
// seen on consecutive heartbeats becomes a proposed loop task; nothing runs
// until Mark approves it, and the heartbeat then reports whether the pattern
// is still observed. Policy, skills and acceptance are never edited here.
//
// The completion report is the room's finish line: every counted task
// production-accepted. The room hears about it only when the report changes.

export const HEARTBEAT_STATE_KEY = "loop.heartbeat";
const OPEN_STATUSES = new Set(["active", "waiting", "blocked"]);
const PATTERN_PERSISTENCE = 2;
const QUIET_BEATS_FOR_PASS = 4;

const sha = (text) => createHash("sha256").update(text).digest("hex");

const TRANSIENT = /(?:→ |GitHub )5\d\d\b|timed out|fetch failed|ECONNRESET|ECONNREFUSED|ETIMEDOUT|socket hang up/i;

// Ordered: the first match wins. Patterns follow the blocker text the worker writes.
const BLOCKER_CLASSES = [
  { id: "seat-not-connected", match: /^(\S+) is not connected \(/, waitsOn: "mark", recover: (m, ctx) => adapterFor(m[1], ctx.env).ready },
  { id: "dispatch-budget", match: /^Daily dispatch budget/, waitsOn: "budget", recover: (_, ctx) => (ctx.budget.dispatch || 0) < ctx.limits.dispatchesPerDay },
  { id: "github-budget", match: /^Daily github-read budget/, waitsOn: "budget", recover: (_, ctx) => (ctx.budget["github-read"] || 0) < ctx.limits.githubReadsPerDay },
  { id: "transient-exhausted", match: /^Retry exhausted after \d+ attempts: /, waitsOn: "infra", transient: true, recover: () => true },
  { id: "retry-exhausted", match: /^Retry exhausted after \d+ attempts: /, waitsOn: "mark" },
  { id: "seat-dispatch-ended", match: /No reply was invented\.$/, waitsOn: "mark" },
  { id: "reply-without-refs", match: /replied without a PR or commit ref/, waitsOn: "owner" },
  { id: "source-unreadable", match: /^Canonical source unreadable/, waitsOn: "mark" },
  { id: "smoke-undefined", match: /has no production smoke test/, waitsOn: "mark" },
  { id: "smoke-not-production", match: /which is not production acceptance/, waitsOn: "mark" },
  { id: "smoke-failed", match: /smoke failed/, waitsOn: "owner" },
  { id: "no-owner", match: /^No refs, and owner/, waitsOn: "mark" },
  { id: "authority", match: /^(?:invalid-capability|skill-not-allowed|unknown-skill|unknown-front|escalation|authority-changed|revoked):|^Authority revoked/, waitsOn: "mark" },
];

/** Pure: which class a blocker belongs to. Unknown text is "other", waiting on Mark. */
export function classifyBlocker(blocker) {
  const text = String(blocker || "");
  for (const cls of BLOCKER_CLASSES) {
    const match = text.match(cls.match);
    if (!match) continue;
    if (cls.transient && !TRANSIENT.test(text)) continue;
    return { id: cls.id, waitsOn: cls.waitsOn, match, cls };
  }
  return { id: "other", waitsOn: "mark", match: null, cls: null };
}

export function isRecoverable(blocker, ctx) {
  const found = classifyBlocker(blocker);
  return Boolean(found.cls?.recover?.(found.match, ctx));
}

export function fingerprint(task) {
  return [task.status, task.stage, task.nextSkill, task.waitingOn, task.blocker, task.refs?.length || 0, task.review?.verdict || ""].join("|");
}

const isOpen = (task) => OPEN_STATUSES.has(task.status) && !task.paused && !task.revoked;
const counts = (task) => !["cancelled", "proposed"].includes(task.status);
const accepted = (task) => task.status === "done" && task.stage === "production_accepted";

function waitingOnFor(task) {
  if (task.status === "blocked") return classifyBlocker(task.blocker).waitsOn;
  if (task.waitingOn) return "seat";
  if (task.stage === "reviewed") return "mark"; // merge is Mark's
  if (task.stage === "merged") return "deploy";
  return "loop";
}

/** Pure: carry per-task fingerprints forward one heartbeat. */
export function advanceTaskState(previous = {}, tasks, at) {
  const next = {};
  for (const task of tasks.filter(isOpen)) {
    const fp = fingerprint(task);
    const prior = previous[task.id];
    next[task.id] = prior && prior.fp === fp ? { ...prior, beats: prior.beats + 1 } : { fp, since: at, beats: 0, revivals: prior?.revivals || 0 };
  }
  return next;
}

/** Pure: the finish-line read model for the room. */
export function completionReport(tasks, taskState = {}, { stallBeats = 4, heartbeatMs = 30 * 60_000 } = {}) {
  const counted = tasks.filter(counts);
  const done = counted.filter(accepted);
  const stalled = tasks
    .filter((task) => isOpen(task) && (taskState[task.id]?.beats || 0) >= stallBeats)
    .map((task) => ({
      taskId: task.id,
      front: task.front,
      since: taskState[task.id].since,
      beats: taskState[task.id].beats,
      waitsOn: waitingOnFor(task),
      detail: task.blocker || task.nextAction || "",
    }));
  const needs = tasks
    .filter((task) => isOpen(task) && task.status === "blocked")
    .map((task) => {
      const found = classifyBlocker(task.blocker);
      return { taskId: task.id, front: task.front, class: found.id, waitsOn: found.waitsOn, blocker: task.blocker };
    });
  const fronts = [...new Set(tasks.map((task) => task.front))].map((front) => {
    const mine = counted.filter((task) => task.front === front);
    const ok = mine.filter(accepted).length;
    return {
      front,
      counted: mine.length,
      accepted: ok,
      open: mine.filter(isOpen).length,
      blocked: mine.filter((task) => task.status === "blocked").length,
      complete: mine.length > 0 && ok === mine.length,
    };
  });
  return {
    complete: counted.length > 0 && done.length === counted.length,
    counted: counted.length,
    accepted: done.length,
    percent: counted.length ? Math.round((done.length / counted.length) * 100) : 0,
    open: counted.filter(isOpen).length,
    proposed: tasks.filter((task) => task.status === "proposed").length,
    fronts,
    needsMark: needs.filter((item) => item.waitsOn === "mark"),
    waitingElsewhere: needs.filter((item) => item.waitsOn !== "mark"),
    stalled,
    stallAfterMs: stallBeats * heartbeatMs,
  };
}

/** Pure: patterns observed in this heartbeat, keyed for deterministic proposals. */
export function observePatterns(report, taskState, { reviveRepeat = 3 } = {}) {
  const patterns = {};
  const byClass = {};
  for (const item of [...report.needsMark, ...report.waitingElsewhere]) (byClass[item.class] ||= []).push(item.taskId);
  for (const [cls, ids] of Object.entries(byClass)) {
    if (ids.length >= 2) patterns[`class:${cls}`] = { kind: "class", cls, taskIds: ids.sort() };
  }
  for (const item of report.stalled) patterns[`stall:${item.taskId}`] = { kind: "stall", taskIds: [item.taskId], waitsOn: item.waitsOn, detail: item.detail, since: item.since };
  for (const [id, entry] of Object.entries(taskState)) {
    if ((entry.revivals || 0) >= reviveRepeat) patterns[`revive:${id}`] = { kind: "revive", taskIds: [id], revivals: entry.revivals };
  }
  return patterns;
}

/** Pure: carry pattern history forward; returns keys that just became persistent. */
export function advancePatterns(previous = {}, observed, slot) {
  const next = {};
  const persistent = [];
  for (const [key, pattern] of Object.entries(observed)) {
    const prior = previous[key];
    const seen = prior && prior.lastSlot === slot - 1 ? prior.seen + 1 : 1;
    next[key] = { ...pattern, firstSlot: prior?.firstSlot ?? slot, lastSlot: slot, seen, quiet: 0, proposalId: prior?.proposalId || "" };
    if (seen >= PATTERN_PERSISTENCE && !next[key].proposalId) persistent.push(key);
  }
  for (const [key, prior] of Object.entries(previous)) {
    if (next[key] || !prior.proposalId) continue;
    next[key] = { ...prior, quiet: (prior.quiet || 0) + 1 };
  }
  return { patterns: next, persistent };
}

export function proposalFor(key, pattern, { heartbeatMs }) {
  const minutes = Math.round(heartbeatMs / 60_000);
  const ids = pattern.taskIds.join(", ");
  const base = {
    id: `improve-${sha(key).slice(0, 12)}`,
    front: "hq-mcp",
    source: "heartbeat",
    status: "proposed",
    ownerSeat: "cursor",
    reviewerSeat: "codex",
    nextAction: "Waiting for Mark to approve this heartbeat proposal.",
    priority: 30,
  };
  const acceptanceTail = `The loop heartbeat no longer observes pattern "${key}" for ${QUIET_BEATS_FOR_PASS} consecutive heartbeats (${QUIET_BEATS_FOR_PASS * minutes} min).`;
  const text =
    pattern.kind === "class"
      ? {
          title: `Recurring blocker "${pattern.cls}" on ${pattern.taskIds.length} tasks`,
          deliverable: `Remove the cause of "${pattern.cls}" blockers on ${ids}, or change the step that produces them.`,
        }
      : pattern.kind === "stall"
        ? {
            title: `Task ${ids} has not moved since ${pattern.since}`,
            deliverable: `Unstick ${ids} (waiting on ${pattern.waitsOn}): ${String(pattern.detail).slice(0, 200)}`,
          }
        : {
            title: `Task ${ids} keeps failing on outages (${pattern.revivals} revivals)`,
            deliverable: `Find why ${ids} keeps exhausting retries on GitHub/network errors and fix the cause.`,
          };
  return {
    ...base,
    ...text,
    acceptance: { test: acceptanceTail, environment: "production" },
    authority: { policyVersion: "", approvedBy: "", approvalRef: `heartbeat pattern ${key}`, scope: "Proposal only: nothing runs until Mark approves." },
    rationale: `Observed by the loop heartbeat on ${PATTERN_PERSISTENCE}+ consecutive heartbeats. Tasks: ${ids}.`,
  };
}

function reportDigest(report, revived, proposed) {
  return sha(
    JSON.stringify({
      p: report.percent,
      c: report.complete,
      m: report.needsMark.map((item) => `${item.taskId}:${item.class}`),
      w: report.waitingElsewhere.map((item) => `${item.taskId}:${item.class}`),
      s: report.stalled.map((item) => item.taskId),
      r: revived.map((item) => item.taskId),
      n: proposed,
    })
  ).slice(0, 16);
}

export function heartbeatMessage(report, { at, revived, proposed, measured }) {
  const time = at.slice(11, 16);
  const lines = [
    report.complete
      ? `Heartbeat ${time} UTC: complete. ${report.accepted}/${report.counted} tasks production-accepted.`
      : `Heartbeat ${time} UTC: ${report.accepted}/${report.counted} tasks production-accepted (${report.percent}%), ${report.open} open.`,
  ];
  const list = (items, fmt) => items.slice(0, 6).map(fmt).join("; ") + (items.length > 6 ? `; +${items.length - 6} more` : "");
  if (revived.length) lines.push(`Revived: ${list(revived, (item) => `${item.taskId} (${item.class})`)}.`);
  if (report.needsMark.length) lines.push(`Needs Mark: ${list(report.needsMark, (item) => `${item.taskId}: ${item.blocker.slice(0, 120)}`)}.`);
  if (report.waitingElsewhere.length) lines.push(`Waiting on ${list(report.waitingElsewhere, (item) => `${item.waitsOn} for ${item.taskId} (${item.class})`)}.`);
  if (report.stalled.length) lines.push(`Unchanged ${Math.round(report.stallAfterMs / 60_000)}+ min: ${list(report.stalled, (item) => `${item.taskId} (waiting on ${item.waitsOn})`)}.`);
  if (proposed.length) lines.push(`Proposed improvements (approve in Acceptance & Sources): ${proposed.join(", ")}.`);
  if (measured.length) lines.push(`Improvement checks: ${list(measured, (item) => `${item.taskId} ${item.observed ? "pattern still seen" : `quiet ${item.quiet}/${QUIET_BEATS_FOR_PASS}`}`)}.`);
  return lines.join("\n");
}

/**
 * One heartbeat, if this window has not had one. Returns null when another
 * worker already ran it. Callers must not run it while the loop is paused.
 */
export async function heartbeat({ io, store, limits, workerId }) {
  const now = io.now();
  const at = now.toISOString();
  const slot = Math.floor(now.getTime() / limits.heartbeatMs);
  const claimed = await store.recordEvent({ kind: "heartbeat", actor: workerId, dedupeKey: `heartbeat:${slot}`, payload: { slot } });
  if (!claimed) return null;

  const previous = (await store.getControl(HEARTBEAT_STATE_KEY))?.value || {};
  const tasks = await store.listTasks();
  const ctx = { env: io.env, budget: await store.budgetUsage(), limits };

  const woken = await store.wakeDistant({ horizon: new Date(now.getTime() + limits.heartbeatMs), now });

  const taskState = advanceTaskState(previous.tasks, tasks, at);
  const revived = [];
  for (const task of tasks.filter((item) => isOpen(item) && item.status === "blocked")) {
    if (!isRecoverable(task.blocker, ctx)) continue;
    const found = classifyBlocker(task.blocker);
    const row = await store.reviveBlocked({ id: task.id, blocker: task.blocker, now, nextAction: `Revived by the heartbeat: ${found.id} cleared.` });
    if (!row) continue;
    revived.push({ taskId: task.id, class: found.id });
    taskState[task.id] = { ...taskState[task.id], revivals: (taskState[task.id]?.revivals || 0) + 1 };
    await store.recordEvent({ taskId: task.id, kind: "heartbeat-revive", actor: workerId, payload: { class: found.id, blocker: task.blocker } });
  }

  const after = revived.length ? await store.listTasks() : tasks;
  const report = completionReport(after, taskState, { stallBeats: limits.stallBeats, heartbeatMs: limits.heartbeatMs });
  const observed = observePatterns(report, taskState);
  const { patterns, persistent } = advancePatterns(previous.patterns, observed, slot);

  const proposed = [];
  for (const key of persistent) {
    const proposal = proposalFor(key, patterns[key], limits);
    const created = await store.createTask(proposal);
    patterns[key].proposalId = proposal.id;
    if (created) {
      proposed.push(proposal.id);
      await store.recordEvent({ taskId: proposal.id, kind: "heartbeat-proposal", actor: workerId, payload: { pattern: key, taskIds: patterns[key].taskIds } });
    }
  }

  const byId = Object.fromEntries(after.map((task) => [task.id, task]));
  const measured = [];
  for (const [key, pattern] of Object.entries(patterns)) {
    const proposal = pattern.proposalId && byId[pattern.proposalId];
    if (!proposal || ["proposed", "cancelled"].includes(proposal.status)) continue;
    const item = { taskId: proposal.id, pattern: key, observed: Boolean(observed[key]), quiet: pattern.quiet || 0, pass: (pattern.quiet || 0) >= QUIET_BEATS_FOR_PASS };
    measured.push(item);
    if (item.pass && !pattern.measuredPass) {
      pattern.measuredPass = at;
      await store.recordEvent({ taskId: proposal.id, kind: "heartbeat-measured", actor: workerId, payload: item });
    }
  }
  for (const [key, pattern] of Object.entries(patterns)) {
    if (!observed[key] && pattern.proposalId && !byId[pattern.proposalId]) delete patterns[key];
  }

  const knownProposals = Object.values(patterns).map((pattern) => pattern.proposalId).filter(Boolean).sort();
  const digest = reportDigest(report, revived, knownProposals);
  let posted = false;
  if (digest !== previous.postedDigest && report.counted > 0) {
    await store.postLoopMessage({ id: `HB-${slot}`, kind: "status", body: heartbeatMessage(report, { at, revived, proposed, measured }) });
    posted = true;
  }

  const summary = { slot, at, woken: woken.length, revived, proposed, measured, posted, completion: report };
  await store.setControl(
    HEARTBEAT_STATE_KEY,
    { at, slot, worker: workerId, tasks: taskState, patterns, postedDigest: posted ? digest : previous.postedDigest || "", completion: report, last: { woken: woken.length, revived, proposed } },
    workerId
  );
  await store.recordEvent({ kind: "heartbeat-summary", actor: workerId, payload: { slot, woken: woken.length, revived, proposed, posted, percent: report.percent, complete: report.complete } });
  return summary;
}
