export const PLAN_HORIZON = {
  asOf: "2026-10-01",
  start: "2026-10-02",
  end: "2026-10-31",
  note: "Review windows anchored to 1 Oct 2026. They sequence known next steps. They are not completion dates.",
};

export const FOUR_FRONTS = [
  {
    id: "sookly-journey",
    name: "Sookly Journey / CRM",
    progress: 75,
    phase: "Review gate · draft PR",
    repo: "mblackth-ai/sookly-omnichat",
    branch: "cursor/operational-journey-engine-v1",
    evidenceSha: "2507155ee1283dfb49e14a873259c51b75496953",
    pr: {
      number: 60,
      url: "https://github.com/mblackth-ai/sookly-omnichat/pull/60",
      state: "draft",
      merged: false,
    },
    gates: [
      { id: "acceptance", label: "acceptance suites and CI green at 2507155", met: true },
      { id: "persistence", label: "persistence gate green at a30aedd", met: true, sha: "a30aedd" },
      { id: "merge-60", label: "Mark merges draft PR #60", met: false, owner: "Mark" },
      { id: "prod-migrate", label: "a separate production migration is approved", met: false, owner: "Mark" },
      { id: "http-route", label: "a product HTTP route exists", met: false, owner: "Cursor" },
    ],
    evidence:
      "Acceptance SHA 2507155ee1283dfb49e14a873259c51b75496953. Suites: operational-journey 9/0, tools 12/0, orchestration 7/0; tsc; prisma validate; Actions CI green. Persistence gate is green at a30aedd. Draft PR https://github.com/mblackth-ai/sookly-omnichat/pull/60 is open and unmerged. Production migration is a separate gate. Product HTTP route is still a gap.",
    next: "Mark merge yes on draft PR #60. Production migration stays separate. Product HTTP route is still a gap.",
    blocker: "Draft PR #60 is unmerged. Production migration is not approved. Product HTTP route is still a gap.",
  },
  {
    id: "seos-social",
    name: "SEOS Social Control Plane",
    progress: 80,
    phase: "Review gate · draft PR",
    repo: "mblackth-ai/SEOS",
    branch: "cursor/seos-social-control-plane-mvp1",
    evidenceSha: "844d1369ca5a9d595a1b79c0081738521c39ca99",
    pr: {
      number: 2,
      url: "https://github.com/mblackth-ai/SEOS/pull/2",
      state: "draft",
      merged: false,
    },
    gates: [
      {
        id: "lifecycle-tests",
        label: "lifecycle unit tests PASS 18/0 on 03ac0c5",
        met: true,
        sha: "03ac0c5ec4b208bcdd369ef6abb1689443a52a1a",
      },
      { id: "merge-2", label: "Mark merges draft PR #2 to the mvp branch or main", met: false, owner: "Mark" },
    ],
    evidence:
      "Branch tip 844d1369ca5a9d595a1b79c0081738521c39ca99 (lifecycle transitions). Lifecycle unit tests PASS 18/0 on 03ac0c5ec4b208bcdd369ef6abb1689443a52a1a, branch cursor/publication-lifecycle-tests-6bb8. Draft PR https://github.com/mblackth-ai/SEOS/pull/2 is open and unmerged.",
    next: "Mark merge yes on draft PR #2. Progress stays below 100 until that merge.",
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
    pr: {
      number: 3,
      url: "https://github.com/mblackth-ai/rdusa/pull/3",
      state: "draft",
      merged: false,
    },
    gates: [
      { id: "seo-geo", label: "SEO/GEO ledger row verified at 510724be", met: true },
      { id: "open-rows", label: "Andrew and Mark verify OPEN rows beyond SEO/GEO", met: false, owner: "Andrew / Mark" },
      { id: "merge-3", label: "Mark merges draft PR #3", met: false, owner: "Mark" },
    ],
    evidence:
      "SHA 510724bef68d3daaa21fa53436c22d75481dbc24. Ledger file evidence pass. Draft PR https://github.com/mblackth-ai/rdusa/pull/3 is open and unmerged. Only the SEO/GEO row is fully verified. Other rows are OPEN pending Mark/Andrew.",
    next: "Andrew and Mark close the OPEN ledger rows. Ledger merge of draft PR #3 waits on that.",
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
    pr: {
      number: 5,
      url: "https://github.com/mblackth-ai/SookLabs/pull/5",
      state: "draft",
      merged: false,
    },
    gates: [
      { id: "evidence-sync", label: "evidence sync is drafted in PR #5", met: true },
      { id: "merge-5", label: "Mark merges draft PR #5", met: false, owner: "Mark" },
      { id: "new-evidence", label: "a later percentage cites new verified evidence", met: false, owner: "Cursor" },
    ],
    evidence:
      "Master squash b10b2ad0ff91ad505035e30d11ab26d7b9a836af holds the control-plane read model. Gateway branch cursor/hq-mcp-gateway-v1 tip is 0bb09e2fff8d34b9280368beb52ffc53f06fb82b. Draft PR https://github.com/mblackth-ai/SookLabs/pull/5 records the SEOS, Journey, and RDUSA evidence. A later percentage change needs new verified evidence.",
    next: "Mark merges draft PR #5. The HQ percentage stays 35 until a later change cites new verified evidence.",
    blocker: "Merge to master and any deploy wait on Mark.",
  },
];

