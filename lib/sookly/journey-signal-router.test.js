import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyEmailSignal,
  mapQuoWebhookToSignal,
  recognizeProcessArtifacts,
  suggestStageFromSignal,
  supplierLoopDue,
} from "./journey-signal-router.js";

test("classifyEmailSignal detects quotation and supplier reply", () => {
  const out = classifyEmailSignal({
    direction: "inbound",
    subject: "Re: lead time on display units",
    fromRole: "supplier",
  });
  assert.equal(out.type, "email.inbound");
  assert.ok(out.hints.includes("supplier_timing"));
  assert.ok(out.hints.includes("supplier_reply"));
});

test("suggestStageFromSignal moves inquiry inbound to qualify", () => {
  const signal = classifyEmailSignal({ direction: "inbound", subject: "Question about sizes" });
  const move = suggestStageFromSignal("inquiry", signal);
  assert.equal(move.suggestedStageId, "qualify");
  assert.equal(move.stay, false);
});

test("mapQuoWebhookToSignal handles transcript completed", () => {
  const mapped = mapQuoWebhookToSignal({
    type: "call.transcript.completed",
    data: {
      callId: "call_abc",
      summary: "Customer asked for quote",
      context: { contacts: { ids: ["ct_1"] } },
    },
  });
  assert.equal(mapped.signalType, "quo.call.transcript.completed");
  assert.equal(mapped.callId, "call_abc");
  assert.deepEqual(mapped.contactIds, ["ct_1"]);
});

test("supplierLoopDue flags supplier-owned stages", () => {
  assert.equal(supplierLoopDue("supplier_quote_pending"), true);
  assert.equal(supplierLoopDue("quote_sent"), false);
});

test("recognizeProcessArtifacts flags PO and payment language", () => {
  const flags = recognizeProcessArtifacts("Please send PO and we will charge the card on file.");
  assert.equal(flags.needsPurchaseOrder, true);
  assert.equal(flags.needsPaymentFollowUp, true);
});
