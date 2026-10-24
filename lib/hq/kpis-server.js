import "server-only";
import { readAnalyticsSummaryWith } from "./analytics-summary.js";
import { readHomeDataWith } from "./home-data.js";
import { getOpsStorageMode, readOpsData } from "./ops-data.js";
import { fetchWithTimeout, seosBaseUrl } from "./read-timeouts.js";

/** Months of SEOS history for the Performance chart. The Content Reach card uses the latest month of the same read. */
const CHART_MONTHS = 6;

/**
 * Server-side reads for Home: the ops store and SEOS in parallel, each bounded by ~3s. Read-only;
 * secrets stay on the server. Raw upstream errors go to the server log, never to the page.
 */
export async function readHomeData() {
  return readHomeDataWith({
    readOps: readOpsData,
    readAnalytics: () =>
      readAnalyticsSummaryWith({
        baseUrl: seosBaseUrl(),
        token: process.env.SEOS_HQ_API_TOKEN?.trim(),
        months: CHART_MONTHS,
        fetchImpl: fetchWithTimeout(fetch),
      }),
    storage: getOpsStorageMode(),
    log: (what, error) => console.warn(`[hq home] ${what} read failed:`, error instanceof Error ? error.message : String(error ?? "")),
  });
}
