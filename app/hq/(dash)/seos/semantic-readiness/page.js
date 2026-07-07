import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { knowledgeSummary } from "@/lib/hq/knowledge-mock";

export default function HqSemanticReadinessPage() {
  const s = knowledgeSummary;
  return (
    <div>
      <TopBar
        title="Semantic Readiness"
        subtitle="Is the business understandable, findable, structured, and ready for AI/search?"
      />
      <div className="hq-page-content">
        <div className="hq-grid-3">
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Answer engine readiness</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-warning)" }}>{s.semanticReadiness}%</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>Entity clarity</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--color-warning)" }}>{s.entityClarity}/10</div>
          </Card>
          <Card padding="md">
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>KB completeness</div>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-bold)", color: "var(--text-accent)" }}>{s.completeness}%</div>
          </Card>
        </div>
        <Card padding="md" style={{ marginTop: "var(--space-4)" }}>
          <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
            <div className="hq-card-title">Export readiness</div>
            <Badge variant="warning" size="sm">Draft Export</Badge>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {[
              { label: "llms.txt", status: "Draft Export" },
              { label: "llms-full.txt", status: "Manual" },
              { label: "Schema.org", status: "Workflow Ready" },
              { label: "FAQ coverage", status: "Partial" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-sm)" }}>
                <span>{row.label}</span>
                <span style={{ color: "var(--text-tertiary)" }}>{row.status}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: "var(--space-3)", marginBottom: 0 }}>
            Scores computed from SEOS Knowledge Base — not a separate SEO knowledge store.
          </p>
        </Card>
      </div>
    </div>
  );
}
