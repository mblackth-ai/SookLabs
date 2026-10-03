import assert from "node:assert/strict";
import test from "node:test";
import { isRoomDraft } from "./room-connection.js";

test("HQ_ROOM_STATUS stays unset in this draft", () => {
  assert.equal(isRoomDraft({ HQ_ROOM_STATUS: "" }), true);
});
