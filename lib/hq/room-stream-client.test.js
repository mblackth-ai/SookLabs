import assert from "node:assert/strict";
import test from "node:test";
import { parseSseDataBlock } from "./room-stream-client.js";
import { dispatchOutcomeNote } from "./dispatch-outcome.js";

test("parseSseDataBlock reads JSON message events", () => {
  const block = "event: message\ndata: {\"id\":\"m1\",\"body\":\"hi\"}\n";
  assert.deepEqual(parseSseDataBlock(block), { id: "m1", body: "hi" });
  assert.equal(parseSseDataBlock(": heartbeat\n"), null);
});

test("dispatchOutcomeNote lists offline seats with missing env names", () => {
  const note = dispatchOutcomeNote(
    [{ seatId: "cursor", status: "offline", error: "" }],
    [{ seatId: "cursor", missing: "HQ_ROOM_CONNECTION_CURSOR" }],
  );
  assert.match(note, /Cursor offline/);
  assert.match(note, /HQ_ROOM_CONNECTION_CURSOR/);
});
