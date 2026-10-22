/**
 * Sookly → HQ enquiries (RDUSA MVP). Pure part: fetch wrapper with injected fetch, action items and
 * the 30-day measurement window. Read-only: HQ never replies to customers or changes Sookly data.
 * Never throws: pages show "not connected" or the error instead of breaking.
 */

export const RDUSA_MVP_START_DEFAULT = "2026-10-24T07:00:00Z"; // Sat 24 Oct 2026, 14:00 ICT

const EMPTY = { metrics: null, attention: [], conversations: [], channels: [], windowDays: 0, generatedAt: null };

/** Days to ask Sookly for: from the launch date (max 30); 30 before launch so the demo shows test data context. */
export function measurementDays(now = new Date(), start = RDUSA_MVP_START_DEFAULT) {
  const s = new Date(start).getTime();
  if (!Number.isFinite(s) || now.getTime() < s) return 30;
  return Math.max(1, Math.min(30, Math.ceil((now.getTime() - s) / 86400000)));
}

export function measurementDay(now = new Date(), start = RDUSA_MVP_START_DEFAULT) {
  const s = new Date(start).getTime();
  if (!Number.isFinite(s) || now.getTime() < s) return 0;
  return Math.min(30, Math.floor((now.getTime() - s) / 86400000) + 1);
}

export async function readEnquirySummaryWith({ baseUrl, apiKey, days = 30, includeTest = false, fetchImpl }) {
  if (!apiKey) {
    return { ok: false, configured: false, error: "SOOKLY_RDUSA_HQ_KEY is not configured.", data: EMPTY };
  }
  const url = `${String(baseUrl || "https://app.sookly.co").replace(/\/$/, "")}/api/external/hq-summary?days=${Number(days) || 30}${includeTest ? "&includeTest=1" : ""}`;
  try {
    const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const hint = response.status === 404 ? " (Sookly is not on the version with /api/external/hq-summary yet)" : "";
      return { ok: false, configured: true, error: (payload.error || `Sookly HQ summary failed (${response.status})`) + hint, data: EMPTY };
    }
    return { ok: true, configured: true, error: null, data: { ...EMPTY, ...payload } };
  } catch (error) {
    return { ok: false, configured: true, error: error instanceof Error ? error.message : "Sookly unavailable", data: EMPTY };
  }
}

export function fmtMinutes(m) {
  if (m == null) return "–";
  if (m < 60) return `${m} min`;
  if (m < 1440) return `${Math.round((m / 60) * 10) / 10} h`;
  return `${Math.round((m / 1440) * 10) / 10} d`;
}

const CHANNEL = { webchat: "Website chat", messenger: "Messenger", instagram: "Instagram", line: "LINE", email: "Email" };
export const channelLabel = (c) => CHANNEL[c] || c;

/** Daily Briefing items: conversations waiting on us, then follow-ups that are due. */
export function enquiryActionItems(result, { business = "RDUSA", inboxUrl = "https://app.sookly.co/inbox", max = 8 } = {}) {
  if (!result?.ok) return [];
  return (result.data.attention ?? []).slice(0, max).map((c) => ({
    id: `enquiry:${c.id}`,
    severity: c.needsReply && (c.waitingMinutes ?? 0) >= 1440 ? "error" : c.needsReply ? "warning" : "neutral",
    business,
    title: c.needsReply
      ? `${c.contact} waiting ${fmtMinutes(c.waitingMinutes)} (${channelLabel(c.channel)})`
      : `Follow up with ${c.contact} (${channelLabel(c.channel)})`,
    detail: `${c.preview || "(no text)"}${c.assignee ? ` · owner: ${c.assignee}` : " · unassigned"}`,
    when: "",
    href: inboxUrl,
  }));
}
