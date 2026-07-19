"use client";

import { useState } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useOpsData } from "./useOpsData";
import { getMergedBlockers, newId } from "@/lib/hq/ops-shared";

export function BlockersPanel({ initialData }) {
  const { data, save, saving, error } = useOpsData(initialData);
  const [title, setTitle] = useState("");
  const blockers = getMergedBlockers(data);

  async function addBlocker(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const next = [...(data.blockers || []), { id: newId("bl"), title: t, status: "open", detail: "" }];
    const ok = await save({ blockers: next });
    if (ok) setTitle("");
  }

  async function resolve(id) {
    if (String(id).startsWith("ws-")) return;
    await save({
      blockers: (data.blockers || []).map((b) => (b.id === id ? { ...b, status: "resolved" } : b)),
    });
  }

  async function logDecisionAndResolve(blocker) {
    if (String(blocker.id).startsWith("ws-")) return;
    const decisions = [
      {
        id: newId("dec"),
        date: new Date().toISOString().slice(0, 10),
        title: `Unblocked: ${blocker.title}`,
        body: blocker.detail || "Resolved from blockers panel.",
        tags: ["blocker"],
      },
      ...(data.decisions || []),
    ];
    await save({
      decisions,
      blockers: (data.blockers || []).map((b) => (b.id === blocker.id ? { ...b, status: "resolved" } : b)),
    });
  }

  return (
    <Card padding="md">
      <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
        <div>
          <div className="hq-card-title">Blockers</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
            Freeform + items marked blocked on boards
          </div>
        </div>
        <Badge variant={blockers.length ? "error" : "outline"} size="sm">
          {blockers.length} open
        </Badge>
      </div>
      {error && <p style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>{error}</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {blockers.map((b) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              padding: "8px 10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid rgba(239,68,68,.2)",
              background: "var(--color-error-muted, rgba(239,68,68,.06))",
            }}
          >
            <div>
              <div style={{ fontSize: "var(--text-sm)" }}>{b.title}</div>
              {b.detail && (
                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 2 }}>{b.detail}</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {b.href && (
                <Button variant="ghost" size="sm" href={b.href}>
                  Board
                </Button>
              )}
              {!String(b.id).startsWith("ws-") && (
                <>
                  <Button variant="ghost" size="sm" disabled={saving} onClick={() => logDecisionAndResolve(b)}>
                    Log & resolve
                  </Button>
                  <Button variant="ghost" size="sm" disabled={saving} onClick={() => resolve(b.id)}>
                    Resolve
                  </Button>
                </>
              )}
              {String(b.id).startsWith("ws-") && b.href && (
                <Button variant="ghost" size="sm" href={b.href}>
                  Unblock on board
                </Button>
              )}
            </div>
          </div>
        ))}
        {blockers.length === 0 && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>No open blockers.</p>
        )}
      </div>
      <form onSubmit={addBlocker} style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add blocker…"
          style={{
            flex: 1,
            padding: "8px 10px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
          }}
        />
        <Button type="submit" size="sm" disabled={saving}>
          Add
        </Button>
      </form>
    </Card>
  );
}
