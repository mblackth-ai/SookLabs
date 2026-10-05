import { RDUSA_B2B_JOURNEY, kanbanColumns, suggestedActionForCase } from "./journey-model.js";
import { INTEGRATION_STATUS_LABEL, SOOKLY_INTEGRATION_SLOTS } from "./journey-integrations.js";
import {
  classifyEmailSignal,
  mapQuoWebhookToSignal,
  recognizeProcessArtifacts,
  suggestStageFromSignal,
  supplierLoopDue,
} from "./journey-signal-router.js";

/** HQ-visible pilot cases until app.sookly.com exposes /api/journey/cases. */
export const PILOT_CASES = [
  {
    id: "case-rdusa-001",
    contact: "Acme Retail (pilot)",
    stageId: "supplier_quote_pending",
    channel: "email",
    blocker: "Waiting on supplier lead time",
    supplierNextDue: "2026-10-07",
    prospectNextDue: null,
    updatedAt: "2026-10-05T12:00:00.000Z",
  },
  {
    id: "case-rdusa-002",
    contact: "Bright Stores",
    stageId: "build_customer_quote",
    channel: "quo",
    blocker: "",
    supplierNextDue: null,
    prospectNextDue: "2026-10-06",
    updatedAt: "2026-10-05T11:30:00.000Z",
  },
  {
    id: "case-rdusa-003",
    contact: "Coastal Displays",
    stageId: "inquiry",
    channel: "web",
    blocker: "",
    supplierNextDue: null,
    prospectNextDue: "2026-10-05",
    updatedAt: "2026-10-05T17:00:00.000Z",
  },
];

function sooklyBuildTasks(ops) {
  const app = ops?.streams?.sooklyApp?.items || [];
  const web = ops?.streams?.sooklyWebsite?.items || [];
  return [...app, ...web].map((item) => ({
    id: item.id,
    title: item.title,
    status: item.status,
    priority: item.priority,
    owner: item.owner,
    due: item.due,
  }));
}

function automationBacklog(template) {
  return template.stages
    .filter((stage) => stage.automationTier === "manual")
    .map((stage) => ({
      stageId: stage.id,
      label: stage.label,
      reason: stage.summary,
      learnTarget: "Promote to assist/auto when evidence shows repeatable inputs.",
    }));
}

/** Demo signal routing for HQ — not live ingestion. */
function signalRoutingExamples() {
  const emailInquiry = classifyEmailSignal({
    direction: "inbound",
    subject: "Can you quote 12 display stands?",
  });
  const emailQuoteSent = classifyEmailSignal({
    direction: "outbound",
    subject: "Your quotation #4421",
    body: "Please find attached pricing and delivery.",
  });
  const quoTranscript = mapQuoWebhookToSignal({
    type: "call.transcript.completed",
    data: {
      callId: "demo-call",
      summary: "Prospect reported damaged carton",
      context: { contacts: { ids: ["quo-demo"] } },
    },
  });

  return [
    {
      label: "Email inquiry → qualify",
      signal: emailInquiry,
      transition: suggestStageFromSignal("inquiry", emailInquiry),
    },
    {
      label: "Outbound quote → quote_sent + Xero link",
      signal: emailQuoteSent,
      transition: suggestStageFromSignal("build_customer_quote", emailQuoteSent),
    },
    {
      label: "Quo transcript → receipt_check when issue language",
      signal: { type: quoTranscript.signalType, confidence: "high", hints: ["receipt_issue"] },
      transition: suggestStageFromSignal("delivery_confirm", {
        type: "quo.call.transcript.completed",
        confidence: "high",
        hints: ["receipt_issue"],
      }),
      quo: quoTranscript,
    },
  ];
}

function enrichCaseRow(row, template) {
  const guidance = suggestedActionForCase(row);
  const sampleText = [row.blocker, row.channel].filter(Boolean).join(" ");
  const artifacts = recognizeProcessArtifacts(sampleText);
  return {
    ...row,
    guidance,
    stage: kanbanColumns(template).find((s) => s.id === row.stageId) || null,
    supplierLoopActive: supplierLoopDue(row.stageId),
    artifacts,
  };
}

export function buildSooklyJourneySnapshot(ops = {}) {
  const template = RDUSA_B2B_JOURNEY;
  const cases = PILOT_CASES.map((row) => enrichCaseRow(row, template));
  const actionsDue = cases
    .map((c) => ({
      caseId: c.id,
      contact: c.contact,
      stageId: c.stageId,
      supplierLoopActive: c.supplierLoopActive,
      supplierNextDue: c.supplierNextDue,
      prospectNextDue: c.prospectNextDue,
      ...c.guidance,
    }))
    .filter((row) => row.action);

  return {
    generatedAt: new Date().toISOString(),
    productRepo: "mblackth-ai/sookly-omnichat",
    productRepoReachable: false,
    acceptanceAuthority: "sookly-control/release-matrix.md (in product repo; mirrored in docs/SOOKLY-JOURNEY-RDUSA-SOP.md)",
    template: { id: template.id, version: template.version, label: template.label, stageCount: template.stages.length },
    columns: kanbanColumns(template),
    cases,
    integrations: SOOKLY_INTEGRATION_SLOTS.map((slot) => ({
      ...slot,
      statusLabel: INTEGRATION_STATUS_LABEL[slot.status] || slot.status,
    })),
    buildTasks: sooklyBuildTasks(ops),
    automationBacklog: automationBacklog(template),
    actionsDue,
    signalRoutingExamples: signalRoutingExamples(),
    calendarPilot: {
      status: "ui_reference",
      states: ["new", "assigned", "booked"],
      journeyHooks: ["calendar.inquiry", "calendar.booking.confirmed"],
      targetStages: ["qualify", "quote_sent"],
    },
    honest: {
      kanbanData: "pilot",
      liveAppSync: false,
      message: "Cases are HQ pilot rows until app.sookly.com journey API lands. Integration statuses reflect design + env readiness, not production Connected claims.",
    },
  };
}
