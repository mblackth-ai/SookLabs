"use client";

import { useEffect, useState } from "react";
import { useOpsData } from "./useOpsData";
import { Card } from "./Card";
import { Button } from "./Button";
import { PriorityList } from "./PriorityList";
import { AgentJobLog } from "./AgentJobLog";

const SECTIONS = [
  { key: "priorities", label: "Priorities focus" },
  { key: "risks", label: "Risks & blockers" },
  { key: "decisions", label: "Decisions to make" },
];

const SECTION_TEMPLATES = {
  priorities: `Today (max 3):
- 
- 

This week:
- 

Delegated / waiting on:
- `,
  risks: `Blockers:
- 

Dependencies:
- 

Watch (no action yet):
- `,
  decisions: `Decide today:
- 

Decide this week:
- 

Parked (needs more info):
- `,
};

export function BriefingNotesEditor({ initialData }) {
  const { data, save, saving, error } = useOpsData(initialData);
  const sections = data.briefingNotes?.sections || {};
  const [drafts, setDrafts] = useState({
    priorities: sections.priorities || "",
    risks: sections.risks || "",
    decisions: sections.decisions || "",
  });

  useEffect(() => {
    setDrafts({
      priorities: data.briefingNotes?.sections?.priorities || "",
      risks: data.briefingNotes?.sections?.risks || "",
      decisions: data.briefingNotes?.sections?.decisions || "",
    });
  }, [data.updatedAt, data.briefingNotes?.lastGeneratedAt]);

  async function updateSection(key, value) {
    setDrafts((d) => ({ ...d, [key]: value }));
    await save({
      briefingNotes: {
        ...data.briefingNotes,
        date: new Date().toISOString().slice(0, 10),
        lastGeneratedAt: data.briefingNotes?.lastGeneratedAt,
        sections: { ...(data.briefingNotes?.sections || {}), [key]: value },
      },
    });
  }

  async function insertTemplate(key) {
    const template = SECTION_TEMPLATES[key];
    const current = drafts[key] || "";
    const next = current.trim() ? `${current.trim()}\n\n${template}` : template;
    setDrafts((d) => ({ ...d, [key]: next }));
    await updateSection(key, next);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <PriorityList initialData={data} compact />

      {data.briefingNotes?.lastGeneratedAt && (
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: 0 }}>
          Last agent write: {new Date(data.briefingNotes.lastGeneratedAt).toLocaleString()}
        </p>
      )}

      <div className="hq-grid-2">
        {SECTIONS.map(({ key, label }) => (
          <Card key={key} padding="md">
            <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
              <div className="hq-card-title">{label}</div>
              <Button variant="ghost" size="sm" disabled={saving} onClick={() => insertTemplate(key)}>
                Insert template
              </Button>
            </div>
            <textarea
              value={drafts[key] || ""}
              onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
              onBlur={(e) => {
                if (e.target.value !== (sections[key] || "")) {
                  updateSection(key, e.target.value);
                }
              }}
              rows={5}
              placeholder={`Notes for ${label.toLowerCase()}…`}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "var(--text-sm)",
                background: "var(--bg-base)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-lg)",
                color: "var(--text-primary)",
                resize: "vertical",
                lineHeight: 1.5,
              }}
            />
          </Card>
        ))}
      </div>

      <AgentJobLog jobs={data.agentJobs} />

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Button variant="ghost" size="sm" href="/hq/decision-log">
          Open decision log →
        </Button>
        {saving && <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Saving…</span>}
        {error && <span style={{ fontSize: "var(--text-xs)", color: "var(--color-error)" }}>{error}</span>}
      </div>
    </div>
  );
}
