import Link from "next/link";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { FOUR_FRONTS, getFourFrontsOverall } from "@/lib/hq/four-fronts";

function badgeVariant(progress) {
  if (progress >= 75) return "success";
  if (progress >= 50) return "accent";
  if (progress >= 25) return "warning";
  return "outline";
}

export function FourFrontsSummary() {
  const overall = getFourFrontsOverall();

  return (
    <Card padding="md" className="hq-mb-4">
      <div className="hq-flex-between hq-mb-3">
        <div>
          <div className="hq-card-title">Four Fronts</div>
          <div className="hq-text-sm-secondary">Concept → implementation → acceptance → human approval</div>
        </div>
        <Badge variant="accent" size="sm">{overall}% overall</Badge>
      </div>

      <div className="hq-grid-4" style={{ gap: "var(--space-2-5)" }}>
        {FOUR_FRONTS.map((front) => (
          <Link key={front.id} href="/hq/engineering/four-fronts" className="hq-tile-link">
            <div style={{ padding: 12, border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              <div className="hq-flex-between hq-mb-2">
                <strong style={{ fontSize: "var(--text-sm)" }}>{front.name}</strong>
                <Badge variant={badgeVariant(front.progress)} size="sm">{front.progress}%</Badge>
              </div>
              <div style={{ height: 6, borderRadius: 999, background: "var(--bg-tertiary)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${front.progress}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "var(--text-accent)",
                  }}
                />
              </div>
              <div className="hq-text-xs-muted hq-mt-2">{front.phase}</div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
