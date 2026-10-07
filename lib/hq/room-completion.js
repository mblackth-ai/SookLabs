// Scores a room record against the two-seat milestone.
// Observe and propose only: this module does not post, merge, or promote.

import { NO_REST_WINDOW_MS, isRestHeartbeat, roomSeat } from "./swarm-contract.js";

const LOOP = "observe -> propose -> test -> measure -> approve -> promote";

function seatIdOf(message) {
  const raw = message?.seatId || message?.seat || "";
  return roomSeat(raw)?.id || String(raw).trim().toLowerCase();
}

function isAgent(id) {
  return roomSeat(id)?.tier === "agent";
}

function isReply(message) {
  return Boolean(message?.replyTo || message?.dispatchId);
}

function objectiveOf(messages) {
  return messages
    .filter((message) => seatIdOf(message) === "mark" && !isReply(message) && (message.kind === "chat" || message.kind === "baton"))
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")))[0] || null;
}

function inThread(message, objective) {
  if (!objective) return false;
  const thread = objective.threadId || objective.id;
  return message.id === objective.id || message.threadId === thread || message.threadId === objective.id || message.replyTo === objective.id;
}

function dispatchInThread(dispatch, objective) {
  if (!objective) return false;
  const thread = objective.threadId || objective.id;
  return dispatch.sourceMessageId === objective.id || dispatch.threadId === thread || dispatch.threadId === objective.id;
}

function messageById(messages, id) {
  return messages.find((message) => message.id === id) || null;
}

function replyFor(messages, dispatch) {
  return (
    (dispatch.replyMessageId && messageById(messages, dispatch.replyMessageId)) ||
    messages.find((message) => message.dispatchId === dispatch.id) ||
    null
  );
}

function check(id, pass, evidence, proposal) {
  return { id, pass: Boolean(pass), evidence, proposal: pass ? "" : proposal };
}

function noRest(messages) {
  const found = messages.filter((message) => isRestHeartbeat(message));
  const minutes = NO_REST_WINDOW_MS / 60000;
  if (found.length) {
    return check(
      "no-rest-heartbeats",
      false,
      `Rest heartbeat posts: ${found.map((message) => message.id || seatIdOf(message)).join(", ")}.`,
      "Remove the rest heartbeat posts. Presence lasts 30 minutes after real work.",
    );
  }
  return check(
    "no-rest-heartbeats",
    true,
    `No rest heartbeats. A seat stays present for ${minutes} minutes after real work.`,
    "Remove the rest heartbeat posts. Presence lasts 30 minutes after real work.",
  );
}

function objectiveCheck(messages) {
  const objective = objectiveOf(messages);
  if (!objective) {
    return check(
      "operator-objective",
      false,
      "The room has no operator objective.",
      "Have Mark post one objective in the room channel.",
    );
  }
  return check("operator-objective", true, `Operator objective ${objective.id}.`, "Have Mark post one objective in the room channel.");
}

function assignedSeats(messages, dispatches) {
  const objective = objectiveOf(messages);
  const seats = new Set(
    dispatches
      .filter((dispatch) => objective && dispatchInThread(dispatch, objective) && isAgent(dispatch.seatId) && dispatch.status !== "offline")
      .map((dispatch) => dispatch.seatId),
  );
  return check(
    "two-authenticated-seats",
    seats.size >= 2,
    seats.size ? `Connected seats: ${[...seats].sort().join(", ")}.` : "No connected agent dispatch on the objective.",
    "Route the objective to at least two connected agent seats.",
  );
}

function ownSeatReplies(messages, dispatches) {
  const objective = objectiveOf(messages);
  const rows = dispatches.filter(
    (dispatch) => objective && dispatchInThread(dispatch, objective) && isAgent(dispatch.seatId) && dispatch.status === "responded",
  );
  const bad = rows.find((dispatch) => {
    const reply = replyFor(messages, dispatch);
    return !reply || seatIdOf(reply) !== dispatch.seatId;
  });
  const seats = new Set(rows.filter((dispatch) => seatIdOf(replyFor(messages, dispatch) || {}) === dispatch.seatId).map((dispatch) => dispatch.seatId));
  if (bad) {
    return check(
      "own-seat-replies",
      false,
      `Dispatch ${bad.id} is not answered by ${bad.seatId}.`,
      "Each assigned seat replies on its own dispatch. Do not post as another seat.",
    );
  }
  return check(
    "own-seat-replies",
    seats.size >= 2,
    seats.size ? `Replies from ${[...seats].sort().join(", ")}.` : "No agent has replied on the objective.",
    "Each assigned seat replies on its own dispatch. Do not post as another seat.",
  );
}

