import assert from "node:assert/strict";
import test from "node:test";
import { OAUTH_DISCOVERY_NOT_FOUND, isOauthDiscoveryPath } from "./mcp-discovery.js";

test("OAuth/OIDC discovery paths, including path-suffixed forms, are recognised", () => {
  for (const path of [
    "/.well-known/oauth-protected-resource",
    "/.well-known/oauth-protected-resource/hq/api/room/mcp",
    "/.well-known/oauth-authorization-server",
    "/.well-known/oauth-authorization-server/hq/api/room/mcp",
    "/.well-known/openid-configuration",
  ]) assert.equal(isOauthDiscoveryPath(path), true, path);
});

test("other paths are left alone", () => {
  for (const path of ["/", "/hq/login", "/.well-known/security.txt", "/.well-known/oauth-protected-resourcex", "/hq/api/room/mcp", ""]) {
    assert.equal(isOauthDiscoveryPath(path), false, path);
  }
  assert.equal(OAUTH_DISCOVERY_NOT_FOUND.error, "not_found");
  assert.match(OAUTH_DISCOVERY_NOT_FOUND.error_description, /bearer/);
});
