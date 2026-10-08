/**
 * Pure part of the SEOS analytics client (no server-only import, so it is testable).
 * Never throws: HQ shows "not configured" or the error instead of a broken page.
 */

const EMPTY = { generatedAt: null, workspaces: [] };

export async function readAnalyticsSummaryWith({ baseUrl, token, months = 6, fetchImpl }) {
  if (!token || token.startsWith("change-me")) {
    return { ok: false, configured: false, error: "SEOS_HQ_API_TOKEN is not configured.", data: EMPTY };
  }
  const url = `${String(baseUrl).replace(/\/$/, "")}/api/analytics/hq-summary?months=${Number(months) || 6}`;
  try {
    const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) {
      return { ok: false, configured: true, error: payload.error || `SEOS analytics API failed (${response.status})`, data: EMPTY };
    }
    return { ok: true, configured: true, error: null, data: payload.data ?? EMPTY };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      error: error instanceof Error ? error.message : "SEOS analytics API unavailable",
      data: EMPTY,
    };
  }
}

/** Points for an inverted-rank sparkline (position 1 at the top). Null months break the line. */
export function sparklinePoints(trend, width = 120, height = 32, pad = 3) {
  const values = trend.map((t) => t.averagePosition).filter((v) => typeof v === "number");
  if (values.length === 0) return [];
  const best = Math.min(...values);
  const worst = Math.max(...values);
  const span = worst - best || 1;
  const step = trend.length > 1 ? (width - pad * 2) / (trend.length - 1) : 0;
  return trend.map((t, i) =>
    typeof t.averagePosition === "number"
      ? { x: pad + i * step, y: pad + ((t.averagePosition - best) / span) * (height - pad * 2), month: t.month, value: t.averagePosition }
      : null
  );
}
