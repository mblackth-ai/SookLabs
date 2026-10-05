import { enrollInstalled, migrateEnroll } from "@/lib/hq/seat-enroll";
import { json, readJson, requireSeatPost } from "@/lib/hq/room-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Mark only: create the seat key request tables (additive, CREATE IF NOT EXISTS).
 * Same schema as scripts/hq-seat-enroll-migrate.mjs; Mark's key on this call is the approval.
 */
export async function POST(request) {
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const auth = await requireSeatPost(request, payload.body);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  if (auth.seat !== "mark") return json({ ok: false, error: "Only Mark can install this." }, 403);
  try {
    const before = await enrollInstalled();
    await migrateEnroll();
    console.info(`seat enroll: tables ${before ? "already present" : "created"} by mark`);
    return json({ ok: true, installed: true, created: !before });
  } catch (error) {
    console.error("seat enroll install failed");
    return json({ ok: false, error: error?.code === "no-database" ? "HQ has no database configured." : "Install failed." }, 503);
  }
}
