/**
 * Home "Performance Overview" chart data (pure; no server-only import, so it is testable).
 *
 * The only real time series HQ can read server-side today is SEOS's monthly website sessions
 * (Google Analytics 4 via SEOS GET /api/analytics/hq-summary → workspaces[].traffic[{ month, sessions }]).
 * SEOS does not expose a daily or weekly search series, and hq_ops tasks carry no completion dates,
 * so neither is plotted. Months with no reading stay null (a gap), never zero or an invented point.
 */

const MONTH_RE = /^\d{4}-\d{2}$/;

/** Every YYYY-MM from `first` to `last` inclusive. */
export function monthRange(first, last) {
  if (!MONTH_RE.test(first) || !MONTH_RE.test(last) || first > last) return [];
  const out = [];
  let [y, m] = first.split("-").map(Number);
  for (let guard = 0; guard < 120; guard++) {
    const key = `${y}-${String(m).padStart(2, "0")}`;
    out.push(key);
    if (key === last) break;
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

const MONTH_LABEL = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });

/** "2026-09" → "Sep 26". */
export function monthLabel(month) {
  if (!MONTH_RE.test(month)) return month;
  const [y, m] = month.split("-").map(Number);
  return MONTH_LABEL.format(new Date(Date.UTC(y, m - 1, 1)));
}

/**
 * Build the sessions series from what readAnalyticsSummaryWith returned.
 * Status follows the KPI cards: "ok" | "empty" | "not_connected" | "error". Only "ok" carries points.
 */
export function buildSessionsSeries(result) {
  const base = {
    key: "sessions",
    title: "Performance Overview",
    metric: "Website sessions per month",
    source: "From SEOS: Google Analytics website sessions, summed across linked sites.",
    href: "/hq/reports",
    points: [],
    sites: [],
  };
  if (!result || result.configured === false) {
    return {
      ...base,
      status: "not_connected",
      source: "Not connected: SEOS isn't linked to this HQ server.",
      detail: "Link SEOS to chart monthly website sessions. Daily search numbers and task completions over time aren't available to HQ yet either.",
    };
  }
  if (!result.ok) {
    return { ...base, status: "error", detail: "SEOS didn't respond, so the chart can't be shown right now." };
  }

  const byMonth = new Map();
  const sites = [];
  for (const w of result.data?.workspaces ?? []) {
    let counted = false;
    for (const t of Array.isArray(w?.traffic) ? w.traffic : []) {
      if (!MONTH_RE.test(t?.month ?? "") || typeof t.sessions !== "number" || !Number.isFinite(t.sessions)) continue;
      byMonth.set(t.month, (byMonth.get(t.month) ?? 0) + t.sessions);
      counted = true;
    }
    if (counted) sites.push(w.name || w.slug);
  }
  if (byMonth.size === 0) {
    return {
      ...base,
      status: "empty",
      detail: "SEOS is linked but has no Google Analytics sessions yet. Daily search numbers and task completions over time aren't available to HQ yet.",
    };
  }
  const months = [...byMonth.keys()].sort();
  const points = monthRange(months[0], months.at(-1)).map((month) => ({
    month,
    label: monthLabel(month),
    value: byMonth.has(month) ? byMonth.get(month) : null,
  }));
  const real = points.filter((p) => p.value != null).length;
  return {
    ...base,
    status: "ok",
    points,
    sites,
    detail: `${real} month${real === 1 ? "" : "s"} of data · ${sites.length} site${sites.length === 1 ? "" : "s"}: ${sites.join(", ")}`,
  };
}

/** Round a max up to a tidy axis top (1, 2, 2.5, 5 × 10^n). */
export function niceMax(max) {
  if (!(max > 0)) return 1;
  const pow = 10 ** Math.floor(Math.log10(max));
  for (const step of [1, 2, 2.5, 5, 10]) if (step * pow >= max) return step * pow;
  return 10 * pow;
}

/**
 * SVG geometry for the series. Null values break the line into segments; no point is invented.
 * Returns { x, y } for each point (y null for gaps), the line segments as path strings, and y-axis ticks.
 */
export function chartGeometry(points, { width = 640, height = 220, padX = 40, padTop = 12, padBottom = 28 } = {}) {
  const values = points.map((p) => p.value).filter((v) => typeof v === "number");
  const top = niceMax(values.length ? Math.max(...values) : 0);
  const innerW = width - padX * 2;
  const innerH = height - padTop - padBottom;
  const step = points.length > 1 ? innerW / (points.length - 1) : 0;
  const xy = points.map((p, i) => ({
    ...p,
    x: points.length > 1 ? padX + i * step : padX + innerW / 2,
    y: typeof p.value === "number" ? padTop + innerH - (p.value / top) * innerH : null,
  }));
  const segments = [];
  let current = [];
  for (const p of xy) {
    if (p.y == null) {
      if (current.length) segments.push(current);
      current = [];
    } else current.push(p);
  }
  if (current.length) segments.push(current);
  const paths = segments
    .filter((s) => s.length > 1)
    .map((s) => s.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "));
  const areas = segments
    .filter((s) => s.length > 1)
    .map(
      (s) =>
        `M${s[0].x.toFixed(1)},${(padTop + innerH).toFixed(1)} ` +
        s.map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") +
        ` L${s.at(-1).x.toFixed(1)},${(padTop + innerH).toFixed(1)} Z`,
    );
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({ value: top * f, y: padTop + innerH - f * innerH }));
  return { width, height, padX, padTop, baseline: padTop + innerH, points: xy, paths, areas, ticks };
}

const AXIS_FMT = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** Axis tick label: 0, 250, 1.5K, 2M. */
export function formatAxis(n) {
  return typeof n === "number" && Number.isFinite(n) ? AXIS_FMT.format(n) : "";
}
