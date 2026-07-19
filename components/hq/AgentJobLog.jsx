"use client";

import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AgentJobLog({ jobs = [], compact = false }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const recent = jobs.slice(0, compact ? 3 : 8);

  async function runMorning() {
    setLoading(true);
    try {
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
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card padding="md">
      <div className="hq-card-header">
        <span className="hq-card-title">Agent jobs</span>
        <div style={{ display: "flex", gap: 6 }}>
          {!recent.length && (
            <Button variant="ghost" size="sm" loading={loading} onClick={runMorning}>
              Run briefing
            </Button>
          )}
          <Button variant="ghost" size="sm" href="/hq/briefing">
            Briefing →
          </Button>
          <Button variant="ghost" size="sm" href="/hq/automation">
            Registry →
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
              <Badge
                variant={job.status === "completed" ? "success" : job.status === "failed" ? "error" : "warning"}
                size="sm"
              >
                {job.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
