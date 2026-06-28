import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";

function Stat({ label, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "var(--text-tertiary)",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export function ProductCard({ name, tagline, status, mrr, mrrDelta, users, desc, eta, phase }) {
  const live = status === "live";
  return (
    <Card padding="lg" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-primary)", marginBottom: 4 }}>
            {name}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-tertiary)", lineHeight: 1.4, maxWidth: 280 }}>{tagline}</div>
        </div>
        <Badge variant={live ? "success" : "neutral"} dot={live}>
          {live ? "LIVE" : "PLANNED"}
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
      <Button variant={live ? "secondary" : "ghost"} size="sm" style={{ alignSelf: "flex-start" }}>
        {live ? "Open product →" : "View roadmap →"}
      </Button>
    </Card>
  );
}
