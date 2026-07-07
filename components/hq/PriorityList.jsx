"use client";

import { useState } from "react";
import { Card } from "./Card";
import { Button } from "./Button";
import { useOpsData } from "./useOpsData";
import { newId } from "@/lib/hq/ops-shared";

export function PriorityList({ initialData, compact = false }) {
  const { data, save, saving, error } = useOpsData(initialData);
  const [newTitle, setNewTitle] = useState("");

  async function toggle(id) {
    const todayPriorities = data.todayPriorities.map((p) =>
      p.id === id ? { ...p, done: !p.done } : p
    );
    await save({ todayPriorities });
  }

  async function addItem(e) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const todayPriorities = [
      ...data.todayPriorities,
      { id: newId("tp"), title, done: false, stream: "ops" },
    ];
    const ok = await save({ todayPriorities });
    if (ok) setNewTitle("");
  }

  const open = data.todayPriorities.filter((p) => !p.done);
  const done = data.todayPriorities.filter((p) => p.done);

  return (
    <Card accent={!compact} padding="md">
      <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
        <div>
          <div className="hq-card-title">Today&apos;s priorities</div>
          {!compact && (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
              Your live checklist — saved to HQ ops
            </div>
          )}
        </div>
        {!compact && (
          <Button variant="ghost" size="sm" href="/hq/briefing">
            Briefing notes →
          </Button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {open.map((p) => (
          <label
            key={p.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "8px 10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-surface)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={p.done}
              onChange={() => toggle(p.id)}
              disabled={saving}
              style={{ marginTop: 3, accentColor: "var(--accent)" }}
            />
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", lineHeight: 1.45 }}>{p.title}</span>
          </label>
        ))}
        {open.length === 0 && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>All priorities done for today.</p>
        )}
      </div>

      {done.length > 0 && (
        <div style={{ marginTop: 12, opacity: 0.65 }}>
          <div className="hq-section-label" style={{ marginBottom: 6 }}>
            Done
          </div>
          {done.map((p) => (
            <label
              key={p.id}
              style={{ display: "flex", gap: 10, alignItems: "center", fontSize: "var(--text-sm)", marginBottom: 4 }}
            >
              <input type="checkbox" checked onChange={() => toggle(p.id)} disabled={saving} />
              <span style={{ textDecoration: "line-through", color: "var(--text-tertiary)" }}>{p.title}</span>
            </label>
          ))}
        </div>
      )}

      <form onSubmit={addItem} style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add a priority…"
          style={{
            flex: 1,
            padding: "7px 10px",
            fontSize: "var(--text-sm)",
            background: "var(--bg-base)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-lg)",
            color: "var(--text-primary)",
          }}
        />
        <Button type="submit" variant="secondary" size="sm" loading={saving}>
          Add
        </Button>
      </form>
      {error && <p style={{ fontSize: 12, color: "var(--color-error)", marginTop: 8 }}>{error}</p>}
    </Card>
  );
}
