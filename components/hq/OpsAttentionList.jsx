import Link from "next/link";
import { Card } from "./Card";
import { AttentionRow } from "./AttentionRow";
import { Badge } from "./Badge";

export function OpsAttentionList({ items }) {
  return (
    <Card padding="md">
      <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
        <span className="hq-card-title">Needs attention</span>
        <Badge variant="outline" size="sm">
          From ops
        </Badge>
      </div>
      {!items?.length ? (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
          No blocked or overdue items. Clear for now.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((item) => (
            <Link key={item.id} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
              <AttentionRow sev={item.sev} title={item.title} time={item.time} tag={item.tag} action={item.action} />
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
