// HQ founder nav (lib/hq/nav.js) + residual static demo copy. Real work lives in the ops store (lib/hq/ops.js).

export { nav } from "./nav.js";

export const currentUser = { name: "Mark", role: "Founder" };

/** Honest static hints only — no fake ARR/SLA/agent fleets. */
export const briefingHighlights = [
  "Use Daily Briefing notes in the ops store — not mock ARR or SLA figures.",
  "Open Goals and Blockers before diving into a product board.",
  "Authority panel nests under Projects → SEOS; open seos.sooklabs.com for operator work.",
];

export const products = [
  {
    name: "Sookly",
    tagline: "Incoming control — omnichannel AI receptionist",
    status: "in progress",
    phase: "MVP1 checklist in HQ",
    desc: "Handles inbound customer communications. Product lives at sookly.co — HQ tracks build work only.",
    href: "/hq/sookly",
  },
  {
    name: "SEOS",
    tagline: "Outgoing control — visibility and expansion",
    status: "in progress",
    eta: "MVP1",
    phase: "Context · Refactor · Authority",
    desc: "Operator desk for SEO/GEO, content refactor, and authority. Open seos.sooklabs.com for execution.",
    href: "/hq/seos",
  },
  {
    name: "RoastMyOpSec",
    tagline: "AI Security Platform",
    status: "planned",
    eta: "Q4 2026",
    phase: "Architecture phase",
    desc: "Continuously audits your operational security posture and surfaces risk before it becomes a breach.",
    href: "/hq/roastmyopsec",
  },
];

export const briefingSections = [
  {
    title: "How to use briefing",
    body: "Write real notes in the three panels below. Ask AI dispatches a job to your selected agent; results land via webhook callback into these sections. No mock ARR or SLA copy.",
  },
];
