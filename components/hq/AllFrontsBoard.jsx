import Link from "next/link";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { getHqFronts } from "@/lib/hq/hq-fronts";

function progressLabel(progress) {
  if (progress == null) return "No score";
  return `${progress}%`;
}

function progressVariant(progress) {
  if (progress == null) return "outline";
  if (progress >= 75) return "success";
  if (progress >= 50) return "accent";
  if (progress >= 25) return "warning";
  return "outline";
}

export function AllFrontsBoard() {
  const fronts = getHqFronts();

  return (
    <Card padding="md" className="hq-mb-4" id="all-fronts">
      <div className="hq-flex-between hq-mb-3">
        <div>
          <div className="hq-card-title">All fronts</div>
          <div className="hq-text-sm-secondary">
            Percentages are scorecard ratios or recorded four-front estimates. A blank score is not a zero.
          </div>
        </div>
        <Link href="/hq/fronts" className="hq-text-sm-secondary">
          Open list
        </Link>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {fronts.map((front) => (
          <Link key={front.id} href={`/hq/fronts/${front.id}`} className="hq-tile-link">
            <div style={{ padding: 12, border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              <div className="hq-flex-between hq-mb-2" style={{ gap: 12 }}>
                <strong style={{ fontSize: "var(--text-sm)" }}>{front.name}</strong>
                <Badge variant={progressVariant(front.progress)} size="sm">{progressLabel(front.progress)}</Badge>
              </div>
              <div className="hq-text-xs-muted">{front.formula}</div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
