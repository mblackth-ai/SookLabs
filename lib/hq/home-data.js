/**
 * Home page reads (pure orchestration; the server wiring lives in kpis-server.js).
 *
 * The ops store and SEOS are read in parallel, each bounded by about HQ_READ_TIMEOUT_MS, so the page never
 * waits on the slower one twice and never hangs. A failed or slow ops read becomes `opsError` (the Open Tasks
 * card and Pulse show "Unavailable"); it never throws.
 */

import { buildKpis } from "./kpis.js";
import { buildSessionsSeries } from "./performance.js";
import { HQ_READ_TIMEOUT_MS, withDeadline } from "./read-timeouts.js";

/** Pulse counts follow the Open Tasks card: numbers only when the ops store is live. */
export function pulseState(tasksKpi) {
  if (tasksKpi?.status === "ok") return { live: true, status: "ok", label: null };
  if (tasksKpi?.status === "error") return { live: false, status: "error", label: "Unavailable" };
  return { live: false, status: "not_connected", label: "Not connected" };
}

/**
 * @param {object} deps
 * @param {() => Promise<object>} deps.readOps        hq_ops snapshot reader
 * @param {() => Promise<object>} deps.readAnalytics  SEOS summary reader (already bounded by its own fetch timeout)
 * @param {"postgres"|"file"} deps.storage
 */
export async function readHomeDataWith({ readOps, readAnalytics, storage, timeoutMs = HQ_READ_TIMEOUT_MS, log = () => {} }) {
  // The ops read may need to connect, check the table and select; give the whole read one deadline.
  const opsPromise = withDeadline(Promise.resolve().then(readOps), timeoutMs + 500, "ops store read").then(
    (ops) => ({ ops, opsError: null }),
    (error) => {
      log("ops", error);
      return { ops: null, opsError: "unavailable" };
    },
  );
  const analyticsPromise = withDeadline(Promise.resolve().then(readAnalytics), timeoutMs + 500, "SEOS read").catch((error) => ({
    ok: false,
    configured: true,
    error: error instanceof Error ? error.message : "SEOS read failed",
    data: { generatedAt: null, workspaces: [] },
  }));

  const [{ ops, opsError }, analytics] = await Promise.all([opsPromise, analyticsPromise]);
  if (analytics && analytics.ok === false && analytics.configured !== false) log("seos", analytics.error);

  const kpis = buildKpis({ analytics, ops, storage, opsError });
  return {
    ops,
    opsError,
    kpis,
    pulse: pulseState(kpis.find((k) => k.key === "tasks")),
    performance: buildSessionsSeries(analytics),
  };
}
