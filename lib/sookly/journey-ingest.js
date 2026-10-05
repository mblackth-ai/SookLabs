import { classifyEmailSignal, mapQuoWebhookToSignal, suggestStageFromSignal } from "./journey-signal-router.js";
import { validateJourneyEventDraft } from "./journey-events-schema.js";
import { journeyStage } from "./journey-model.js";

/**
 * Dry-run ingest: produce journey_case_events draft + stage suggestion (no persistence).
 * @param {{ source: "email" | "quo", caseId: string, currentStageId?: string, payload: Record<string, unknown> }} input
 */
export function ingestJourneySignal(input) {
  const caseId = String(input.caseId || "").trim();
  if (!caseId) return { ok: false, error: "caseId is required." };

  const currentStageId = String(input.currentStageId || "inquiry").trim();
  const source = input.source;

  if (source === "email") {
    const direction = input.payload?.direction === "outbound" ? "outbound" : "inbound";
    const classified = classifyEmailSignal({
      direction,
      subject: String(input.payload?.subject || ""),
      body: String(input.payload?.body || ""),
      fromRole: input.payload?.fromRole,
    });
    const transition = suggestStageFromSignal(currentStageId, classified);
    const draft = validateJourneyEventDraft({
      caseId,
      type: classified.type,
      source: "email",
      externalId: input.payload?.messageId,
      payload: { subject: input.payload?.subject, direction, hints: classified.hints },
      stageHint: transition.suggestedStageId,
    });
    if (!draft.ok) return draft;
    return buildIngestResult(draft.value, classified, transition, currentStageId);
  }

  if (source === "calendar") {
    const eventType =
      input.payload?.status === "booked" ? "calendar.booking.confirmed" : "calendar.inquiry";
    const classified = { type: eventType, confidence: "high", hints: ["calendar"] };
    const transition = suggestStageFromSignal(currentStageId, classified);
    const draft = validateJourneyEventDraft({
      caseId,
      type: eventType,
      source: "calendar",
      externalId: input.payload?.bookingId,
      payload: input.payload,
      stageHint: transition.suggestedStageId,
    });
    if (!draft.ok) return draft;
    return buildIngestResult(draft.value, classified, transition, currentStageId);
  }

  if (source === "quo") {
    const mapped = mapQuoWebhookToSignal(input.payload || {});
    if (!mapped.signalType) {
      return { ok: false, error: "Unrecognized Quo webhook type." };
    }
    const classified = {
      type: mapped.signalType,
      confidence: "medium",
      hints: mapped.summary && /damage|missing|issue/i.test(mapped.summary) ? ["receipt_issue"] : ["general_message"],
    };
    const transition = suggestStageFromSignal(currentStageId, classified);
    const draft = validateJourneyEventDraft({
      caseId,
      type: mapped.signalType,
      source: "quo",
      externalId: mapped.callId || input.payload?.id,
      payload: { ...mapped, rawType: input.payload?.type },
      stageHint: transition.suggestedStageId,
    });
    if (!draft.ok) return draft;
    return buildIngestResult(draft.value, classified, transition, currentStageId);
  }

  return { ok: false, error: `Unsupported source: ${source}` };
}

function buildIngestResult(eventRow, classified, transition, currentStageId) {
  const fromStage = journeyStage(currentStageId);
  const toStage = journeyStage(transition.suggestedStageId);
  return {
    ok: true,
    event: eventRow,
    classified,
    transition: {
      ...transition,
      fromStageId: currentStageId,
      fromLabel: fromStage?.label || currentStageId,
      toLabel: toStage?.label || transition.suggestedStageId,
    },
    persist: false,
    note: "HQ dry-run only; app.sookly.com should persist to journey_case_events.",
  };
}
