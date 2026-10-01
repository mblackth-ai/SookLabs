import {
  RETAINER_AS_OF,
  RETAINER_GOLDEN_RULE,
  RETAINER_WINDOW,
  buildRetainerPeriods,
  countRetainerStatuses,
  finalizeRetainerSnapshot,
  isRetainerHealthy,
  isRetainerWindowComplete,
  retainerCriterion,
} from "./retainer-delivery";

export const RDUSA_RETAINER_CONTRACT_PATH = "docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md";

export const RDUSA_RETAINER_CONTRACT_URL =
  "https://github.com/mblackth-ai/SookLabs/blob/cursor/hq-four-front-evidence-sync-f8c4/docs/RDUSA_RETAINER_DELIVERY_CONTRACT.md";

const LEDGER_SHA = "510724bef68d3daaa21fa53436c22d75481dbc24";
const LEDGER_PR = "https://github.com/mblackth-ai/rdusa/pull/3";

export const RDUSA_RETAINER_CRITERIA = [
  retainerCriterion({
    id: "rdusa-daily-ig-publish",
    criterion: "Real-product-photo Instagram publishing path",
    cadence: "daily",
    status: "BLOCKED",
    owner: "Mark",
    requiredForHealth: true,
    evidence:
      "META_PAGE_TOKEN_RDUSA expired about 25 Sep 2026. Real-product-photo Instagram publishing is not operational until that token is reminted. No invented testimonials and no wrong-brand publish are claimed for 2 Oct 2026 because no publish artifact is in HQ. Prior baseline cited as 50/57 is not a current count. This is a Mark-gated credential, so the row is BLOCKED rather than FAIL.",
  }),
  retainerCriterion({
    id: "rdusa-daily-no-invented-testimonials",
    criterion: "No invented testimonials on the publish path",
    cadence: "daily",
    status: "UNKNOWN",
    owner: "Cursor",
    requiredForHealth: false,
    countsTowardPeriod: false,
    evidence:
      "Standing rule: do not invent testimonials. No 2 Oct 2026 publish artifact is in HQ, so this row is UNKNOWN rather than PASS or FAIL. It does not change the daily rollup while the token row is the scored path.",
  }),
  retainerCriterion({
    id: "rdusa-daily-brand-lock",
    criterion: "Never publish RDUSA from the wrong brand",
    cadence: "daily",
    status: "UNKNOWN",
    owner: "Cursor",
    requiredForHealth: false,
    countsTowardPeriod: false,
    evidence:
      "Standing rule: never publish RDUSA from another brand. No 2 Oct 2026 publish artifact is in HQ, so this row is UNKNOWN rather than PASS or FAIL.",
  }),
  retainerCriterion({
    id: "rdusa-weekly-commercial-scorecard",
    criterion: "Weekly commercial scorecard for retainer ROI attribution",
    cadence: "weekly",
    status: "NOT STARTED",
    owner: "CoS",
    requiredForHealth: true,
    evidence:
      "Routine rdusa-weekly-commercial-scorecard. No scorecard artifact for 2026-W40 is in HQ as of 2 Oct 2026. The week is open through 4 Oct 2026, so this is NOT STARTED rather than FAIL. PASS only when that week's artifact is recorded.",
  }),
  retainerCriterion({
    id: "rdusa-weekly-seo-geo",
    criterion: "SEO/GEO ledger row verified",
    cadence: "weekly",
    status: "PASS",
    owner: "Andrew / Mark",
    requiredForHealth: false,
    countsTowardPeriod: false,
    evidence: `SEO/GEO ledger row verified at ${LEDGER_SHA}. Draft PR ${LEDGER_PR} is unmerged. This does not mark other ledger rows PASS and does not close the weekly growth-support row.`,
  }),
  retainerCriterion({
    id: "rdusa-weekly-ledger-open",
    criterion: "Other RDUSA ledger rows beyond SEO/GEO",
    cadence: "weekly",
    status: "BLOCKED",
    owner: "Andrew / Mark",
    requiredForHealth: false,
    countsTowardPeriod: false,
    evidence: `Ledger rows other than SEO/GEO are OPEN pending Andrew and Mark. Draft PR ${LEDGER_PR} is unmerged. OPEN rows are not PASS.`,
  }),
  retainerCriterion({
    id: "rdusa-weekly-growth-support",
    criterion: "Content, social, and SEO/growth support for the week",
    cadence: "weekly",
    status: "BLOCKED",
    owner: "Cursor",
    requiredForHealth: true,
    evidence:
      "The marketing retainer scope is content, social, and SEO/growth support. Social publishing is blocked on the expired Meta token. Ledger rows beyond SEO/GEO are OPEN. No W40 content artifact is in HQ. The row stays BLOCKED, not PASS.",
  }),
  retainerCriterion({
    id: "rdusa-monthly-october",
    criterion: "October marketing retainer delivery",
    cadence: "monthly",
    status: "NOT STARTED",
    owner: "CoS",
    requiredForHealth: false,
    evidence:
      "October 2026 has not closed. No month-level delivery artifact is in HQ as of 2 Oct 2026. Engagement truth is USD 1,500/month for SEO, content, social, and growth support. This row does not score dollar outcomes.",
  }),
  retainerCriterion({
    id: "rdusa-90d-scorecard-habit",
    criterion: "Keep the weekly commercial scorecard habit",
    cadence: "90d",
    status: "NOT STARTED",
    owner: "CoS",
    requiredForHealth: false,
    evidence:
      "90-day goal: keep the weekly commercial scorecard so retainer value is evidenced from 1 Oct through 29 Dec 2026. W40 has no artifact yet. The goal is not PASS on day 2.",
  }),
  retainerCriterion({
    id: "rdusa-90d-ig-toward-100",
    criterion: "Restore Graph publish and continue real-product Instagram",
    cadence: "90d",
    status: "BLOCKED",
    owner: "Mark",
    requiredForHealth: false,
    evidence:
      "90-day goal: restore the Graph publish path and continue real-product Instagram toward 100 posts from the prior 50/57 baseline. HQ does not hold a current post count, and none is invented. Blocked on META_PAGE_TOKEN_RDUSA expired about 25 Sep 2026.",
  }),
  retainerCriterion({
    id: "rdusa-90d-threads-fb",
    criterion: "Threads and Facebook after Instagram",
    cadence: "90d",
    status: "NOT STARTED",
    owner: "Mark",
    requiredForHealth: false,
    evidence: "Threads and Facebook follow Instagram when tokens allow. Not started. This is not a current-day FAIL.",
  }),
  retainerCriterion({
    id: "rdusa-90d-journey-separate",
    criterion: "Journey/CRM pilot tracked on the acceptance contract",
    cadence: "90d",
    status: "NOT STARTED",
    owner: "Mark",
    requiredForHealth: false,
    countsTowardPeriod: false,
    evidence:
      "Expansion opportunity only. Scored on docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md, where pilotReady is false. It is not a marketing-retainer gate and does not change this retainer's period rollups.",
  }),
  retainerCriterion({
    id: "rdusa-phone-standby-optional",
    criterion: "Phone and order-desk standby",
    cadence: "monthly",
    status: "UNKNOWN",
    owner: "Mark",
    requiredForHealth: false,
    countsTowardPeriod: false,
    evidence:
      "Optional expansion, about $3.50/hr, Monday through Friday about 9–5 ET. Not required for marketing-retainer PASS. No standby usage is recorded in HQ, so this is UNKNOWN.",
  }),
];

