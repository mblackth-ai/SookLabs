export const FOUR_FRONTS = [
  {
    id: "sookly-journey",
    name: "Sookly Journey / CRM",
    progress: 75,
    phase: "Review gate · draft PR",
    repo: "mblackth-ai/sookly-omnichat",
    branch: "cursor/operational-journey-engine-v1",
    evidenceSha: "2507155ee1283dfb49e14a873259c51b75496953",
    evidence:
      "Acceptance SHA 2507155ee1283dfb49e14a873259c51b75496953. Suites: operational-journey 9/0, tools 12/0, orchestration 7/0; tsc; prisma validate; Actions CI green. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is open and unmerged. In-memory store. No production migration.",
    next: "Mark reviews draft PR #60. Production migration stays unapproved. Progress stays below 100 until merge.",
    blocker: "Draft PR #60 is unmerged. In-memory store. Production migration needs Mark.",
  },
  {
    id: "seos-social",
    name: "SEOS Social Control Plane",
    progress: 80,
    phase: "Review gate · draft PR",
    repo: "mblackth-ai/SEOS",
    branch: "cursor/seos-social-control-plane-mvp1",
    evidenceSha: "844d1369ca5a9d595a1b79c0081738521c39ca99",
    evidence:
      "Branch tip 844d1369ca5a9d595a1b79c0081738521c39ca99 (lifecycle transitions). Lifecycle unit tests PASS 18/0 on 03ac0c5ec4b208bcdd369ef6abb1689443a52a1a, branch cursor/publication-lifecycle-tests-6bb8. Draft PR https://github.com/mblackth-ai/SEOS/pull/2 is open and unmerged.",
    next: "Mark decides whether draft PR #2 merges to the mvp branch or main. Progress stays below 100 until that merge.",
    blocker: "Draft PR #2 is unmerged. Merge target is Mark's decision.",
  },
  {
    id: "rdusa-internal",
    name: "RDUSA Internal Retainer Control",
    progress: 45,
    phase: "Review gate · draft PR",
    repo: "mblackth-ai/rdusa",
    branch: "cursor/rdusa-internal-retainer-control-v1",
    evidenceSha: "510724bef68d3daaa21fa53436c22d75481dbc24",
    evidence:
      "SHA 510724bef68d3daaa21fa53436c22d75481dbc24. Ledger file evidence pass. Draft PR https://github.com/mblackth-ai/rdusa/pull/3 is open and unmerged. Only the SEO/GEO row is fully verified. Other rows are OPEN pending Mark/Andrew.",
    next: "Mark and Andrew verify the OPEN ledger rows beyond SEO/GEO. Progress stays below 100.",
    blocker: "Ledger rows other than SEO/GEO are OPEN pending Mark/Andrew. Draft PR #3 is unmerged.",
  },
  {
    id: "hq-mcp",
    name: "HQ / MCP Gateway",
    progress: 35,
    phase: "Review gate · draft PR",
    repo: "mblackth-ai/SookLabs",
    branch: "cursor/hq-mcp-gateway-v1",
    evidenceSha: "b10b2ad0ff91ad505035e30d11ab26d7b9a836af",
    evidence:
      "Master squash b10b2ad0ff91ad505035e30d11ab26d7b9a836af holds the control-plane read model. Gateway branch cursor/hq-mcp-gateway-v1 tip is 0bb09e2fff8d34b9280368beb52ffc53f06fb82b. This evidence sync is a draft PR in review and records the SEOS, Journey, and RDUSA evidenceSha values.",
    next: "Mark reviews the evidence-sync draft PR before any merge to master. No deploy. MCP write tools remain unbuilt.",
    blocker: "Merge to master and any deploy wait on Mark.",
  },
];

export function getFourFrontsOverall() {
  return Math.round(FOUR_FRONTS.reduce((sum, item) => sum + item.progress, 0) / FOUR_FRONTS.length);
}
