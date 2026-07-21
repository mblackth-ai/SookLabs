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
      <div className="hq-card-header hq-priority-header" style={{ marginBottom: "var(--space-3)" }}>
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

      <div className="hq-priority-list">
        {open.map((p) => (
          <div
            key={p.id}
            className="hq-priority-row"
          >
            <label className="hq-priority-label">
              <input
                type="checkbox"
                checked={p.done}
                onChange={() => toggle(p.id)}
                disabled={saving}
                className="hq-priority-check"
              />
              <span className="hq-priority-title">
                {p.title}
                {p.boardHref ? (
                  <>
                    {" "}
                    <a
                      href={p.boardHref}
                      onClick={(e) => e.stopPropagation()}
                      className="hq-priority-board-link"
                    >
                      Board →
                    </a>
                  </>
                ) : null}
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
        {open.length === 0 && (
          <div className="hq-priority-empty">
            <p>No open priorities — pick up to 3 for today.</p>
            <div className="hq-priority-empty-actions">
              <Button
                variant="secondary"
                size="sm"
                disabled={saving}
                onClick={() => {
                  document.getElementById("priorities-add-form")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                  document.querySelector("#priorities-add-form input")?.focus();
                }}
              >
                Add below
              </Button>
              <Button variant="ghost" size="sm" href={data.primaryBoardHref || "/hq/sookly/action-plan"}>
                Open board →
              </Button>
            </div>
          </div>
        )}
      </div>

      {done.length > 0 && (
        <div className="hq-priority-done-block">
          <div className="hq-section-label hq-priority-done-label">
            Done ({done.length})
          </div>
          {done.map((p) => (
            <div key={p.id} className="hq-priority-row hq-priority-row--done">
              <label className="hq-priority-label">
                <input type="checkbox" checked onChange={() => toggle(p.id)} disabled={saving} className="hq-priority-check" />
                <span className="hq-priority-title hq-priority-title--done">{p.title}</span>
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

      <form id="priorities-add-form" onSubmit={addItem} className="hq-priority-add-form">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder={atCap ? "Clear or finish one before adding…" : "Add a priority…"}
          disabled={atCap || saving}
          className="hq-priority-add-input"
        />
        <Button type="submit" variant="secondary" size="sm" loading={saving} disabled={atCap}>
          Add
        </Button>
      </form>
      {error && <p style={{ fontSize: 12, color: "var(--color-error)", marginTop: 8 }}>{error}</p>}
    </Card>
  );
}
