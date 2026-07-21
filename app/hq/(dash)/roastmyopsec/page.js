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
        <ClickPlaySandbox sectionId="roastMyOpSec" />
        <ActionPlanBoard initialData={ops} streamKeys={["roastMyOpSec"]} columns={1} />
      </div>
    </div>
  );
}
