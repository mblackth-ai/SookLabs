import Link from "next/link";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { EIGHT_FRONTS_BASIS, getEightFronts, getEightFrontsOverall } from "@/lib/hq/eight-fronts";

function tone(progress) {
  if (progress >= 75) return "success";
  if (progress >= 50) return "accent";
  if (progress >= 25) return "warning";
  return "outline";
}

export function EightFrontsBoard({ compact = false }) {
  const fronts = getEightFronts();
  const overall = getEightFrontsOverall();

  return (
    <Card padding="md" className="hq-mb-4" id="eight-fronts">
      <div className="hq-flex-between hq-mb-3" style={{ gap: 12 }}>
        <div>
          <div className="hq-card-title">Eight fronts</div>
          <div className="hq-text-sm-secondary">{EIGHT_FRONTS_BASIS}</div>
        </div>
        <Badge variant="accent" size="sm">{overall}% overall</Badge>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {fronts.map((front) => (
          <Link key={front.id} href={`/hq/fronts/${front.id}`} className="hq-tile-link">
            <div style={{ padding: 12, border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              <div className="hq-flex-between hq-mb-2" style={{ gap: 12 }}>
                <strong style={{ fontSize: "var(--text-sm)" }}>{front.name}</strong>
                <Badge variant={tone(front.progress)} size="sm">{front.progress}%</Badge>
              </div>
              <div className="hq-progress-track" aria-hidden="true">
                <div className="hq-progress-fill" style={{ width: `${front.progress}%` }} />
              </div>
              {compact ? null : <div className="hq-text-xs-muted hq-mt-2">{front.formula}</div>}
            </div>
          </Link>
        ))}
      </div>
      <p className="hq-text-xs-muted" style={{ marginTop: 12 }}>
        Engineering tracks stay at <Link href="/hq/engineering/four-fronts">/hq/engineering/four-fronts</Link>. Their 85 / 80 / 45 / 35 are not rewritten here.
      </p>
    </Card>
  );
}
