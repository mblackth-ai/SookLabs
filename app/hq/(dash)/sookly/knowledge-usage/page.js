import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";

export default function KnowledgeUsagePage() {
  return (
    <div>
      <TopBar
        title="Knowledge Usage"
        subtitle="No live Sookly or SEOS knowledge sync"
        actions={
          <Badge variant="warning" size="sm" title="Illustrative rows are not shown">
            Demo
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md">
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
            The sample intent table is not on this page. It was static demo data in lib/hq/knowledge-mock.js and is listed under Upcoming / Not Yet Released. Edit knowledge truth in SEOS. Sookly does not have a connected export here.
          </p>
        </Card>
      </div>
    </div>
  );
}
