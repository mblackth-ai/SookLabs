// HQ founder nav + residual static demo copy. Real work lives in the ops store (lib/hq/ops.js).

export const nav = [
  { kind: "section", label: "Command" },
  { kind: "item", id: "overview", label: "Overview", icon: "briefcase", href: "/hq" },
  { kind: "item", id: "goals", label: "Goals", icon: "trending", href: "/hq/goals" },
  { kind: "item", id: "briefing", label: "Daily Briefing", icon: "book", href: "/hq/briefing" },
  { kind: "item", id: "decision-log", label: "Decision Log", icon: "book", href: "/hq/decision-log" },
  { kind: "item", id: "review", label: "Weekly Review", icon: "book", href: "/hq/review" },
  { kind: "section", label: "Projects" },
  { kind: "item", id: "portfolio", label: "Portfolio", icon: "briefcase", href: "/hq/portfolio" },
  { kind: "item", id: "sookly", label: "Sookly", icon: "activity", href: "/hq/sookly" },
  { kind: "subitem", id: "action-plan", label: "Action Plan", icon: "zap", href: "/hq/sookly/action-plan", badge: "board" },
  { kind: "item", id: "seos", label: "SEOS", icon: "trending", href: "/hq/seos" },
  {
    kind: "subitem",
    id: "authority",
    label: "Authority",
    icon: "activity",
    href: "/hq/seos/authority",
    badge: "panel",
  },
  {
    kind: "subitem",
    id: "social-gtm",
    label: "Social GTM",
    icon: "zap",
    href: "/hq/seos/social-gtm",
    badge: "board",
  },
  { kind: "item", id: "roastmyopsec", label: "RoastMyOpSec", icon: "alert", href: "/hq/roastmyopsec" },
  { kind: "item", id: "community", label: "Community", icon: "grid", href: "/hq/community" },
  { kind: "divider" },
  { kind: "section", label: "Coordination" },
  { kind: "item", id: "automation", label: "LLM & Agents", icon: "zap", href: "/hq/automation" },
  { kind: "item", id: "settings", label: "Settings", icon: "settings", href: "/hq/settings" },
];

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
