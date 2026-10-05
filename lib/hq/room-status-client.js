import { ROOM_MCP_URL } from "./room-mcp-endpoint.js";

/** Public room status from GET /hq/api/room (no seat key). */
export async function fetchRoomStatus(baseUrl = "") {
  const prefix = String(baseUrl || "").replace(/\/$/, "");
  const res = await fetch(`${prefix}/hq/api/room`, { headers: { accept: "application/json" }, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.error || "Room status could not be loaded.");
  }
  return {
    draft: Boolean(data.draft),
    mcp: data.mcp || ROOM_MCP_URL,
    strip: Array.isArray(data.strip) ? data.strip : [],
    connections: Array.isArray(data.connections) ? data.connections : [],
  };
}
