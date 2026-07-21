"use client";

import { useEffect, useState } from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

/**
 * Last click-play draft hint only (primary board lives in morning loop / pulse).
 */
export function ClickPlayDraftHint() {
  const [last, setLast] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("hq-click-play:last");
      if (raw) setLast(JSON.parse(raw));
    } catch {
      setLast(null);
    }
  }, []);

  if (!last) return null;

  return (
    <Card padding="md" className="hq-click-play-hint">
      <div className="hq-card-header" style={{ marginBottom: 8 }}>
        <span className="hq-card-title">Session draft</span>
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
    </Card>
  );
}
