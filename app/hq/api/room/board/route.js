import { json, requireLiveRead } from "@/lib/hq/room-http";
import { listRoomMessages } from "@/lib/hq/swarm";
import { boardMarkdown, normalizeChannel, roomBoardRows } from "@/lib/hq/swarm-contract";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const auth = await requireLiveRead(request);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const channel = normalizeChannel(request.nextUrl.searchParams.get("channel"));
  if (!channel) return json({ ok: false, error: "Channel is invalid." }, 400);
  try {
    const messages = await listRoomMessages({ channel, limit: 200 });
    const board = roomBoardRows(messages);
    if (request.nextUrl.searchParams.get("format") === "md") {
      return new Response(boardMarkdown(board), {
        headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "no-store" },
      });
    }
    return json({ ok: true, board, markdown: boardMarkdown(board) });
  } catch {
    console.error("room board read failed");
    return json({ ok: false, error: "The board could not be loaded." }, 503);
  }
}
