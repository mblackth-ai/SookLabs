import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { ClickPlaySandbox } from "@/components/hq/ClickPlaySandbox";
import { getSeosAppUrl } from "@/lib/hq/paths";

export default function ReceptionistReadinessPage() {
  const seosUrl = getSeosAppUrl();
  return (
    <div>
      <TopBar
        title="Receptionist Readiness"
        subtitle="Local reply sketch only. No live readiness meter."
        actions={
          <Badge variant="warning" size="sm">
            Demo · not live product
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Static demo scores are not on this page. They lived in lib/hq/knowledge-mock.js (67, 60, and 3/5) and are listed under Upcoming / Not Yet Released. Edit real knowledge gaps in SEOS.
          </p>
          <div style={{ marginTop: 12 }}>
            <Button variant="ghost" size="sm" href={seosUrl} external>
              Open SEOS Knowledge Base →
            </Button>
          </div>
        </Card>
        <ClickPlaySandbox sectionId="sooklyReceptionist" />
      </div>
    </div>
  );
}
