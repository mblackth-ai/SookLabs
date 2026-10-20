import "server-only";
import { readContentSummaryWith } from "./content-summary.js";

/** SEOS → HQ content & social summary per business. Same token and base URL as the Authority / Reports panels. */
export async function readContentSummary({ past = 14, ahead = 14 } = {}) {
  return readContentSummaryWith({
    baseUrl: process.env.SEOS_INTERNAL_URL || process.env.NEXT_PUBLIC_SEOS_URL || "https://seos.sooklabs.com",
    token: process.env.SEOS_HQ_API_TOKEN?.trim(),
    past,
    ahead,
    fetchImpl: fetch,
  });
}
