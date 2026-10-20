import { Badge } from "./Badge";
import { Card } from "./Card";

/** Daily Briefing: failed / blocked posts and gaps from SEOS. Read-only; fixes happen in SEOS. */
export function ContentActionItems({ items, error }) {
  return (
    <Card padding="md">
      <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
        <div>
          <div className="hq-card-title">Content & Social: action items</div>
          <p className="hq-briefing-ask-hint">Failed or blocked posts and gap days from SEOS. Fix them in SEOS; this list clears itself.</p>
        </div>
        <a href="/hq/content" style={{ fontSize: "var(--text-xs)", color: "var(--text-accent)" }}>Content & Social →</a>
      </div>
      {error ? <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>SEOS not reachable: {error}</p> : null}
      {!error && items.length === 0 ? <p style={{ fontSize: "var(--text-xs)", color: "var(--color-success)" }}>No failed or blocked posts, no gap days.</p> : null}
      <div style={{ display: "grid", gap: 6 }}>
        {items.map((i) => (
          <a key={i.id} href={i.href} target="_blank" rel="noreferrer" style={{ display: "flex", gap: 8, alignItems: "flex-start", textDecoration: "none", padding: "6px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <Badge variant={i.severity} size="sm">{i.business}</Badge>
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-primary)" }}>
              {i.title}
              {i.when ? <span style={{ color: "var(--text-tertiary)" }}> · {i.when}</span> : null}
              <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{i.detail}</span>
            </span>
          </a>
        ))}
      </div>
    </Card>
  );
}
