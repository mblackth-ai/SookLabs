import assert from "node:assert/strict";
import test from "node:test";
import { buildSooklyJourneySnapshot, PILOT_CASES } from "../sookly/journey-snapshot.js";

test("Sookly journey snapshot includes template, pilot cases, and integrations", () => {
  const snap = buildSooklyJourneySnapshot({
    streams: { sooklyApp: { items: [{ id: "sa-j1", title: "Journey schema", status: "doing", priority: "P0", owner: "James", due: "" }] } },
  });
  assert.equal(snap.template.id, "rdusa-b2b-display-order");
  assert.equal(snap.cases.length, PILOT_CASES.length);
  assert.ok(snap.integrations.some((row) => row.id === "quo-transcripts"));
  assert.equal(snap.honest.kanbanData, "pilot");
  assert.ok(snap.buildTasks.some((t) => t.id === "sa-j1"));
  assert.ok(snap.signalRoutingExamples.length >= 2);
  assert.ok(snap.actionsDue.some((row) => row.caseId === "case-rdusa-001"));
});
