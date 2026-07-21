// HQ demo/consumption mirrors — Phase 2 static. Only exports still used by Sookly demo pages.

export const sooklyReadiness = {
  score: 67,
  safeToAutoReplyPercent: 60,
  approvedFaqCount: 3,
  totalFaqCount: 5,
  blockers: [
    "FAQ not approved for AI: \"How much does teeth whitening cost?\"",
    "Policy missing content: Refund Policy",
    "Pricing note \"Whitening\" has no AI-approved FAQ answer",
    "Escalation rule needs clear policy: Implant consultations require deposit",
  ],
};

export const knowledgeUsage = [
  { intent: "Opening hours enquiry", channel: "LINE", kbId: "faq-hours", label: "What are your opening hours?", status: "manual" },
  { intent: "First visit preparation", channel: "Website chat", kbId: "faq-first", label: "What should first-time patients bring?", status: "manual" },
  { intent: "Whitening price enquiry", channel: "WhatsApp", kbId: "faq-whitening-price", label: "How much does teeth whitening cost?", status: "manual" },
  { intent: "Cancellation policy", channel: "All channels", kbId: "pol-cancel", label: "Cancellation Policy", status: "manual" },
  { intent: "Implant booking", channel: "Messenger", kbId: "br-implant", label: "Implant consultations require deposit", status: "manual" },
];

export const statusLabels = {
  manual: "Manual",
  draft_export: "Draft Export",
  workflow_ready: "Workflow Ready",
  future_api: "Future API",
};
