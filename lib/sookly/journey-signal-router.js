// Map external signals (email, Quo, calendar, payment) to journey stages and next actions.
// Pure logic — safe for app.sookly.com and HQ reporting demos.

import { journeyStage, RDUSA_B2B_JOURNEY } from "./journey-model.js";

/** @typedef {{ type: string, confidence: "high" | "medium" | "low", hints?: string[] }} ClassifiedSignal */

const QUOTE_PATTERNS = /\b(quote|quotation|pricing|price list|rfq|estimate)\b/i;
const PO_PATTERNS = /\b(p\.?o\.?|purchase order|order confirm|confirm order)\b/i;
const PAYMENT_PATTERNS = /\b(payment|paid|card|authorize|approval|credit card)\b/i;
const TRACKING_PATTERNS = /\b(tracking|shipment|shipped|carrier|delivery)\b/i;
const ISSUE_PATTERNS = /\b(damage|shortage|missing|wrong item|not received|issue)\b/i;
const SUPPLIER_PATTERNS = /\b(lead time|availability|moq|supplier|backorder)\b/i;

/**
 * @param {{ direction: "inbound" | "outbound", subject?: string, body?: string, fromRole?: "prospect" | "supplier" | "operator" }} input
 * @returns {ClassifiedSignal}
 */
export function classifyEmailSignal(input) {
  const text = `${input.subject || ""}\n${input.body || ""}`.trim();
  const type = input.direction === "inbound" ? "email.inbound" : "email.outbound";
  const hints = [];

  if (ISSUE_PATTERNS.test(text)) hints.push("receipt_issue");
  if (TRACKING_PATTERNS.test(text)) hints.push("shipment");
  if (PAYMENT_PATTERNS.test(text)) hints.push("payment");
  if (PO_PATTERNS.test(text)) hints.push("purchase_order");
  if (QUOTE_PATTERNS.test(text)) hints.push("quotation");
  if (SUPPLIER_PATTERNS.test(text)) hints.push("supplier_timing");

  let confidence = "low";
  if (hints.length >= 2) confidence = "high";
  else if (hints.length === 1) confidence = "medium";

  if (input.fromRole === "supplier" && input.direction === "inbound") {
    hints.push("supplier_reply");
    confidence = confidence === "low" ? "medium" : confidence;
  }

  return { type, confidence, hints: hints.length ? hints : ["general_message"] };
}

/**
 * Normalize Quo webhook payloads (2026-03-30 style) to journey signal types.
 * @param {{ type?: string, data?: Record<string, unknown> }} payload
 * @returns {{ signalType: string | null, callId?: string, contactIds?: string[], summary?: string }}
 */
export function mapQuoWebhookToSignal(payload) {
  const eventType = String(payload?.type || "").trim();
  const data = payload?.data && typeof payload.data === "object" ? payload.data : {};
  const contactIds = extractQuoContactIds(data);

  switch (eventType) {
    case "call.transcript.completed":
      return {
        signalType: "quo.call.transcript.completed",
        callId: stringOrUndefined(data.callId ?? data.id),
        contactIds,
        summary: stringOrUndefined(data.summary),
      };
    case "message.received":
      return {
        signalType: "quo.message.received",
        contactIds,
        summary: stringOrUndefined(data.body),
      };
    case "call.completed":
      return {
        signalType: "quo.call.completed",
        callId: stringOrUndefined(data.callId ?? data.id),
        contactIds,
      };
    default:
      return { signalType: null, contactIds };
  }
}

function extractQuoContactIds(data) {
  const ctx = data.context && typeof data.context === "object" ? data.context : {};
  const contacts = ctx.contacts && typeof ctx.contacts === "object" ? ctx.contacts : {};
  const ids = contacts.ids;
  if (Array.isArray(ids)) return ids.map((id) => String(id));
  return [];
}

function stringOrUndefined(value) {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

/**
 * Suggest stage transition from current stage + classified signal (assist-only).
 * @param {string | null | undefined} currentStageId
 * @param {ClassifiedSignal} signal
 * @returns {{ stay: boolean, suggestedStageId: string | null, reason: string, xeroSuggest: string | null }}
 */
export function suggestStageFromSignal(currentStageId, signal) {
  const current = journeyStage(currentStageId) || journeyStage("inquiry");
  const hints = new Set(signal.hints || []);

  if (signal.type === "calendar.booking.confirmed") {
    return stageMove("qualify", "Booking confirmed — move to qualify and capture requirements.");
  }
  if (signal.type === "payment.card.authorized" || hints.has("payment")) {
    return stageMove("payment_pending", "Payment signal — confirm authorization then supplier confirm.", "xero.invoice.accrec.suggested");
  }
  if (hints.has("shipment") || signal.type === "shipment.tracking") {
    if (current.order >= 9) return stageMove("tracking_shared", "Tracking available — notify prospect.");
    return stageMove("supplier_fulfilment", "Shipment in progress.");
  }
  if (hints.has("receipt_issue") || signal.type === "quo.call.transcript.completed") {
    if (hints.has("receipt_issue")) {
      return stageMove("receipt_check", "Issue reported — open receipt check.");
    }
  }
  if (hints.has("supplier_reply") || (hints.has("supplier_timing") && signal.type === "email.inbound")) {
    if (current.id === "supplier_research" || current.id === "supplier_quote_pending") {
      return stageMove("build_customer_quote", "Supplier inputs received — build customer quote.", "xero.quote.suggested");
    }
  }
  if (hints.has("quotation") && signal.type === "email.outbound") {
    return stageMove("quote_sent", "Outbound quote — mark quote sent.", "xero.quote.suggested");
  }
  if (hints.has("purchase_order") && current.id === "payment_pending") {
    return stageMove("supplier_confirm", "PO / order confirm — place with supplier.", "xero.invoice.accpay.suggested");
  }
  if (signal.type === "email.inbound" && current.id === "inquiry") {
    return stageMove("qualify", "New inquiry — qualify requirements.");
  }

  return {
    stay: true,
    suggestedStageId: current.id,
    reason: current.suggestedNext,
    xeroSuggest: current.xero?.suggest ?? null,
  };
}

function stageMove(stageId, reason, xeroSuggest = null) {
  const stage = journeyStage(stageId);
  return {
    stay: false,
    suggestedStageId: stageId,
    reason: reason || stage?.suggestedNext || "",
    xeroSuggest,
  };
}

/** When supplier is next in the loop for a stage (for HQ dashboards). */
export function supplierLoopDue(stageId) {
  const stage = journeyStage(stageId);
  if (!stage) return false;
  return stage.owner === "supplier" || stage.id === "supplier_research" || stage.id === "supplier_confirm";
}

/** Recognition labels for operator UI (quote / PO / Q&A). */
export function recognizeProcessArtifacts(text) {
  const blob = String(text || "");
  return {
    needsQuotation: QUOTE_PATTERNS.test(blob),
    needsPurchaseOrder: PO_PATTERNS.test(blob),
    needsPaymentFollowUp: PAYMENT_PATTERNS.test(blob),
    needsTrackingShare: TRACKING_PATTERNS.test(blob),
    needsReceiptCheck: ISSUE_PATTERNS.test(blob),
  };
}

export function journeyStageIds() {
  return RDUSA_B2B_JOURNEY.stages.map((s) => s.id);
}
