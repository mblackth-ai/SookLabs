"use client";

import { useEffect, useRef, useState } from "react";
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
-`,
  risks: `Blockers:
-

Dependencies:
-

Watch (no action yet):
-`,
  decisions: `Decide today:
-

Decide this week:
-

Parked (needs more info):
-`,
};

export function BriefingNotesEditor({ initialData }) {
  const { data, save, saving, error } = useOpsData(initialData);
  const sections = data.briefingNotes?.sections || {};
  const [drafts, setDrafts] = useState({
    priorities: sections.priorities || "",
    risks: sections.risks || "",
    decisions: sections.decisions || "",
  });
  const [savedSection, setSavedSection] = useState(null);
  const savedTimer = useRef(null);

  useEffect(() => {
    setDrafts({
      priorities: data.briefingNotes?.sections?.priorities || "",
      risks: data.briefingNotes?.sections?.risks || "",
      decisions: data.briefingNotes?.sections?.decisions || "",
    });
  }, [data.updatedAt, data.briefingNotes?.lastGeneratedAt]);

  useEffect(
    () => () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    },
    []
  );

  function flashSectionSaved(key) {
    setSavedSection(key);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSavedSection(null), 2000);
  }

  async function updateSection(key, value) {
    setDrafts((d) => ({ ...d, [key]: value }));
    const ok = await save({
      briefingNotes: {
        ...data.briefingNotes,
        date: new Date().toISOString().slice(0, 10),
        lastGeneratedAt: data.briefingNotes?.lastGeneratedAt,
        sections: { ...(data.briefingNotes?.sections || {}), [key]: value },
      },
    });
    if (ok) flashSectionSaved(key);
  }

  async function insertTemplate(key) {
    const template = SECTION_TEMPLATES[key];
    const current = drafts[key] || "";
    const next = current.trim() ? `${current.trim()}\n\n${template}` : template;
    setDrafts((d) => ({ ...d, [key]: next }));
    await updateSection(key, next);
  }

  return (
    <div className="hq-briefing-notes">
      <PriorityList initialData={data} compact />

      {data.briefingNotes?.lastGeneratedAt && (
        <p className="hq-briefing-agent-write">
          Last agent write: {new Date(data.briefingNotes.lastGeneratedAt).toLocaleString()}
        </p>
      )}

      <div className="hq-briefing-sections">
        {SECTIONS.map(({ key, label }) => (
          <Card key={key} padding="md" className="hq-briefing-section">
            <div className="hq-card-header hq-briefing-section-header">
              <div className="hq-briefing-section-title-row">
                <div className="hq-card-title">{label}</div>
                {savedSection === key ? (
                  <span className="hq-section-saved" role="status" aria-live="polite">
                    Saved
                  </span>
                ) : null}
              </div>
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
              rows={8}
              placeholder={`Notes for ${label.toLowerCase()}…`}
              className="hq-briefing-textarea"
            />
          </Card>
        ))}
      </div>

      <AgentJobLog jobs={data.agentJobs} />

      <div className="hq-briefing-footer">
        <Button variant="ghost" size="sm" href="/hq/decision-log">
          Open decision log →
        </Button>
        {error ? <span className="hq-ask-ai-error">{error}</span> : null}
      </div>
    </div>
  );
}
