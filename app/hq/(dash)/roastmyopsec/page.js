import { TopBar } from "@/components/hq/TopBar";
import { ActionPlanBoard } from "@/components/hq/ActionPlanBoard";
import { Badge } from "@/components/hq/Badge";
import { Card } from "@/components/hq/Card";
import { ClickPlaySandbox } from "@/components/hq/ClickPlaySandbox";
import { readOpsData } from "@/lib/hq/ops";

export default async function RoastMyOpSecPlanPage() {
  const ops = await readOpsData();

  return (
    <div>
      <TopBar
        title="RoastMyOpSec Plan"
        subtitle="Surface inventory click-and-play · no live scanner"
        crumbs={[
          { label: "Overview", href: "/hq" },
          { label: "RoastMyOpSec" },
        ]}
        actions={
          <Badge variant="warning" size="sm">
            Manual · 0 live scan
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
            Inventory public surfaces below. Scanner engine is Future API. Consume maps from SEOS Knowledge Base — do not
            fork a security FAQ store.
          </p>
        </Card>
        <Card padding="md" style={{ marginBottom: "var(--space-4)" }}>
          <div className="hq-card-header hq-mb-2">
            <div className="hq-card-title">Security intelligence content loop</div>
            <Badge variant="outline" size="sm">Planned · no live feed yet</Badge>
          </div>
          <p className="hq-text-sm-secondary">
            Next slice: attributed vulnerability/news cards → bounded weekly Claude synthesis → approval-gated content queue.
            Source freshness and links must remain visible; HQ must never imply a connected live feed until evidence exists.
          </p>
        </Card>
        <ClickPlaySandbox sectionId="roastMyOpSec" />
        <ActionPlanBoard initialData={ops} streamKeys={["roastMyOpSec"]} columns={1} />
      </div>
    </div>
  );
}
