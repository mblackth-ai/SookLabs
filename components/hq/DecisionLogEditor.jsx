"use client";

import { useState } from "react";
import { useOpsData } from "./useOpsData";
import { Card } from "./Card";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { newId } from "@/lib/hq/ops-shared";

export function DecisionLogEditor({ initialData }) {
  const { data, save, saving, error } = useOpsData(initialData);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <Card padding="md">
        <div className="hq-card-title" style={{ marginBottom: "var(--space-4)" }}>
          Log a decision
        </div>
        <form onSubmit={addDecision} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Decision title"
            style={inputStyle}
          />
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
        {data.decisions.map((entry) => (
          <Card key={entry.id} padding="md">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
              <div className="hq-card-title">{entry.title}</div>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", flexShrink: 0 }}>{entry.date}</span>
            </div>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 10px" }}>
              {entry.body}
            </p>
            {entry.tags?.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="neutral" size="sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        ))}
        {data.decisions.length === 0 && (
          <p style={{ color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>No decisions logged yet.</p>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  fontSize: "var(--text-sm)",
  background: "var(--bg-base)",
  border: "1px solid var(--border-default)",
  borderRadius: "var(--radius-lg)",
  color: "var(--text-primary)",
};
