// MCP discovery on the HQ host. The room MCP takes a static bearer seat key
// and has no OAuth server, so OAuth/OIDC discovery must say "not found" in
// JSON. If it returned the HQ login page as 200 HTML, clients such as Cursor's
// connector would read it as OAuth support, start an OAuth flow and time out.
// When PR #14's OAuth resource server lands, real metadata replaces this.

const OAUTH_DISCOVERY = [
  "/.well-known/oauth-protected-resource",
  "/.well-known/oauth-authorization-server",
  "/.well-known/openid-configuration",
];

/** True for OAuth/OIDC discovery paths, including RFC 9728/8414 path-suffixed forms. */
export function isOauthDiscoveryPath(pathname) {
  const path = String(pathname || "");
  return OAUTH_DISCOVERY.some((base) => path === base || path.startsWith(`${base}/`));
}

export const OAUTH_DISCOVERY_NOT_FOUND = {
  error: "not_found",
  error_description: "This MCP server uses a static bearer seat key (Authorization: Bearer <HQ_ROOM_CONNECTION>), not OAuth. See https://hq.sooklabs.com/hq/join",
};
