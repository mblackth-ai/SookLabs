import "server-only";
import { readAnalyticsSummaryWith } from "./analytics-summary.js";
import { buildKpis } from "./kpis.js";
import { getOpsStorageMode } from "./ops-data.js";

const SEOS_TIMEOUT_MS = 6000;

/**
 * Server-side reads for the Home KPI cards. Read-only; secrets stay on the server.
 * `ops` is the snapshot the page already read (pass `opsError` if that read failed).
 */
export async function readHomeKpis({ ops, opsError = null } = {}) {
  // Same SEOS endpoint, base URL and token as the Reports page; 1 = latest complete month only.
  const analytics = await readAnalyticsSummaryWith({
    baseUrl: process.env.SEOS_INTERNAL_URL || process.env.NEXT_PUBLIC_SEOS_URL || "https://seos.sooklabs.com",
    token: process.env.SEOS_HQ_API_TOKEN?.trim(),
    months: 1,
    fetchImpl: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(SEOS_TIMEOUT_MS) }),
  });
  return buildKpis({ analytics, ops, storage: getOpsStorageMode(), opsError });
}
