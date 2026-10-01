import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";

const FRONTS = [
  {
    name: "Sookly Journey / CRM",
    progress: 50,
    phase: "Implementation",
    repo: "mblackth-ai/sookly-omnichat",
    branch: "cursor/operational-journey-engine-v1",
    evidence: "Journey schema + migration + tenant-safe Intelligence read path committed",
    next: "CI/review gate, generic templates, Current Situation UI, RDUSA mock journey",
    blocker: "No human blocker",
  },
  {
    name: "SEOS Social Control Plane",
    progress: 25,
    phase: "Foundation → UI",
    repo: "mblackth-ai/SEOS",
    branch: "cursor/seos-social-control-plane-mvp1",
    evidence: "Calendar-first Publication Job MVP spec + product decision committed",
    next: "Calendar surface over existing queue/schedule state, then real channel adapters",
    blocker: "No human blocker",
  },
  {
    name: "RDUSA Internal Retainer Control",
    progress: 20,
    phase: "Evidence consolidation",
    repo: "mblackth-ai/rdusa",
    branch: "cursor/rdusa-internal-retainer-control-v1",
    evidence: "Historical GSC/GA4, plans, reports, competitor work, social and SEO evidence indexed",
    next: "Master responsibilities contract, contribution ledger, historical decision map",
    blocker: "No human blocker",
  },
  {
    name: "HQ / MCP Gateway",
    progress: 35,
    phase: "Control-plane build",
    repo: "mblackth-ai/SookLabs",
    branch: "cursor/hq-mcp-gateway-v1",
    evidence: "Existing HQ agent dispatch, pending jobs, callbacks, ops state and n8n routing",
    next: "Cross-project MCP tools, normalized status, approvals, event-driven callbacks",
    blocker: "No human blocker",
  },
];

function tone(progress) {
  if (progress >= 75) return "success";
  if (progress >= 50) return "info";
  if (progress >= 25) return "warning";
  return "outline";
}

export default function FourFrontsPage() {
  const average = Math.round(FRONTS.reduce((sum, item) => sum + item.progress, 0) / FRONTS.length);

  return (
    <div>
      <TopBar
        title="Four Fronts"
        subtitle="Live delivery overview for the four active build tracks. Estimates are acceptance-based, not commit-count percentages."
        actions={<Badge variant="info" size="sm">{average}% overall</Badge>}
      />

      <div className="hq-page-content">
        <div className="hq-grid-2" style={{ gap: "var(--space-3)", marginBottom: 16 }}>
          {FRONTS.map((front) => (
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
