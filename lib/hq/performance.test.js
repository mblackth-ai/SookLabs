import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSessionsSeries, chartGeometry, formatAxis, monthLabel, monthRange, niceMax } from "./performance.js";

const ws = (name, traffic) => ({ slug: name.toLowerCase(), name, hasData: true, traffic });

test("not configured, failed and empty SEOS reads give an honest state and no points", () => {
  const nc = buildSessionsSeries({ ok: false, configured: false, data: { workspaces: [] } });
  assert.equal(nc.status, "not_connected");
  assert.match(nc.source, /^Not connected/);
  assert.match(nc.detail, /aren't available/);
  assert.deepEqual(nc.points, []);
  assert.equal(buildSessionsSeries(undefined).status, "not_connected");
  const err = buildSessionsSeries({ ok: false, configured: true, error: "SEOS analytics API failed (500)", data: { workspaces: [] } });
  assert.equal(err.status, "error");
  assert.doesNotMatch(err.detail, /500/);
  assert.deepEqual(err.points, []);
  const empty = buildSessionsSeries({ ok: true, configured: true, data: { workspaces: [ws("A", []), ws("B", [{ month: "2026-09", sessions: null }])] } });
  assert.equal(empty.status, "empty");
  assert.deepEqual(empty.points, []);
});

test("sessions are summed per month across sites; missing months are gaps, not zeros", () => {
  const s = buildSessionsSeries({
    ok: true,
    configured: true,
    data: {
      workspaces: [
        ws("RDUSA", [{ month: "2026-06", sessions: 100 }, { month: "2026-09", sessions: 40 }]),
        ws("JAKA", [{ month: "2026-06", sessions: 5 }, { month: "2026-07", sessions: null }]),
        ws("Empty", []),
      ],
    },
  });
  assert.equal(s.status, "ok");
  assert.deepEqual(
    s.points.map((p) => [p.month, p.value]),
    [["2026-06", 105], ["2026-07", null], ["2026-08", null], ["2026-09", 40]],
  );
  assert.deepEqual(s.sites, ["RDUSA", "JAKA"]);
  assert.match(s.detail, /2 months of data · 2 sites: RDUSA, JAKA/);
});

test("geometry breaks the line at gaps and never invents a point", () => {
  const pts = [
    { month: "2026-06", value: 100 },
    { month: "2026-07", value: 50 },
    { month: "2026-08", value: null },
    { month: "2026-09", value: 80 },
    { month: "2026-10", value: 90 },
  ];
  const g = chartGeometry(pts);
  assert.equal(g.points.filter((p) => p.y != null).length, 4);
  assert.equal(g.paths.length, 2, "two segments around the gap");
  assert.equal(g.ticks.at(-1).value, 100);
  assert.ok(g.points[0].y < g.points[1].y, "higher value is drawn higher");
  assert.equal(chartGeometry([{ month: "2026-09", value: 3 }]).paths.length, 0, "a single month is a dot, not a line");
});

test("helpers", () => {
  assert.deepEqual(monthRange("2025-11", "2026-02"), ["2025-11", "2025-12", "2026-01", "2026-02"]);
  assert.deepEqual(monthRange("2026-02", "2025-11"), []);
  assert.equal(monthLabel("2026-09"), "Sep 26");
  assert.equal(niceMax(0), 1);
  assert.equal(niceMax(87), 100);
  assert.equal(niceMax(1234), 2000);
  assert.equal(formatAxis(1500), "1.5K");
  assert.equal(formatAxis(null), "");
});

test("the chart module and component hold no literal data points", () => {
  for (const f of ["lib/hq/performance.js", "components/hq/PerformanceChart.jsx"]) {
    const src = readFileSync(new URL(`../../${f}`, import.meta.url), "utf8");
    assert.doesNotMatch(src, /sessions:\s*-?\d|value:\s*-?\d/, `${f} assigns a literal data value`);
  }
});
