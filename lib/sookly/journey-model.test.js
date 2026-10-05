import assert from "node:assert/strict";
import test from "node:test";
import { RDUSA_B2B_JOURNEY, journeyStage, suggestedActionForCase, kanbanColumns } from "./journey-model.js";

test("RDUSA journey has ordered stages through closed_won", () => {
  const cols = kanbanColumns();
  assert.ok(cols.length >= 10);
  assert.equal(cols[0].id, "inquiry");
  assert.equal(cols.at(-1).id, "closed_won");
  assert.equal(journeyStage("payment_pending")?.automationTier, "assist");
});

test("suggestedActionForCase surfaces stage guidance and blockers", () => {
  const out = suggestedActionForCase({ stageId: "supplier_research", blocker: "Need portal login" });
  assert.match(out.action, /supplier/i);
  assert.match(out.action, /Need portal login/);
  assert.equal(out.tier, "manual");
});
