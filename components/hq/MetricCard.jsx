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
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: "var(--text-tertiary)",
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--text-primary)", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
        {ai && <StatusDot status="ai" pulse />}
        <span style={{ fontSize: 12, fontWeight: 500, color: deltaColor }}>{delta}</span>
        <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{sub}</span>
      </div>
    </Card>
  );
}
