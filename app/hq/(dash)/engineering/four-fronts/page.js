import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";

import {
  FOUR_FRONTS,
  FRONT_PLAN,
  PLAN_HORIZON,
  getFourFrontsOverall,
  getFrontInsight,
  getPlanSummary,
  planStatusVariant,
} from "@/lib/hq/four-fronts";
import { getRdusaPilotContractSnapshot, pilotStatusVariant } from "@/lib/hq/rdusa-pilot-contract";

function tone(progress) {
  if (progress >= 75) return "success";
  if (progress >= 50) return "accent";
  if (progress >= 25) return "warning";
  return "outline";
}

export default function FourFrontsPage() {
  const average = getFourFrontsOverall();
  const counts = getPlanSummary();
  const pilot = getRdusaPilotContractSnapshot();
  const major = pilot.majorCounts;

  return (
    <div>
      <TopBar
        title="Four Fronts"
        subtitle="Engineering evidence only. Overall is the rounded mean of these four tracks. The founder board is the eight fronts."
        actions={<Badge variant="accent" size="sm">{average}% · four-front estimate</Badge>}
      />

      <div className="hq-page-content">
        <Card id="rdusa-pilot" padding="md" style={{ marginBottom: 16 }}>
          <div className="hq-flex-between hq-mb-2">
            <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>
              <div className="hq-card-title">RDUSA pilot acceptance</div>
              <div className="hq-text-sm-secondary">
                Finish line: {pilot.path}. Four-front percentages are a different board. A {average}% four-front estimate is not pilot ready.
              </div>
            </div>
            <Badge variant={pilot.pilotReady ? "success" : "error"} size="sm">
              {pilot.pilotReady ? "Pilot ready" : "Not pilot ready"}
            </Badge>
          </div>
          <div className="hq-text-sm-secondary" style={{ marginBottom: 10 }}>
            Major criteria: {major.PASS} pass · {major.FAIL} fail · {major.BLOCKED} blocked · {major["NOT STARTED"]} not started.
            All rows: {pilot.counts.PASS} pass · {pilot.counts.FAIL} fail · {pilot.counts.BLOCKED} blocked · {pilot.counts["NOT STARTED"]} not started.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            <Badge variant={pilotStatusVariant("PASS")} size="sm">{major.PASS} PASS</Badge>
            <Badge variant={pilotStatusVariant("FAIL")} size="sm">{major.FAIL} FAIL</Badge>
            <Badge variant={pilotStatusVariant("BLOCKED")} size="sm">{major.BLOCKED} BLOCKED</Badge>
            <Badge variant={pilotStatusVariant("NOT STARTED")} size="sm">{major["NOT STARTED"]} NOT STARTED</Badge>
          </div>
          <div className="hq-section-label">Next unmet criterion</div>
          <div className="hq-text-sm-secondary" style={{ marginBottom: 10 }}>{pilot.criticalPath}</div>
          <div className="hq-text-xs-muted">
            Slices remaining: {pilot.remainingSlices.min}–{pilot.remainingSlices.max}.{" "}
            <a href={pilot.url} target="_blank" rel="noreferrer">Open the contract</a>
            {" · "}
            <a href="/hq/retainers">Client retainers are a separate board</a>
          </div>
        </Card>

        <div className="hq-grid-2" style={{ gap: "var(--space-3)", marginBottom: 16 }}>
          {FOUR_FRONTS.map((front) => {
            const insight = getFrontInsight(front);
            return (
              <Card key={front.id} padding="md">
                <div className="hq-card-header hq-mb-2">
                  <div>
                    <div className="hq-card-title">{front.name}</div>
                    <div className="hq-text-sm-secondary">{insight.phase}</div>
                  </div>
                  <Badge variant={tone(insight.progress)} size="sm">{insight.progress}%</Badge>
                </div>

                <div style={{ margin: "12px 0 16px", height: 8, borderRadius: 999, background: "var(--bg-tertiary)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${insight.progress}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "var(--text-accent)",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  <div>
                    <div className="hq-section-label">What would raise %</div>
                    <div className="hq-text-sm-secondary">{insight.raiseProgress}</div>
                  </div>
                  <div>
                    <div className="hq-section-label">If stalled</div>
                    <div className="hq-text-sm-secondary">{insight.stallRisk}</div>
                  </div>
                  <div>
                    <div className="hq-section-label">Next gate</div>
                    <div className="hq-text-sm-secondary">{insight.nextGate}</div>
                  </div>
                  <div>
                    <div className="hq-section-label">Blocker</div>
                    <div className="hq-text-sm-secondary">{insight.blocker}</div>
                  </div>
                  <div>
                    <div className="hq-section-label">Evidence</div>
                    <div className="hq-text-sm-secondary">{front.evidence}</div>
                  </div>
                  <div>
                    <div className="hq-section-label">Branch</div>
                    <code style={{ fontSize: 12 }}>{front.repo} · {front.branch}</code>
                  </div>
                  {insight.evidenceSha ? (
                    <div>
                      <div className="hq-section-label">Evidence SHA</div>
                      <code style={{ fontSize: 12 }}>{insight.evidenceSha}</code>
                    </div>
                  ) : null}
                  {insight.pr?.url ? (
                    <div>
                      <div className="hq-section-label">Pull request</div>
                      <a href={insight.pr.url} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>
                        #{insight.pr.number} · {insight.pr.state}{insight.pr.merged ? "" : " · unmerged"}
                      </a>
                    </div>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>

        <Card padding="md" style={{ marginBottom: 16 }}>
          <div className="hq-flex-between hq-mb-2">
            <div>
              <div className="hq-card-title">Review horizon</div>
              <div className="hq-text-sm-secondary">{PLAN_HORIZON.note}</div>
            </div>
            <Badge variant="outline" size="sm">
              {counts.ready} ready · {counts.blocked} blocked · {counts.queued} queued
            </Badge>
          </div>
          <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
            {FRONT_PLAN.map((item) => {
              const front = FOUR_FRONTS.find((entry) => entry.id === item.frontId);
              return (
                <div key={item.id} style={{ display: "grid", gap: 4 }}>
                  <div className="hq-flex-between" style={{ gap: 12 }}>
                    <strong style={{ fontSize: "var(--text-sm)" }}>{item.title}</strong>
                    <Badge variant={planStatusVariant(item.status)} size="sm">{item.status}</Badge>
                  </div>
                  <div className="hq-text-xs-muted">
                    {front?.name} · {item.window.label} · {item.owner}
                  </div>
                  <div className="hq-text-sm-secondary">{item.dependency}</div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card padding="md">
          <div className="hq-card-title" style={{ marginBottom: 8 }}>Approval boundary</div>
          <p className="hq-text-sm-secondary" style={{ margin: 0 }}>
            The loop continues without founder input until a real gate appears: merge to protected main,
            production deployment, production database migration, credentials/provider permissions,
            billing or spend, or another irreversible external action.
          </p>
        </Card>
      </div>
    </div>
  );
}
