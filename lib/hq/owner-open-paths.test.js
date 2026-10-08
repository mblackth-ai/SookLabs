import test from "node:test";
import assert from "node:assert/strict";
import { isOwnerPublicPath } from "./owner-open-paths.js";
import { ownerJoinErrorText } from "./owner-join-errors.js";

test("owner public paths are the room and the two owner routes only", () => {
  assert.equal(isOwnerPublicPath("/hq/client"), true);
  assert.equal(isOwnerPublicPath("/hq/client/join/hqi_abc"), true);
  assert.equal(isOwnerPublicPath("/hq/api/client/redeem"), true);
  assert.equal(isOwnerPublicPath("/hq/api/client/logout"), true);
  assert.equal(isOwnerPublicPath("/hq/api/client"), false);
  assert.equal(isOwnerPublicPath("/hq/api/client/owners"), false);
  assert.equal(isOwnerPublicPath("/hq/api/client/redeem/extra"), false);
  assert.equal(isOwnerPublicPath("/hq/api/owners"), false);
});

test("join errors accept known codes and drop anything else", () => {
  assert.match(ownerJoinErrorText("used"), /already used/);
  assert.equal(ownerJoinErrorText("not a real error"), null);
  assert.equal(ownerJoinErrorText("<img src=x onerror=alert(1)>"), null);
  assert.equal(ownerJoinErrorText(["used"]), null);
});
