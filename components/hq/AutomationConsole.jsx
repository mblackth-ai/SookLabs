"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { AskAIButtonFull } from "./AskAIButton";

const BADGE_VARIANT = {
  "Workflow Ready": "success",
  Manual: "warning",
  "Future API": "outline",
  "Draft Export": "accent",
};

function buildCursorPrompt(job) {
  const payload = job.payload || {};
  const context = payload.context || job.summary || "(no context — refresh pending)";
  return `You are completing a SookLabs HQ agent job. Use the hq-ops skill.

Job ID: ${job.id}
Provider: ${job.provider || "cursor"}
Type: ${job.type || "briefing-ask-ai"}

Write a concise executive briefing in markdown with these sections:
## Priorities focus
## Risks & blockers
## Decisions to make

Ops context:
${context}

When done, either:
1) In HQ → LLM & Agents, paste the briefing into Complete job for ${job.id}, or
2) POST /hq/api/agents/callback with Bearer HQ_AGENT_CALLBACK_SECRET and body:
{"jobId":"${job.id}","provider":"${job.provider || "cursor"}","status":"completed","text":"<your briefing>"}
`;
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
}

export function AutomationConsole({
  mode,
  webhookConfigured,
  callbackConfigured,
  anthropicConfigured,
  n8nBase,
  providers,
  initialJobs = [],
}) {
  const router = useRouter();
  const [jobs, setJobs] = useState(initialJobs);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [completeId, setCompleteId] = useState(null);
  const [completeText, setCompleteText] = useState("");

  const running = useMemo(
    () => (jobs || []).filter((j) => j.status === "running"),
    [jobs]
  );

  const flash = useCallback((msg, isError = false) => {
    if (isError) {
      setError(msg);
      setToast("");
    } else {
      setToast(msg);
      setError("");
    }
    setTimeout(() => {
      setToast("");
      setError("");
    }, 4000);
  }, []);

  async function refreshPending() {
    setBusy("refresh");
    try {
      const res = await fetch("/hq/api/agents/pending?provider=cursor");
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Refresh failed");
      const pending = json.jobs || [];
      setJobs((prev) => {
        const byId = new Map((prev || []).map((j) => [j.id, j]));
        for (const j of pending) byId.set(j.id, { ...byId.get(j.id), ...j, status: "running" });
        return Array.from(byId.values()).sort((a, b) =>
          String(b.startedAt || "").localeCompare(String(a.startedAt || ""))
        );
      });
      flash(pending.length ? `${pending.length} running job(s)` : "No running Cursor jobs");
      router.refresh();
    } catch (e) {
      flash(e.message || "Refresh failed", true);
    } finally {
      setBusy("");
    }
  }

  async function runMorning() {
    setBusy("morning");
    try {
      const res = await fetch("/hq/api/cron/morning", { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Morning run failed");
      flash(
        json.webhookPosted
          ? `Morning dispatched via n8n (${json.jobId})`
          : json.summary || `Morning queued (${json.jobId})`
      );
      await refreshPending();
    } catch (e) {
      flash(e.message || "Morning run failed", true);
    } finally {
      setBusy("");
    }
  }

  async function copyPrompt(job) {
    try {
      let enriched = job;
      if (!job.payload?.context) {
        const res = await fetch(`/hq/api/agents/pending?provider=${encodeURIComponent(job.provider || "cursor")}`);
        const json = await res.json();
        const match = (json.jobs || []).find((j) => j.id === job.id);
        if (match) enriched = match;
      }
      await copyText(buildCursorPrompt(enriched));
      flash(`Copied Cursor prompt for ${job.id}`);
    } catch {
      flash("Clipboard unavailable", true);
    }
  }

  async function failJob(job) {
    setBusy(`fail-${job.id}`);
    try {
      const res = await fetch("/hq/api/agents/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          provider: job.provider || "cursor",
          status: "failed",
          summary: "Dismissed from HQ Automation console",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Dismiss failed");
      setJobs((prev) =>
        (prev || []).map((j) => (j.id === job.id ? { ...j, status: "failed", summary: "Dismissed" } : j))
      );
      flash(`Dismissed ${job.id}`);
      router.refresh();
    } catch (e) {
      flash(e.message || "Dismiss failed", true);
    } finally {
      setBusy("");
    }
  }

  async function dismissAllRunning() {
    if (!running.length) return;
    setBusy("dismiss-all");
    const ids = running.map((j) => j.id);
    const succeeded = new Set();
    for (const job of running) {
      try {
        const res = await fetch("/hq/api/agents/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: job.id,
            provider: job.provider || "cursor",
            status: "failed",
            summary: "Bulk dismissed from HQ Automation console",
          }),
        });
        const json = await res.json();
        if (res.ok && json.ok) succeeded.add(job.id);
      } catch {
        /* keep running */
      }
    }
    setJobs((prev) =>
      (prev || []).map((j) =>
        succeeded.has(j.id) ? { ...j, status: "failed", summary: "Bulk dismissed" } : j
      )
    );
    const ok = succeeded.size;
    const fail = ids.length - ok;
    flash(
      fail
        ? `Dismissed ${ok}; ${fail} failed`
        : `Dismissed ${ok} running job${ok === 1 ? "" : "s"}`
    );
    router.refresh();
    setBusy("");
  }

  async function pruneFinishedJobs() {
    setBusy("prune");
    try {
      const resGet = await fetch("/hq/api/ops");
      const jsonGet = await resGet.json();
      if (!resGet.ok || !jsonGet.ok) throw new Error(jsonGet.error || "Could not load ops");
      const kept = (jsonGet.data?.agentJobs || []).filter((j) => j.status === "running");
      const res = await fetch("/hq/api/ops", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentJobs: kept }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Prune failed");
      setJobs(kept);
      flash(`Cleared finished jobs · ${kept.length} running kept`);
      router.refresh();
    } catch (e) {
      flash(e.message || "Prune failed", true);
    } finally {
      setBusy("");
    }
  }

  async function submitComplete(job) {
    const text = completeText.trim();
    if (!text) {
      flash("Paste briefing text first", true);
      return;
    }
    setBusy(`complete-${job.id}`);
    try {
      const res = await fetch("/hq/api/agents/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          provider: job.provider || "cursor",
          status: "completed",
          text,
          summary: "Completed from HQ Automation console",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Complete failed");
      setCompleteId(null);
      setCompleteText("");
      setJobs((prev) =>
        (prev || []).map((j) =>
          j.id === job.id ? { ...j, status: "completed", summary: text.slice(0, 120) } : j
        )
      );
      flash(`Briefing saved for ${job.id}`);
      router.push("/hq/briefing");
      router.refresh();
    } catch (e) {
      flash(e.message || "Complete failed", true);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="hq-stack-3">
      <Card padding="md">
        <div className="hq-card-header">
          <span className="hq-card-title">Agent mode</span>
          <Badge variant={mode === "webhook" ? "success" : "accent"} size="sm">
            {mode}
          </Badge>
        </div>
        <p className="hq-text-sm-secondary hq-mt-2">
          Webhook mode queues jobs in ops, routes through n8n when configured, and completes via Cursor poll or one-click
          paste below. No LLM API keys required in Vercel.
        </p>
        <div className="hq-grid-2 hq-mt-4" style={{ gap: "var(--space-3)" }}>
          <div className="hq-text-xs-muted">
            Callback secret:{" "}
            <Badge variant={callbackConfigured ? "success" : "warning"} size="sm">
              {callbackConfigured ? "Set" : "Missing"}
            </Badge>
          </div>
          <div className="hq-text-xs-muted">
            Webhook URL:{" "}
            <Badge variant={webhookConfigured ? "success" : "warning"} size="sm">
              {webhookConfigured ? "Set" : "Optional / unset"}
            </Badge>
          </div>
        </div>
      </Card>

      <Card padding="md">
        <div className="hq-card-header hq-mb-2">
          <span className="hq-card-title">One-click actions</span>
          {(toast || error) && (
            <span className="hq-text-xs-muted" style={{ color: error ? "var(--color-error)" : undefined }}>
              {error || toast}
            </span>
          )}
        </div>
        <div className="hq-row-2">
          <AskAIButtonFull showFocus />
          <Button variant="secondary" size="sm" loading={busy === "morning"} onClick={runMorning}>
            Run morning
          </Button>
          <Button variant="ghost" size="sm" loading={busy === "refresh"} onClick={refreshPending}>
            Refresh queue
          </Button>
          <Button variant="ghost" size="sm" loading={busy === "prune"} onClick={pruneFinishedJobs}>
            Clear finished jobs
          </Button>
          {n8nBase ? (
            <Button variant="ghost" size="sm" href={n8nBase} external>
              Open n8n →
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" href="/hq/briefing">
            Briefing →
          </Button>
        </div>
        <p className="hq-text-xs-muted hq-mt-3">
          With n8n webhook set, <strong>Ask AI / Run morning</strong> auto-write the briefing (OpenAI → callback). Copy
          Cursor prompt / Complete stay available for Codex, Claude, or overrides.
        </p>
      </Card>

      <Card padding="md" className="hq-automation-running">
        <div className="hq-card-header hq-mb-2">
          <span className="hq-card-title">Running jobs</span>
          <div className="hq-row-2">
            <Badge variant={running.length ? "warning" : "outline"} size="sm">
              {running.length}
            </Badge>
            {running.length > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                loading={busy === "dismiss-all"}
                onClick={dismissAllRunning}
              >
                Dismiss all
              </Button>
            ) : null}
          </div>
        </div>
        {!running.length ? (
          <div className="hq-empty">
            <p className="hq-empty__text">No running jobs. Use Ask AI or Run morning to dispatch.</p>
            <div className="hq-empty__actions">
              <Button variant="secondary" size="sm" href="/hq/briefing">
                Ask AI on Briefing →
              </Button>
              <Button variant="ghost" size="sm" loading={busy === "morning"} onClick={runMorning}>
                Run morning
              </Button>
            </div>
          </div>
        ) : (
          <div className="hq-job-list">
            {running.map((job) => (
              <div key={job.id} className="hq-job-card">
                <div className="hq-flex-between">
                  <div>
                    <div className="hq-job-title">
                      {job.type}
                      <span className="hq-job-title-meta">
                        {" "}
                        · {job.provider || "cursor"} · {job.id}
                      </span>
                    </div>
                    <div className="hq-job-meta">
                      {job.startedAt ? new Date(job.startedAt).toLocaleString() : ""}
                      {job.summary ? ` · ${String(job.summary).slice(0, 100)}` : ""}
                    </div>
                  </div>
                </div>
                <div className="hq-job-actions">
                  <div className="hq-job-actions-primary">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setCompleteId(completeId === job.id ? null : job.id);
                        setCompleteText("");
                      }}
                    >
                      Complete
                    </Button>
                    <Button variant="accent" size="sm" onClick={() => copyPrompt(job)}>
                      Copy Cursor prompt
                    </Button>
                  </div>
                  <div className="hq-job-actions-secondary">
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={busy === `fail-${job.id}`}
                      onClick={() => failJob(job)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
                {completeId === job.id && (
                  <div className="hq-job-complete-panel">
                    <textarea
                      value={completeText}
                      onChange={(e) => setCompleteText(e.target.value)}
                      placeholder="Paste briefing markdown (## Priorities focus / ## Risks / ## Decisions)…"
                      rows={8}
                      className="hq-job-complete-textarea"
                    />
                    <div className="hq-row-2 hq-mt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        loading={busy === `complete-${job.id}`}
                        onClick={() => submitComplete(job)}
                      >
                        Save briefing
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setCompleteId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="hq-grid-2" style={{ gap: "var(--space-3)" }}>
        {providers.map((p) => (
          <Card key={p.id} padding="md">
            <div className="hq-card-header hq-mb-2">
              <div className="hq-card-title">{p.label}</div>
              <Badge variant={BADGE_VARIANT[p.badge] || "outline"} size="sm">
                {p.badge}
              </Badge>
            </div>
            <p className="hq-text-sm-secondary">{p.note}</p>
            {p.id === "n8n" && n8nBase ? (
              <Button variant="ghost" size="sm" href={n8nBase} external className="hq-mt-2">
                Open n8n →
              </Button>
            ) : null}
            {p.id === "cursor" && running[0] ? (
              <Button variant="ghost" size="sm" className="hq-mt-2" onClick={() => copyPrompt(running[0])}>
                Copy latest Cursor prompt
              </Button>
            ) : null}
            {p.id === "anthropic" && anthropicConfigured ? (
              <p className="hq-text-xs-muted hq-mt-2">
                Set HQ_AGENT_MODE=anthropic to use the key (Future API path).
              </p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
