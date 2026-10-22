import "server-only";
import { measurementDays, readEnquirySummaryWith, RDUSA_MVP_START_DEFAULT } from "./enquiries.js";

export function rdusaMvpStart() {
  return process.env.RDUSA_MVP_START?.trim() || RDUSA_MVP_START_DEFAULT;
}

/** Sookly RDUSA workspace roll-up (Bearer key with the internal hq_summary:read scope). */
export async function readRdusaEnquiries({ includeTest = false } = {}) {
  return readEnquirySummaryWith({
    baseUrl: process.env.SOOKLY_API_URL || "https://app.sookly.co",
    apiKey: process.env.SOOKLY_RDUSA_HQ_KEY?.trim(),
    days: measurementDays(new Date(), rdusaMvpStart()),
    includeTest,
    fetchImpl: fetch,
  });
}
