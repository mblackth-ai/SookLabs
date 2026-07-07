import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { StatusBadge } from "@/components/hq/HubPage";
import { knowledgeUsage } from "@/lib/hq/knowledge-mock";

export default function KnowledgeUsagePage() {
  return (
    <div>
      <TopBar
        title="Knowledge Usage"
        subtitle="Which SEOS Knowledge Base records power Sookly auto-replies"
        actions={
          <Badge variant="warning" size="sm">
            Read-only · Manual
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="none">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)", textAlign: "left" }}>
                <th style={{ padding: "var(--space-3)" }}>Intent</th>
                <th style={{ padding: "var(--space-3)" }}>Channel</th>
                <th style={{ padding: "var(--space-3)" }}>KB record</th>
                <th style={{ padding: "var(--space-3)" }}>Sync</th>
              </tr>
            </thead>
            <tbody>
              {knowledgeUsage.map((row) => (
                <tr key={row.kbId + row.channel} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "var(--space-3)" }}>{row.intent}</td>
                  <td style={{ padding: "var(--space-3)", color: "var(--text-secondary)" }}>{row.channel}</td>
                  <td style={{ padding: "var(--space-3)" }}>
                    <div>{row.label}</div>
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", fontFamily: "monospace" }}>{row.kbId}</div>
                  </td>
                  <td style={{ padding: "var(--space-3)" }}>
                    <StatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
