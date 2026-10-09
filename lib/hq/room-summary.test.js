import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { executionBoard, seatBlockerRows, seatRows, summarizeSnapshot } from "./room-summary.js";

test("summary: finish line is labelled an estimate, and only safe fields leave", () => {
  const out = summarizeSnapshot({
    generatedAt: "2026-10-05T00:00:00Z",
    overallProgress: 71,
    fronts: [{ id: "hq-mcp", name: "HQ", progress: 60, notes: "internal" }],
    approvals: [{ id: "a1", status: "approval_required", context: "secret-ish" }],
    blockers: [{ id: "b1", title: "Blocked", ownerEmail: "x@y" }],
  });
  assert.equal(out.finishLine.percent, 71);
  assert.match(out.finishLine.basis, /estimate/i);
  assert.deepEqual(out.finishLine.fronts, [{ id: "hq-mcp", name: "HQ", progress: 60 }]);
  assert.equal(out.approvals[0].context, undefined);
  assert.deepEqual(out.blockers, [{ id: "b1", title: "Blocked", detail: "", href: "" }]);
});

test("seat blockers: worded as the room page shows them; ready seats are not blockers", () => {
  const rows = seatBlockerRows([
    { seatId: "claude", callsign: "Claude", adapter: "none", ready: false, missing: "HQ_SEAT_ADAPTER_CLAUDE" },
    { seatId: "gemini", callsign: "Gemini", adapter: "pull", ready: false, missing: "HQ_ROOM_CONNECTION_GEMINI" },
    { seatId: "codex", callsign: "Codex", adapter: "pull", ready: true, missing: "" },
  ]);
  assert.deepEqual(
    rows.map((row) => [row.seatId, row.title, row.action]),
    [
      ["claude", "Claude offline", "connect"],
      ["gemini", "Gemini connected, waiting for its key", "disconnect"],
    ]
  );
  assert.match(rows[0].detail, /HQ_SEAT_ADAPTER_CLAUDE is not set/);
});

test("seat rows carry availability, never key material", () => {
  const [row] = seatRows([{ seatId: "codex", callsign: "Codex", adapter: "pull", ready: true, online: false, lastSeenAt: "t", tokenHash: "h" }]);
  assert.deepEqual(row, { seat: "codex", callsign: "Codex", adapter: "pull", ready: true, online: false, lastSeenAt: "t", missing: "" });
});

test("execution board: the repo seed's four fronts, each with owner, next action and acceptance test", () => {
  const ops = JSON.parse(readFileSync(new URL("../../data/hq/ops.json", import.meta.url), "utf8"));
  const board = executionBoard(ops);
  assert.deepEqual(board.items.map((item) => item.front).sort(), ["hq-mcp", "rdusa-internal", "seos-social", "sookly-journey"]);
  for (const item of board.items) {
    assert.ok(item.owner && item.nextAction && item.acceptanceTest, item.id);
    assert.ok(item.nextAction.length <= 600 && item.currentState.length <= 600);
  }
  assert.deepEqual(executionBoard(ops, "seos-social").items.map((item) => item.id), ["exec-seos"]);
  assert.deepEqual(executionBoard({}).items, []);
  assert.match(executionBoard({}).note, /no execution board yet/);
});
