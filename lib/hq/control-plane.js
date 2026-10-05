import { FOUR_FRONTS, getFourFrontsOverall } from "./four-fronts";
import { readOpsData, getMergedBlockers } from "./ops";
import { getSooklyJourneySnapshot } from "./sookly-journey-report";

export const RDUSA_VALUE_EXPANSION = {
  client: "Retail Display USA",
  currentRetainerUsd: 1500,
  currentScopeLabel: "SEO, content, social media and growth support",
  objective: "Increase measurable value before discussing any retainer expansion.",
  opportunities: [
    {
      id: "rdusa-sookly-chat",
      label: "Sookly website receptionist",
      stage: "candidate",
      value: "Capture and qualify inbound website conversations and reduce missed enquiries.",
      acceptance: "Real website pilot, human handoff, conversation evidence, no fake automation claims.",
    },
    {
      id: "rdusa-journey-crm",
      label: "CRM + customer Journey",
      stage: "prototype",
      value: "Track a lead from first enquiry through quote, payment, fulfilment and follow-up.",
      acceptance: "Deterministic Journey state, bounded cases, next action, blocker and evidence history.",
    },
    {
      id: "rdusa-ops-sync",
      label: "Central operations sync",
      stage: "discover",
      value: "Connect customer, quote/order and operational evidence into one truthful workflow.",
      acceptance: "Source ownership, authority and handoff rules defined before any live writes.",
    },
  ],
};

export async function getControlPlaneSnapshot() {
  const ops = await readOpsData();
  const blockers = getMergedBlockers(ops);
  const approvals = (ops.agentJobs || []).filter((job) =>
    ["approval_required", "waiting_approval", "needs_approval"].includes(job.status)
  );

  const sooklyJourney = await getSooklyJourneySnapshot();

  return {
    generatedAt: new Date().toISOString(),
    overallProgress: getFourFrontsOverall(),
    fronts: FOUR_FRONTS,
    approvals,
    blockers,
    sooklyJourney,
    rdusaValueExpansion: RDUSA_VALUE_EXPANSION,
    guardrails: {
      mergesRequireApproval: true,
      productionDeploysRequireApproval: true,
      productionMigrationsRequireApproval: true,
      credentialChangesRequireApproval: true,
      externalPublishingRequiresApproval: true,
    },
  };
}
