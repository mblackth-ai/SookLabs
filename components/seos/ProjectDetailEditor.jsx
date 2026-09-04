"use client";

import { useState } from "react";
import { Card } from "@/components/hq/Card";
import { seosPath } from "@/lib/seos/paths";
import { ConnectionRow } from "./ConnectionRow";
import { WorkflowRow } from "./WorkflowRow";

export function ProjectDetailEditor({ project: initialProject }) {
  const [project, setProject] = useState(initialProject);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("connections");

  async function savePatch(patch) {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(seosPath("/api/command-center"), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: [patch] }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Save failed");
      const updated = payload.data.projects.find((p) => p.id === project.id);
      if (updated) setProject(updated);
      setMessage("Saved");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function updateWorkflow(workflowId, field, value) {
    const workflows = project.workflows.map((wf) => {
      if (wf.id !== workflowId) return wf;
      if (field.startsWith("editable.")) {
        const key = field.replace("editable.", "");
        return { ...wf, editable: { ...wf.editable, [key]: value } };
      }
      return { ...wf, [field]: value };
    });
    const next = { ...project, workflows };
    setProject(next);
    return next;
  }

  function updateConnection(connectionId, field, value) {
    const connections = project.connections.map((c) =>
      c.id === connectionId ? { ...c, [field]: value } : c,
    );
    const next = { ...project, connections };
    setProject(next);
    return next;
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["connections", "workflows"].map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className="hq-navlink"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${tab === key ? "var(--border-accent)" : "var(--border-faint)"}`,
              background: tab === key ? "var(--accent-muted)" : "transparent",
              color: tab === key ? "var(--text-accent)" : "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {key === "connections" ? "Connections" : "Workflows / agents"}
          </button>
        ))}
        {message ? (
          <span style={{ alignSelf: "center", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
            {saving ? "Saving…" : message}
          </span>
        ) : null}
      </div>

      {tab === "connections" ? (
        <div style={{ display: "grid", gap: 12 }}>
          {project.connections.map((conn) => (
            <Card key={conn.id} padding="md">
              <ConnectionRow
                connection={conn}
                onBlurSave={(field, value) => {
                  const next = updateConnection(conn.id, field, value);
                  savePatch({ id: project.id, connections: next.connections });
                }}
              />
            </Card>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {project.workflows.map((wf) => (
            <Card key={wf.id} padding="md">
              <WorkflowRow
                workflow={wf}
                onBlurSave={(field, value) => {
                  const next = updateWorkflow(wf.id, field, value);
                  savePatch({ id: project.id, workflows: next.workflows });
                }}
              />
            </Card>
          ))}
        </div>
      )}

      <Card padding="md" style={{ marginTop: 16 }}>
        <label className="hq-login-label" htmlFor="project-notes">
          Project operator notes
        </label>
        <textarea
          id="project-notes"
          className="hq-login-input"
          rows={3}
          defaultValue={project.operatorNotes || ""}
          onBlur={(e) => savePatch({ id: project.id, operatorNotes: e.target.value })}
          style={{ width: "100%", marginTop: 8, resize: "vertical" }}
        />
      </Card>
    </div>
  );
}
