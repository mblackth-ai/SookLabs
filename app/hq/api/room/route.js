import { isRoomDraft, listRoomConnections } from "@/lib/hq/room-connection";
import { json } from "@/lib/hq/room-http";
import { ROOM_MCP_URL } from "@/lib/hq/room-mcp-endpoint";
import { seatEnv } from "@/lib/hq/seat-auth";
import { listRoomSeats } from "@/lib/hq/swarm";
import { seatStrip } from "@/lib/hq/swarm-router";
import { ROOM_PACT, ROOM_SHARE_URL } from "@/lib/hq/swarm-contract";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  let strip = [];
  try {
    const env = await seatEnv();
    strip = seatStrip(await listRoomSeats(), env);
  } catch {
    console.error("room status strip failed");
  }
  return json({
    ok: true,
    draft: isRoomDraft(),
    room: "hq",
    shareUrl: ROOM_SHARE_URL,
    pact: ROOM_PACT,
    connections: listRoomConnections(),
    mcp: ROOM_MCP_URL,
    strip,
    messages: "/hq/api/room/messages",
    stream: "/hq/api/room/stream",
    board: "/hq/api/room/board",
    publicFeed: "/hq/api/room/public/feed",
  });
}

export async function POST() {
  return json({ ok: false, error: "Post to /hq/api/room/messages. The server stamps the author." }, 405);
}
