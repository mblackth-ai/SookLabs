import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { ActionPlanBoard } from "@/components/hq/ActionPlanBoard";
import { readOpsData } from "@/lib/hq/ops";

const lanes = [
  {
    href: "/hq/fronts",
    title: "Frontier OS / All fronts",
    subtitle: "Cross-project progress, blockers and finish-line visibility.",
    badge: "Control plane",
  },
  {
    href: "/hq/automation",
    title: "Agent relay",
    subtitle: "LLM seats, baton handoffs, evidence receipts and approval gates.",
    badge: "Relay",
  },
  {
    href: "/hq/portfolio",
    title: "Project portfolio",
    subtitle: "SookLabs umbrella view across Sookly, SEOS, RoastMyOpSec and community.",
    badge: "Portfolio",
  },
];

export default async function SookLabsUmbrellaPage() {
  const ops = await readOpsData();

  return (
    <div>
      <TopBar
        title="SookLabs"
        subtitle="Umbrella operating layer · see the work without living in the repos"
        actions={<Badge variant="accent" size="sm">Frontier OS</Badge>}
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            HQ is the visibility and exception layer. Repository state remains authoritative. Surface progress,
            ownership, social coverage, blockers and approvals here; do not create a second competing source of truth.
          </p>
        </Card>

        <div className="hq-grid-2" style={{ gap: "var(--space-3)", marginBottom: "var(--space-4)" }}>
          {lanes.map((lane) => (
            <Link key={lane.href} href={lane.href} className="hq-tile-link">
              <Card padding="md" className="hq-card--tile">
                <div className="hq-card-header hq-mb-2">
                  <div className="hq-card-title">{lane.title}</div>
                  <Badge variant="outline" size="sm">{lane.badge}</Badge>
                </div>
                <p className="hq-text-sm-secondary">{lane.subtitle}</p>
              </Card>
            </Link>
          ))}
        </div>

        <ActionPlanBoard initialData={ops} streamKeys={["sookLabsSocial"]} columns={1} />
      </div>
    </div>
  );
}
