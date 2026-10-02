import { TopBar } from "@/components/hq/TopBar";
import { ActionPlanBoard } from "@/components/hq/ActionPlanBoard";
import { Badge } from "@/components/hq/Badge";
import { Card } from "@/components/hq/Card";
import { ClickPlaySandbox } from "@/components/hq/ClickPlaySandbox";
import { readOpsData } from "@/lib/hq/ops";

export default async function CommunityPlanPage() {
  const ops = await readOpsData();

  return (
    <div>
      <TopBar
        title="Community"
        subtitle="Discord pillars · click-and-play cadence — hosting later (Future API)"
        crumbs={[
          { label: "Overview", href: "/hq" },
          { label: "Community" },
        ]}
        actions={
          <Badge variant="warning" size="sm">
            Manual · 0 OAuth
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
            Plan pillar posts below without Discord OAuth or Stripe. Structure first; Future API for hosting and gating.
          </p>
        </Card>
        <ClickPlaySandbox sectionId="community" />
        <ActionPlanBoard initialData={ops} streamKeys={["community"]} columns={1} />
      </div>
    </div>
  );
}
