"use client";

import { Card } from "./Card";
import { Badge } from "./Badge";
import Link from "next/link";

const STATUS_LABELS = {
  todo: "To do",
  doing: "In progress",
  blocked: "Blocked",
  done: "Done",
};

export function TopOpenItems({ items }) {
  if (!items?.length) return null;

  return (
    <Card padding="md">
      <div className="hq-card-header">
        <span className="hq-card-title">Top open items</span>
        <ButtonLink href="/hq/sookly/action-plan">Action plan →</ButtonLink>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              paddingBottom: 10,
              borderBottom: "1px solid var(--border-faint)",
            }}
          >
            <div>
              <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--text-primary)" }}>{item.title}</div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 4 }}>
                {item.streamLabel} · {item.owner}
                {item.due ? ` · due ${item.due}` : ""}
              </div>
            </div>
            <Badge variant={item.priority === "P0" ? "error" : item.priority === "P1" ? "warning" : "neutral"} size="sm">
              {item.priority}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ButtonLink({ href, children }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: "var(--text-sm)",
        color: "var(--text-accent)",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}
