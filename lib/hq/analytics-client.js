import "server-only";
import { readAnalyticsSummaryWith } from "./analytics-summary.js";
import { fetchWithTimeout, seosBaseUrl } from "./read-timeouts.js";

/** SEOS → HQ rankings summary per managed business. Same token and base URL as the Authority panel. Gives up after ~3s. */
export async function readAnalyticsSummary(months = 6) {
  return readAnalyticsSummaryWith({
    baseUrl: seosBaseUrl(),
    token: process.env.SEOS_HQ_API_TOKEN?.trim(),
    months,
    fetchImpl: fetchWithTimeout(fetch),
  });
}
