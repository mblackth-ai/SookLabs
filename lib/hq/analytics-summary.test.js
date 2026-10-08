import { test } from "node:test";
import assert from "node:assert/strict";
import { readAnalyticsSummaryWith, sparklinePoints } from "./analytics-summary.js";

test("analytics summary: missing token is reported, no request made", async () => {
  let called = false;
  const out = await readAnalyticsSummaryWith({ baseUrl: "https://seos.example", token: "", fetchImpl: async () => { called = true; } });
  assert.equal(out.configured, false);
  assert.equal(called, false);
  assert.deepEqual(out.data.workspaces, []);
});

test("analytics summary: sends the bearer token and returns data", async () => {
  let seen;
  const out = await readAnalyticsSummaryWith({
    baseUrl: "https://seos.example/",
    token: "t0k",
    months: 12,
    fetchImpl: async (url, init) => {
      seen = { url, auth: init.headers.Authorization };
      return new Response(JSON.stringify({ ok: true, data: { generatedAt: "x", workspaces: [{ slug: "rdusa" }] } }));
    },
  });
  assert.equal(seen.url, "https://seos.example/api/analytics/hq-summary?months=12");
  assert.equal(seen.auth, "Bearer t0k");
  assert.equal(out.ok, true);
  assert.equal(out.data.workspaces[0].slug, "rdusa");
});

test("analytics summary: SEOS errors and network failures never throw", async () => {
  const denied = await readAnalyticsSummaryWith({
    baseUrl: "https://seos.example",
    token: "t",
    fetchImpl: async () => new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 }),
  });
  assert.equal(denied.ok, false);
  assert.equal(denied.error, "Unauthorized");
  const down = await readAnalyticsSummaryWith({ baseUrl: "https://seos.example", token: "t", fetchImpl: async () => { throw new Error("ECONNREFUSED"); } });
  assert.equal(down.ok, false);
  assert.equal(down.error, "ECONNREFUSED");
});

test("sparkline: best position at the top, gaps stay gaps", () => {
  const pts = sparklinePoints([
    { month: "2026-07", averagePosition: 20 },
    { month: "2026-08", averagePosition: null },
    { month: "2026-09", averagePosition: 10 },
  ], 100, 30, 0);
  assert.equal(pts[0].y, 30);
  assert.equal(pts[1], null);
  assert.equal(pts[2].y, 0);
  assert.equal(pts[2].x, 100);
  assert.deepEqual(sparklinePoints([{ month: "2026-09", averagePosition: null }]), []);
});
