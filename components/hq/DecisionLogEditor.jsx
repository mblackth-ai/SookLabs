"use client";

import { useState } from "react";
import { useOpsData } from "./useOpsData";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { newId } from "@/lib/hq/ops-shared";

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  fontSize: "var(--text-sm)",
  background: "var(--bg-base)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-lg)",
  color: "var(--text-primary)",
};

export function DecisionLogEditor({ initialData }) {
  const { data, save, saving, error } = useOpsData(initialData);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [todayOnly, setTodayOnly] = useState(false);

  async function addDecision(e) {
    e.preventDefault();
    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;
    const decisions = [
      {
        id: newId("dec"),
        date: new Date().toISOString().slice(0, 10),
        title: t,
        body: b,
        tags: tags
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      },
      ...data.decisions,
    ];
    const ok = await save({ decisions });
    if (ok) {
      setTitle("");
      setBody("");
      setTags("");
    }
  }

  function startEdit(entry) {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditBody(entry.body);
  }

  async function saveEdit(id) {
    const decisions = data.decisions.map((d) =>
      d.id === id ? { ...d, title: editTitle.trim() || d.title, body: editBody.trim() || d.body } : d
    );
    const ok = await save({ decisions });
    if (ok) setEditingId(null);
  }

  async function remove(id) {
    await save({ decisions: data.decisions.filter((d) => d.id !== id) });
  }

  const today = new Date().toISOString().slice(0, 10);
  const decidedToday = (data.decisions || []).some((d) => String(d.date || "").startsWith(today));
  const todayDecisions = (data.decisions || []).filter((d) => String(d.date || "").startsWith(today));
  const visibleDecisions = todayOnly ? todayDecisions : data.decisions || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      {!decidedToday && (
        <Card
          padding="md"
          style={{
            border: "1px solid var(--border-accent, rgba(99,102,241,.35))",
            background: "var(--color-accent-muted, rgba(99,102,241,.06))",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <div className="hq-card-title" style={{ marginBottom: 6 }}>
                Nothing logged today yet
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
                One sentence is enough — what did you choose, defer, or kill? Future-you will thank present-you.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setTitle("Today: ");
                document.getElementById("decision-log-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
                document.querySelector("#decision-log-form input")?.focus();
              }}
            >
              Log today&apos;s decision
            </Button>
          </div>
        </Card>
      )}

      <Card padding="md" id="decision-log-form">
        <div className="hq-card-title" style={{ marginBottom: "var(--space-4)" }}>
          Log a decision
        </div>
        <form onSubmit={addDecision} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Decision title" style={inputStyle} />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What was decided and why?"
            rows={4}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma-separated)"
            style={inputStyle}
          />
          <div>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              Add decision
            </Button>
          </div>
        </form>
        {error && <p style={{ color: "var(--color-error)", fontSize: 12, marginTop: 8 }}>{error}</p>}
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: 0 }}>
            {decidedToday
              ? `${todayDecisions.length} logged today${todayOnly ? "" : " · scroll for history"}`
              : `${(data.decisions || []).length} total · none today yet`}
          </p>
          {(data.decisions || []).length > 0 && (
            <Button variant={todayOnly ? "accent" : "ghost"} size="sm" onClick={() => setTodayOnly((v) => !v)}>
              {todayOnly ? "Show all" : "Today only"}
            </Button>
          )}
        </div>
        {visibleDecisions.map((entry) => (
          <Card key={entry.id} padding="md">
            {editingId === entry.id ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={inputStyle} />
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <Button size="sm" disabled={saving} onClick={() => saveEdit(entry.id)}>
                    Save
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                  <div className="hq-card-title">{entry.title}</div>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", flexShrink: 0 }}>{entry.date}</span>
                </div>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 10px" }}>
                  {entry.body}
                </p>
                {entry.tags?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="neutral" size="sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6 }}>
                  <Button variant="ghost" size="sm" onClick={() => startEdit(entry)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" disabled={saving} onClick={() => remove(entry.id)}>
                    Delete
                  </Button>
                </div>
              </>
            )}
          </Card>
        ))}
        {visibleDecisions.length === 0 && (
          <p style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
            {todayOnly ? "No decisions logged today — use the form above." : "No decisions logged yet."}
          </p>
        )}
      </div>
    </div>
  );
}
