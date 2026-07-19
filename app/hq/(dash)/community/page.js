import { TopBar } from "@/components/hq/TopBar";
import { ActionPlanBoard } from "@/components/hq/ActionPlanBoard";
import { Badge } from "@/components/hq/Badge";
import { Card } from "@/components/hq/Card";
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
        subtitle="Discord server · three pillars · subscription later (Future API)"
        actions={
          <Badge variant="neutral" size="sm">
            Manual hosting
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
            SookLabs Community focuses on Psychology, Investment, and Technology. Hosting and Stripe gating are Future
            API — tick structure and pillar cadence here first.
          </p>
        </Card>
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
