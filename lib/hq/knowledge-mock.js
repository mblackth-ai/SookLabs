// HQ mirror of SEOS Knowledge Base mock — Phase 2 static. Keep aligned with SEOS/src/lib/knowledge/knowledge-base.mock.ts

export const knowledgeSummary = {
  workspaceName: "Bangkok Smile Demo Clinic",
  slug: "sookly-demo-clinic",
  updatedAt: "2026-07-01",
  completeness: 75,
  semanticReadiness: 71,
  entityClarity: 6.2,
  faqPublished: 4,
  faqTarget: 12,
  faqApprovedForAI: 3,
};

export const seosHubLinks = [
  {
    href: "/hq/seos/knowledge-base",
    title: "Knowledge Base",
    subtitle: "Canonical business truth — edit once, distribute everywhere",
    badge: "Manual",
  },
  {
    href: "/hq/seos/semantic-readiness",
    title: "Semantic Readiness",
    subtitle: "Entity clarity, llms.txt, schema, AI/search readiness",
    badge: "Computed",
  },
  {
    href: "/hq/seos/content-gaps",
    title: "Content Gaps",
    subtitle: "Knowledge Base vs website content map",
    badge: "3 gaps",
  },
  {
    href: "/hq/seos/social-gtm",
    title: "Social GTM",
    subtitle: "Platform matrix + refactor → publish checklist · no live OAuth",
    badge: "Future OAuth",
  },
  {
    href: "/hq/seos/competitor-signals",
    title: "Competitor Signals",
    subtitle: "Market intel — does not write to Knowledge Base",
    badge: "Static",
  },
  {
    href: "/hq/seos/distribution-map",
    title: "Distribution Map",
    subtitle: "Channel × field publish status",
    badge: "Honest status",
  },
  {
    href: "/hq/seos/exports",
    title: "Exports",
    subtitle: "llms.txt, Schema.org, knowledge.json — draft copy/download",
    badge: "Draft Export",
  },
];

export const sooklyHubLinks = [
  {
    href: "/hq/sookly",
    title: "Product Status",
    subtitle: "Channels, uptime, routing — Sookly ops (not canonical truth)",
    badge: "Manual",
  },
  {
    href: "/hq/sookly/receptionist-readiness",
    title: "Receptionist Readiness",
    subtitle: "Demo placeholder — what AI could say once KB is real",
    badge: "Demo",
  },
  {
    href: "/hq/sookly/knowledge-usage",
    title: "Knowledge Usage",
    subtitle: "Which KB facts power auto-replies per channel",
    badge: "Demo",
  },
];

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

export const contentGaps = [
  { gap: "Entity \"LINE OA clinic workflow\" is inconsistent", priority: 9, action: "SEOS Knowledge Base → Entities" },
  { gap: "FAQ incomplete: \"Does the clinic use AI for patient communication?\"", priority: 7.5, action: "SEOS Knowledge Base → FAQs" },
  { gap: "Policy missing content: Refund Policy", priority: 8, action: "SEOS Knowledge Base → Policies" },
  { gap: "Website page \"Pricing\" (/pricing) is missing vs Knowledge Base", priority: 8.5, action: "Content Gaps" },
];

export const distributionRows = [
  { channel: "Website", fieldGroup: "Business identity", status: "draft_export", lastSynced: "5 days ago" },
  { channel: "Website", fieldGroup: "FAQs", status: "manual", note: "3 of 5 FAQs on site" },
  { channel: "llms.txt", fieldGroup: "Full export", status: "draft_export", lastSynced: "2 days ago" },
  { channel: "Schema.org", fieldGroup: "LocalBusiness", status: "draft_export", lastSynced: "1 week ago" },
  { channel: "Google Business Profile", fieldGroup: "Hours & NAP", status: "future_api" },
  { channel: "Sookly chatbot", fieldGroup: "Approved FAQs", status: "manual", lastSynced: "Static demo" },
];

export const statusLabels = {
  manual: "Manual",
  draft_export: "Draft Export",
  workflow_ready: "Workflow Ready",
  future_api: "Future API",
};

export const llmsTxtPreview = `# Bangkok Smile Dental

> Calm, modern dental care in the heart of Bangkok

Bangkok Smile Dental is a full-service dental clinic...

## FAQ
### What are your opening hours?
Mon–Fri 9am–6pm, Sat 10am–2pm. Closed Sundays.

---
Generated from SEOS Knowledge Base · sookly-demo-clinic`;

export const decisionLogEntries = [
  { date: "2026-07-03", title: "SEOS owns canonical Knowledge Base", body: "Sookly consumes via read-only views. No duplicate FAQ stores." },
  { date: "2026-07-01", title: "Phase 2 static implementation", body: "Mock KB + generators. No database until Phase 3." },
  { date: "2026-06-28", title: "HQ subdomain live", body: "hq.sooklabs.com password gate Phase 1." },
];
