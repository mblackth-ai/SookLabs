import { isRoomDraft, listRoomConnections } from "@/lib/hq/room-connection";
import { json } from "@/lib/hq/room-http";
import { ROOM_MCP_URL } from "@/lib/hq/room-mcp-endpoint";
import { ROOM_PACT, ROOM_SHARE_URL } from "@/lib/hq/swarm-contract";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return json({
    ok: true,
    draft: isRoomDraft(),
    room: "hq",
    shareUrl: ROOM_SHARE_URL,
    pact: ROOM_PACT,
    connections: listRoomConnections(),
    mcp: ROOM_MCP_URL,
    messages: "/hq/api/room/messages",
    stream: "/hq/api/room/stream",
    board: "/hq/api/room/board",
    publicFeed: "/hq/api/room/public/feed",
  });
}

export async function POST() {
  return json({ ok: false, error: "Post to /hq/api/room/messages. The server stamps the author." }, 405);
}