function buildSnapshot() {
  const criteria = RDUSA_RETAINER_CRITERIA;
  return {
    field: "rdusaRetainerContract",
    clientId: "rdusa",
    clientName: "Retail Display USA",
    path: RDUSA_RETAINER_CONTRACT_PATH,
    url: RDUSA_RETAINER_CONTRACT_URL,
    authoritative: true,
    asOf: RETAINER_AS_OF,
    timeZone: RETAINER_WINDOW.timeZone,
    window: RETAINER_WINDOW,
    goldenRule: RETAINER_GOLDEN_RULE,
    journeyContractPath: "docs/RDUSA_PILOT_ACCEPTANCE_CONTRACT.md",
    fee: {
      amountUsd: 1500,
      cadence: "monthly",
      label: "USD 1,500/month",
      scope: "SEO, content, social media and growth support",
      confirmed: true,
    },
    retainerHealthy: isRetainerHealthy(criteria),
    healthBasis:
      "False because the Instagram publish path is BLOCKED on the expired Meta token and the 2026-W40 commercial scorecard is not PASS.",
    windowComplete: isRetainerWindowComplete(criteria),
    counts: countRetainerStatuses(criteria),
    periods: buildRetainerPeriods(criteria),
    criticalPath:
      "Remint META_PAGE_TOKEN_RDUSA, expired about 25 Sep 2026, then record the 2026-W40 commercial scorecard. Journey pilot stays on the separate acceptance contract. This slice must not publish, merge, or deploy.",
    nextUnmet: {
      id: "rdusa-daily-ig-publish",
      also: "rdusa-weekly-commercial-scorecard",
      summary: "Remint the RDUSA Meta token, then record this week's commercial scorecard",
    },
    criteria,
  };
}

export function getRdusaRetainerContractSnapshot() {
  return finalizeRetainerSnapshot(buildSnapshot());
}
