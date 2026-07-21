"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { AskAIButton } from "./AskAIButton";

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
      router.refresh();
    } catch (e) {
      flash(e.message || "Complete failed", true);
    } finally {
      setBusy("");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <Card padding="md">
        <div className="hq-card-header">
          <span className="hq-card-title">Agent mode</span>
          <Badge variant={mode === "webhook" ? "success" : "accent"} size="sm">
            {mode}
          </Badge>
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "8px 0 0" }}>
          Webhook mode queues jobs in ops, routes through n8n when configured, and completes via Cursor poll or one-click
          paste below. No LLM API keys required in Vercel.
        </p>
        <div className="hq-grid-2" style={{ marginTop: 16, gap: 12 }}>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
            Callback secret:{" "}
            <Badge variant={callbackConfigured ? "success" : "warning"} size="sm">
              {callbackConfigured ? "Set" : "Missing"}
            </Badge>
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
            Webhook URL:{" "}
            <Badge variant={webhookConfigured ? "success" : "warning"} size="sm">
              {webhookConfigured ? "Set" : "Optional / unset"}
            </Badge>
          </div>
        </div>
      </Card>

      <Card padding="md">
        <div className="hq-card-header" style={{ marginBottom: 12 }}>
          <span className="hq-card-title">One-click actions</span>
          {(toast || error) && (
            <span style={{ fontSize: "var(--text-xs)", color: error ? "var(--color-error)" : "var(--text-tertiary)" }}>
              {error || toast}
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <AskAIButton showFocus />
          <Button variant="secondary" size="sm" loading={busy === "morning"} onClick={runMorning}>
            Run morning
          </Button>
          <Button variant="ghost" size="sm" loading={busy === "refresh"} onClick={refreshPending}>
            Refresh queue
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
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: "12px 0 0" }}>
          With n8n webhook set, <strong>Ask AI / Run morning</strong> auto-write the briefing (OpenAI → callback). Copy
          Cursor prompt / Complete stay available for Codex, Claude, or overrides.
        </p>
      </Card>

      <Card padding="md">
        <div className="hq-card-header" style={{ marginBottom: 12 }}>
          <span className="hq-card-title">Running jobs</span>
          <Badge variant={running.length ? "warning" : "outline"} size="sm">
            {running.length}
          </Badge>
        </div>
        {!running.length ? (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
            No running jobs. Use Ask AI or Run morning to dispatch.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {running.map((job) => (
              <div
                key={job.id}
                style={{
                  paddingTop: 4,
                  borderTop: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
                      {job.type}
                      <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}>
                        {" "}
                        · {job.provider || "cursor"} · {job.id}
                      </span>
                    </div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
                      {job.startedAt ? new Date(job.startedAt).toLocaleString() : ""}
                      {job.summary ? ` · ${String(job.summary).slice(0, 100)}` : ""}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <Button variant="accent" size="sm" onClick={() => copyPrompt(job)}>
                      Copy Cursor prompt
                    </Button>
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
                  <div style={{ marginTop: 10 }}>
                    <textarea
                      value={completeText}
                      onChange={(e) => setCompleteText(e.target.value)}
                      placeholder="Paste briefing markdown (## Priorities focus / ## Risks / ## Decisions)…"
                      rows={8}
                      style={{
                        width: "100%",
                        fontFamily: "var(--font-mono, var(--font-sans))",
                        fontSize: "var(--text-xs)",
                        padding: 10,
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--border-default)",
                        background: "var(--bg-base)",
                        color: "var(--text-primary)",
                        resize: "vertical",
                      }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
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
            <div className="hq-card-header" style={{ marginBottom: 8 }}>
              <div className="hq-card-title">{p.label}</div>
              <Badge variant={BADGE_VARIANT[p.badge] || "outline"} size="sm">
                {p.badge}
              </Badge>
            </div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>{p.note}</p>
            {p.id === "n8n" && n8nBase ? (
              <Button variant="ghost" size="sm" href={n8nBase} external style={{ marginTop: 10 }}>
                Open n8n →
              </Button>
            ) : null}
            {p.id === "cursor" && running[0] ? (
              <Button variant="ghost" size="sm" style={{ marginTop: 10 }} onClick={() => copyPrompt(running[0])}>
                Copy latest Cursor prompt
              </Button>
            ) : null}
            {p.id === "anthropic" && anthropicConfigured ? (
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: "8px 0 0" }}>
                Set HQ_AGENT_MODE=anthropic to use the key (Future API path).
              </p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
