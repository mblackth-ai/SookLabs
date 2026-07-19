"use client";

import { useState } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useOpsData } from "./useOpsData";
import { newId } from "@/lib/hq/ops-shared";

export function PriorityList({ initialData, compact = false }) {
  const { data, save, saving, error } = useOpsData(initialData);
  const [newTitle, setNewTitle] = useState("");

  const open = data.todayPriorities.filter((p) => !p.done);
  const done = data.todayPriorities.filter((p) => p.done);
  const atCap = open.length >= 3;

  async function toggle(id) {
    const todayPriorities = data.todayPriorities.map((p) =>
      p.id === id ? { ...p, done: !p.done } : p
    );
    await save({ todayPriorities });
  }

  async function remove(id) {
    await save({ todayPriorities: data.todayPriorities.filter((p) => p.id !== id) });
  }

  async function clearDone() {
    await save({ todayPriorities: data.todayPriorities.filter((p) => !p.done) });
  }

  async function addItem(e) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || atCap) return;
    const todayPriorities = [
      ...data.todayPriorities,
      { id: newId("tp"), title, done: false, stream: "ops" },
    ];
    const ok = await save({ todayPriorities });
    if (ok) setNewTitle("");
  }

  return (
    <Card accent={!compact} padding="md" id="priorities">
      <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
        <div>
          <div className="hq-card-title">Today&apos;s priorities</div>
          {!compact && (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
              Aim for 3 — {open.length}/3 open · saved to HQ ops
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Badge variant={atCap ? "warning" : "outline"} size="sm">
            {open.length} open
          </Badge>
          {done.length > 0 && (
            <Button variant="ghost" size="sm" disabled={saving} onClick={clearDone}>
              Clear done
            </Button>
          )}
          {!compact && (
            <Button variant="ghost" size="sm" href="/hq/briefing">
              Briefing →
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {open.map((p) => (
          <div
            key={p.id}
            className="hq-priority-row"
          >
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, cursor: "pointer", minWidth: 0 }}>
              <input
                type="checkbox"
                checked={p.done}
                onChange={() => toggle(p.id)}
                disabled={saving}
                style={{ marginTop: 3, accentColor: "var(--accent)" }}
              />
              <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)", lineHeight: 1.45 }}>{p.title}</span>
            </label>
            <button
              type="button"
              className="hq-priority-remove"
              disabled={saving}
              onClick={() => remove(p.id)}
              aria-label="Remove priority"
            >
              ×
            </button>
          </div>
        ))}
        {open.length === 0 && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
            No open priorities — add up to 3 for today.
          </p>
        )}
      </div>

      {done.length > 0 && (
        <div style={{ marginTop: 12, opacity: 0.7 }}>
          <div className="hq-section-label" style={{ marginBottom: 6 }}>
            Done ({done.length})
          </div>
          {done.map((p) => (
            <div key={p.id} className="hq-priority-row hq-priority-row--done">
              <label style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, cursor: "pointer", minWidth: 0 }}>
                <input type="checkbox" checked onChange={() => toggle(p.id)} disabled={saving} />
                <span style={{ textDecoration: "line-through", color: "var(--text-tertiary)", fontSize: "var(--text-sm)" }}>
                  {p.title}
                </span>
              </label>
              <button
                type="button"
                className="hq-priority-remove"
                disabled={saving}
                onClick={() => remove(p.id)}
                aria-label="Remove priority"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addItem} style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={atCap ? "Clear or finish one before adding…" : "Add a priority…"}
          disabled={atCap || saving}
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
        <Button type="submit" variant="secondary" size="sm" loading={saving} disabled={atCap}>
          Add
        </Button>
      </form>
      {error && <p style={{ fontSize: 12, color: "var(--color-error)", marginTop: 8 }}>{error}</p>}
    </Card>
  );
}
