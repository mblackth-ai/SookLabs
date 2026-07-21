"use client";

import { useState } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { useOpsData } from "./useOpsData";
import { newId } from "@/lib/hq/ops-shared";

const PRODUCT_LABELS = {
  hq: "HQ",
  sookly: "Sookly",
  seos: "SEOS",
  personal: "Personal",
  general: "General",
};

const PRODUCT_BOARD = {
  hq: "/hq",
  sookly: "/hq/sookly/action-plan",
  seos: "/hq/seos/social-gtm",
  personal: "/hq/goals",
};

const PRODUCT_VARIANT = {
  hq: "accent",
  sookly: "success",
  seos: "warning",
  personal: "neutral",
  general: "outline",
};

export function GoalsPanel({ initialData, compact = false }) {
  const { data, save, saving, error } = useOpsData(initialData);
  const [title, setTitle] = useState("");
  const [product, setProduct] = useState("hq");
  const goals = data.goals || [];
  const active = goals.filter((g) => g.status === "active");

  async function addGoal(e) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const next = [
      ...goals,
      { id: newId("g"), title: t, horizon: "ongoing", status: "active", product, notes: "" },
    ];
    const ok = await save({ goals: next });
    if (ok) setTitle("");
  }

  async function setStatus(id, status) {
    await save({
      goals: goals.map((g) => (g.id === id ? { ...g, status } : g)),
    });
  }

  return (
    <Card padding="md">
      <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
        <div>
          <div className="hq-card-title">Master goals</div>
          {!compact && (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
              Long-horizon outcomes — persisted in HQ ops
            </div>
          )}
          {compact && (
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
              {active.length} active
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" href="/hq/goals">
          {compact ? "Manage →" : "Manage →"}
        </Button>
      </div>
      {error && (
        <p style={{ color: "var(--color-error)", fontSize: "var(--text-sm)" }}>{error}</p>
      )}
      {!compact && goals.length === 0 && (
        <div
          style={{
            marginBottom: 12,
            padding: "var(--space-4)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-accent, rgba(99,102,241,.35))",
            background: "var(--color-accent-muted, rgba(99,102,241,.06))",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div>
              <div className="hq-card-title" style={{ marginBottom: 6 }}>
                Set your first master goal
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
                One line is enough — what outcome matters this quarter across HQ, Sookly, or SEOS?
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                document.getElementById("goals-add-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
                document.querySelector("#goals-add-form input")?.focus();
              }}
            >
              Add goal below
            </Button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(compact ? active.slice(0, 4) : goals).map((g) => (
          <div
            key={g.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              padding: "10px 12px",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{g.title}</div>
                <Badge variant={PRODUCT_VARIANT[g.product] || "outline"} size="sm">
                  {PRODUCT_LABELS[g.product] || g.product || "General"}
                </Badge>
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
                {g.horizon || "ongoing"}
                {PRODUCT_BOARD[g.product] ? (
                  <>
                    {" · "}
                    <a
                      href={PRODUCT_BOARD[g.product]}
                      style={{ color: "var(--text-accent)", textDecoration: "none" }}
                    >
                      Open board →
                    </a>
                  </>
                ) : null}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
              <Badge variant={g.status === "active" ? "accent" : "outline"} size="sm">
                {g.status}
              </Badge>
              {!compact && g.status === "active" && (
                <Button variant="ghost" size="sm" disabled={saving} onClick={() => setStatus(g.id, "done")}>
                  Done
                </Button>
              )}
              {!compact && g.status === "done" && (
                <Button variant="ghost" size="sm" disabled={saving} onClick={() => setStatus(g.id, "active")}>
                  Reopen
                </Button>
              )}
            </div>
          </div>
        ))}
        {active.length === 0 && compact && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius-md)",
              border: "1px dashed var(--border-subtle)",
              background: "var(--bg-raised)",
            }}
          >
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>
              No active goals yet — anchor the quarter before diving into boards.
            </p>
            <Button variant="secondary" size="sm" href="/hq/goals">
              Add your first goal →
            </Button>
          </div>
        )}
        {active.length === 0 && !compact && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
            No active goals. Add one below.
          </p>
        )}
      </div>
      {!compact && (
        <form id="goals-add-form" onSubmit={addGoal} style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New goal…"
            style={{
              flex: 1,
              minWidth: 160,
              padding: "8px 10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
            }}
          />
          <select
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            aria-label="Goal product area"
            style={{
              padding: "8px 10px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-surface)",
              color: "var(--text-primary)",
            }}
          >
            <option value="hq">HQ</option>
            <option value="sookly">Sookly</option>
            <option value="seos">SEOS</option>
            <option value="personal">Personal</option>
            <option value="general">General</option>
          </select>
          <Button type="submit" size="sm" disabled={saving}>
            Add
          </Button>
        </form>
      )}
    </Card>
  );
}
