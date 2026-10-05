import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { computeSooklyJourneyCheckpoint } from "./journey-checkpoint.js";
import { ingestJourneySignal } from "./journey-ingest.js";
import { verifyQuoWebhookSignature } from "./quo-webhook-verify.js";

test("ingestJourneySignal dry-runs email inquiry", () => {
  const out = ingestJourneySignal({
    source: "email",
    caseId: "case-1",
    currentStageId: "inquiry",
    payload: { direction: "inbound", subject: "Need a quote for 20 units" },
  });
  assert.equal(out.ok, true);
  assert.equal(out.event.type, "email.inbound");
  assert.equal(out.transition.suggestedStageId, "qualify");
});

test("ingestJourneySignal dry-runs Quo transcript", () => {
  const out = ingestJourneySignal({
    source: "quo",
    caseId: "case-2",
    currentStageId: "delivery_confirm",
    payload: {
      type: "call.transcript.completed",
      data: { callId: "c1", summary: "missing items in shipment" },
    },
  });
  assert.equal(out.ok, true);
  assert.equal(out.event.type, "quo.call.transcript.completed");
});

test("verifyQuoWebhookSignature accepts valid HMAC", () => {
  const body = '{"type":"message.received"}';
  const secret = "test-secret-key-for-hmac-verify!!";
  const sig = createHmac("sha256", secret).update(body).digest("hex");
  assert.equal(verifyQuoWebhookSignature({ rawBody: body, signatureHeader: sig, secret }), true);
});

test("checkpoint marks M2 when ingest files exist", () => {
  const cp = computeSooklyJourneyCheckpoint({
    filesPresent: (p) => existsSync(join(process.cwd(), p)),
  });
  assert.ok(cp.percent >= 60);
  assert.ok(cp.items.find((i) => i.id === "m0-schema")?.done);
});
