import { identifySeatAny } from "@/lib/hq/seat-auth";
import { json, presentedConnection } from "@/lib/hq/room-http";
import { readClientNames, readPublicFeed } from "@/lib/hq/swarm";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  const presented = presentedConnection(request);
  let review = false;
  if (presented.ok && presented.token) {
    const auth = await identifySeatAny({ token: presented.token });
    review = auth.ok && auth.seat === "mark" && request.nextUrl.searchParams.get("review") === "1";
  }
  try {
    const names = await readClientNames();
    const feed = await readPublicFeed({ clientNames: names, review });
    return json({
      ok: true,
      social: false,
      feed: feed.feed,
      held: feed.held,
    });
  } catch {
    console.error("room public feed failed");
    return json({ ok: false, error: "The public feed could not be loaded." }, 503);
  }
}
