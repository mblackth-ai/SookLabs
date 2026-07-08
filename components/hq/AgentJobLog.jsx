"use client";

import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AgentJobLog({ jobs = [] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const recent = jobs.slice(0, 5);

  async function runMorning() {
    setLoading(true);
    try {
      await fetch("/hq/api/briefing/ask", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!recent.length) {
    return (
      <Card padding="md">
        <div className="hq-card-header">
          <span className="hq-card-title">Agent jobs</span>
          <Button variant="ghost" size="sm" loading={loading} onClick={runMorning}>
            Run briefing agent
          </Button>
        </div>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
          No agent runs yet. Morning cron or Ask AI will log jobs here.
        </p>
      </Card>
    );
  }

  return (
    <Card padding="md">
      <div className="hq-card-header">
        <span className="hq-card-title">Agent jobs</span>
        <Button variant="ghost" size="sm" href="/hq/briefing">
          Briefing →
        </Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {recent.map((job) => (
          <div key={job.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{job.type}</div>
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
    </Card>
  );
}
