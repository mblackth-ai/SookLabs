import { Card } from "./Card";
import { Avatar } from "./Avatar";
import { StatusDot } from "./StatusDot";
import { Button } from "./Button";

export function AgentCard({ name, role, status, last }) {
  const running = status === "running";
  return (
    <Card padding="md" interactive style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Avatar name={name} isAI size="md" />
        <StatusDot status={running ? "ai" : "neutral"} pulse={running} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.015em", marginBottom: 3 }}>
          {name}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", lineHeight: 1.45 }}>{role}</div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: 4,
          borderTop: "1px solid var(--border-faint)",
        }}
      >
        <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Last run · {last}</div>
        <Button variant={running ? "accent" : "secondary"} size="sm">
          {running ? "View output" : "Brief me"}
        </Button>
      </div>
    </Card>
  );
}
