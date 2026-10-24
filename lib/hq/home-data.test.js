import { test } from "node:test";
import assert from "node:assert/strict";
import { pulseState, readHomeDataWith } from "./home-data.js";

const never = () => new Promise(() => {});
const sleep = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
const analyticsOk = {
  ok: true,
  configured: true,
  data: {
    workspaces: [
      { slug: "a", name: "A", hasData: true, latestMonth: "2026-09", totals: { impressions: 40 }, traffic: [{ month: "2026-08", sessions: 10 }, { month: "2026-09", sessions: 12 }] },
    ],
  },
};
const opsLive = { workstreams: { s: { items: [{ status: "todo" }, { status: "done" }] } }, todayPriorities: [], goals: [] };
const card = (data, key) => data.kpis.find((k) => k.key === key);

test("hung ops store and hung SEOS still render: Open Tasks, Reach and the chart show Unavailable", async () => {
  const t0 = performance.now();
  const logged = [];
  const data = await readHomeDataWith({ readOps: never, readAnalytics: never, storage: "postgres", timeoutMs: 40, log: (w) => logged.push(w) });
  assert.ok(performance.now() - t0 < 1000, "home data resolved instead of hanging");
  assert.equal(data.ops, null);
  assert.equal(data.opsError, "unavailable");
  assert.equal(card(data, "tasks").status, "error");
  assert.equal(card(data, "tasks").value, null);
  assert.equal(card(data, "reach").status, "error");
  assert.equal(data.performance.status, "error");
  assert.deepEqual(data.pulse, { live: false, status: "error", label: "Unavailable" });
  assert.deepEqual(logged.sort(), ["ops", "seos"]);
});

test("a thrown ops read becomes the error state, never a page crash", async () => {
  const data = await readHomeDataWith({
    readOps: async () => {
      throw new Error("connection refused");
    },
    readAnalytics: async () => analyticsOk,
    storage: "postgres",
    timeoutMs: 100,
  });
  assert.equal(card(data, "tasks").status, "error");
  assert.doesNotMatch(card(data, "tasks").detail, /refused/);
  assert.equal(card(data, "reach").status, "ok");
});

test("ops and SEOS are read in parallel", async () => {
  const t0 = performance.now();
  const data = await readHomeDataWith({ readOps: () => sleep(150, opsLive), readAnalytics: () => sleep(150, analyticsOk), storage: "postgres", timeoutMs: 1000 });
  const ms = performance.now() - t0;
  assert.ok(ms < 280, `took ${Math.round(ms)}ms, so the reads ran one after the other`);
  assert.equal(card(data, "tasks").value, 1);
  assert.equal(data.pulse.live, true);
  assert.equal(data.performance.status, "ok");
});

test("Pulse follows the Open Tasks card: no seed counts when the ops store is not connected", async () => {
  const data = await readHomeDataWith({ readOps: async () => opsLive, readAnalytics: async () => analyticsOk, storage: "file", timeoutMs: 100 });
  assert.equal(card(data, "tasks").status, "not_connected");
  assert.deepEqual(data.pulse, { live: false, status: "not_connected", label: "Not connected" });
  assert.deepEqual(pulseState({ status: "ok" }), { live: true, status: "ok", label: null });
  assert.equal(pulseState(undefined).live, false);
});
