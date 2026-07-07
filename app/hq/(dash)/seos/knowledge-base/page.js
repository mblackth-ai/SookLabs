import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { knowledgeSummary } from "@/lib/hq/knowledge-mock";
import { getSeosAppUrl } from "@/lib/hq/paths";

export default function HqKnowledgeBasePage() {
  const s = knowledgeSummary;
  const seosUrl = getSeosAppUrl();
  return (
    <div>
      <TopBar
        title="Knowledge Base"
        subtitle={`${s.workspaceName} · canonical business truth`}
        actions={
          <Badge variant="warning" size="sm">
            Manual · Phase 2
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card accent padding="md">
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: "var(--leading-relaxed)" }}>
            Single source of truth for business identity, offers, FAQs, policies, hours, and approved claims.
            Sookly, website, llms.txt, and Schema.org read from here — not separate stores.
          </p>
        </Card>
        <div className="hq-grid-4" style={{ marginTop: "var(--space-4)" }}>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Completeness</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--text-accent)" }}>{s.completeness}%</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>FAQs published</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)" }}>{s.faqPublished}/{s.faqTarget}</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>AI-approved FAQs</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)" }}>{s.faqApprovedForAI}</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Last updated</div>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", marginTop: "var(--space-1)" }}>{s.updatedAt}</div>
          </Card>
        </div>
        <Card padding="md" style={{ marginTop: "var(--space-4)" }}>
          <div className="hq-card-header">
            <div className="hq-card-title">Edit in SEOS product</div>
            <Button variant="accent" size="sm" href={seosUrl}>
              Open SEOS app →
            </Button>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", margin: 0 }}>
            Full tabbed editor (Identity, Offers, FAQs, Policies, …) lives in the SEOS dashboard Knowledge Base module.
          </p>
        </Card>
      </div>
    </div>
  );
}
