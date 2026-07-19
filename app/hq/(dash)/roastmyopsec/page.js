import { TopBar } from "@/components/hq/TopBar";
import { ActionPlanBoard } from "@/components/hq/ActionPlanBoard";
import { Badge } from "@/components/hq/Badge";
import { Card } from "@/components/hq/Card";
import { readOpsData } from "@/lib/hq/ops";

export default async function RoastMyOpSecPlanPage() {
  const ops = await readOpsData();

  return (
    <div>
      <TopBar
        title="RoastMyOpSec Plan"
        subtitle="Exposure auditor roadmap · reads SEOS surfaces, never owns business truth"
        actions={
          <Badge variant="neutral" size="sm">
            Discover
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
            Plan board only. Scanner engine and live checks are Future API. Consume website content map and public
            channels from SEOS Knowledge Base — do not fork a security FAQ store.
          </p>
        </Card>
        <ActionPlanBoard initialData={ops} streamKeys={["roastMyOpSec"]} columns={1} />
      </div>
    </div>
  );
}
