import { test } from "node:test";
import assert from "node:assert/strict";
import { businessSummary, contentActionItems, readContentSummaryWith, reportingActionItems, reportingStatus } from "./content-summary.js";
import { CLIENTS, getClient } from "./clients.js";

const sample = {
  ok: true,
  data: {
    generatedAt: "2026-10-20T20:00:00.000Z",
    totals: { scheduled: 43, published: 4, unverified: 16, failed: 0, blocked: 39, gapDays: 26 },
    actionItems: [
      { business: "rdusa", businessName: "Retail Display USA", status: "blocked", reason: "threads token invalid", count: 10, platforms: ["threads"], firstAt: "2026-10-16T08:00:00Z", lastAt: "2026-10-23T08:00:00Z" },
      { business: "rdusa", businessName: "Retail Display USA", status: "failed", reason: "token missing for rdusa (facebook)", count: 1, platforms: ["facebook"], firstAt: "2026-10-20T08:00:00Z", lastAt: "2026-10-20T08:00:00Z" },
    ],
    businesses: [
      { slug: "rdusa", name: "Retail Display USA", gapDays: ["2026-10-27", "2026-10-28"], missingLines: [], window: { aheadDays: 14 } },
      { slug: "jaka", name: "JAKA Transportation", gapDays: [], missingLines: ["Hiring"], window: { aheadDays: 14 } },
    ],
  },
};

test("content summary: missing token is reported, no request made", async () => {
  let called = false;
  const out = await readContentSummaryWith({ baseUrl: "https://seos.example", token: "", fetchImpl: async () => { called = true; } });
  assert.equal(out.configured, false);
  assert.equal(called, false);
  assert.deepEqual(out.data.businesses, []);
});

test("content summary: bearer token, URL and data", async () => {
  let seen;
  const out = await readContentSummaryWith({
    baseUrl: "https://seos.example/",
    token: "t0k",
    past: 7,
    ahead: 21,
    fetchImpl: async (url, init) => {
      seen = { url, auth: init.headers.Authorization };
      return new Response(JSON.stringify({ ok: true, data: { businesses: [{ slug: "rdusa" }] } }));
    },
  });
  assert.equal(seen.url, "https://seos.example/api/hq/content-summary?past=7&ahead=21");
  assert.equal(seen.auth, "Bearer t0k");
  assert.equal(out.ok, true);
  assert.equal(out.data.businesses[0].slug, "rdusa");
  assert.deepEqual(out.data.actionItems, []);
});

test("content summary: SEOS errors, old SEOS (404) and network failures never throw", async () => {
  const e1 = await readContentSummaryWith({ baseUrl: "x", token: "t", fetchImpl: async () => new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 }) });
  assert.equal(e1.ok, false);
  assert.equal(e1.error, "Unauthorized");
  const e2 = await readContentSummaryWith({ baseUrl: "x", token: "t", fetchImpl: async () => new Response("<html>", { status: 404 }) });
  assert.match(e2.error, /not on the version/);
  const e3 = await readContentSummaryWith({ baseUrl: "x", token: "t", fetchImpl: async () => { throw new Error("ECONNREFUSED"); } });
  assert.equal(e3.error, "ECONNREFUSED");
  assert.deepEqual(contentActionItems(e3), []);
});

test("briefing action items: failed first, then blocked, gaps and missing lines; nothing invented", () => {
  const items = contentActionItems(sample, { seosUrl: "https://seos.example" });
  assert.deepEqual(items.map((i) => i.severity), ["error", "warning", "neutral", "neutral"]);
  assert.equal(items[0].title, "1 facebook post failed");
  assert.equal(items[1].title, "10 threads posts blocked");
  assert.equal(items[1].detail, "threads token invalid");
  assert.equal(items[1].when, "Oct 16–Oct 23");
  assert.equal(items[2].title, "2 gap days in the next 14");
  assert.equal(items[3].title, "No Hiring posts planned");
  assert.ok(items.every((i) => i.href === "https://seos.example"));
});

test("clients: RDUSA, JAKA, SookLabs and Sookly profiles; every system starts not connected", () => {
  assert.deepEqual(CLIENTS.map((c) => c.slug), ["rdusa", "jaka", "sooklabs", "sookly"]);
  assert.deepEqual(getClient("rdusa").lockedMetrics.map((m) => m.label), ["Outrigger sales", "Slatwall sales"]);
  assert.deepEqual(getClient("jaka").contacts.map((c) => c.value), ["(816) 299-7989", "(913) 957-9311"]);
  assert.ok(CLIENTS.every((c) => c.systems.every((s) => s.connected === false)));
  assert.equal(getClient("nope"), null);
  assert.equal(businessSummary(sample, "jaka").name, "JAKA Transportation");
  assert.equal(businessSummary({ ok: false }, "jaka"), null);
});

test("box reporting: last push age, publisher health, and action items only for unhealthy publishers", () => {
  const now = new Date("2026-10-21T12:00:00Z");
  const b = {
    slug: "rdusa",
    name: "Retail Display USA",
    gapDays: [],
    reporting: {
      lastPushAt: "2026-10-21T11:30:00Z",
      pushStale: false,
      healthy: false,
      publishers: [
        { key: "publisher:rdusa-ig-queue", name: "RDUSA Instagram queue", health: "ok", lastRunAt: "2026-10-21T11:50:00Z", queued: 74, detail: null },
        { key: "publisher:rdusa-social", name: "RDUSA Threads runner", health: "down", lastRunAt: "2026-10-20T11:00:00Z", queued: null, detail: null },
      ],
    },
  };
  const st = reportingStatus(b, now);
  assert.equal(st.reported, true);
  assert.equal(st.lastPush, "30 min ago");
  assert.equal(st.publishers[1].lastRun, "25 h ago");
  const items = reportingActionItems({ ok: true, data: { businesses: [b, { slug: "jaka", name: "JAKA", reporting: { lastPushAt: "2026-10-21T08:00:00Z", pushStale: true, healthy: true, publishers: [] } }] } }, { now });
  assert.deepEqual(items.map((i) => [i.id, i.severity]), [["rdusa:publisher:rdusa-social", "error"], ["jaka:push", "warning"]]);
  assert.match(items[0].title, /RDUSA Threads runner is not running/);
});

test("box reporting: an older SEOS without reporting is 'not reported', never healthy, and adds no items", () => {
  const st = reportingStatus({ slug: "sookly", name: "Sookly" });
  assert.equal(st.reported, false);
  assert.equal(st.healthy, false);
  assert.deepEqual(reportingActionItems(sample), []);
  assert.equal(contentActionItems(sample).length >= 2, true);
});
