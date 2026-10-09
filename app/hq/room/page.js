import { connection } from "next/server";
import { RoomBoard } from "@/components/hq/RoomBoard";
import { isRoomDraft, listRoomConnections } from "@/lib/hq/room-connection";
import { normalizeTier } from "@/lib/hq/swarm-contract";
import { readPublicFeed, readClientNames } from "@/lib/hq/swarm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata() {
  const draft = isRoomDraft();
  return {
    title: draft ? "HQ Swarm Room draft — SookLabs HQ" : "HQ Swarm Room — SookLabs HQ",
    description: draft
      ? "Draft of one room on SookLabs HQ. Not a live chatroom."
      : "One room on SookLabs HQ for Mark and the swarm.",
    robots: { index: false, follow: false },
  };
}

export default async function RoomPage({ searchParams }) {
  await connection();
  const params = await searchParams;
  const tier = normalizeTier(params?.as);
  const draft = isRoomDraft();
  const connections = listRoomConnections();
  let initialFeed = [];
  let loadError = "";
  if (tier === "spectator") {
    try {
      const names = await readClientNames();
      const feed = await readPublicFeed({ clientNames: names });
      initialFeed = feed.feed;
    } catch {
      console.error("room public feed failed");
      loadError = "The public feed could not be loaded.";
    }
  }
  return (
    <RoomBoard tier={tier} draft={draft} connections={connections} initialFeed={initialFeed} loadError={loadError} />
  );
}
