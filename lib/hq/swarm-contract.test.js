import assert from "node:assert/strict";
import test from "node:test";
import { ROOM_CHANNELS, ROOM_KINDS, ROOM_SEATS } from "./swarm-contract.js";
import { isRoomDraft } from "./room-connection.js";

test("the draft roster has one id per seat", () => {
  const ids = ROOM_SEATS.map((seat) => seat.id);
  assert.deepEqual(ids, ["mark", "claude", "cursor", "codex", "grok", "gemini", "chatgpt", "crew"]);
  assert.deepEqual(ROOM_KINDS, ["chat", "baton", "decision", "evidence", "status"]);
  assert.deepEqual(ROOM_CHANNELS.map((item) => item.id), ["room", "rdusa", "jaka"]);
  assert.equal(new Set(ids).size, ids.length);
});

test("the room stays a draft until status is live", () => {
  assert.equal(isRoomDraft({}), true);
  assert.equal(isRoomDraft({ HQ_ROOM_STATUS: "live" }), false);
});