function sharedThread(messages, dispatches) {
  const objective = objectiveOf(messages);
  const thread = objective ? objective.threadId || objective.id : "";
  const replies = dispatches
    .filter((dispatch) => objective && dispatchInThread(dispatch, objective) && dispatch.status === "responded" && isAgent(dispatch.seatId))
    .map((dispatch) => replyFor(messages, dispatch))
    .filter(Boolean);
  const drifted = replies.find((message) => (message.channel || "room") !== "room" || (message.threadId || thread) !== thread);
  if (!objective || replies.length < 2 || drifted) {
    return check(
      "shared-room-thread",
      false,
      drifted ? `${drifted.id} left the objective thread.` : "The two replies are not both on the objective thread.",
      "Keep every reply on the objective thread in the room channel.",
    );
  }
  return check("shared-room-thread", true, `Thread ${thread} holds ${replies.length} replies.`, "Keep every reply on the objective thread in the room channel.");
}

function batonHandoff(messages, dispatches) {
  const objective = objectiveOf(messages);
  const baton = messages.find((message) => {
    const target = roomSeat(message.baton?.to)?.id || "";
    return (
      objective &&
      inThread(message, objective) &&
      message.kind === "baton" &&
      isAgent(seatIdOf(message)) &&
      target &&
      target !== seatIdOf(message) &&
      isAgent(target)
    );
  });
  const target = baton ? roomSeat(baton.baton.to).id : "";
  const dispatch = dispatches.find(
    (row) => baton && row.reason === "baton" && row.seatId === target && row.status === "responded" && row.sourceMessageId === baton.id,
  );
  const reply = dispatch ? replyFor(messages, dispatch) : null;
  const pass = Boolean(baton && dispatch && reply && seatIdOf(reply) === target);
  return check(
    "baton-handoff",
    pass,
    pass ? `${seatIdOf(baton)} handed ${baton.id} to ${target}.` : "No answered baton between two agent seats.",
    "Have one agent post a baton to the next agent, and have that seat reply on the baton dispatch.",
  );
}

function resolvedEvidence(messages) {
  const objective = objectiveOf(messages);
  const evidence = messages.filter((message) => objective && inThread(message, objective) && message.kind === "evidence");
  const falseClaim = evidence.find((message) => message.verified === true && !refsResolve(message));
  const resolved = evidence.find((message) => message.verified === true && refsResolve(message));
  if (falseClaim) {
    return check(
      "resolved-evidence",
      false,
      `${falseClaim.id} is marked verified without resolved refs.`,
      "Post evidence whose GitHub refs resolve. Unverified claims do not complete the room.",
    );
  }
  return check(
    "resolved-evidence",
    Boolean(resolved),
    resolved ? `Resolved evidence ${resolved.id}.` : "No resolved evidence on the objective thread.",
    "Post evidence whose GitHub refs resolve. Unverified claims do not complete the room.",
  );
}

function refsResolve(message) {
  return Array.isArray(message.refs) && message.refs.length > 0 && message.refs.every((ref) => ref && ref.resolves === true);
}

function auditTrail(messages, dispatches) {
  const objective = objectiveOf(messages);
  const rows = dispatches.filter((dispatch) => objective && dispatchInThread(dispatch, objective) && dispatch.status === "responded");
  const broken = rows.find((dispatch) => {
    const reply = replyFor(messages, dispatch);
    return !reply || reply.dispatchId !== dispatch.id || !reply.threadId || !reply.replyTo || !dispatch.replyMessageId;
  });
  if (!rows.length || broken) {
    return check(
      "audit-trail",
      false,
      broken ? `Dispatch ${broken.id} is missing a linked reply.` : "No responded dispatch to audit.",
      "Link each reply with replyTo, threadId, and dispatchId, and store that id on the dispatch.",
    );
  }
  return check("audit-trail", true, `${rows.length} responded dispatches link to a reply.`, "Link each reply with replyTo, threadId, and dispatchId, and store that id on the dispatch.");
}

const RUNNERS = [noRest, objectiveCheck, assignedSeats, ownSeatReplies, sharedThread, batonHandoff, resolvedEvidence, auditTrail];

export function evaluateRoomCompletion(snapshot = {}) {
  const messages = Array.isArray(snapshot.messages) ? snapshot.messages : [];
  const dispatches = Array.isArray(snapshot.dispatches) ? snapshot.dispatches : [];
  const checks = RUNNERS.map((run) => run(messages, dispatches));
  const failing = checks.filter((item) => !item.pass);
  return {
    verdict: failing.length ? "incomplete" : "complete",
    productionAccepted: false,
    windowMs: NO_REST_WINDOW_MS,
    checks,
    improvement: {
      loop: LOOP,
      applied: false,
      proposal: failing[0] ? { check: failing[0].id, action: failing[0].proposal } : null,
    },
  };
}

export function formatRoomCompletion(report) {
  const lines = [`HQ room completion: ${report.verdict}`, "Production acceptance: not claimed", ""];
  for (const item of report.checks) {
    lines.push(`[${item.pass ? "pass" : "fail"}] ${item.id}`);
    lines.push(`  ${item.evidence}`);
    if (!item.pass) lines.push(`  next: ${item.proposal}`);
  }
  lines.push("");
  lines.push(`Self-improvement: ${report.improvement.loop}`);
  lines.push("Nothing was applied or promoted.");
  lines.push(
    report.improvement.proposal
      ? `Proposal: ${report.improvement.proposal.check} — ${report.improvement.proposal.action}`
      : "Proposal: none",
  );
  return lines.join("\n");
}
