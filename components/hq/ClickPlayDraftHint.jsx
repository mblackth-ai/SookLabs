"use client";

import { useEffect, useState } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

/**
 * Shows last click-play draft from this browser session + primary board link.
 */
export function ClickPlayDraftHint({ primaryBoardHref }) {
  const [last, setLast] = useState(null);
  const boardHref = primaryBoardHref || "/hq/sookly/action-plan";

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("hq-click-play:last");
      if (raw) setLast(JSON.parse(raw));
    } catch {
      setLast(null);
    }
  }, []);

  return (
    <Card padding="md" className="hq-click-play-hint">
      <div className="hq-card-header" style={{ marginBottom: 8 }}>
        <span className="hq-card-title">Focus board</span>
        <Badge variant="outline" size="sm">
          Primary
        </Badge>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: last ? 12 : 0 }}>
        <Button variant="secondary" size="sm" href={boardHref}>
          Open primary board →
        </Button>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{boardHref}</span>
      </div>
      {last ? (
        <div
          style={{
            paddingTop: 12,
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Last click-play draft (this browser)</span>
            <Badge variant="accent" size="sm">
              Draft Export
            </Badge>
          </div>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: 4 }}>{last.title}</div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: "0 0 10px", lineHeight: 1.5 }}>
            {String(last.summary || "").slice(0, 140)}
            {String(last.summary || "").length > 140 ? "…" : ""}
          </p>
          {last.boardHref ? (
            <Button variant="ghost" size="sm" href={last.boardHref}>
              Resume playground →
            </Button>
          ) : null}
        </div>
      ) : (
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: "8px 0 0" }}>
          No session draft yet. Generate one on Social GTM, Community, RoastMyOpSec, or Sookly receptionist.
        </p>
      )}
    </Card>
  );
}
