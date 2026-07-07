import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { contentGaps } from "@/lib/hq/knowledge-mock";

export default function HqContentGapsPage() {
  return (
    <div>
      <TopBar title="Content Gaps" subtitle="Knowledge Base vs website · computed gaps" />
      <div className="hq-page-content">
        {contentGaps.map((gap) => (
          <Card key={gap.gap} padding="md" style={{ marginBottom: "var(--space-3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-3)", flexWrap: "wrap" }}>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, flex: 1 }}>{gap.gap}</p>
              <Badge variant="warning" size="sm">P{gap.priority}</Badge>
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-accent)", marginTop: "var(--space-2)", marginBottom: 0 }}>{gap.action}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
