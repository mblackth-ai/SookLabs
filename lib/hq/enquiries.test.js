import { test } from "node:test";
import assert from "node:assert/strict";
import { enquiryActionItems, fmtMinutes, measurementDay, measurementDays, readEnquirySummaryWith } from "./enquiries.js";

test("measurement window: 30 days before launch, then days since launch capped at 30", () => {
  const start = "2026-10-24T07:00:00Z";
  assert.equal(measurementDays(new Date("2026-10-23T00:00:00Z"), start), 30);
  assert.equal(measurementDay(new Date("2026-10-23T00:00:00Z"), start), 0);
  assert.equal(measurementDays(new Date("2026-10-24T08:00:00Z"), start), 1);
  assert.equal(measurementDay(new Date("2026-10-26T08:00:00Z"), start), 3);
  assert.equal(measurementDays(new Date("2026-12-30T00:00:00Z"), start), 30);
});

test("missing key is reported, not thrown", async () => {
  const r = await readEnquirySummaryWith({ apiKey: "", fetchImpl: async () => { throw new Error("no"); } });
  assert.equal(r.ok, false);
  assert.equal(r.configured, false);
});

test("calls Sookly with bearer key and maps attention items", async () => {
  let seen;
  const fetchImpl = async (url, init) => {
    seen = { url, auth: init.headers.Authorization };
    return { ok: true, status: 200, json: async () => ({ metrics: { enquiries: 2 }, attention: [
      { id: "c1", contact: "Jane", channel: "webchat", needsReply: true, waitingMinutes: 1500, preview: "Quote for 20 panels", assignee: null },
      { id: "c2", contact: "Bob", channel: "messenger", needsReply: false, followUpDue: true, waitingMinutes: null, preview: "Samples", assignee: "Andrew" },
    ] }) };
  };
  const r = await readEnquirySummaryWith({ baseUrl: "https://app.sookly.co/", apiKey: "k", days: 3, fetchImpl });
  assert.equal(seen.url, "https://app.sookly.co/api/external/hq-summary?days=3");
  assert.equal(seen.auth, "Bearer k");
  const items = enquiryActionItems(r);
  assert.equal(items.length, 2);
  assert.equal(items[0].severity, "error");
  assert.match(items[0].title, /Jane waiting 1 d/);
  assert.match(items[1].title, /Follow up with Bob/);
  assert.match(items[1].detail, /owner: Andrew/);
});

test("404 explains the Sookly version", async () => {
  const r = await readEnquirySummaryWith({ apiKey: "k", fetchImpl: async () => ({ ok: false, status: 404, json: async () => ({}) }) });
  assert.match(r.error, /not on the version/);
});

test("minutes format", () => {
  assert.equal(fmtMinutes(null), "–");
  assert.equal(fmtMinutes(12), "12 min");
  assert.equal(fmtMinutes(90), "1.5 h");
});
