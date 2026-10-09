import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  ownerRedeemErrorFromState,
  ownerRedeemUnavailable,
  ownerRedeemUnknownToken,
} from "./owner-join-errors.js";

test("redeem returns used, expired, cancelled, unknown, or unavailable", () => {
  for (const code of ["used", "expired", "cancelled"]) {
    const error = ownerRedeemErrorFromState(code);
    assert.equal(error.code, code);
    assert.equal(error.status, 410);
  }

  const unknownState = ownerRedeemErrorFromState("unknown");
  assert.equal(unknownState.code, "unknown");
  assert.equal(unknownState.status, 404);

  const unknownToken = ownerRedeemUnknownToken();
  assert.equal(unknownToken.code, "unknown");
  assert.equal(unknownToken.status, 404);
  assert.equal(unknownToken.error.includes("Ask for a new one"), false);

  const unavailable = ownerRedeemUnavailable();
  assert.equal(unavailable.code, "unavailable");
  assert.equal(unavailable.status, 503);

  const route = readFileSync(new URL("../../app/hq/api/client/redeem/route.js", import.meta.url), "utf8");
  const portal = readFileSync(new URL("./owner-portal.js", import.meta.url), "utf8");
  assert.match(route, /ownerRedeemUnavailable\(\)/);
  assert.match(route, /result\.error\.code \|\| "unknown"/);
  assert.match(portal, /ownerRedeemUnknownToken\(\)/);
  assert.match(portal, /ownerRedeemErrorFromState\(state\)/);
});
