import assert from "node:assert/strict";
import test from "node:test";
import { dispatchReplyError } from "./dispatch-guard.js";

const now = Date.parse("2026-10-03T12:00:00Z");
const row = (extra = {}) => ({
  seatId: "codex", status: "thinking", attempts: 2, replyMessageId: null,
  leaseUntil: new Date(now + 1000).toISOString(), ...extra,
});
const gate = (dispatch, extra = {}) => dispatchReplyError(dispatch, { seatId: "codex", now, ...extra });

test("only the owning seat can answer, including replay", () => {
  assert.equal(gate(null).status, 403);
  assert.equal(gate(row({ seatId: "claude" })).status, 403);
  assert.equal(gate(row({ seatId: "claude", replyMessageId: "old" })).status, 403);
});
test("only active dispatches accept a first reply", () => {
  for (const status of ["queued", "failed", "offline", "timed_out", "responded", "unknown"]) {
    assert.equal(gate(row({ status })).status, 409, status);
  }
  for (const status of ["dispatching", "thinking"]) assert.equal(gate(row({ status })), null);
});
test("expired and malformed leases fail closed, legacy unleased claims still work", () => {
  for (const leaseUntil of [new Date(now).toISOString(), new Date(now - 1).toISOString(), "invalid"]) {
    assert.equal(gate(row({ leaseUntil })).status, 409);
  }
  assert.equal(gate(row({ leaseUntil: "" })), null);
});
test("native attempts are fenced; unversioned external reply contract is retained", () => {
  assert.equal(gate(row(), { expectedAttempt: 2 }), null);
  for (const expectedAttempt of [1, 3, 0, -1, 1.5, "2", NaN]) {
    assert.equal(gate(row(), { expectedAttempt }).status, 409);
  }
  assert.equal(gate(row()), null);
});
test("an owning-seat duplicate may replay its prior reply but cannot replace it", () => {
  assert.equal(gate(row({ status: "responded", replyMessageId: "old", leaseUntil: "" }), { expectedAttempt: 1 }), null);
});
