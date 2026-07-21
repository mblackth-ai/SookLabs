import { TopBar } from "@/components/hq/TopBar";
import { ActionPlanBoard } from "@/components/hq/ActionPlanBoard";
import { Badge } from "@/components/hq/Badge";
import { Card } from "@/components/hq/Card";
import { ClickPlaySandbox } from "@/components/hq/ClickPlaySandbox";
import { readOpsData } from "@/lib/hq/ops";

const PILLARS = [
  { id: "psychology", title: "Psychology", blurb: "Thinking tools, habits, clarity under noise." },
  { id: "investment", title: "Investment", blurb: "Long-term leverage, not hype trading." },
  { id: "technology", title: "Technology", blurb: "Builders, systems, AI that reduces load." },
];

export default async function CommunityPlanPage() {
  const ops = await readOpsData();

  return (
    <div>
      <TopBar
        title="Community"
        subtitle="Discord pillars · click-and-play cadence — hosting later (Future API)"
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
        <div className="hq-grid-3" style={{ marginBottom: "var(--space-4)" }}>
          {PILLARS.map((p) => (
            <Card key={p.id} padding="md">
              <div className="hq-card-title" style={{ marginBottom: 6 }}>
                {p.title}
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>{p.blurb}</p>
            </Card>
          ))}
        </div>
        <ActionPlanBoard initialData={ops} streamKeys={["community"]} columns={1} />
      </div>
    </div>
  );
}
