import assert from "node:assert/strict";
import test from "node:test";
import { evaluateRoomCompletion, formatRoomCompletion } from "./room-completion.js";
import { NO_REST_WINDOW_MS, gateRestHeartbeat, isRestHeartbeat, seatPresence } from "./swarm-contract.js";

const ref = {
  type: "ci",
  ref: "https://github.com/mblackth-ai/SookLabs/actions/runs/1",
  url: "https://github.com/mblackth-ai/SookLabs/actions/runs/1",
  resolves: true,
};

function completeRoom() {
  const messages = [
    { id: "m-obj", channel: "room", seatId: "mark", kind: "chat", body: "Prove the two-seat handoff.", refs: [], verified: false, baton: null, threadId: "m-obj", replyTo: null, dispatchId: null, createdAt: "2026-10-07T10:00:00.000Z" },
    { id: "r-claude", channel: "room", seatId: "claude", kind: "chat", body: "Backend slice is ready.", refs: [], verified: false, baton: null, threadId: "m-obj", replyTo: "m-obj", dispatchId: "d-claude", createdAt: "2026-10-07T10:05:00.000Z" },
    { id: "r-cursor", channel: "room", seatId: "cursor", kind: "chat", body: "I can take the baton.", refs: [], verified: false, baton: null, threadId: "m-obj", replyTo: "m-obj", dispatchId: "d-cursor", createdAt: "2026-10-07T10:06:00.000Z" },
    { id: "b-claude", channel: "room", seatId: "claude", kind: "baton", body: "@cursor Land the harness.", refs: [], verified: false, baton: { to: "cursor", status: "todo", task: "Land the harness", next: "Reply with evidence" }, threadId: "m-obj", replyTo: null, dispatchId: null, createdAt: "2026-10-07T10:07:00.000Z" },
    { id: "r-evidence", channel: "room", seatId: "cursor", kind: "evidence", body: "CI is green.", refs: [ref], verified: true, baton: null, threadId: "m-obj", replyTo: "b-claude", dispatchId: "d-baton", createdAt: "2026-10-07T10:20:00.000Z" },
  ];
  const dispatches = [
    { id: "d-claude", sourceMessageId: "m-obj", threadId: "m-obj", seatId: "claude", originSeatId: "mark", reason: "mark-default", status: "responded", replyMessageId: "r-claude" },
    { id: "d-cursor", sourceMessageId: "m-obj", threadId: "m-obj", seatId: "cursor", originSeatId: "mark", reason: "mark-default", status: "responded", replyMessageId: "r-cursor" },
    { id: "d-baton", sourceMessageId: "b-claude", threadId: "m-obj", seatId: "cursor", originSeatId: "claude", reason: "baton", status: "responded", replyMessageId: "r-evidence" },
  ];
  return { messages, dispatches };
}

test("a two-seat handoff with resolved evidence is complete and not promoted", () => {
  const report = evaluateRoomCompletion(completeRoom());
  assert.equal(report.verdict, "complete");
  assert.equal(report.productionAccepted, false);
  assert.equal(report.windowMs, 30 * 60 * 1000);
  assert.equal(report.improvement.applied, false);
  assert.equal(report.improvement.proposal, null);
  assert.ok(report.checks.every((item) => item.pass));
  assert.match(formatRoomCompletion(report), /Proposal: none/);
  assert.match(formatRoomCompletion(report), /not claimed/);
});

test("an empty room proposes the operator objective and applies nothing", () => {
  const report = evaluateRoomCompletion({});
  assert.equal(report.verdict, "incomplete");
  assert.equal(report.improvement.proposal.check, "operator-objective");
  assert.equal(report.improvement.applied, false);
  assert.equal(report.checks.find((item) => item.id === "no-rest-heartbeats").pass, true);
});

test("a rest heartbeat is the first gap, including after a 30 minute quiet stretch", () => {
  const room = completeRoom();
  room.messages.push({
    id: "rest-1",
    channel: "room",
    seatId: "cursor",
    kind: "status",
    body: "NO_REPLY",
    refs: [],
    verified: false,
    baton: null,
    threadId: "m-obj",
    replyTo: null,
    dispatchId: null,
    createdAt: "2026-10-07T10:50:00.000Z",
  });
  const report = evaluateRoomCompletion(room);
  assert.equal(report.verdict, "incomplete");
  assert.equal(report.improvement.proposal.check, "no-rest-heartbeats");
  assert.match(report.improvement.proposal.action, /30 minutes/);
});

test("a reply from the wrong seat fails the own-seat check", () => {
  const room = completeRoom();
  room.messages.find((message) => message.id === "r-claude").seatId = "cursor";
  const report = evaluateRoomCompletion(room);
  assert.equal(report.checks.find((item) => item.id === "own-seat-replies").pass, false);
});

test("verified evidence without a resolved ref does not complete", () => {
  const room = completeRoom();
  const evidence = room.messages.find((message) => message.id === "r-evidence");
  evidence.refs = [{ ...ref, resolves: false }];
  const report = evaluateRoomCompletion(room);
  assert.equal(report.checks.find((item) => item.id === "resolved-evidence").pass, false);
});

test("rest heartbeats are refused and presence holds for 30 minutes", () => {
  assert.equal(isRestHeartbeat({ kind: "status", body: "heartbeat" }), true);
  assert.equal(isRestHeartbeat({ kind: "status", body: ": ping" }), true);
  assert.equal(isRestHeartbeat({ kind: "status", body: "still here" }), true);
  assert.equal(isRestHeartbeat({ kind: "status", body: "Schema index landed." }), false);
  assert.equal(isRestHeartbeat({ kind: "chat", body: "ping" }), false);
  const refused = gateRestHeartbeat("status", "rest");
  assert.equal(refused.ok, false);
  assert.equal(refused.status, 400);
  assert.equal(gateRestHeartbeat("chat", "ping").ok, true);

  const start = Date.parse("2026-10-07T10:00:00.000Z");
  assert.equal(seatPresence(new Date(start).toISOString(), start + NO_REST_WINDOW_MS), "seen");
  assert.equal(seatPresence(new Date(start).toISOString(), start + NO_REST_WINDOW_MS + 1), "silent");
  assert.equal(seatPresence("", start), "silent");
});
