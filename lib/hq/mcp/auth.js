import { timingSafeEqual } from "@/lib/hq/auth";

const PLACEHOLDER = /^change-me/i;
const MIN_TOKEN_LENGTH = 32;

/** The read token, or null when unset, a placeholder, or too short (MCP stays closed). */
export function resolveMcpReadToken(raw = process.env.HQ_MCP_READ_TOKEN) {
  const token = raw?.trim();
  if (!token || token.length < MIN_TOKEN_LENGTH || PLACEHOLDER.test(token)) return null;
  return token;
}

/**
 * Authenticate an MCP request by bearer token.
 * Returns { ok: true, scopes, caller } or { ok: false, status, error }.
 */
export function authenticateMcpRequest(request) {
  const token = resolveMcpReadToken();
  if (!token) return { ok: false, status: 503, error: "HQ MCP is not configured." };

  const header = request.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!bearer || !timingSafeEqual(bearer, token)) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }
  return { ok: true, scopes: ["read"], caller: "read-token" };
}
