import { identifySeatAny } from "@/lib/hq/seat-auth";
import { callRoomMcp } from "@/lib/hq/room-mcp";
import { handleRpc, isRpcPayload } from "@/lib/hq/room-mcp-rpc";
import { HQ_ROOM_MCP_PROTOCOL_VERSIONS, HQ_ROOM_MCP_PUBLIC_PATH } from "@/lib/hq/room-mcp-endpoint";
import { json, presentedConnection, readJson } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

// One URL, two shapes:
// - MCP Streamable HTTP (JSON-RPC 2.0, stateless, JSON responses) for MCP clients;
// - the original `{ name, args }` POST, kept for scripts that already use it.

const rpcFailure = (id, code, message, status, headers = {}) =>
  new Response(JSON.stringify({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });

export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const rpc = isRpcPayload(payload.body);
  const presented = presentedConnection(request, rpc ? "" : payload.body?.connection);
  if (!presented.ok) {
    return rpc ? rpcFailure(payload.body?.id, -32001, presented.error, presented.status) : json({ ok: false, error: presented.error }, presented.status);
  }
  const auth = presented.token
    ? await identifySeatAny({
        token: presented.token,
        claimedSeat: rpc ? undefined : payload.body?.seat,
        claimedAuthor: rpc ? undefined : payload.body?.author,
      })
    : { ok: false, status: 401, error: "Send this seat's connection as Authorization: Bearer <key>.", seat: "", tokenHash: "" };

  if (rpc) {
    const seat = auth.ok ? auth.seat : "";
    const tokenHash = auth.ok ? auth.tokenHash : "";
    let out;
    try {
      out = await handleRpc(payload.body, {
        seat,
        authError: auth.ok ? null : { status: auth.status, error: auth.error },
        callTool: ({ name, args }) => callRoomMcp({ name, args, seat, tokenHash, authError: null }),
      });
    } catch {
      console.error("room mcp rpc failed");
      return rpcFailure(payload.body?.id, -32603, "The room tool could not run.", 500);
    }
    if (out === null) return new Response(null, { status: 202, headers: { "cache-control": "no-store" } });
    if (!auth.ok) {
      return new Response(JSON.stringify(out), {
        status: auth.status || 401,
        headers: { "content-type": "application/json", "cache-control": "no-store", "www-authenticate": 'Bearer realm="sooklabs-hq-room"' },
      });
    }
    return json(out);
  }

  const name = payload.body?.name || payload.body?.tool;
  try {
    const result = await callRoomMcp({
      name,
      args: payload.body?.args || payload.body,
      seat: auth.ok ? auth.seat : "",
      tokenHash: auth.ok ? auth.tokenHash : "",
      authError: auth.ok ? null : { status: auth.status, error: auth.error },
    });
    if (!result.ok) return json({ ok: false, error: result.error }, result.status || 400);
    return json(result);
  } catch {
    console.error("room mcp failed");
    return json({ ok: false, error: "The room tool could not run." }, 503);
  }
}

// Stateless server: no server-initiated SSE stream and no sessions to delete.
// Some clients probe with GET before issuing POST JSON-RPC requests.
export async function GET(request) {
  const accept = (request.headers.get("accept") || "").toLowerCase();
  if (accept.includes("text/event-stream")) {
    return new Response(null, { status: 405, headers: { allow: "POST", "cache-control": "no-store" } });
  }
  return json({
    ok: true,
    server: "sooklabs-hq-room",
    transport: "streamable-http",
    protocolVersions: HQ_ROOM_MCP_PROTOCOL_VERSIONS,
    path: HQ_ROOM_MCP_PUBLIC_PATH,
    usage: "POST JSON-RPC 2.0 with Authorization: Bearer <HQ_ROOM_CONNECTION>",
    wrongPaths: ["/room/mcp", "/hq/room/mcp", "/api/room/mcp"],
  });
}

export async function DELETE() {
  return new Response(null, { status: 405, headers: { allow: "POST" } });
}