export const FRONT_PLAN = [
  {
    id: "journey-merge-60",
    frontId: "sookly-journey",
    title: "Mark merge yes on sookly-omnichat #60",
    window: { start: "2026-10-02", end: "2026-10-08", label: "2–8 Oct 2026" },
    owner: "Mark",
    dependency: "Draft PR #60. Persistence gate green at a30aedd. Acceptance SHA 2507155.",
    status: "ready",
  },
  {
    id: "journey-prod-migrate",
    frontId: "sookly-journey",
    title: "Separate production migration",
    window: { start: "2026-10-09", end: "2026-10-31", label: "9–31 Oct 2026" },
    owner: "Mark",
    dependency: "Merge of #60, then an explicit production migration approval.",
    status: "blocked",
  },
  {
    id: "journey-http-route",
    frontId: "sookly-journey",
    title: "Product HTTP route",
    window: { start: "2026-10-09", end: "2026-10-31", label: "9–31 Oct 2026" },
    owner: "Cursor",
    dependency: "Still a gap. No product HTTP route is in the verified evidence.",
    status: "queued",
  },
  {
    id: "seos-merge-2",
    frontId: "seos-social",
    title: "Mark merge yes on SEOS #2 lifecycle tests",
    window: { start: "2026-10-02", end: "2026-10-08", label: "2–8 Oct 2026" },
    owner: "Mark",
    dependency: "Draft PR #2. Lifecycle tests PASS 18/0 on 03ac0c5.",
    status: "ready",
  },
  {
    id: "rdusa-open-rows",
    frontId: "rdusa-internal",
    title: "OPEN ledger rows beyond SEO/GEO",
    window: { start: "2026-10-02", end: "2026-10-31", label: "2–31 Oct 2026" },
    owner: "Andrew / Mark",
    dependency: "Only the SEO/GEO row is verified. Other rows are OPEN.",
    status: "blocked",
  },
  {
    id: "rdusa-merge-3",
    frontId: "rdusa-internal",
    title: "Ledger merge of rdusa #3",
    window: { start: "2026-10-09", end: "2026-10-31", label: "9–31 Oct 2026" },
    owner: "Mark",
    dependency: "Draft PR #3. Waits on the OPEN rows beyond SEO/GEO.",
    status: "blocked",
  },
  {
    id: "hq-merge-5",
    frontId: "hq-mcp",
    title: "Merge SookLabs #5 evidence sync",
    window: { start: "2026-10-02", end: "2026-10-08", label: "2–8 Oct 2026" },
    owner: "Mark",
    dependency: "Draft PR #5. Merging it does not raise the HQ percentage by itself.",
    status: "ready",
  },
  {
    id: "hq-bump-from-evidence",
    frontId: "hq-mcp",
    title: "Bump HQ percentage only from new verified evidence",
    window: { start: "2026-10-09", end: "2026-10-31", label: "9–31 Oct 2026" },
    owner: "Cursor",
    dependency: "After #5 merges, a new evidenceSha is required before the percentage changes.",
    status: "queued",
  },
];

export function planStatusVariant(status) {
  switch (status) {
    case "ready":
      return "accent";
    case "blocked":
      return "warning";
    case "queued":
      return "outline";
    default: {
      const unknown = status;
      throw new Error(`Unknown plan status: ${String(unknown)}`);
    }
  }
}

export function getFrontInsight(front) {
  const gates = front.gates || [];
  const met = gates.filter((gate) => gate.met);
  const open = gates.filter((gate) => !gate.met);
  const pr = front.pr || null;

  return {
    progress: front.progress,
    phase: front.phase,
    evidenceSha: front.evidenceSha || null,
    pr,
    blocker: front.blocker,
    nextGate: front.next,
    metGates: met.map((gate) => gate.label),
    openGates: open.map((gate) => ({ id: gate.id, label: gate.label, owner: gate.owner || null })),
    raiseProgress: open.length
      ? `Stays at ${front.progress}% until ${open.map((gate) => gate.label).join("; ")}.`
      : `No open gate is recorded. ${front.progress}% is not treated as 100.`,
    stallRisk: open.length
      ? `If this stalls, it remains ${front.progress}% with ${open.length} open ${open.length === 1 ? "gate" : "gates"}.`
      : `No open gate is recorded at ${front.progress}%.`,
  };
}

export function getPlanSummary(items = FRONT_PLAN) {
  const counts = { queued: 0, blocked: 0, ready: 0 };
  for (const item of items) {
    switch (item.status) {
      case "queued":
      case "blocked":
      case "ready":
        counts[item.status] += 1;
        break;
      default: {
        const unknown = item.status;
        throw new Error(`Unknown plan status: ${String(unknown)}`);
      }
    }
  }
  return counts;
}

export function getPlanHorizon() {
  return {
    ...PLAN_HORIZON,
    counts: getPlanSummary(),
    items: FRONT_PLAN,
  };
}

export function getFourFrontsOverall() {
  return Math.round(FOUR_FRONTS.reduce((sum, item) => sum + item.progress, 0) / FOUR_FRONTS.length);
}

function assertVerifiedBoard() {
  const expected = {
    "sookly-journey": 75,
    "seos-social": 80,
    "rdusa-internal": 45,
    "hq-mcp": 35,
  };
  for (const front of FOUR_FRONTS) {
    if (front.progress !== expected[front.id]) {
      throw new Error(`Progress for ${front.id} is ${front.progress}, expected ${expected[front.id]}`);
    }
    if (front.progress >= 100) {
      throw new Error(`${front.id} is at ${front.progress}`);
    }
    if (front.pr?.merged) {
      throw new Error(`${front.id} is marked merged`);
    }
    getFrontInsight(front);
  }
  const ids = new Set(FOUR_FRONTS.map((front) => front.id));
  for (const item of FRONT_PLAN) {
    planStatusVariant(item.status);
    if (!ids.has(item.frontId)) {
      throw new Error(`Plan item ${item.id} has unknown front ${item.frontId}`);
    }
  }
  if (getFourFrontsOverall() !== 59) {
    throw new Error(`Overall progress is ${getFourFrontsOverall()}`);
  }
}

assertVerifiedBoard();
