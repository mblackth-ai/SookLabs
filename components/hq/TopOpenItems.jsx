"use client";

import { Card } from "./Card";
import { Badge } from "./Badge";
import Link from "next/link";

export function TopOpenItems({ items, href = "/hq/sookly/action-plan", linkLabel = "All boards →" }) {
  return (
    <Card padding="md">
      <div className="hq-card-header">
        <span className="hq-card-title">Top open P0–P2</span>
        <ButtonLink href={href}>{linkLabel}</ButtonLink>
      </div>
      {!items?.length ? (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: "8px 0 0" }}>
          No open board items.{" "}
          <Link href={href} style={{ color: "var(--text-accent)", textDecoration: "none" }}>
            Open portfolio →
          </Link>
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.boardHref || href}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
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
                    {item.status === "blocked" ? " · blocked" : ""}
                  </div>
                </div>
                <Badge variant={item.priority === "P0" ? "error" : item.priority === "P1" ? "warning" : "neutral"} size="sm">
                  {item.priority}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
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
