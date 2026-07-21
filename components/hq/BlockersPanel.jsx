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
      <div className="hq-card-header hq-mb-3">
        <div>
          <div className="hq-card-title">Blockers</div>
          <div className="hq-text-xs-muted" style={{ marginTop: 4 }}>
            Freeform + items marked blocked on boards
          </div>
        </div>
        <Badge variant={blockers.length ? "error" : "outline"} size="sm">
          {blockers.length} open
        </Badge>
      </div>
      {error && <p style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>{error}</p>}
      <div className="hq-blocker-list">
        {blockers.map((b) => {
          const isWorkstream = String(b.id).startsWith("ws-");
          return (
            <div key={b.id} className="hq-blocker-row">
              <div className="hq-blocker-body">
                <div className="hq-blocker-title">{b.title}</div>
                {b.detail ? <div className="hq-blocker-detail">{b.detail}</div> : null}
              </div>
              <div className="hq-blocker-actions">
                <div className="hq-blocker-actions-primary">
                  {b.href ? (
                    <Button variant="secondary" size="sm" href={b.href}>
                      {b.sourceItemId || isWorkstream ? "Open item →" : "Board"}
                    </Button>
                  ) : null}
                  {!isWorkstream ? (
                    <Button variant="accent" size="sm" disabled={saving} onClick={() => logDecisionAndResolve(b)}>
                      Log & resolve
                    </Button>
                  ) : null}
                </div>
                {!isWorkstream ? (
                  <div className="hq-blocker-actions-secondary">
                    <Button variant="ghost" size="sm" disabled={saving} onClick={() => resolve(b.id)}>
                      Resolve
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
        {blockers.length === 0 && <p className="hq-text-sm-secondary" style={{ margin: 0 }}>No open blockers.</p>}
      </div>
      <form onSubmit={addBlocker} className="hq-blocker-add">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add blocker…"
          className="hq-blocker-input"
        />
        <Button type="submit" size="sm" disabled={saving}>
          Add
        </Button>
      </form>
    </Card>
  );
}
