/**
 * Pure part of the SEOS content & social client (no server-only import, so it is testable).
 * Read-only: HQ shows SEOS's per-business record, it never writes posts or keeps its own copy.
 * Never throws: HQ shows "not configured" or the error instead of a broken page.
 */

const EMPTY = { generatedAt: null, totals: null, actionItems: [], businesses: [], approvals: { joomla: { connected: false, pending: null } } };

export async function readContentSummaryWith({ baseUrl, token, past = 14, ahead = 14, fetchImpl }) {
  if (!token || token.startsWith("change-me")) {
    return { ok: false, configured: false, error: "SEOS_HQ_API_TOKEN is not configured.", data: EMPTY };
  }
  const url = `${String(baseUrl).replace(/\/$/, "")}/api/hq/content-summary?past=${Number(past) || 14}&ahead=${Number(ahead) || 14}`;
  try {
    const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      const hint = response.status === 404 ? " (SEOS is not on the version with the content summary yet)" : "";
      return { ok: false, configured: true, error: (payload.error || `SEOS content API failed (${response.status})`) + hint, data: EMPTY };
    }
    return { ok: true, configured: true, error: null, data: { ...EMPTY, ...(payload.data ?? {}) } };
  } catch (error) {
    return { ok: false, configured: true, error: error instanceof Error ? error.message : "SEOS content API unavailable", data: EMPTY };
  }
}

function fmtRange(first, last) {
  const f = (iso) => (iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : null);
  const a = f(first);
  const b = f(last);
  if (!a) return "";
  return a === b || !b ? a : `${a}–${b}`;
}

/**
 * Daily Briefing action items from the SEOS summary: failed/blocked posts (grouped by reason) and gap days.
 * Only items that need a person; the counts themselves stay on Content & Social.
 */
export function contentActionItems(result, { seosUrl = "https://seos.sooklabs.com", maxGapItems = 4 } = {}) {
  if (!result?.ok) return [];
  const items = [];
  for (const a of result.data.actionItems ?? []) {
    items.push({
      id: `${a.business}:${a.status}:${a.reason}`,
      severity: a.status === "failed" ? "error" : "warning",
      business: a.businessName || a.business,
      title: `${a.count} ${a.platforms.join(" + ")} post${a.count === 1 ? "" : "s"} ${a.status}`,
      detail: a.reason,
      when: fmtRange(a.firstAt, a.lastAt),
      href: seosUrl,
    });
  }
  const gaps = (result.data.businesses ?? []).filter((b) => b.gapDays?.length).sort((x, y) => y.gapDays.length - x.gapDays.length);
  for (const b of gaps.slice(0, maxGapItems)) {
    items.push({
      id: `${b.slug}:gaps`,
      severity: "neutral",
      business: b.name,
      title: `${b.gapDays.length} gap day${b.gapDays.length === 1 ? "" : "s"} in the next ${b.window?.aheadDays ?? 14}`,
      detail: b.gapDays.map((d) => d.slice(5)).join(", "),
      when: "",
      href: seosUrl,
    });
  }
  for (const b of result.data.businesses ?? []) {
    if (b.missingLines?.length) {
      items.push({ id: `${b.slug}:lines`, severity: "neutral", business: b.name, title: `No ${b.missingLines.join(" or ")} posts planned`, detail: "Required content line is empty in the ±14-day window.", when: "", href: seosUrl });
    }
  }
  items.push(...reportingActionItems(result, { seosUrl }));
  const rank = { error: 0, warning: 1, neutral: 2 };
  return items.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function businessSummary(result, slug) {
  return result?.ok ? (result.data.businesses ?? []).find((b) => b.slug === slug) ?? null : null;
}

const HOUR = 3600_000;

function ago(iso, now) {
  if (!iso) return "never";
  const h = (now.getTime() - new Date(iso).getTime()) / HOUR;
  if (h < 1) return `${Math.max(0, Math.round(h * 60))} min ago`;
  if (h < 48) return `${Math.round(h)} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

/**
 * Box reporting per business (SEOS `reporting`): when the box last pushed its record and whether each
 * publisher runner is alive. Older SEOS versions have no `reporting`; that reads as "not reported", never as healthy.
 */
export function reportingStatus(b, now = new Date()) {
  const r = b?.reporting;
  if (!r) return { reported: false, healthy: false, lastPush: "not reported", publishers: [] };
  return {
    reported: true,
    healthy: Boolean(r.healthy),
    pushStale: Boolean(r.pushStale),
    lastPushAt: r.lastPushAt ?? null,
    lastPush: ago(r.lastPushAt, now),
    publishers: (r.publishers ?? []).map((p) => ({ ...p, lastRun: ago(p.lastRunAt, now) })),
  };
}

export function reportingActionItems(result, { seosUrl = "https://seos.sooklabs.com", now = new Date() } = {}) {
  if (!result?.ok) return [];
  const items = [];
  for (const b of result.data.businesses ?? []) {
    if (!b.reporting) continue;
    const st = reportingStatus(b, now);
    if (st.pushStale) {
      items.push({ id: `${b.slug}:push`, severity: "warning", business: b.name, title: "Schedule record not pushed to SEOS recently", detail: `Last push ${st.lastPush}.`, when: "", href: seosUrl });
    }
    for (const p of st.publishers) {
      if (p.health === "ok") continue;
      const what = p.health === "down" ? "is not running" : p.health === "stale" ? "has not reported" : "reports an error";
      items.push({
        id: `${b.slug}:${p.key}`,
        severity: p.health === "down" ? "error" : "warning",
        business: b.name,
        title: `${p.name || p.key} ${what}`,
        detail: [p.detail, p.queued ? `${p.queued} queued` : null, `last run ${p.lastRun}`].filter(Boolean).join(" · "),
        when: "",
        href: seosUrl,
      });
    }
  }
  return items;
}
