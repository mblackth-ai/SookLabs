import Link from "next/link";
import { Card } from "./Card";
import { Badge } from "./Badge";

const STAGE_VARIANT = {
  discover: "neutral",
  prototype: "warning",
  mvp1: "accent",
  beta: "success",
  gtm: "success",
};

export function PortfolioStrip({ products }) {
  if (!products?.length) return null;

  return (
    <div className="hq-grid-4 hq-mb-4">
      {products.map((p) => (
        <Link key={p.id} href={p.href} className="hq-tile-link">
          <Card padding="md" className="hq-card--tile">
            <div className="hq-flex-between hq-mb-2">
              <div className="hq-card-title" style={{ fontSize: "var(--text-sm)" }}>
                {p.name}
              </div>
              <Badge variant={STAGE_VARIANT[p.stage] || "neutral"} size="sm">
                {p.stageLabel}
              </Badge>
            </div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: 600, color: "var(--text-accent)" }}>{p.pct}%</div>
            <div className="hq-text-xs-muted hq-mt-1">
              {p.open} open
              {p.blocked ? ` · ${p.blocked} blocked` : ""}
              {` · ${p.done}/${p.total} done`}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
