import { readFileSync } from "fs";
import { resolve } from "path";

/** Operator-facing finish line. Do not weaken this sentence. */
export const RDUSA_PILOT_GOLDEN_RULE =
  "RDUSA is pilot ready when a real RDUSA operator can open a contact in Sookly, understand exactly where that contact is in the business process, see what must happen next and who owns it, perform or approve the next permitted action, hand the work to another operator if necessary, close and reopen the app, and find the same correct operational state preserved, without relying on human memory, spreadsheets, side messages or undocumented knowledge.";

export const RDUSA_PILOT_CONTRACT_PATH = "docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md";

export const RDUSA_PILOT_CONTRACT_URL =
  "https://github.com/mblackth-ai/SookLabs/blob/cursor/hq-four-front-evidence-sync-f8c4/docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md";

const ENGINE = {
  sha: "cf3d866864e8bc7cf10826d2e7d49a1f67b015d7",
  shortSha: "cf3d866",
  repo: "mblackth-ai/sookly-omnichat",
  branch: "cursor/operational-journey-engine-v1",
  prNumber: 60,
  pr: "https://github.com/mblackth-ai/sookly-omnichat/pull/60",
  ciRun: "36926423635",
  ci: "https://github.com/mblackth-ai/sookly-omnichat/actions/runs/36926423635",
};

const SCORECARD_START = "<!-- rdusa-scorecard:start -->";
const SCORECARD_END = "<!-- rdusa-scorecard:end -->";

function engineEvidence(detail) {
  return `${detail} Tip ${ENGINE.sha} (${ENGINE.shortSha}) on ${ENGINE.branch}. Draft PR ${ENGINE.pr} is unmerged. CI ${ENGINE.ci} postgres-migrate-and-build SUCCESS. This HQ slice did not re-run sookly-omnichat tests.`;
}

function criterion(entry) {
  return {
    parentId: null,
    ...entry,
  };
}

