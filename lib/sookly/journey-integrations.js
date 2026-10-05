// Integration slots for Sookly journey (HQ status only — not live connectors in this repo).

export const SOOKLY_INTEGRATION_SLOTS = [
  {
    id: "email-resend",
    label: "Email sync (Resend)",
    role: "Timeline + journey signals",
    status: "workflow_ready",
    env: ["RESEND_API_KEY", "SOOKLY_INBOUND_EMAIL_WEBHOOK_SECRET"],
    inboundPath: "/api/integrations/email/inbound (app.sookly.com — planned)",
    journeySignals: ["email.inbound", "email.outbound"],
    hqNote: "HQ already uses Resend for marketing contact; app needs per-tenant inbound routing into journey_case_events.",
  },
  {
    id: "quo-transcripts",
    label: "Quo (OpenPhone) calls & SMS",
    role: "Transcripts + contact match",
    status: "manual",
    env: ["QUO_API_KEY", "QUO_WEBHOOK_SECRET"],
    docs: "https://www.quo.com/docs/2026-03-30/webhooks-overview",
    events: ["call.transcript.completed", "message.received", "contact.updated"],
    inboundPath: "/api/integrations/quo/webhook (planned)",
    journeySignals: ["quo.call.transcript.completed", "quo.message.received"],
    hqNote: "Subscribe with Quo-Api-Version 2026-03-30; verify webhook-signature; map contact.ids → Sookly contact.",
  },
  {
    id: "calendar-booking",
    label: "Calendar booking",
    role: "Prospect self-serve slots",
    status: "manual",
    env: ["SOOKLY_CALENDAR_PROVIDER"],
    journeySignals: ["calendar.inquiry", "calendar.booking.confirmed"],
    hqNote: "Reference UI kit states new/assigned/booked; wire to journey stage qualify → quote_sent.",
  },
  {
    id: "xero-finance",
    label: "Xero quotes & invoices",
    role: "PO / AR / AP suggestions",
    status: "workflow_ready",
    env: ["XERO_* via MCP or OAuth in app"],
    journeySignals: ["xero.quote.suggested", "xero.invoice.accrec.suggested", "xero.invoice.accpay.suggested"],
    hqNote: "Suggest-only until operator approves; never auto-post bills or customer invoices without gate.",
  },
  {
    id: "supplier-portal",
    label: "Supplier websites",
    role: "Price, availability, place order",
    status: "manual",
    env: [],
    journeySignals: ["supplier.portal.manual"],
    hqNote: "Logged as manual evidence with URL + screenshot; automation backlog tracks repeat suppliers.",
  },
];

export const INTEGRATION_STATUS_LABEL = {
  connected: "Connected",
  workflow_ready: "Workflow Ready",
  manual: "Manual",
  future: "Future API",
};
