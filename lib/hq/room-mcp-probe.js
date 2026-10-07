import { ROOM_MCP_BROWSER_PATH } from "./room-mcp-endpoint.js";

export function parseMcpSeatFromInstructions(instructions) {
  const match = String(instructions || "").match(/seat "([a-z]+)"/);
  return match ? match[1] : "";
}

/** Read-only MCP initialize check (same contract as scripts/hq-mcp-check.mjs). */
export async function probeRoomMcp({ token, url = ROOM_MCP_BROWSER_PATH, expectedSeat = "" } = {}) {
  const key = String(token || "").trim();
  if (!key) return { ok: false, error: "No connection key." };
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: { name: "hq-room-probe", version: "1" },
        },
      }),
    });
  } catch {
    return { ok: false, error: "Could not reach the MCP endpoint." };
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.error) {
    return { ok: false, status: res.status, error: body.error?.message || `HTTP ${res.status}` };
  }
  const seat = parseMcpSeatFromInstructions(body.result?.instructions);
  if (expectedSeat && seat && seat !== expectedSeat) {
    return { ok: false, error: `This key is seat "${seat}", not "${expectedSeat}".` };
  }
  return {
    ok: true,
    seat,
    protocol: body.result?.protocolVersion || "",
    server: body.result?.serverInfo?.name || "",
  };
}
