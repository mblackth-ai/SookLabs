import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { LongDate } from "@/components/hq/LongDate";
import { PriorityList } from "@/components/hq/PriorityList";
import { TopOpenItems } from "@/components/hq/TopOpenItems";
import { QuickLinks } from "@/components/hq/QuickLinks";
import { readOpsData, getTopOpenItems } from "@/lib/hq/ops";

export default function ExecutivePage() {
  const ops = readOpsData();
  const topOpen = getTopOpenItems(ops, 3);
  const openPriorities = ops.todayPriorities.filter((p) => !p.done).length;

  return (
    <div>
      <TopBar
        title="Good morning."
        subtitle={<LongDate suffix=" · Your daily workspace." />}
        actions={
          <>
            <Button variant="secondary" size="sm" disabled title="Not available in v1">
              Export briefing
            </Button>
            <Button variant="accent" size="sm" disabled title="Not available in v1">
              Ask AI
            </Button>
          </>
        }
      />

      <div className="hq-page-content">
        <PriorityList initialData={ops} />

        <div className="hq-grid-2">
          <TopOpenItems items={topOpen} />
          <QuickLinks />
        </div>

        <Card padding="md">
          <div className="hq-card-header">
            <span className="hq-card-title">Reference · not live data</span>
            <Badge variant="neutral" size="sm">
              Manual
            </Badge>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "0 0 var(--space-4)", lineHeight: 1.55 }}>
            Portfolio metrics, AI agents, and overnight feeds are placeholders until integrations ship. Use priorities,
            action plan, and decision log for real daily ops.
          </p>
          <div className="hq-grid-4">
            <div>
              <div className="hq-section-label">Open priorities</div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{openPriorities}</div>
            </div>
            <div>
              <div className="hq-section-label">Website tasks</div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{ops.workstreams.sooklyWebsite.items.length}</div>
            </div>
            <div>
              <div className="hq-section-label">App tasks</div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{ops.workstreams.sooklyApp.items.length}</div>
            </div>
            <div>
              <div className="hq-section-label">Decisions logged</div>
              <div style={{ fontSize: "var(--text-2xl)", fontWeight: 600 }}>{ops.decisions.length}</div>
            </div>
          </div>
          <div style={{ marginTop: "var(--space-4)", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button variant="ghost" size="sm" href="/hq/seos/knowledge-base">
              SEOS intel →
            </Button>
            <Button variant="ghost" size="sm" href="/hq/sookly/receptionist-readiness">
              Sookly readiness →
            </Button>
            <Button variant="ghost" size="sm" href="/hq/portfolio">
              Portfolio →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
