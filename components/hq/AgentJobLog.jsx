"use client";

import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STARTER_JOB = {
  id: "starter",
  provider: "cursor",
  type: "briefing-ask-ai",
  summary: "Focus on today priorities, blockers, and one decision from HQ ops.",
};

function buildCursorPrompt(job) {
  return `You are completing a SookLabs HQ agent job. Use the hq-ops skill.

Job ID: ${job.id}
Provider: ${job.provider || "cursor"}
Type: ${job.type || "briefing-ask-ai"}

Write a concise executive briefing in markdown with:
## Priorities focus
## Risks & blockers
## Decisions to make

Then Complete the job in HQ → LLM & Agents (paste briefing), or POST /hq/api/agents/callback.

Context hint: ${job.summary || "(open Automation → Refresh queue for full context)"}
`;
}

function statusVariant(status) {
  if (status === "completed") return "success";
  if (status === "failed") return "error";
  return "warning";
}

export function AgentJobLog({ jobs = [], compact = false }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const router = useRouter();
  const recent = jobs.slice(0, compact ? 3 : 8);
  const runningCount = jobs.filter((j) => j.status === "running").length;

  async function runMorning() {
    setLoading(true);
    try {
      const res = await fetch("/hq/api/cron/morning", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        let provider = "cursor";
        try {
          provider = localStorage.getItem("hq-agent-provider") || "cursor";
        } catch {
          /* ignore */
        }
        await fetch("/hq/api/briefing/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider }),
        });
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function copyPrompt(job) {
    try {
      await navigator.clipboard.writeText(buildCursorPrompt(job));
      setToast(`Copied ${job.id}`);
      setTimeout(() => setToast(""), 2500);
    } catch {
      setToast("Copy failed");
      setTimeout(() => setToast(""), 2500);
    }
  }

  async function dismissJob(job) {
    setLoading(true);
    try {
      const res = await fetch("/hq/api/agents/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          provider: job.provider || "cursor",
          status: "failed",
          summary: "Dismissed from Overview agent jobs",
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setToast(json.error || "Dismiss failed");
        setTimeout(() => setToast(""), 2500);
        return;
      }
      setToast(`Dismissed ${job.id}`);
      setTimeout(() => setToast(""), 2500);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card padding={compact ? "sm" : "md"} className={compact ? "hq-agent-log hq-agent-log--compact" : "hq-agent-log"}>
      <div className="hq-card-header">
        <div>
          <span className="hq-card-title">{compact ? "Recent agent jobs" : "Agent jobs"}</span>
          {compact && runningCount > 0 ? (
            <div className="hq-agent-log-compact-meta">
              {runningCount} running — complete in Automation
            </div>
          ) : null}
        </div>
        <div className="hq-row-2">
          {toast ? <span className="hq-text-xs-muted">{toast}</span> : null}
          {!compact ? (
            <Button variant="ghost" size="sm" loading={loading} onClick={runMorning}>
              Run morning
            </Button>
          ) : null}
          <Button variant={compact ? "secondary" : "ghost"} size="sm" href="/hq/automation">
            {compact ? "Automation →" : "Complete →"}
          </Button>
        </div>
      </div>
      {!recent.length ? (
        <div className={compact ? "hq-agent-log-compact-empty" : "hq-empty"}>
          <p className={compact ? "hq-text-xs-muted" : "hq-empty__text"}>
            {compact
              ? "No agent runs yet. Dispatch from Briefing · Ask AI."
              : "No agent runs yet. Dispatch from Briefing · Ask AI — or paste a starter prompt into Cursor and complete via Automation."}
          </p>
          {!compact ? (
            <div className="hq-empty__actions">
              <Button variant="secondary" size="sm" href="/hq/briefing">
                Ask AI on Briefing →
              </Button>
              <Button variant="accent" size="sm" onClick={() => copyPrompt(STARTER_JOB)}>
                Copy starter prompt
              </Button>
              <Button variant="ghost" size="sm" href="/hq/automation">
                Complete job →
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" href="/hq/briefing" className="hq-mt-2">
              Ask AI →
            </Button>
          )}
        </div>
      ) : (
        <div className="hq-job-list">
          {recent.map((job) => (
            <div key={job.id} className={`hq-job-card${compact ? " hq-job-card--compact" : ""}`}>
              <div className="hq-flex-between">
                <div>
                  <div className="hq-job-title">
                    {job.type}
                    {job.provider ? <span className="hq-job-title-meta"> · {job.provider}</span> : null}
                  </div>
                  <div className="hq-job-meta">
                    {job.startedAt ? new Date(job.startedAt).toLocaleString() : ""}
                    {job.summary ? ` · ${job.summary.slice(0, compact ? 56 : 80)}` : ""}
                  </div>
                </div>
                <Badge variant={statusVariant(job.status)} size="sm">
                  {job.status}
                </Badge>
              </div>
              {!compact && job.status === "running" ? (
                <div className="hq-job-actions">
                  <div className="hq-job-actions-primary">
                    <Button variant="secondary" size="sm" href="/hq/automation">
                      Complete
                    </Button>
                    <Button variant="accent" size="sm" onClick={() => copyPrompt(job)}>
                      Copy prompt
                    </Button>
                  </div>
                  <div className="hq-job-actions-secondary">
                    <Button variant="ghost" size="sm" disabled={loading} onClick={() => dismissJob(job)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              ) : null}
              {compact && job.status === "running" ? (
                <div className="hq-agent-log-compact-running">
                  <Button variant="ghost" size="sm" href="/hq/automation">
                    Complete in Automation →
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
