import "server-only";
import { gateRoomKind, normalizeBaton, normalizeBody, normalizeChannel, normalizeKind, normalizeRefs, roomBoardRows, boardMarkdown } from "./swarm-contract";
import { listRoomMessages, postRoomRecord, recordMcpCall, touchRoomSeat } from "./swarm";
import { claimDispatch, inboxFor, routeAndProcess, seatStrip } from "./swarm-router";
import { listRoomSeats } from "./swarm";
import { getControlPlaneSnapshot } from "./control-plane";
import { seatBlockerRows, seatRows, summarizeSnapshot } from "./room-summary.js";
import { seatEnv } from "./seat-auth.js";
import { currentApprovers, decideEnrollment, listEnrollments } from "./seat-enroll.js";
import { enrollUnavailable } from "./seat-enroll-http.js";

const ROOM_TOOLS = ["room_read", "room_post", "room_board", "room_inbox", "room_claim", "room_enroll_pending", "room_enroll_decide", "hq_status", "hq_next_actions"];
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
  if (tool === "room_inbox") {
    await touchRoomSeat(seat, tokenHash);
    return { ok: true, dispatches: await inboxFor(seat) };
  }
  if (tool === "room_claim") {
    const result = await claimDispatch(String(args?.dispatchId || ""), seat);
    return result.error ? { ok: false, ...result.error } : { ok: true, dispatch: result.dispatch };
  }
  if (tool === "room_enroll_pending" || tool === "room_enroll_decide") {
    if (!(await currentApprovers()).includes(seat)) return { ok: false, status: 403, error: "This seat cannot approve key requests." };
    const down = await enrollUnavailable();
    if (down) return { ok: false, ...down };
    if (tool === "room_enroll_pending") {
      const requests = (await listEnrollments()).map((row) => (seat === "mark" ? row : { ...row, pairingCode: "" }));
      return { ok: true, requests };
    }
    const action = String(args?.action || "");
    if (!["approve", "deny"].includes(action)) return { ok: false, status: 400, error: "Action must be approve or deny." };
    const result = await decideEnrollment({ id: String(args?.requestId || ""), code: args?.pairingCode, approve: action === "approve", approver: seat });
    return result.error ? { ok: false, ...result.error } : { ok: true, request: result.enrollment };
  }
  // Read-only control-plane views: the same read model as the room page header and seat strip.
  if (tool === "hq_status") {
    const snapshot = await getControlPlaneSnapshot();
    const strip = seatStrip(await listRoomSeats(), await seatEnv());
    const summary = summarizeSnapshot(snapshot);
    return {
      ok: true,
      ...summary,
      blockers: [...summary.blockers, ...seatBlockerRows(strip).map(({ action, href, ...row }) => row)],
      seats: seatRows(strip),
      guardrails: snapshot.guardrails,
    };
  }
  if (tool === "hq_next_actions") {
    const front = String(args?.front || "").trim();
    const snapshot = await getControlPlaneSnapshot();
    const board = snapshot.execution;
    const items = front ? board.items.filter((item) => item.front === front) : board.items;
    return { ok: true, generatedAt: snapshot.generatedAt, ...board, items };
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
    dispatchId: String(args?.dispatchId || "").trim() || null,
  });
  if (saved.error) return { ok: false, ...saved.error };
  // Same rules as the HTTP post: an agent message reaches others only by @mention or baton.
  if (!saved.deduped) await routeAndProcess(saved.message);
  return { ok: true, message: saved.message, deduped: saved.deduped };
}
