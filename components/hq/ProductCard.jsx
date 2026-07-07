import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

function Stat({ label, children }) {
  return (
    <div>
      <div className="hq-section-label" style={{ marginBottom: "var(--space-1)" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export function ProductCard({ name, tagline, status, mrr, mrrDelta, users, desc, eta, phase, href }) {
  const live = status === "live";
  const inProgress = status === "in progress";
  const badgeVariant = live ? "success" : inProgress ? "warning" : "neutral";
  const badgeLabel = live ? "LIVE" : inProgress ? "IN PROGRESS" : "PLANNED";

  return (
    <Card padding="lg" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 4 }}>
            {name}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.4, maxWidth: 280 }}>{tagline}</div>
        </div>
        <Badge variant={badgeVariant} dot={live}>
          {badgeLabel}
        </Badge>
      </div>
      <p
        style={{
          fontSize: 13,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          borderTop: "1px solid var(--border-faint)",
          paddingTop: 16,
        }}
      >
        {desc}
      </p>
      {live ? (
        <div style={{ display: "flex", gap: 24 }}>
          <Stat label="MRR">
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>
              {mrr} <span style={{ fontSize: 13, color: "var(--color-success)", fontWeight: 500 }}>{mrrDelta}</span>
            </div>
          </Stat>
          <Stat label="Customers">
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em" }}>{users}</div>
          </Stat>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 24 }}>
          <Stat label="Target">
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>{eta}</div>
          </Stat>
          <Stat label="Phase">
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text-secondary)" }}>{phase}</div>
          </Stat>
        </div>
      )}
      <Button
        variant={live ? "secondary" : "ghost"}
        size="sm"
        href={href}
        style={{ alignSelf: "flex-start" }}
      >
        {live ? "Open product →" : "View roadmap →"}
      </Button>
    </Card>
  );
}
