/**
 * Home KPI cards (pure; no server-only import, so it is testable).
 *
 * Every card is built from a real HQ source or shows a state without a number:
 *   - "ok"            value is a number read from the named source
 *   - "empty"         the source is connected but has nothing to count yet
 *   - "not_connected" HQ has no source for this metric (no key, no table, no store)
 *   - "error"         the source is connected but the read failed
 * Only "ok" carries a value. Nothing here may ever hold a literal metric figure.
 */

import { CLIENTS } from "./clients.js";
import { getRetainerSnapshot } from "./retainers.js";

export const KPI_KEYS = ["revenue", "customers", "reach", "tasks"];

const numberFmt = new Intl.NumberFormat("en-US");
const compactFmt = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

/** Display string for a count: full digits under 10k, compact notation (K, M) above. */
export function formatCount(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return Math.abs(n) >= 10_000 ? compactFmt.format(n) : numberFmt.format(n);
}

function card(base, fields) {
  const out = { ...base, value: null, display: null, detail: null, ...fields };
  if (out.status !== "ok") {
    out.value = null;
    out.display = null;
  } else {
    out.display = formatCount(out.value);
  }
  return out;
}

/**
 * Total Revenue. HQ has no revenue source today: no Stripe key in HQ's server env and no revenue table
 * in the HQ ops store. Pass `revenue` only when a real server-side source is wired in a later slice.
 */
export function revenueKpi(revenue = null) {
  const base = {
    key: "revenue",
    label: "Total Revenue",
    icon: "revenue",
    accent: "purple",
    href: null,
    source: "Not connected: HQ has no Stripe key or revenue table on the server.",
  };
  if (!revenue || revenue.connected !== true) {
    return card(base, { status: "not_connected", detail: "Connect a revenue source (Stripe or a revenue table) to show this." });
  }
  if (revenue.error) return card(base, { status: "error", source: revenue.source, detail: revenue.error });
  if (typeof revenue.amount !== "number") return card(base, { status: "empty", source: revenue.source, detail: "No revenue recorded yet." });
  return card(base, { status: "ok", value: revenue.amount, source: revenue.source, detail: revenue.period ?? null });
}

/** Active Customers: clients in HQ's client registry with a retainer contract (lib/hq/clients.js + lib/hq/retainers.js). */
export function customersKpi(clients = CLIENTS, snapshotFor = getRetainerSnapshot) {
  const base = {
    key: "customers",
    label: "Active Customers",
    icon: "customers",
    accent: "blue",
    href: "/hq/clients",
    source: "HQ client registry: clients with a retainer contract (lib/hq/clients.js, lib/hq/retainers.js).",
  };
  if (!Array.isArray(clients)) return card(base, { status: "not_connected", detail: "Client registry unavailable." });
  const active = clients.filter((c) => c?.retainer && snapshotFor(c.retainer));
  if (active.length === 0) return card(base, { status: "empty", detail: "No clients with a retainer contract." });
  return card(base, {
    status: "ok",
    value: active.length,
    detail: `Retainer clients: ${active.map((c) => c.short || c.name).join(", ")}. Sookly customer count is not connected.`,
  });
}

/**
 * Content Reach: Google Search Console impressions on SEOS tracked keywords for the latest complete month,
 * summed over SEOS workspaces that have data (SEOS GET /api/analytics/hq-summary, Bearer SEOS_HQ_API_TOKEN).
 * `result` is what readAnalyticsSummaryWith returns.
 */
export function reachKpi(result) {
  const base = {
    key: "reach",
    label: "Content Reach",
    icon: "reach",
    accent: "green",
    href: "/hq/reports",
    source: "SEOS analytics summary: Google Search Console impressions on tracked keywords.",
  };
  if (!result || result.configured === false) {
    return card(base, { status: "not_connected", source: "Not connected: SEOS_HQ_API_TOKEN is not set on the HQ server.", detail: "Set the SEOS token to read search reach." });
  }
  if (!result.ok) return card(base, { status: "error", detail: `SEOS read failed: ${result.error || "unknown error"}` });
  const withData = (result.data?.workspaces ?? []).filter(
    (w) => w?.hasData && typeof w?.totals?.impressions === "number" && Number.isFinite(w.totals.impressions),
  );
  if (withData.length === 0) return card(base, { status: "empty", detail: "SEOS is connected but has no Search Console data yet." });
  const months = [...new Set(withData.map((w) => w.latestMonth).filter(Boolean))].sort();
  const value = withData.reduce((sum, w) => sum + w.totals.impressions, 0);
  const month = months.at(-1) ?? null;
  return card(base, {
    status: "ok",
    value,
    detail: `Search impressions${month ? `, ${month}` : ""} · ${withData.length} site${withData.length === 1 ? "" : "s"}: ${withData.map((w) => w.name || w.slug).join(", ")}`,
  });
}

/** Open workstream items in an ops snapshot (status other than "done"). Same count as the Overview pulse. */
export function countOpenTasks(ops) {
  return Object.values(ops?.workstreams || {}).reduce(
    (n, s) => n + (Array.isArray(s?.items) ? s.items.filter((i) => i && i.status !== "done").length : 0),
    0,
  );
}

/**
 * Open Tasks: open items across HQ ops-store workstreams (hq_ops row in HQ Postgres).
 * The file store is seed data on serverless, so it counts as not connected.
 */
export function tasksKpi({ ops, storage, error } = {}) {
  const base = {
    key: "tasks",
    label: "Open Tasks",
    icon: "tasks",
    accent: "amber",
    href: "/hq/portfolio",
    source: "HQ ops store (Postgres hq_ops): open workstream items.",
  };
  if (storage !== "postgres") {
    return card(base, { status: "not_connected", source: "Not connected: HQ_DATABASE_URL is not set, so HQ only has its file seed.", detail: "Connect the HQ ops database to count tasks." });
  }
  if (error) return card(base, { status: "error", detail: `Ops store read failed: ${error}` });
  const value = countOpenTasks(ops);
  const streams = Object.values(ops?.workstreams || {}).filter((s) => (s?.items || []).some((i) => i && i.status !== "done")).length;
  return card(base, { status: "ok", value, detail: `Across ${streams} workstream${streams === 1 ? "" : "s"}` });
}

/** The four Home cards in mockup order. */
export function buildKpis({ revenue = null, clients = CLIENTS, snapshotFor = getRetainerSnapshot, analytics, ops, storage, opsError } = {}) {
  return [revenueKpi(revenue), customersKpi(clients, snapshotFor), reachKpi(analytics), tasksKpi({ ops, storage, error: opsError })];
}