export const RDUSA_PILOT_CRITERIA = [
  criterion({
    id: "engine-prisma-persistence",
    criterion: "Prisma production path (PrismaJourneyStore + persistent-approval)",
    level: "major",
    status: "PASS",
    evidence: engineEvidence(
      "Production path modules are PrismaJourneyStore and persistent-approval, not MemoryJourneyStore. npm run test:operational-journey:persistent 26/0."
    ),
  }),
  criterion({
    id: "engine-tenant-isolation",
    criterion: "Journey engine tenant isolation",
    level: "major",
    status: "PASS",
    evidence: engineEvidence("Tenant isolation is in the verified engine bundle, with the persistent suite at 26/0."),
  }),
  criterion({
    id: "engine-blockers",
    criterion: "Journey engine blockers",
    level: "major",
    status: "PASS",
    evidence: engineEvidence("Blocker enforcement is in the verified engine bundle, with the persistent suite at 26/0."),
  }),
  criterion({
    id: "engine-approval-reject-expiry",
    criterion: "Approval reject and expiry",
    level: "major",
    status: "PASS",
    evidence: engineEvidence(
      "npm run test:human-approval-gate 8/0. Rejected and expired approvals stay rejected. Persistent suite 26/0."
    ),
  }),
  criterion({
    id: "engine-human-approval-boundaries",
    criterion: "Human approval boundaries",
    level: "major",
    status: "PASS",
    evidence: engineEvidence(
      "npm run test:human-approval-gate 8/0. Existing human approval gates stay intact at the engine."
    ),
  }),
  criterion({
    id: "product-prisma-path",
    criterion: "Product HTTP / inbox calls PrismaJourneyStore",
    level: "major",
    status: "PASS",
    evidence: engineEvidence(
      "Product HTTP path calls PrismaJourneyStore. MemoryJourneyStore is not a silent fallback. npm run test:operational-journey:persistent 26/0. Staging smoke and production migration stay open and do not reopen this row."
    ),
  }),
  criterion({
    id: "operator-ui-integration",
    criterion: "Operator Journey UI",
    level: "major",
    status: "PASS",
    evidence: engineEvidence(
      "Contact, Journey, and AI Assistant rail is in the product. Journey view minimum and operator actions are PASS sub-gates. The phone-call VA workspace stays NOT STARTED and does not reopen this row."
    ),
  }),
  criterion({
    id: "ai-journey-context",
    criterion: "Product AI Journey context",
    level: "major",
    status: "PASS",
    evidence: engineEvidence(
      "Product assistant answers from Contact, Conversation, Journey, SOP, and permissions. Stage-aware guidance is a PASS sub-gate. The product must-not list stays on ai-safety-product and is not closed by this row."
    ),
  }),
  criterion({
    id: "loose-end-surfacing",
    criterion: "Loose-end detection surfaced to operators",
    level: "major",
    status: "PASS",
    evidence: engineEvidence(
      "Product surface shows overdue next actions, quote follow-up gaps, payment silence, unresolved blockers, idle Journeys, unassigned owners, and unanswered customer responses. The stalled fixture sub-gate is PASS."
    ),
  }),
  criterion({
    id: "scenario-a-happy-path",
    criterion: "Acceptance scenario A happy path",
    level: "major",
    status: "PASS",
    evidence: engineEvidence(
      "Inquiry through Complete is accepted on the product path with close and reopen persistence. Persistent suite 26/0. No staging smoke and no production deploy are claimed."
    ),
  }),
  criterion({
    id: "scenario-b-blocked-path",
    criterion: "Acceptance scenario B blocked path",
    level: "major",
    status: "PASS",
    evidence: engineEvidence(
      "Product acceptance shows a blocker, a refused advance, a recorded clear, then continue. History keeps both the set and the clear."
    ),
  }),
  criterion({
    id: "scenario-c-staff-handoff",
    criterion: "Acceptance scenario C staff handoff",
    level: "major",
    status: "PASS",
    evidence: engineEvidence(
      "Andrew or Mark to a VA, continuing from Sookly alone, is accepted on the product path. This row is also the staff-handoff gate."
    ),
  }),
  criterion({
    id: "merge-pr-60",
    criterion: "Merge sookly-omnichat PR #60",
    level: "major",
    status: "BLOCKED",
    evidence: `Pending Mark. ${ENGINE.pr} is draft and unmerged at ${ENGINE.shortSha}. This slice must not merge.`,
  }),
  criterion({
    id: "prod-migrate",
    criterion: "Production database migration",
    level: "major",
    status: "BLOCKED",
    evidence: "Pending Mark. Production migration has not been reviewed, approved, or run. This slice must not migrate.",
  }),
  criterion({
    id: "production-deploy",
    criterion: "Production deploy",
    level: "major",
    status: "BLOCKED",
    evidence: "Pending Mark. No production deploy is authorized. This slice must not deploy.",
  }),
  criterion({
    id: "live-pilot-10-20",
    criterion: "Live RDUSA pilot, 10 to 20 real Journeys",
    level: "major",
    status: "NOT STARTED",
    evidence: "No live RDUSA Journey cohort has been run after activation. The success bar in this contract is unmet.",
  }),
  criterion({
    id: "va-sop-product-facing",
    criterion: "VA handoff SOP inside the operator product",
    level: "major",
    status: "PASS",
    evidence: engineEvidence(
      "Section 11 SOP is published inside the Sookly operator workspace. The live 10 to 20 Journey cohort stays NOT STARTED."
    ),
  }),
  criterion({
    id: "test-operational-journey-persistent",
    criterion: "Persistent Journey suite 26/0",
    level: "sub-gate",
    parentId: "engine-prisma-persistence",
    status: "PASS",
    evidence: engineEvidence("npm run test:operational-journey:persistent 26/0."),
  }),
  criterion({
    id: "test-operational-journey",
    criterion: "In-memory Journey suite green on CI",
    level: "sub-gate",
    parentId: "engine-prisma-persistence",
    status: "PASS",
    evidence: engineEvidence(
      "In-memory journey suite is green on this CI run, with tsc and next build. This suite is not the production path. This HQ slice did not re-count it, so no pass count is restated."
    ),
  }),
  criterion({
    id: "test-human-approval-gate",
    criterion: "Human approval gate suite 8/0",
    level: "sub-gate",
    parentId: "engine-human-approval-boundaries",
    status: "PASS",
    evidence: engineEvidence("npm run test:human-approval-gate 8/0."),
  }),
  criterion({
    id: "test-ops-command",
    criterion: "Ops command suite",
    level: "sub-gate",
    parentId: "engine-prisma-persistence",
    status: "PASS",
    evidence: engineEvidence(
      "npm run test:ops-command was 102/0 at a30aedd. This HQ slice did not re-count that suite. CI on this tip is SUCCESS for tsc and next build."
    ),
  }),
  criterion({
    id: "test-agent-tools",
    criterion: "Agent tools suite",
    level: "sub-gate",
    parentId: "ai-journey-context",
    status: "PASS",
    evidence: engineEvidence(
      "tools.test.ts was 12/0 at a30aedd. This HQ slice did not re-count that suite. ai-journey-context is PASS from product evidence, not from this suite alone."
    ),
  }),
  criterion({
    id: "ci-postgres-migrate-and-build",
    criterion: "CI postgres-migrate-and-build",
    level: "sub-gate",
    parentId: "engine-prisma-persistence",
    status: "PASS",
    evidence: engineEvidence(
      "Actions run 36926423635 postgres-migrate-and-build SUCCESS. tsc and next build are green. In-memory journey is green. Human approval is 8/0. Ephemeral CI migrate is not a production migration."
    ),
  }),
  criterion({
    id: "operator-journey-rail",
    criterion: "Collapsible Contact, Journey, and AI Assistant rail",
    level: "sub-gate",
    parentId: "operator-ui-integration",
    status: "PASS",
    evidence: engineEvidence("Collapsible Contact, Journey, and AI Assistant rail is present on the product path."),
  }),
  criterion({
    id: "journey-view-minimum",
    criterion: "Journey view minimum fields",
    level: "sub-gate",
    parentId: "operator-ui-integration",
    status: "PASS",
    evidence: engineEvidence(
      "Journey view shows current stage, Journey status, owner, next action, due date, blocker, indicators, SOP guidance, and recent evidence together."
    ),
  }),
  criterion({
    id: "phone-va-workspace",
    criterion: "Phone-call VA keeps the contact open",
    level: "sub-gate",
    parentId: "operator-ui-integration",
    status: "NOT STARTED",
    evidence:
      "The Contact, Journey, and AI rail does not by itself prove a phone-call VA can keep the contact open. That workspace is not in the cited product evidence for this tip.",
  }),
  criterion({
    id: "operator-journey-actions",
    criterion: "Operator Journey actions on the product path",
    level: "sub-gate",
    parentId: "operator-ui-integration",
    status: "PASS",
    evidence: engineEvidence(
      "Create, read, update situation, advance stage, assign owner, set or clear blocker, create or update case, record evidence, and complete or cancel are on the Prisma-backed product path. MemoryJourneyStore is not a silent fallback."
    ),
  }),
  criterion({
    id: "canonical-lifecycle-in-product",
    criterion: "Seven-stage lifecycle in the product",
    level: "sub-gate",
    parentId: "operator-ui-integration",
    status: "PASS",
    evidence: engineEvidence(
      "Scenario A advances Inquiry, Qualification, Requirements, Quote, Review & Payment, Fulfilment, and Complete on the product path. Engine enum tokens were not re-read in this slice."
    ),
  }),
  criterion({
    id: "four-dimensions-in-product",
    criterion: "Four state dimensions separated in the product",
    level: "sub-gate",
    parentId: "operator-ui-integration",
    status: "NOT STARTED",
    evidence:
      "Conversation, contact classification, Journey state, and ownership are defined here. This tip's cited evidence does not show the product keeping all four separate. Tags are not the Journey.",
  }),
  criterion({
    id: "ai-stage-aware",
    criterion: "Stage-aware AI guidance",
    level: "sub-gate",
    parentId: "ai-journey-context",
    status: "PASS",
    evidence: engineEvidence(
      "Review & Payment guidance recommends the payment action instead of a generic customer-service reply."
    ),
  }),
  criterion({
    id: "ai-safety-product",
    criterion: "Product AI must-not boundaries",
    level: "sub-gate",
    parentId: "ai-journey-context",
    status: "NOT STARTED",
    evidence: engineEvidence(
      "Engine approval boundaries are a separate PASS. This HQ slice did not read sookly-omnichat source. Prompt text or tests, if present, are not recorded as proof that the product assistant refuses silent restricted sends, stage skips, blocker bypass, cross-tenant reads, self-approval, and rejected or expired approvals."
    ),
  }),
  criterion({
    id: "loose-end-stalled-fixture",
    criterion: "Deliberately stalled RDUSA test Journey surfaces",
    level: "sub-gate",
    parentId: "loose-end-surfacing",
    status: "PASS",
    evidence: engineEvidence("A deliberately stalled RDUSA test Journey surfaces on the product path."),
  }),
  criterion({
    id: "pr-60-reviewed",
    criterion: "Human review of PR #60",
    level: "sub-gate",
    parentId: "merge-pr-60",
    status: "BLOCKED",
    evidence: `Pending Mark. ${ENGINE.pr} is draft at ${ENGINE.shortSha}. CI is green at Actions run ${ENGINE.ciRun}. Review is a human gate.`,
  }),
  criterion({
    id: "prod-migration-reviewed",
    criterion: "Production migration reviewed",
    level: "sub-gate",
    parentId: "prod-migrate",
    status: "BLOCKED",
    evidence: "Pending Mark. Ephemeral CI migrate is not a production migration review.",
  }),
  criterion({
    id: "prod-migrate-explicit-approval",
    criterion: "Explicit production migrate approval",
    level: "sub-gate",
    parentId: "prod-migrate",
    status: "BLOCKED",
    evidence: "Pending Mark. No explicit production migrate approval exists. This slice must not approve it.",
  }),
  criterion({
    id: "rollback-backup-understood",
    criterion: "Rollback and backup understood",
    level: "sub-gate",
    parentId: "prod-migrate",
    status: "NOT STARTED",
    evidence: "No recorded rollback and backup understanding exists for a production Journey migration.",
  }),
  criterion({
    id: "staging-smoke",
    criterion: "Staging smoke of the persistent path",
    level: "sub-gate",
    parentId: "product-prisma-path",
    status: "NOT STARTED",
    evidence: "No staging smoke has been run against PrismaJourneyStore.",
  }),
  criterion({
    id: "controlled-prod-smoke",
    criterion: "Controlled production smoke, no accidental customer message",
    level: "sub-gate",
    parentId: "production-deploy",
    status: "NOT STARTED",
    evidence: "No controlled production smoke has been run. No customer message is authorized from this work.",
  }),
];

