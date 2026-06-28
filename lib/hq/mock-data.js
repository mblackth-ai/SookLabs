// Phase 1 mock data for SookLabs HQ. No fetching, no database, no integrations.
// Mirrors the design-system HQ prototype verbatim.

export const nav = [
  { kind: "section", label: "Command" },
  { kind: "item", id: "executive", label: "Executive", icon: "briefcase", href: "/hq" },
  { kind: "item", id: "briefing", label: "Daily Briefing", icon: "book", href: "/hq/briefing" },
  { kind: "section", label: "Intelligence" },
  { kind: "item", id: "agents", label: "AI Agents", icon: "cpu", href: "/hq/agents", badge: 7 },
  { kind: "item", id: "automation", label: "Automation", icon: "zap", href: "/hq/automation" },
  { kind: "section", label: "Portfolio" },
  { kind: "item", id: "portfolio", label: "All Products", icon: "grid", href: "/hq/portfolio" },
  { kind: "item", id: "sookly", label: "Sookly", icon: "activity", href: "/hq/sookly" },
  { kind: "section", label: "Departments" },
  { kind: "item", id: "marketing", label: "Marketing", icon: "trending", href: "/hq/marketing" },
  { kind: "item", id: "engineering", label: "Engineering", icon: "cpu", href: "/hq/engineering" },
  { kind: "divider" },
  { kind: "section", label: "System" },
  { kind: "item", id: "integrations", label: "Integrations", icon: "plug", href: "/hq/integrations", badge: 12 },
  { kind: "item", id: "settings", label: "Settings", icon: "settings", href: "/hq/settings" },
];

export const currentUser = { name: "James Sook", role: "Founder · CEO" };

export const metrics = [
  { label: "ARR", value: "$142K", delta: "↑ 12%", pos: true, sub: "this quarter" },
  { label: "Active Users", value: "2,840", delta: "↑ 8%", pos: true, sub: "across products" },
  { label: "AI Agents", value: "7", delta: "running now", ai: true, sub: "2 idle" },
  { label: "Integrations", value: "12", delta: "connected", neutral: true, sub: "2 pending" },
];

export const briefingHighlights = [
  "Portfolio ARR reached $142K this quarter — up 12% — driven by Sookly's 18% conversion improvement after the April UI update.",
  'Marketing AI identified an untapped keyword cluster around "AI receptionist for SMEs" — 8.4K monthly searches with no direct competitor ranking.',
  "3 Sookly support tickets have exceeded the 24-hour SLA. Customer Success AI recommends escalating ticket #1042 immediately.",
];

export const attentionItems = [
  { sev: "error", title: "3 support tickets exceeding 24h SLA", time: "2h ago", tag: "Customer Success", action: "Review tickets" },
  { sev: "warning", title: "SEOS domain not indexed by Google", time: "14h ago", tag: "SEO", action: "Search Console" },
  { sev: "warning", title: "Stripe webhook failing intermittently", time: "6h ago", tag: "Engineering", action: "View logs" },
];

export const activityItems = [
  { icon: "ai", agent: "Marketing AI", action: "Generated weekly content calendar + 8 article briefs", time: "1h ago" },
  { icon: "ai", agent: "Engineering AI", action: "Reviewed 3 open PRs — 2 approved, 1 flagged for review", time: "2h ago" },
  { icon: "ext", agent: "Stripe", action: "New subscription — Sookly Pro · $149/mo", time: "3h ago" },
  { icon: "ext", agent: "GitHub", action: "14 commits merged to main on sookly-core", time: "5h ago" },
  { icon: "ai", agent: "Sales AI", action: "Added 3 new leads to pipeline from LinkedIn outreach", time: "7h ago" },
  { icon: "ext", agent: "Analytics", action: "Traffic up 34% on sookly.com vs 30-day avg", time: "11h ago" },
];

export const agents = [
  { name: "CEO AI", role: "Executive synthesis & strategy", status: "running", last: "2h ago" },
  { name: "Engineering AI", role: "Code review & architecture", status: "idle", last: "6h ago" },
  { name: "Marketing AI", role: "Content, SEO & campaigns", status: "running", last: "1h ago" },
  { name: "Sales AI", role: "Pipeline & outreach", status: "running", last: "3h ago" },
  { name: "Finance AI", role: "Revenue analysis & forecasting", status: "idle", last: "1d ago" },
  { name: "Research AI", role: "Market & competitive intelligence", status: "idle", last: "2d ago" },
  { name: "SEO AI", role: "Search expansion & keyword gaps", status: "running", last: "30m ago" },
  { name: "Customer Success AI", role: "Support triage & retention", status: "idle", last: "4h ago" },
  { name: "Operations AI", role: "Systems, infra & automation", status: "idle", last: "12h ago" },
];

export const products = [
  {
    name: "Sookly",
    tagline: "AI Receptionist & Unified Customer Communications",
    status: "live",
    mrr: "$11.2K",
    mrrDelta: "+18%",
    users: 234,
    desc: "Handles all inbound customer communications — calls, messages, emails — with a unified AI inbox.",
  },
  {
    name: "SEOS",
    tagline: "AI Search Expansion Operating System",
    status: "planned",
    eta: "Q3 2026",
    phase: "Phase 1 — core engine",
    desc: "Identifies untapped keyword opportunities and autonomously builds search-optimised content at scale.",
  },
  {
    name: "RoastMyOpSec",
    tagline: "AI Security Platform",
    status: "planned",
    eta: "Q4 2026",
    phase: "Architecture phase",
    desc: "Continuously audits your operational security posture and surfaces risk before it becomes a breach.",
  },
];

export const briefingSections = [
  {
    title: "Portfolio health",
    body: "ARR reached $142K this quarter, up 12% quarter-on-quarter. This growth is primarily driven by Sookly, which saw an 18% improvement in conversion following the April UI update. MRR stands at $11.2K with a net revenue retention of 104%. Finance AI projects ARR will reach $190K by end of Q3 if current growth continues.",
  },
  {
    title: "What changed overnight",
    body: '14 commits were merged to sookly-core on GitHub. Marketing AI completed the weekly content calendar and filed 8 article briefs. Sales AI added 3 new leads from LinkedIn outreach. A new Sookly Pro subscription ($149/mo) was recorded via Stripe at 03:14. Analytics reported a 34% traffic spike on sookly.com — traced to an organic spike in "AI receptionist" search queries.',
  },
  {
    title: "Opportunities",
    body: 'SEO AI flagged a high-value keyword gap: "AI receptionist for SMEs" has 8,400 monthly searches and no direct competitor ranking in positions 1-10. A single landing page optimised for this cluster could generate an estimated 400-600 additional monthly visitors. Recommendation: brief Marketing AI to draft and publish within 5 business days.',
  },
  {
    title: "Risks & attention required",
    body: "3 Sookly support tickets have exceeded the 24-hour SLA. Ticket #1042 involves a mid-market customer at renewal risk — Customer Success AI recommends a direct founder call within 24 hours. The Stripe webhook failure (6 errors in 12 hours) has not yet caused revenue impact but should be patched this sprint to prevent subscription gaps.",
  },
  {
    title: "Recommended actions today",
    body: "1. Call ticket #1042 customer before 5pm.\n2. Approve Marketing AI's content calendar — it's awaiting your sign-off.\n3. Merge PR #284 (Stripe webhook fix) — Engineering AI reviewed and approved.\n4. Review SEOS Q3 milestone plan — Finance AI flagged the resourcing model needs updating.",
  },
];
