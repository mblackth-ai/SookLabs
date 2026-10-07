import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { RepoTimeline } from "@/components/hq/RepoTimeline";

import { FOUR_FRONTS, getFourFrontsOverall } from "@/lib/hq/four-fronts";

function tone(progress) {
  if (progress >= 75) return "success";
  if (progress >= 50) return "accent";
  if (progress >= 25) return "warning";
  return "outline";
}

export default function FourFrontsPage() {
  const average = getFourFrontsOverall();

  return (
    <div>
      <TopBar
        title="Four Fronts"
        subtitle="Live delivery overview for the four active build tracks. Estimates are acceptance-based, not commit-count percentages."
        actions={<Badge variant="accent" size="sm">{average}% overall</Badge>}
      />

      <div className="hq-page-content">
        <div className="hq-grid-2" style={{ gap: "var(--space-3)", marginBottom: 16 }}>
          {FOUR_FRONTS.map((front) => (
            <Card key={front.name} padding="md">
              <div className="hq-card-header hq-mb-2">
                <div>
                  <div className="hq-card-title">{front.name}</div>
                  <div className="hq-text-sm-secondary">{front.phase}</div>
                </div>
                <Badge variant={tone(front.progress)} size="sm">{front.progress}%</Badge>
              </div>

              <div style={{ margin: "12px 0 16px", height: 8, borderRadius: 999, background: "var(--bg-tertiary)", overflow: "hidden" }}>
                <div
                  style={{
                    width: `${front.progress}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: "var(--text-accent)",
                  }}
                />
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <div>
                  <div className="hq-section-label">Evidence</div>
                  <div className="hq-text-sm-secondary">{front.evidence}</div>
                </div>
                <div>
                  <div className="hq-section-label">Next gate</div>
                  <div className="hq-text-sm-secondary">{front.next}</div>
                </div>
                <div>
                  <div className="hq-section-label">Blocker</div>
                  <div className="hq-text-sm-secondary">{front.blocker}</div>
                </div>
                <div>
                  <div className="hq-section-label">Branch</div>
                  <code style={{ fontSize: 12 }}>{front.repo} · {front.branch}</code>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <p className="hq-text-xs-muted" style={{ margin: "0 0 8px" }}>
          The repo timeline below reads real Git history for the HQ / MCP Gateway front&apos;s repo
          (mblackth-ai/SookLabs) only. It does not change the progress estimates above.
        </p>
        <RepoTimeline />

        <Card padding="md" style={{ marginTop: 16 }}>
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
