import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";
import { seedFromOps } from "@/lib/hq/loop-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Mark loads the ops executionMode items onto the loop. Existing tasks keep their state.
export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.seat !== "mark") return json({ ok: false, error: "Only Mark can seed the board." }, 403);
  try {
    return json({ ok: true, ...(await seedFromOps("mark")) });
  } catch {
    return json({ ok: false, error: "Seeding failed. Is the loop installed?" }, 503);
  }
}
