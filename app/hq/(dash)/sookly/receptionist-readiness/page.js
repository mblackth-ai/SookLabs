import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { sooklyReadiness } from "@/lib/hq/knowledge-mock";
import { getSeosAppUrl } from "@/lib/hq/paths";

export default function ReceptionistReadinessPage() {
  const r = sooklyReadiness;
  const seosUrl = getSeosAppUrl();
  return (
    <div>
      <TopBar
        title="Receptionist Readiness"
        subtitle="Demo placeholder · not SoT — illustrates future Sookly consumption of SEOS KB"
        actions={
          <Badge variant="outline" size="sm">
            Demo placeholder · not SoT
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Scores below are static demo figures for planning — not a live product readiness meter. Fix real gaps in SEOS Knowledge Base.
          </p>
        </Card>
        <div className="hq-grid-3">
          <Card accent padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Readiness score (demo)</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-warning)" }}>{r.score}%</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Safe auto-reply coverage (demo)</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)" }}>{r.safeToAutoReplyPercent}%</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>AI-approved FAQs (demo)</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)" }}>{r.approvedFaqCount}/{r.totalFaqCount}</div>
          </Card>
        </div>
        <Card padding="md" style={{ marginTop: "var(--space-4)" }}>
          <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
            <div className="hq-card-title">Blockers</div>
            <Button variant="ghost" size="sm" href={seosUrl} external>
              Fix in SEOS Knowledge Base →
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
