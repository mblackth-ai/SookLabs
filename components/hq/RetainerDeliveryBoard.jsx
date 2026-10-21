import Link from "next/link";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { retainerStatusVariant } from "@/lib/hq/retainer-delivery";

const PERIOD_ORDER = ["today", "thisWeek", "thisMonth", "window90d"];

function healthLabel(snapshot) {
  if (snapshot.retainerHealthy) return "Required periods pass";
  return "Not retainer healthy";
}

export function RetainerPeriodBadges({ periods }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {PERIOD_ORDER.map((key) => {
        const period = periods[key];
        return (
          <Badge key={key} variant={retainerStatusVariant(period.status)} size="sm" title={period.label}>
            {period.key === "window90d" ? "90d" : period.key === "thisWeek" ? "week" : period.key === "thisMonth" ? "month" : "today"}{" "}
            {period.status}
          </Badge>
        );
      })}
    </div>
  );
}

export function RetainerDeliverySummary({ rdusa, jaka }) {
  return (
    <Card padding="md" className="hq-mb-4" id="retainers">
      <div className="hq-flex-between hq-mb-3">
        <div>
          <div className="hq-card-title">Client retainers</div>
          <div className="hq-text-sm-secondary">
            Day, week, month, and 90-day pass or fail for what was promised. Separate from the four engineering fronts.
          </div>
        </div>
        <Link href="/hq/retainers" className="hq-text-sm-secondary">
          Open retainers
        </Link>
      </div>
      <div className="hq-grid-2" style={{ gap: "var(--space-3)" }}>
        {[rdusa, jaka].map((snapshot) => (
          <Link key={snapshot.clientId} href={`/hq/retainers#${snapshot.clientId}`} className="hq-tile-link">
            <div style={{ padding: 12, border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)" }}>
              <div className="hq-flex-between hq-mb-2">
                <strong style={{ fontSize: "var(--text-sm)" }}>{snapshot.clientName}</strong>
                <Badge variant={snapshot.retainerHealthy ? "success" : "error"} size="sm">
                  {healthLabel(snapshot)}
                </Badge>
              </div>
              <div className="hq-text-xs-muted hq-mb-2">{snapshot.fee.label}</div>
              <RetainerPeriodBadges periods={snapshot.periods} />
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function CriterionList({ criteria }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {criteria.map((row) => (
        <div key={row.id} style={{ display: "grid", gap: 4 }}>
          <div className="hq-flex-between" style={{ gap: 12 }}>
            <strong style={{ fontSize: "var(--text-sm)" }}>{row.criterion}</strong>
            <Badge variant={retainerStatusVariant(row.status)} size="sm">{row.status}</Badge>
          </div>
          <div className="hq-text-xs-muted">
            {row.cadence} · {row.periodLabel} · {row.owner}
            {row.requiredForHealth ? " · required for health" : ""}
            {row.countsTowardPeriod ? "" : " · listed, not in the period rollup"}
          </div>
          <div className="hq-text-sm-secondary">{row.evidence}</div>
        </div>
      ))}
    </div>
  );
}

export function RetainerClientCard({ snapshot }) {
  const counts = snapshot.counts;
  return (
    <Card id={snapshot.clientId} padding="md" style={{ marginBottom: 16 }}>
      <div className="hq-flex-between hq-mb-2">
        <div>
          <div className="hq-card-title">{snapshot.clientName}</div>
          <div className="hq-text-sm-secondary">
            {snapshot.fee.label}
            {snapshot.fee.confirmed ? "" : " · fee unconfirmed"}
            {" · "}
            {snapshot.window.label} {snapshot.window.start}–{snapshot.window.end}
          </div>
        </div>
        <Badge variant={snapshot.retainerHealthy ? "success" : "error"} size="sm">
          {healthLabel(snapshot)}
        </Badge>
      </div>
      <div style={{ marginBottom: 10 }}>
        <RetainerPeriodBadges periods={snapshot.periods} />
      </div>
      <div className="hq-text-sm-secondary" style={{ marginBottom: 10 }}>
        {counts.PASS} pass · {counts.FAIL} fail · {counts.BLOCKED} blocked · {counts["NOT STARTED"]} not started · {counts.UNKNOWN} unknown.
        {snapshot.windowComplete ? " 90-day window complete." : " 90-day window is not complete."}
        {" "}
        {snapshot.healthBasis}
      </div>
      <div className="hq-section-label">Critical path</div>
      <div className="hq-text-sm-secondary" style={{ marginBottom: 12 }}>{snapshot.criticalPath}</div>
      <CriterionList criteria={snapshot.criteria} />
      <div className="hq-text-xs-muted" style={{ marginTop: 12 }}>
        <a href={snapshot.url} target="_blank" rel="noreferrer">Open the contract</a>
      </div>
    </Card>
  );
}