function countBy(rows) {
  const counts = { PASS: 0, FAIL: 0, BLOCKED: 0, "NOT STARTED": 0 };
  for (const row of rows) {
    switch (row.status) {
      case "PASS":
      case "FAIL":
      case "BLOCKED":
      case "NOT STARTED":
        counts[row.status] += 1;
        break;
      default: {
        const unknown = row.status;
        throw new Error(`Unknown pilot status: ${String(unknown)}`);
      }
    }
  }
  return counts;
}

function assertLevel(level) {
  switch (level) {
    case "major":
    case "sub-gate":
      return level;
    default: {
      const unknown = level;
      throw new Error(`Unknown pilot criterion level: ${String(unknown)}`);
    }
  }
}

export function pilotStatusVariant(status) {
  switch (status) {
    case "PASS":
      return "success";
    case "FAIL":
      return "error";
    case "BLOCKED":
      return "warning";
    case "NOT STARTED":
      return "outline";
    default: {
      const unknown = status;
      throw new Error(`Unknown pilot status: ${String(unknown)}`);
    }
  }
}

export function isRdusaPilotReady(criteria = RDUSA_PILOT_CRITERIA) {
  return criteria.filter((row) => row.level === "major").every((row) => row.status === "PASS");
}

function buildSnapshot() {
  const majors = RDUSA_PILOT_CRITERIA.filter((row) => row.level === "major");
  const pilotReady = isRdusaPilotReady();
  return {
    path: RDUSA_PILOT_CONTRACT_PATH,
    url: RDUSA_PILOT_CONTRACT_URL,
    authoritative: true,
    pilotReady,
    goldenRule: RDUSA_PILOT_GOLDEN_RULE,
    engine: ENGINE,
    counts: countBy(RDUSA_PILOT_CRITERIA),
    majorCounts: countBy(majors),
    criticalPath:
      "Mark merge yes on sookly-omnichat #60, then separate migrate and deploy approvals. Product path, operator rail, scenarios A/B/C, and the product-facing VA SOP are PASS at cf3d866. pilotReady stays false. This slice must not merge, migrate, or deploy.",
    nextUnmet: {
      id: "merge-pr-60",
      also: "prod-migrate",
      repo: ENGINE.repo,
      summary: "Mark merge yes on sookly-omnichat #60, then separate migrate and deploy approvals",
    },
    remainingSlices: {
      min: 3,
      max: 5,
      note: "Three to five slices remain before a live pilot can start. Open product sub-gates are the phone-call VA workspace, four state dimensions, product AI must-not proof, and staging smoke. Merge, production migration, rollback and backup, deploy, and controlled production smoke are human gates. The live 10 to 20 Journey cohort comes after those gates.",
    },
    confirmation:
      "All future RDUSA and Sookly Journey work uses docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md as the fixed finish line. The Golden Rule in that file is not redefined or weakened by this scorecard. pilotReady stays false until every major criterion is PASS.",
    criteria: RDUSA_PILOT_CRITERIA,
  };
}

