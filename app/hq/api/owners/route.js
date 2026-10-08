import { browserWriteAllowed, json, readJson, sessionPresent } from "@/lib/hq/room-http";
import {
  createOwnerInvite,
  listOwners,
  migrateOwnerPortal,
  ownerPortalInstalled,
  revokeOwner,
} from "@/lib/hq/owner-portal";
import { readAnalyticsSummary } from "@/lib/hq/analytics-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function publicBase(request) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  const proto = request.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const prefix = host.split(":")[0] === "hq.sooklabs.com" ? "" : "/hq";
  return `${proto}://${host}${prefix}`;
}

function unavailable(error) {
  return json({ ok: false, error: error?.code === "no-database" ? "HQ has no database configured." : "Owner access is unavailable." }, 503);
}

/** Mark only (HQ session): owner invites and access per business. */
export async function GET(request) {
  if (!(await sessionPresent(request))) return json({ ok: false, error: "Sign in to HQ." }, 401);
  try {
    if (!(await ownerPortalInstalled())) return json({ ok: true, installed: false, invites: [], access: [] });
    return json({ ok: true, installed: true, ...(await listOwners()) });
  } catch (error) {
    return unavailable(error);
  }
}

/**
 * Mark only. Body { action }:
 *  - "install": create the two owner tables (additive; this click is the approval)
 *  - "invite" { business, label }: one-time link, valid 7 days, shown once
 *  - "revoke" { id }: revoke an owner (own_…) or cancel an unused link (oin_…)
 */
export async function POST(request) {
  if (!(await sessionPresent(request))) return json({ ok: false, error: "Sign in to HQ." }, 401);
  if (!browserWriteAllowed(request)) return json({ ok: false, error: "Cross-site posts are blocked." }, 403);
  const payload = await readJson(request);
  if (!payload.ok) return json({ ok: false, error: payload.error }, payload.status);
  const body = payload.body || {};
  try {
    if (body.action === "install") {
      const before = await ownerPortalInstalled();
      await migrateOwnerPortal();
      console.info(`owner portal: tables ${before ? "already present" : "created"} by mark`);
      return json({ ok: true, installed: true, created: !before });
    }
    if (!(await ownerPortalInstalled())) return json({ ok: false, error: "Switch on owner access first." }, 409);
    if (body.action === "invite") {
      // Only businesses SEOS actually reports can be shared.
      const summary = await readAnalyticsSummary(1);
      const known = summary.data.workspaces.some((w) => w.slug === body.business);
      if (!known) return json({ ok: false, error: "Unknown business (not in SEOS)." }, 400);
      const invite = await createOwnerInvite({ business: body.business, label: body.label, by: "mark" });
      if (invite.error) return json({ ok: false, error: invite.error.error }, invite.error.status);
      return json({
        ok: true,
        invite: { id: invite.id, business: invite.business, label: invite.label, expiresAt: invite.expiresAt },
        link: `${publicBase(request)}/client/join/${invite.token}`,
      });
    }
    if (body.action === "revoke") {
      const result = await revokeOwner({ id: body.id, by: "mark" });
      return json(result, result.ok ? 200 : 404);
    }
    return json({ ok: false, error: "Unknown action." }, 400);
  } catch (error) {
    return unavailable(error);
  }
}
