import { Card } from "./Card";
import { StatusDot } from "./StatusDot";

export function MetricCard({ label, value, delta, pos, ai, neutral, sub }) {
  const deltaColor = ai
    ? "var(--text-accent)"
    : neutral
    ? "var(--text-tertiary)"
    : pos
    ? "var(--color-success)"
    : "var(--color-error)";

  return (
    <Card padding="md" style={{ flex: 1 }}>
      <div className="hq-section-label" style={{ marginBottom: "var(--space-2-5)" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: "var(--text-3xl)",
          fontWeight: "var(--weight-semibold)",
          letterSpacing: "var(--tracking-tight)",
          color: "var(--text-primary)",
          lineHeight: "var(--leading-tight)",
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: "var(--space-2)", display: "flex", alignItems: "center", gap: "var(--space-1-5)" }}>
        {ai && <StatusDot status="ai" pulse />}
        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: deltaColor }}>{delta}</span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{sub}</span>
      </div>
    </Card>
  );
}
