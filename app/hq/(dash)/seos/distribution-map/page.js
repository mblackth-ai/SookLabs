import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { StatusBadge } from "@/components/hq/HubPage";
import { distributionRows } from "@/lib/hq/knowledge-mock";

export default function HqDistributionMapPage() {
  return (
    <div>
      <TopBar title="Distribution Map" subtitle="Where Knowledge Base facts are published · honest sync status" />
      <div className="hq-page-content">
        <Card padding="none">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-sm)" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-default)", textAlign: "left" }}>
                <th style={{ padding: "var(--space-3)" }}>Channel</th>
                <th style={{ padding: "var(--space-3)" }}>Field group</th>
                <th style={{ padding: "var(--space-3)" }}>Status</th>
                <th style={{ padding: "var(--space-3)" }}>Last synced</th>
              </tr>
            </thead>
            <tbody>
              {distributionRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "var(--space-3)" }}>{row.channel}</td>
                  <td style={{ padding: "var(--space-3)", color: "var(--text-secondary)" }}>{row.fieldGroup}</td>
                  <td style={{ padding: "var(--space-3)" }}>
                    <StatusBadge status={row.status} />
                  </td>
                  <td style={{ padding: "var(--space-3)", color: "var(--text-tertiary)", fontSize: "var(--text-xs)" }}>
                    {row.lastSynced || row.note || "—"}
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
