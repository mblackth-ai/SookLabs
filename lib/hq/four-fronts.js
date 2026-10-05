export const FOUR_FRONTS = [
  {
    id: "sookly-journey",
    name: "Sookly Journey / CRM",
    progress: 68,
    phase: "Implementation",
    repo: "mblackth-ai/sookly-omnichat",
    branch: "cursor/operational-journey-engine-v1",
    evidence: "HQ M2 ingest contract: schema, signal router, dry-run POST /hq/api/sookly/journey/signals, kanban pilot",
    next: "Persist events in app repo; production Quo webhook + Resend inbound; replace pilot cases",
    blocker: "No human blocker",
  },
  {
    id: "seos-social",
    name: "SEOS Social Control Plane",
    progress: 25,
    phase: "Foundation → UI",
    repo: "mblackth-ai/SEOS",
    branch: "cursor/seos-social-control-plane-mvp1",
    evidence: "Calendar-first Publication Job MVP spec + product decision committed",
    next: "Calendar surface over existing queue/schedule state, then real channel adapters",
    blocker: "No human blocker",
  },
  {
    id: "rdusa-internal",
    name: "RDUSA Internal Retainer Control",
    progress: 20,
    phase: "Evidence consolidation",
    repo: "mblackth-ai/rdusa",
    branch: "cursor/rdusa-internal-retainer-control-v1",
    evidence: "Historical GSC/GA4, plans, reports, competitor work, social and SEO evidence indexed",
    next: "Master responsibilities contract, contribution ledger, historical decision map",
    blocker: "No human blocker",
  },
  {
    id: "hq-mcp",
    name: "HQ / MCP Gateway",
    progress: 35,
    phase: "Control-plane build",
    repo: "mblackth-ai/SookLabs",
    branch: "cursor/hq-mcp-gateway-v1",
    evidence: "Existing HQ agent dispatch, pending jobs, callbacks, ops state and n8n routing",
    next: "Cross-project MCP tools, normalized status, approvals, event-driven callbacks",
    blocker: "No human blocker",
  },
];

export function getFourFrontsOverall() {
  return Math.round(FOUR_FRONTS.reduce((sum, item) => sum + item.progress, 0) / FOUR_FRONTS.length);
}
