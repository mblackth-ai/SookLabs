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
        subtitle="Static sample data — not live Sookly or SEOS KB sync"
        actions={
          <Badge variant="warning" size="sm" title="Illustrative rows only; no API connection">
            Demo
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
            This page mirrors how receptionist intents <em>could</em> map to SEOS Knowledge Base records. Every row is{" "}
            <strong>Manual</strong> — edit truth in SEOS KB; Sookly consumes exports when wired. No fake &quot;Connected&quot;
            or live channel sync.
          </p>
        </Card>
        <Card padding="none">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)", textAlign: "left" }}>
                <th style={{ padding: "var(--space-3)" }}>Intent</th>
                <th style={{ padding: "var(--space-3)" }}>Channel</th>
                <th style={{ padding: "var(--space-3)" }}>KB record</th>
                <th style={{ padding: "var(--space-3)" }}>
                  Sync{" "}
                  <span style={{ fontWeight: 400, color: "var(--text-tertiary)", fontSize: "var(--text-xs)" }}>
                    (honest status)
                  </span>
                </th>
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
