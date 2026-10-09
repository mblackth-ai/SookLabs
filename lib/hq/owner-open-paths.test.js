import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("middleware allow-list still requires the HQ session for lookalike paths", () => {
  const middleware = readFileSync(new URL("../../middleware.js", import.meta.url), "utf8");
  assert.match(middleware, /isOwnerPublicPath\(pathname\)/);
  assert.doesNotMatch(middleware, /startsWith\("\/hq\/api\/client/);
  for (const path of ["/hq/clientX", "/hq/client-admin", "/hq/api/owners"]) {
    assert.equal(isOwnerPublicPath(path), false, `${path} stays behind the HQ session`);
  }
});

test("join errors accept known codes and drop anything else", () => {
  assert.match(ownerJoinErrorText("used"), /already used/);
  assert.equal(ownerJoinErrorText("not a real error"), null);
  assert.equal(ownerJoinErrorText("<img src=x onerror=alert(1)>"), null);
  assert.equal(ownerJoinErrorText(["used"]), null);
});
