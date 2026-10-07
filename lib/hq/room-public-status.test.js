import assert from "node:assert/strict";
import test from "node:test";
import { buildPublicRoomStatus } from "./room-public-status.js";

test("public room status omits seat strip and env metadata", () => {
  const body = buildPublicRoomStatus({ draft: false, connections: [{ seat: "cursor", configured: true }] });
  assert.equal(body.ok, true);
  assert.ok(!("strip" in body));
  assert.ok(body.mcp.includes("/hq/api/room/mcp"));
  assert.equal(body.messages, "/hq/api/room/messages");
});
