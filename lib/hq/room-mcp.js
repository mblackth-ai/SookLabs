import "server-only";
import { gateRoomKind, normalizeBaton, normalizeBody, normalizeChannel, normalizeKind, normalizeRefs, roomBoardRows, boardMarkdown } from "./swarm-contract";
import { listRoomMessages, postRoomRecord, recordMcpCall } from "./swarm";

const ROOM_TOOLS = ["room_read", "room_post", "room_board"];
const BLOCKED_TOOLS = ["promote", "broadcast", "room_promote", "room_broadcast"];

export async function callRoomMcp({ name, args, seat, tokenHash, authError }) {
  const tool = String(name || "").trim();
  await recordMcpCall({ tool: tool || "unknown", seatId: seat || "" });
  if (BLOCKED_TOOLS.includes(tool)) {
    return { ok: false, status: 403, error: "No promote or broadcast tools." };
  }
  if (!ROOM_TOOLS.includes(tool)) {
    return { ok: false, status: 400, error: "Unknown room tool." };
  }
  if (!seat) {
    return {
      ok: false,
      status: authError?.status || 401,
      error: authError?.error || "Send this seat's connection.",
    };
  }
  if (tool === "room_read") {
    const channel = normalizeChannel(args?.channel);
    if (!channel) return { ok: false, status: 400, error: "Channel is invalid." };
    const messages = await listRoomMessages({ channel, after: String(args?.after || ""), limit: 200 });
    return { ok: true, messages };
  }
  if (tool === "room_board") {
    const messages = await listRoomMessages({ channel: "room", limit: 200 });
    const board = roomBoardRows(messages);
    return { ok: true, board, markdown: boardMarkdown(board) };
  }
  const kind = normalizeKind(args?.kind);
  if (!kind.ok) return kind;
  const text = normalizeBody(args?.body);
  if (!text.ok) return text;
  const gate = gateRoomKind(seat, kind.kind);
  if (!gate.ok) return gate;
  const refs = normalizeRefs(args?.refs);
  if (!refs.ok) return refs;
  const baton = normalizeBaton(args?.baton, kind.kind);
  if (!baton.ok) return baton;
  const saved = await postRoomRecord({
    seatId: seat,
    tokenHash,
    channel: "room",
    kind: kind.kind,
    body: text.body,
    refs: refs.refs,
    baton: baton.baton,
  });
  return { ok: true, message: saved.message, deduped: saved.deduped };
}
