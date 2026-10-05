// App-facing contract for journey_cases and journey_case_events (HQ mirror — no DB).

import { SIGNAL_TYPES } from "./journey-model.js";

export const JOURNEY_CASE_FIELDS = [
  "id",
  "contactId",
  "contactLabel",
  "stageId",
  "channel",
  "blocker",
  "supplierNextDue",
  "prospectNextDue",
  "xeroQuoteId",
  "xeroInvoiceAccRecId",
  "xeroInvoiceAccPayId",
  "createdAt",
  "updatedAt",
];

export const JOURNEY_EVENT_FIELDS = [
  "id",
  "caseId",
  "type",
  "occurredAt",
  "source",
  "externalId",
  "payload",
  "stageHint",
  "operatorId",
];

/** @typedef {"email" | "quo" | "calendar" | "xero" | "manual" | "system"} JourneyEventSource */

/**
 * @param {unknown} row
 * @returns {{ ok: true, value: Record<string, unknown> } | { ok: false, error: string }}
 */
export function validateJourneyEventDraft(row) {
  if (!row || typeof row !== "object") return { ok: false, error: "Event must be an object." };
  const type = String(row.type || "").trim();
  if (!SIGNAL_TYPES.includes(type)) {
    return { ok: false, error: `Unknown event type: ${type || "(empty)"}` };
  }
  const caseId = String(row.caseId || "").trim();
  if (!caseId) return { ok: false, error: "caseId is required." };
  return {
    ok: true,
    value: {
      caseId,
      type,
      occurredAt: row.occurredAt || new Date().toISOString(),
      source: row.source || "system",
      externalId: row.externalId ? String(row.externalId) : undefined,
      payload: row.payload && typeof row.payload === "object" ? row.payload : {},
      stageHint: row.stageHint ? String(row.stageHint) : undefined,
    },
  };
}

export function nextOperationalDue(caseRow) {
  const supplier = caseRow?.supplierNextDue ? Date.parse(caseRow.supplierNextDue) : NaN;
  const prospect = caseRow?.prospectNextDue ? Date.parse(caseRow.prospectNextDue) : NaN;
  const candidates = [];
  if (!Number.isNaN(supplier)) candidates.push({ who: "supplier", at: supplier, iso: caseRow.supplierNextDue });
  if (!Number.isNaN(prospect)) candidates.push({ who: "prospect", at: prospect, iso: caseRow.prospectNextDue });
  if (!candidates.length) return null;
  candidates.sort((a, b) => a.at - b.at);
  return candidates[0];
}
