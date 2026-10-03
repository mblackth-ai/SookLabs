const DEFAULT_GITHUB_REPO = "mblackth-ai/SookLabs";

function parseAllowlist(raw) {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;\s]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * @returns {{
 *   oauthIssuerUrl: string;
 *   resourceIdentifier: string;
 *   seatAllowlist: string[];
 *   githubRepo: string;
 *   githubToken: string;
 *   bindHost: string;
 *   bindPort: number;
 *   mcpPath: string;
 *   isAuthConfigured: boolean;
 *   resourceServerUrl: URL | null;
 *   protectedResourceMetadataUrl: string | null;
 * }}
 */
export function loadConfig() {
  const oauthIssuerUrl = process.env.SOOKLABS_MCP_OAUTH_ISSUER_URL?.trim() ?? "";
  const resourceIdentifier = process.env.SOOKLABS_MCP_RESOURCE_IDENTIFIER?.trim() ?? "";
  const seatAllowlist = parseAllowlist(process.env.SOOKLABS_MCP_SEAT_ALLOWLIST);
  const githubRepo = (process.env.SOOKLABS_MCP_GITHUB_REPO?.trim() || DEFAULT_GITHUB_REPO).replace(
    /^\/+|\/+$/g,
    ""
  );
  const githubToken =
    process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim() || "";
  const bindHost = process.env.SOOKLABS_MCP_BIND_HOST?.trim() || "127.0.0.1";
  const bindPort = Number.parseInt(process.env.SOOKLABS_MCP_PORT ?? "3100", 10);
  const mcpPath = process.env.SOOKLABS_MCP_PATH?.trim() || "/mcp";

  const isAuthConfigured =
    Boolean(oauthIssuerUrl) && seatAllowlist.length > 0 && Boolean(resourceIdentifier);

  let resourceServerUrl = null;
  let protectedResourceMetadataUrl = null;
  if (resourceIdentifier) {
    try {
      resourceServerUrl = new URL(resourceIdentifier);
      const rsPath =
        resourceServerUrl.pathname && resourceServerUrl.pathname !== "/"
          ? resourceServerUrl.pathname
          : "";
      protectedResourceMetadataUrl = new URL(
        `/.well-known/oauth-protected-resource${rsPath}`,
        resourceServerUrl
      ).href;
    } catch {
      resourceServerUrl = null;
      protectedResourceMetadataUrl = null;
    }
  }

  return {
    oauthIssuerUrl,
    resourceIdentifier,
    seatAllowlist,
    githubRepo,
    githubToken,
    bindHost,
    bindPort,
    mcpPath,
    isAuthConfigured,
    resourceServerUrl,
    protectedResourceMetadataUrl,
  };
}
