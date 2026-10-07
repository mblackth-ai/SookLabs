import { isRoomDraft, listRoomConnections } from "@/lib/hq/room-connection";
import { json } from "@/lib/hq/room-http";
import { buildPublicRoomStatus } from "@/lib/hq/room-public-status";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return json(
    buildPublicRoomStatus({
      draft: isRoomDraft(),
      connections: listRoomConnections(),
    }),
  );
}

export async function POST() {
  return json({ ok: false, error: "Post to /hq/api/room/messages. The server stamps the author." }, 405);
}
