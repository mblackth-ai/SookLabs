import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildKpis, countOpenTasks, customersKpi, formatCount, KPI_KEYS, reachKpi, revenueKpi, tasksKpi } from "./kpis.js";
import { CLIENTS } from "./clients.js";
import { getRetainerSnapshot } from "./retainers.js";

const notConfigured = { ok: false, configured: false, error: "SEOS_HQ_API_TOKEN is not configured.", data: { workspaces: [] } };

function assertNoNumber(card) {
  assert.notEqual(card.status, "ok", `${card.key} should not be ok`);
  assert.equal(card.value, null, `${card.key} value`);
  assert.equal(card.display, null, `${card.key} display`);
}

test("four cards in mockup order with stable keys and labels", () => {
  const cards = buildKpis({ analytics: notConfigured, ops: {}, storage: "file" });
  assert.deepEqual(cards.map((c) => c.key), KPI_KEYS);
  assert.deepEqual(cards.map((c) => c.label), ["Total Revenue", "Active Customers", "Content Reach", "Open Tasks"]);
  for (const c of cards) assert.ok(c.source && typeof c.source === "string", `${c.key} names its source`);
});

test("with nothing connected, every source-less card is not connected and carries no number", () => {
  const [revenue, , reach, tasks] = buildKpis({ analytics: notConfigured, ops: { workstreams: { a: { items: [{ status: "open" }] } } }, storage: "file" });
  for (const c of [revenue, reach, tasks]) {
    assertNoNumber(c);
    assert.equal(c.status, "not_connected");
    assert.match(c.source, /^Not connected/);
  }
});

test("revenue stays not connected until a real source is passed; only then shows its amount", () => {
  assertNoNumber(revenueKpi());
  assertNoNumber(revenueKpi(null));
  assertNoNumber(revenueKpi({ connected: false, amount: 5 }));
  assert.equal(revenueKpi().href, null, "no link to a page that does not exist");
  const err = revenueKpi({ connected: true, source: "Stripe", error: "401" });
  assertNoNumber(err);
  assert.equal(err.status, "error");
  assertNoNumber(revenueKpi({ connected: true, source: "Stripe" }));
  const ok = revenueKpi({ connected: true, source: "Stripe balance", amount: 4200 });
  assert.equal(ok.status, "ok");
  assert.equal(ok.value, 4200);
});

test("active customers counts registry clients with a retainer contract (RDUSA, JAKA today)", () => {
  const c = customersKpi();
  const expected = CLIENTS.filter((x) => x.retainer && getRetainerSnapshot(x.retainer));
  assert.equal(c.status, "ok");
  assert.equal(c.value, expected.length);
  assert.deepEqual(expected.map((x) => x.slug), ["rdusa", "jaka"]);
  assert.match(c.detail, /RDUSA, JAKA/);
  assertNoNumber(customersKpi([], () => null));
  assert.equal(customersKpi([], () => null).status, "empty");
  assertNoNumber(customersKpi([{ retainer: "x", short: "X" }], () => null));
  assertNoNumber(customersKpi(null));
});

test("content reach sums SEOS Search Console impressions over workspaces with data", () => {
  const result = {
    ok: true,
    configured: true,
    data: {
      workspaces: [
        { slug: "rdusa", name: "RDUSA", hasData: true, latestMonth: "2026-09", totals: { impressions: 1200 } },
        { slug: "jaka", name: "JAKA", hasData: true, latestMonth: "2026-09", totals: { impressions: 34 } },
        { slug: "idle", name: "Idle", hasData: false, latestMonth: "2026-09", totals: { impressions: 999 } },
      ],
    },
  };
  const c = reachKpi(result);
  assert.equal(c.status, "ok");
  assert.equal(c.value, 1234);
  assert.equal(c.display, "1,234");
  assert.match(c.detail, /2026-09/);
  assert.match(c.detail, /2 sites: RDUSA, JAKA/);
});

test("content reach: not configured, failed and empty SEOS reads show no number", () => {
  const nc = reachKpi(notConfigured);
  assertNoNumber(nc);
  assert.equal(nc.status, "not_connected");
  assertNoNumber(reachKpi(undefined));
  const err = reachKpi({ ok: false, configured: true, error: "SEOS analytics API failed (503)", data: { workspaces: [] } });
  assertNoNumber(err);
  assert.equal(err.status, "error");
  assert.match(err.detail, /503/);
  const empty = reachKpi({ ok: true, configured: true, data: { workspaces: [{ slug: "a", hasData: false, totals: { impressions: 50 } }] } });
  assertNoNumber(empty);
  assert.equal(empty.status, "empty");
  assertNoNumber(reachKpi({ ok: true, configured: true, data: { workspaces: [{ slug: "a", hasData: true, totals: {} }] } }));
});

test("open tasks counts non-done workstream items from the Postgres ops store only", () => {
  const ops = {
    workstreams: {
      a: { items: [{ status: "todo" }, { status: "done" }, { status: "in_progress" }] },
      b: { items: [{ status: "done" }] },
      c: { items: [{ status: "blocked" }] },
      d: {},
    },
  };
  assert.equal(countOpenTasks(ops), 3);
  assert.equal(countOpenTasks(null), 0);
  const ok = tasksKpi({ ops, storage: "postgres" });
  assert.equal(ok.status, "ok");
  assert.equal(ok.value, 3);
  assert.match(ok.detail, /2 workstreams/);
  const zero = tasksKpi({ ops: { workstreams: {} }, storage: "postgres" });
  assert.equal(zero.status, "ok");
  assert.equal(zero.value, 0, "a real zero is a number, not a placeholder");
  const file = tasksKpi({ ops, storage: "file" });
  assertNoNumber(file);
  assert.equal(file.status, "not_connected");
  const err = tasksKpi({ ops, storage: "postgres", error: "connection refused" });
  assertNoNumber(err);
  assert.equal(err.status, "error");
});

test("formatCount: full digits below 10k, compact above, null for non-numbers", () => {
  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(9999), "9,999");
  assert.equal(formatCount(12842), "12.8K");
  assert.equal(formatCount(1_400_000), "1.4M");
  assert.equal(formatCount(NaN), null);
  assert.equal(formatCount("12"), null);
});

test("no mockup or placeholder figures ship in the KPI code or the Home page", () => {
  const files = ["lib/hq/kpis.js", "lib/hq/kpis-server.js", "components/hq/KpiCards.jsx", "app/hq/(dash)/page.js", "lib/hq/nav.js", "components/hq/ComingSoon.jsx"];
  const mockupFigures = [/128[,.]?430/, /12[,.]?842/, /\b1\.4M\b/, /\+?32%/, /\b18%/, /\b12%/, /\b28%/];
  for (const f of files) {
    const src = readFileSync(new URL(`../../${f}`, import.meta.url), "utf8");
    for (const re of mockupFigures) assert.doesNotMatch(src, re, `${f} contains ${re}`);
  }
  // kpis.js builds values only from its inputs: no numeric literal is ever assigned as a card value.
  const kpis = readFileSync(new URL("./kpis.js", import.meta.url), "utf8");
  assert.doesNotMatch(kpis, /value:\s*-?\d/, "kpis.js assigns a literal number as a card value");
  assert.doesNotMatch(kpis, /amount:\s*-?\d/);
});
