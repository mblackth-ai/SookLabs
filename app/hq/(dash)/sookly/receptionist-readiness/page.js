import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { sooklyReadiness } from "@/lib/hq/knowledge-mock";

export default function ReceptionistReadinessPage() {
  const r = sooklyReadiness;
  return (
    <div>
      <TopBar
        title="Receptionist Readiness"
        subtitle="What can the AI receptionist safely say? · Consumes SEOS Knowledge Base"
        actions={
          <Badge variant="warning" size="sm">
            Read-only · Manual
          </Badge>
        }
      />
      <div className="hq-page-content">
        <div className="hq-grid-3">
          <Card accent padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Readiness score</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-warning)" }}>{r.score}%</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Safe auto-reply coverage</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)" }}>{r.safeToAutoReplyPercent}%</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>AI-approved FAQs</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)" }}>{r.approvedFaqCount}/{r.totalFaqCount}</div>
          </Card>
        </div>
        <Card padding="md" style={{ marginTop: "var(--space-4)" }}>
          <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
            <div className="hq-card-title">Blockers</div>
            <Button variant="ghost" size="sm" href="/hq/seos/knowledge-base">
              Fix in Knowledge Base →
            </Button>
          </div>
          <ul style={{ margin: 0, paddingLeft: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {r.blockers.map((b) => (
              <li key={b} style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>{b}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
