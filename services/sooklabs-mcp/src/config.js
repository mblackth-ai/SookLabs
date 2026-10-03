import { ROOM_SEATS } from "../../../lib/hq/swarm-contract.js";

const seatIds = new Set(ROOM_SEATS.map((seat) => seat.id));

/** One authorization registry: legacy seat names or issuer subject -> room seat JSON. */
export function parseSeatRegistry(raw) {
  const empty = () => ({ seatAllowlist: [], seatBySubject: Object.create(null) });
  if (!raw?.trim()) return empty();
  try {
    const text = raw.trim();
    const entries = text.startsWith("{")
      ? Object.entries(JSON.parse(text))
      : text.split(/[,;\s]+/).filter(Boolean).map((seat) => [seat, seat]);
    const registry = empty();
    for (const [subject, seat] of entries) {
      if (!subject.trim() || subject !== subject.trim() || typeof seat !== "string" || !seatIds.has(seat)) {
        return empty();
      }
      registry.seatBySubject[subject] = seat;
    }
    registry.seatAllowlist = Object.keys(registry.seatBySubject);
    return registry;
  } catch {
    return empty();
  }
}

function permittedUrl(raw) {
  try {
    const url = new URL(raw);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (url.username || url.password || url.hash || url.search) return null;
    if (url.protocol !== "https:" && !(url.protocol === "http:" && loopback)) return null;
    return url;
  } catch {
    return null;
  }
}

export function loadConfig(env = process.env) {
  const oauthIssuerUrl = env.SOOKLABS_MCP_OAUTH_ISSUER_URL?.trim() ?? "";
  const resourceIdentifier = env.SOOKLABS_MCP_RESOURCE_IDENTIFIER?.trim() ?? "";
  const registry = parseSeatRegistry(env.SOOKLABS_MCP_SEAT_ALLOWLIST);
  const githubToken = env.GITHUB_TOKEN?.trim() || env.GH_TOKEN?.trim() || "";
  const bindHost = env.SOOKLABS_MCP_BIND_HOST?.trim() || "127.0.0.1";
  const bindPort = Number.parseInt(env.SOOKLABS_MCP_PORT ?? "3100", 10);
  const mcpPath = env.SOOKLABS_MCP_PATH?.trim() || "/mcp";
  const issuerUrl = permittedUrl(oauthIssuerUrl);
  const resourceServerUrl = permittedUrl(resourceIdentifier);
  const isAuthConfigured = Boolean(issuerUrl && resourceServerUrl)
    && registry.seatAllowlist.length > 0
    && resourceServerUrl.pathname === mcpPath;
  const protectedResourceMetadataUrl = resourceServerUrl
    ? new URL(`/.well-known/oauth-protected-resource${resourceServerUrl.pathname === "/" ? "" : resourceServerUrl.pathname}`, resourceServerUrl).href
    : null;
  return {
    oauthIssuerUrl, resourceIdentifier, ...registry, githubToken,
    bindHost, bindPort, mcpPath, isAuthConfigured,
    resourceServerUrl, protectedResourceMetadataUrl,
  };
}