export function getRdusaPilotContractSnapshot() {
  return buildSnapshot();
}

export function renderRdusaPilotScorecardMarkdown(snapshot = buildSnapshot()) {
  const lines = [
    "| ID | Criterion | Level | Status | Evidence |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const row of snapshot.criteria) {
    lines.push(
      `| ${row.id} | ${row.criterion} | ${row.level} | ${row.status} | ${row.evidence} |`
    );
  }
  const machine = {
    path: snapshot.path,
    pilotReady: snapshot.pilotReady,
    counts: snapshot.counts,
    majorCounts: snapshot.majorCounts,
    criticalPath: snapshot.criticalPath,
    nextUnmet: snapshot.nextUnmet,
    remainingSlices: snapshot.remainingSlices,
    confirmation: snapshot.confirmation,
    criteria: snapshot.criteria.map((row) => ({
      id: row.id,
      criterion: row.criterion,
      level: row.level,
      parentId: row.parentId,
      status: row.status,
    })),
  };
  return [lines.join("\n"), "", "```json", JSON.stringify(machine, null, 2), "```"].join("\n");
}

function assertScorecardData(snapshot) {
  if (snapshot.goldenRule !== RDUSA_PILOT_GOLDEN_RULE) {
    throw new Error("RDUSA Golden Rule text drifted");
  }
  if (snapshot.pilotReady !== isRdusaPilotReady(snapshot.criteria)) {
    throw new Error("pilotReady must be derived from the major criteria");
  }
  if (snapshot.path !== RDUSA_PILOT_CONTRACT_PATH) {
    throw new Error("RDUSA contract path drifted");
  }
  if (!snapshot.criticalPath || !snapshot.nextUnmet?.id) {
    throw new Error("RDUSA critical path is missing");
  }
  if (!(snapshot.remainingSlices.min <= snapshot.remainingSlices.max)) {
    throw new Error("RDUSA remaining slice range is invalid");
  }

  const ids = new Set();
  for (const row of snapshot.criteria) {
    assertLevel(row.level);
    pilotStatusVariant(row.status);
    if (!row.id || ids.has(row.id)) {
      throw new Error(`Duplicate or empty pilot criterion id: ${row.id}`);
    }
    ids.add(row.id);
    if (!row.evidence || row.evidence.includes("|")) {
      throw new Error(`Pilot criterion ${row.id} needs evidence without pipe characters`);
    }
    if (row.status === "PASS" && row.evidence.length < 20) {
      throw new Error(`PASS criterion ${row.id} is missing a citation`);
    }
    if (row.level === "major" && row.parentId) {
      throw new Error(`Major criterion ${row.id} must not have a parent`);
    }
  }

  for (const row of snapshot.criteria) {
    if (row.level !== "sub-gate") continue;
    const parent = snapshot.criteria.find((item) => item.id === row.parentId);
    if (!parent || parent.level !== "major") {
      throw new Error(`Sub-gate ${row.id} must point at a major criterion`);
    }
  }

  const next = snapshot.criteria.find((row) => row.id === snapshot.nextUnmet.id);
  if (!next || next.status === "PASS") {
    throw new Error("nextUnmet must name a criterion that is not PASS");
  }

  const counts = snapshot.counts;
  const total = counts.PASS + counts.FAIL + counts.BLOCKED + counts["NOT STARTED"];
  if (total !== snapshot.criteria.length) {
    throw new Error("RDUSA scorecard counts do not match the criterion list");
  }
  const major = snapshot.majorCounts;
  const majorTotal = major.PASS + major.FAIL + major.BLOCKED + major["NOT STARTED"];
  const majorRows = snapshot.criteria.filter((row) => row.level === "major").length;
  if (majorTotal !== majorRows) {
    throw new Error("RDUSA major counts do not match the major criteria");
  }
}

function assertContractDocument(snapshot) {
  if (process.env.RDUSA_PILOT_SKIP_DOC_ASSERT === "1") return;
  const docPath = resolve(process.cwd(), RDUSA_PILOT_CONTRACT_PATH);
  const doc = readFileSync(docPath, "utf8");
  if (!doc.includes(RDUSA_PILOT_GOLDEN_RULE)) {
    throw new Error("RDUSA contract is missing the Golden Rule verbatim");
  }
  const start = doc.indexOf(SCORECARD_START);
  const end = doc.indexOf(SCORECARD_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error("RDUSA contract is missing the scorecard markers");
  }
  const actual = doc.slice(start + SCORECARD_START.length, end).trim();
  const expected = renderRdusaPilotScorecardMarkdown(snapshot).trim();
  if (actual !== expected) {
    throw new Error(
      "RDUSA scorecard block does not match lib/hq/rdusa-pilot-contract.js. Regenerate the marked block from renderRdusaPilotScorecardMarkdown()."
    );
  }
}

const snapshotForAssert = buildSnapshot();
assertScorecardData(snapshotForAssert);
assertContractDocument(snapshotForAssert);
