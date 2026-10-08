import "server-only";
import { readAnalyticsSummaryWith } from "./analytics-summary.js";

/** SEOS → HQ rankings summary per managed business. Same token and base URL as the Authority panel. */
export async function readAnalyticsSummary(months = 6) {
  return readAnalyticsSummaryWith({
    baseUrl: process.env.SEOS_INTERNAL_URL || process.env.NEXT_PUBLIC_SEOS_URL || "https://seos.sooklabs.com",
    token: process.env.SEOS_HQ_API_TOKEN?.trim(),
    months,
    fetchImpl: fetch,
  });
}
