import { loopInstalled, migrateLoop, recordEvent } from "@/lib/hq/loop-store";
import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Mark only: create the execution-loop tables (additive, CREATE IF NOT EXISTS).
 * Same schema as scripts/hq-loop-migrate.mjs; Mark's key on this call is the approval,
 * recorded in hq_loop_events. Installing does not start the loop: it still needs
 * HQ_LOOP_WORKER_SECRET (wake) and is paused/resumed from the panel.
 */
export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.seat !== "mark") return json({ ok: false, error: "Only Mark can install the loop." }, 403);
  try {
    const before = await loopInstalled();
    await migrateLoop();
    await recordEvent({ kind: "migration", actor: "mark", payload: { via: "room install button", created: !before } });
    return json({ ok: true, installed: true, created: !before });
  } catch (error) {
    console.error("loop install failed");
    return json({ ok: false, error: error?.code === "no-database" ? "HQ has no database configured." : "Install failed." }, 503);
  }
}
