"use client";

import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

export function AgentJobLog({ jobs = [], compact = false }) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const router = useRouter();
  const recent = jobs.slice(0, compact ? 3 : 8);
  const running = recent.filter((j) => j.status === "running");

  async function runMorning() {
    setLoading(true);
    try {
      const res = await fetch("/hq/api/cron/morning", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        // fallback to Ask AI dispatch
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

  return (
    <Card padding="md">
      <div className="hq-card-header">
        <span className="hq-card-title">Agent jobs</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
          {toast ? (
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{toast}</span>
          ) : null}
          <Button variant="ghost" size="sm" loading={loading} onClick={runMorning}>
            Run morning
          </Button>
          {running[0] ? (
            <Button variant="accent" size="sm" onClick={() => copyPrompt(running[0])}>
              Copy Cursor prompt
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" href="/hq/automation">
            Complete →
          </Button>
        </div>
      </div>
      {!recent.length ? (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
          No agent runs yet. Use Briefing · Ask AI — jobs appear here when dispatched or completed.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {recent.map((job) => (
            <div key={job.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>
                  {job.type}
                  {job.provider ? (
                    <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}> · {job.provider}</span>
                  ) : null}
                </div>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
                  {job.startedAt ? new Date(job.startedAt).toLocaleString() : ""}
                  {job.summary ? ` · ${job.summary.slice(0, 80)}` : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {job.status === "running" ? (
                  <Button variant="ghost" size="sm" onClick={() => copyPrompt(job)}>
                    Copy
                  </Button>
                ) : null}
                <Badge
                  variant={job.status === "completed" ? "success" : job.status === "failed" ? "error" : "warning"}
                  size="sm"
                >
                  {job.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
