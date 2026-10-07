import { ROOM_MCP_URL } from "./room-mcp-endpoint.js";
import { ROOM_PACT, ROOM_SHARE_URL } from "./swarm-contract.js";

/** Body for unauthenticated GET /hq/api/room — no seat strip or env metadata. */
export function buildPublicRoomStatus({ draft, connections }) {
  return {
    ok: true,
    draft,
    room: "hq",
    shareUrl: ROOM_SHARE_URL,
    pact: ROOM_PACT,
    connections,
    mcp: ROOM_MCP_URL,
    messages: "/hq/api/room/messages",
    stream: "/hq/api/room/stream",
    board: "/hq/api/room/board",
    publicFeed: "/hq/api/room/public/feed",
  };
}
