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

test("an SL baton keeps slId and a reviewer who is not the assignee", async () => {
  const { normalizeBaton } = await import("./swarm-contract.js");
  const round = normalizeBaton(
    { slId: "SL-001", to: "codex", reviewer: "claude", status: "dispatched", task: "Record the handoff", next: "Open the PR" },
    "baton"
  );
  assert.equal(round.ok, true);
  assert.equal(round.baton.slId, "SL-001");
  assert.equal(round.baton.reviewer, "claude");
  assert.equal(round.baton.to, "codex");
  const same = normalizeBaton(
    { slId: "SL-001", to: "codex", reviewer: "codex", status: "dispatched", task: "Record the handoff", next: "Open the PR" },
    "baton"
  );
  assert.equal(same.ok, false);
  assert.equal(same.status, 400);
});

test("channels fail closed: only the registry is accepted, the default is room", async () => {
  const { normalizeChannel, ROOM_CHANNELS } = await import("./swarm-contract.js");
  assert.deepEqual(ROOM_CHANNELS.map((item) => item.id), ["room", "rdusa", "jaka"]);
  assert.equal(normalizeChannel(""), "room");
  assert.equal(normalizeChannel(undefined), "room");
  assert.equal(normalizeChannel(" RDUSA "), "rdusa");
  for (const bad of ["secret-room", "rdusa2", "room/../x", "a".repeat(33)]) assert.equal(normalizeChannel(bad), null, bad);
});
