import { TopBar } from "@/components/hq/TopBar";
import { ActionPlanBoard } from "@/components/hq/ActionPlanBoard";
import { PlatformMatrixCard } from "@/components/hq/PlatformMatrixCard";
import { Badge } from "@/components/hq/Badge";
import { Card } from "@/components/hq/Card";
import { readOpsData } from "@/lib/hq/ops";

export default async function SeosSocialGtmPage() {
  const ops = await readOpsData();

  return (
    <div>
      <TopBar
        title="SEOS Social GTM"
        subtitle="Content refactor → multi-platform publish · checklist only — no live OAuth"
        actions={
          <Badge variant="warning" size="sm">
            Manual · Future OAuth
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
            SEOS Expansion OS distributes social packs from one source article. Platforms stay Manual / Draft / Future
            OAuth until you approve credentials. Business facts still live in SEOS Knowledge Base — never duplicate tone
            or claims here.
          </p>
        </Card>
        <div className="hq-grid-2" style={{ alignItems: "start", marginBottom: "var(--space-4)" }}>
          <PlatformMatrixCard platforms={ops.platformMatrix} />
          <Card padding="md">
            <div className="hq-card-title" style={{ marginBottom: "var(--space-2)" }}>
              Target platforms (7)
            </div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <li>Facebook Page — Future OAuth · Graph</li>
              <li>Instagram — Future OAuth · draft media</li>
              <li>TikTok — Manual → Future OAuth</li>
              <li>Reddit — Manual → Future OAuth</li>
              <li>LinkedIn — Draft → Future OAuth</li>
              <li>X (Twitter) — Draft → Future OAuth</li>
              <li>Threads — Manual (#7)</li>
            </ol>
          </Card>
        </div>
        <ActionPlanBoard initialData={ops} streamKeys={["seosSocial"]} columns={1} />
      </div>
    </div>
  );
}
