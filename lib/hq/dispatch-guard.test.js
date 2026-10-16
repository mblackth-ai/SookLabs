import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { dispatchReplyError, replyWakesLoop } from "./dispatch-guard.js";

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

test("only a stored first reply to a dispatch wakes the loop", () => {
  const message = { id: "m1" };
  assert.equal(replyWakesLoop({ message, deduped: false }, "d1"), true);
  // Replay returns the stored reply and wakes nothing again.
  assert.equal(replyWakesLoop({ message, deduped: true }, "d1"), false);
  // Stale, expired, wrong-seat and terminal replies are rejected before anything is stored.
  for (const status of [403, 409]) {
    assert.equal(replyWakesLoop({ error: { status, error: "rejected" } }, "d1"), false);
  }
  // Ordinary room posts carry no dispatch.
  assert.equal(replyWakesLoop({ message, deduped: false }, null), false);
  assert.equal(replyWakesLoop({ message, deduped: false }, ""), false);
});

test("HTTP, MCP and native reply paths all wake through the same gate", () => {
  for (const file of ["../../app/hq/api/room/messages/route.js", "./room-mcp.js", "./swarm-router.js"]) {
    const src = readFileSync(new URL(file, import.meta.url), "utf8");
    assert.match(src, /if \(replyWakesLoop\([^)]*\)\)[^\n]*wakeFromDispatch\(/, file);
    assert.equal((src.match(/wakeFromDispatch\(/g) || []).length, 1, file);
  }
});
