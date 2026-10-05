import assert from "node:assert/strict";
import test from "node:test";
import { ROOM_KINDS, ROOM_SEATS } from "./swarm-contract.js";
import { isRoomDraft } from "./room-connection.js";

test("the draft roster has one id per seat", () => {
  const ids = ROOM_SEATS.map((seat) => seat.id);
  assert.deepEqual(ids, ["mark", "claude", "cursor", "codex", "grok", "gemini", "chatgpt", "crew"]);
  assert.deepEqual(ROOM_KINDS, ["chat", "baton", "decision", "evidence", "status"]);
  assert.equal(new Set(ids).size, ids.length);
});

test("the room stays a draft until status is live", () => {
  assert.equal(isRoomDraft({}), true);
  assert.equal(isRoomDraft({ HQ_ROOM_STATUS: "live" }), false);
});

test("a dispatch reply lands in the source message's channel, whatever the replier sent", async () => {
  const { replyChannel } = await import("./swarm-contract.js");
  assert.equal(replyChannel("room", { channel: "rdusa" }), "rdusa");
  assert.equal(replyChannel("jaka", { channel: "rdusa" }), "rdusa");
  assert.equal(replyChannel("room", null), "room");
});

test("channels fail closed: only the registry is accepted, the default is room", async () => {
  const { normalizeChannel, ROOM_CHANNELS } = await import("./swarm-contract.js");
  assert.deepEqual(ROOM_CHANNELS.map((item) => item.id), ["room", "rdusa", "jaka"]);
  assert.equal(normalizeChannel(""), "room");
  assert.equal(normalizeChannel(undefined), "room");
  assert.equal(normalizeChannel(" RDUSA "), "rdusa");
  for (const bad of ["secret-room", "rdusa2", "room/../x", "a".repeat(33)]) assert.equal(normalizeChannel(bad), null, bad);
});
