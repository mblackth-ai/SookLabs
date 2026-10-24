import "server-only";
import { readContentSummaryWith } from "./content-summary.js";
import { fetchWithTimeout, seosBaseUrl } from "./read-timeouts.js";

/** SEOS → HQ content & social summary per business. Same token and base URL as the Authority / Reports panels. Gives up after ~3s. */
export async function readContentSummary({ past = 14, ahead = 14 } = {}) {
  return readContentSummaryWith({
    baseUrl: seosBaseUrl(),
    token: process.env.SEOS_HQ_API_TOKEN?.trim(),
    past,
    ahead,
    fetchImpl: fetchWithTimeout(fetch),
  });
}
