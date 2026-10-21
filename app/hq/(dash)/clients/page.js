import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { Badge } from "@/components/hq/Badge";
import { Card } from "@/components/hq/Card";
import { readContentSummary } from "@/lib/hq/content-client";
import { businessSummary } from "@/lib/hq/content-summary.js";
import { CLIENTS } from "@/lib/hq/clients";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const result = await readContentSummary();
  return (
    <div>
      <TopBar title="Clients" subtitle="Client businesses we run content and growth for." />
      <div className="hq-page-content">
        <div className="hq-grid-2">
          {CLIENTS.map((c) => {
            const b = businessSummary(result, c.seosBusiness);
            return (
              <Link key={c.slug} href={`/hq/clients/${c.slug}`} style={{ textDecoration: "none" }}>
                <Card padding="md" interactive>
                  <div className="hq-card-header">
                    <div>
                      <div className="hq-card-title">{c.name}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>{c.domain}</div>
                    </div>
                    {b && b.counts.failed + b.counts.blocked ? <Badge variant="warning" size="sm">{b.counts.failed + b.counts.blocked} flagged</Badge> : null}
                  </div>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: 8 }}>{c.summary}</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {c.lockedMetrics.map((m) => (
                      <Badge key={m.key} variant="outline" size="sm">{m.label}</Badge>
                    ))}
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", marginTop: 8 }}>
                    {b ? `${b.counts.scheduled} scheduled · ${b.counts.published} published · ${b.gapDays.length} gap days${b.daysAhead != null ? ` · ${b.daysAhead} days ahead` : ""}${b.reporting && !b.reporting.healthy ? " · publisher issue" : ""}` : `SEOS: ${result.error || "no data"}`}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
