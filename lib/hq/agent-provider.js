import { generateBriefingWithLlm, buildOpsContext, parseBriefingSections } from "./briefing-llm";

export const AGENT_PROVIDERS = [
  { id: "cursor", label: "Cursor", badge: "Workflow Ready" },
  { id: "codex", label: "Codex", badge: "Manual" },
  { id: "claude", label: "Claude", badge: "Manual" },
  { id: "n8n", label: "n8n", badge: "Manual" },
];

/** Honest badge for Cursor: Workflow Ready when pending poll path works (always), but Manual if webhook-only mode expected without runner. */
export function getProviderBadge(providerId, { webhookConfigured } = {}) {
  if (providerId === "n8n") return webhookConfigured ? "Workflow Ready" : "Manual";
  if (providerId === "cursor") return "Workflow Ready"; // pending poll + callback path
  if (providerId === "codex" || providerId === "claude") return "Manual";
  return "Manual";
}

export function getAgentMode() {
  const mode = (process.env.HQ_AGENT_MODE || "webhook").trim().toLowerCase();
  return mode === "anthropic" ? "anthropic" : "webhook";
}

export function getDefaultProvider() {
  return (process.env.HQ_AGENT_DEFAULT_PROVIDER || "cursor").trim().toLowerCase();
}

function resolveCallbackBase() {
  const explicit = process.env.HQ_PUBLIC_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) {
    return (vercel.startsWith("http") ? vercel : `https://${vercel}`).replace(/\/$/, "");
  }
  return "https://hq.sooklabs.com";
}

/**
 * Build the outbound agent job payload (shared by dispatch API + morning cron).
 */
export function buildAgentPayload(ops, { jobId, type, followUp = "", provider } = {}) {
  const providerTarget = (provider || getDefaultProvider()).toLowerCase();
  const base = resolveCallbackBase();
  return {
    jobId,
    type: type || "briefing-ask-ai",
    provider: providerTarget,
    followUp: followUp || "",
    context: buildOpsContext(ops),
    callbackUrl: `${base}/hq/api/agents/callback`,
    opsSnapshot: {
      updatedAt: ops.updatedAt,
      openPriorities: (ops.todayPriorities || []).filter((p) => !p.done).length,
      openTasks: Object.values(ops.workstreams || {}).reduce(
        (n, s) => n + (s.items || []).filter((i) => i.status !== "done").length,
        0
      ),
    },
    startedAt: new Date().toISOString(),
  };
}

/**
 * Dispatch a briefing job via webhook (n8n) or Anthropic API.
 * Webhook mode always returns async running status — completion via /hq/api/agents/callback.
 */
export async function dispatchBriefingJob(ops, { jobId, type, followUp = "", provider } = {}) {
  const mode = getAgentMode();
  const providerTarget = (provider || getDefaultProvider()).toLowerCase();

  if (mode === "anthropic") {
    const { text, model } = await generateBriefingWithLlm(ops, { followUp });
    const sections = parseBriefingSections(text);
    return {
      mode: "anthropic",
      status: "completed",
      jobId,
      provider: "anthropic",
      model,
      text,
      sections,
    };
  }

  const payload = buildAgentPayload(ops, { jobId, type, followUp, provider: providerTarget });
  const webhookUrl = process.env.HQ_AGENT_WEBHOOK_URL?.trim();
  let webhookPosted = false;
  let webhookError = null;

  if (webhookUrl) {
    try {
      const headers = { "Content-Type": "application/json" };
      const dispatchSecret =
        process.env.HQ_AGENT_WEBHOOK_SECRET?.trim() ||
        process.env.HQ_AGENT_CALLBACK_SECRET?.trim();
      if (dispatchSecret) {
        headers.Authorization = `Bearer ${dispatchSecret}`;
        headers["X-HQ-Agent-Dispatch-Secret"] = dispatchSecret;
      }
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      webhookPosted = res.ok;
      if (!res.ok) {
        webhookError = `Webhook HTTP ${res.status}`;
      }
    } catch (err) {
      webhookError = err.message || "Webhook request failed";
    }
  }

  return {
    mode: "webhook",
    status: "running",
    jobId,
    provider: providerTarget,
    payload,
    webhookPosted,
    webhookConfigured: Boolean(webhookUrl),
    webhookError,
    summary: webhookPosted
      ? `Dispatched to ${providerTarget} via webhook`
      : webhookUrl
        ? `Webhook failed (${webhookError}); job queued for pending poll / callback`
        : `Queued for ${providerTarget} (no HQ_AGENT_WEBHOOK_URL — complete via callback or pending poll)`,
  };
}

export { parseBriefingSections, buildOpsContext };
