// RDUSA-style B2B order journey — canonical stage model for app.sookly.com and HQ reporting.
// Safe for client and server (no I/O).

/** @typedef {"auto" | "assist" | "manual"} AutomationTier */

export const AUTOMATION_TIERS = ["auto", "assist", "manual"];

export const SIGNAL_TYPES = [
  "email.inbound",
  "email.outbound",
  "quo.message.received",
  "quo.call.completed",
  "quo.call.transcript.completed",
  "calendar.inquiry",
  "calendar.booking.confirmed",
  "chat.inbound",
  "supplier.portal.manual",
  "payment.card.authorized",
  "shipment.tracking",
  "xero.quote.suggested",
  "xero.invoice.accrec.suggested",
  "xero.invoice.accpay.suggested",
];

export const RDUSA_B2B_JOURNEY = {
  id: "rdusa-b2b-display-order",
  version: "2026-10-05",
  label: "RDUSA display order (prospect → supplier → delivery)",
  description:
    "Deterministic case state from first question through supplier pricing, customer quote, payment, supplier confirmation, shipment, and delivery receipt.",
  stages: [
    {
      id: "inquiry",
      label: "Inquiry",
      order: 1,
      owner: "prospect",
      automationTier: "auto",
      summary: "Prospect asks a question (email, chat, Quo SMS/call).",
      entrySignals: ["email.inbound", "quo.message.received", "quo.call.completed", "chat.inbound"],
      suggestedNext: "Capture the question on the contact timeline; classify intent (quote, availability, general).",
      xero: null,
    },
    {
      id: "qualify",
      label: "Qualify",
      order: 2,
      owner: "operator",
      automationTier: "assist",
      summary: "Confirm SKU/spec, qty, delivery window, and site constraints.",
      entrySignals: ["email.outbound"],
      suggestedNext: "Reply with clarifying questions or mark ready for supplier research.",
      xero: null,
    },
    {
      id: "supplier_research",
      label: "Supplier research",
      order: 3,
      owner: "operator",
      automationTier: "manual",
      summary: "Contact supplier or use supplier portal login for price and availability.",
      entrySignals: ["email.outbound", "supplier.portal.manual"],
      suggestedNext: "Log supplier reference, expected response time, and portal evidence link.",
      xero: { suggest: "xero.invoice.accpay.suggested", when: "After supplier confirms buy price (draft PO/bill only)." },
    },
    {
      id: "supplier_quote_pending",
      label: "Awaiting supplier",
      order: 4,
      owner: "supplier",
      automationTier: "assist",
      summary: "Waiting on supplier pricing, MOQ, or lead time.",
      entrySignals: ["email.inbound"],
      suggestedNext: "If overdue, nudge supplier; update supplier_next_due on the case.",
      xero: null,
    },
    {
      id: "build_customer_quote",
      label: "Build customer quote",
      order: 5,
      owner: "operator",
      automationTier: "assist",
      summary: "Apply margin, delivery, and terms from supplier inputs.",
      entrySignals: [],
      suggestedNext: "Draft customer quote; attach line items and delivery date.",
      xero: { suggest: "xero.quote.suggested", when: "Draft sales quote in Xero (ACCREC) for operator approval." },
    },
    {
      id: "quote_sent",
      label: "Quote sent",
      order: 6,
      owner: "prospect",
      automationTier: "auto",
      summary: "Quote and delivery info sent to prospect.",
      entrySignals: ["email.outbound"],
      suggestedNext: "Track open/reply; set follow-up if no response.",
      xero: { suggest: "xero.quote.suggested", when: "Link Xero quote id on the case when sent." },
    },
    {
      id: "payment_pending",
      label: "Payment pending",
      order: 7,
      owner: "prospect",
      automationTier: "assist",
      summary: "Awaiting card approval or PO from prospect.",
      entrySignals: ["payment.card.authorized", "email.inbound"],
      suggestedNext: "On payment, move to supplier confirm and suggest ACCREC invoice.",
      xero: { suggest: "xero.invoice.accrec.suggested", when: "Create or link customer invoice after payment authorized." },
    },
    {
      id: "supplier_confirm",
      label: "Confirm with supplier",
      order: 8,
      owner: "operator",
      automationTier: "manual",
      summary: "Place or confirm order with supplier (portal or email).",
      entrySignals: ["email.outbound", "supplier.portal.manual"],
      suggestedNext: "Record supplier order ref and promised ship date.",
      xero: { suggest: "xero.invoice.accpay.suggested", when: "Draft supplier bill/PO when order is confirmed." },
    },
    {
      id: "supplier_fulfilment",
      label: "Supplier fulfilment",
      order: 9,
      owner: "supplier",
      automationTier: "assist",
      summary: "Supplier prepares and ships to prospect.",
      entrySignals: ["shipment.tracking", "email.inbound"],
      suggestedNext: "When tracking exists, notify prospect.",
      xero: null,
    },
    {
      id: "tracking_shared",
      label: "Tracking shared",
      order: 10,
      owner: "operator",
      automationTier: "auto",
      summary: "Tracking and order confirmation sent to prospect.",
      entrySignals: ["email.outbound", "shipment.tracking"],
      suggestedNext: "Monitor delivery ETA.",
      xero: null,
    },
    {
      id: "delivery_confirm",
      label: "Delivery confirm",
      order: 11,
      owner: "prospect",
      automationTier: "assist",
      summary: "Confirm arrival with prospect.",
      entrySignals: ["email.inbound"],
      suggestedNext: "If issues, open receipt_check; else close won.",
      xero: null,
    },
    {
      id: "receipt_check",
      label: "Receipt / issue check",
      order: 12,
      owner: "operator",
      automationTier: "assist",
      summary: "Only when damage, shortage, or mismatch reported.",
      entrySignals: ["email.inbound", "quo.call.transcript.completed"],
      suggestedNext: "Document issue evidence; coordinate supplier remedy.",
      xero: null,
    },
    {
      id: "closed_won",
      label: "Closed won",
      order: 13,
      owner: "system",
      automationTier: "auto",
      summary: "Order complete; learn from manual steps for automation candidates.",
      entrySignals: [],
      suggestedNext: "Archive case; feed manual-step log into automation backlog.",
      xero: null,
    },
  ],
};

const STAGE_BY_ID = new Map(RDUSA_B2B_JOURNEY.stages.map((stage) => [stage.id, stage]));

export function journeyStage(stageId) {
  return STAGE_BY_ID.get(String(stageId || "").trim()) || null;
}

export function suggestedActionForCase(caseRow) {
  const stage = journeyStage(caseRow?.stageId);
  if (!stage) return { action: "Unknown stage.", tier: "manual", xero: null };
  let action = stage.suggestedNext;
  if (caseRow?.blocker) action = `${action} Blocker: ${caseRow.blocker}`;
  if (caseRow?.supplierNextDue) action = `${action} Supplier due: ${caseRow.supplierNextDue}.`;
  return { action, tier: stage.automationTier, xero: stage.xero };
}

export function kanbanColumns(template = RDUSA_B2B_JOURNEY) {
  return [...template.stages].sort((a, b) => a.order - b.order);
}
