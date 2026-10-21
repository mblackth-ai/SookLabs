import { notFound } from "next/navigation";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { ClientSectionTabs } from "@/components/hq/ClientSectionTabs";
import { RetainerClientCard } from "@/components/hq/RetainerDeliveryBoard";
import { getClient } from "@/lib/hq/clients";
import { getRetainerSnapshot } from "@/lib/hq/retainers";
import { RETAINER_AS_OF, RETAINER_GOLDEN_RULE } from "@/lib/hq/retainer-delivery";

export default async function ClientRetainerPage({ params }) {
  const { slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const snapshot = getRetainerSnapshot(client.retainer);
  return (
    <div>
      <TopBar
        title={`${client.short} retainer`}
        subtitle={`90-day retainer contract: what was promised, scored by day, week, month and 90 days. Score date ${RETAINER_AS_OF} (Asia/Bangkok).`}
        crumbs={[{ label: "Clients", href: "/hq/clients" }, { label: client.short, href: `/hq/clients/${client.slug}` }, { label: "Retainer" }]}
        actions={<Badge variant="outline" size="sm">Score date {RETAINER_AS_OF}</Badge>}
      />
      <div className="hq-page-content">
        <ClientSectionTabs client={client} active="retainer" />
        {snapshot ? (
          <>
            <Card padding="md" style={{ marginBottom: 16 }}>
              <div className="hq-section-label">Retainer Golden Rule</div>
              <p className="hq-text-sm-secondary" style={{ margin: "8px 0 0" }}>{RETAINER_GOLDEN_RULE}</p>
              <p className="hq-text-xs-muted" style={{ margin: "8px 0 0" }}>
                This scorecard was recorded on {RETAINER_AS_OF}. Live posting numbers are on the Content & Social tab.
              </p>
            </Card>
            <RetainerClientCard snapshot={snapshot} />
          </>
        ) : (
          <Card padding="md">
            <div className="hq-card-title">No retainer contract</div>
            <p className="hq-text-sm-secondary" style={{ marginTop: 8 }}>{client.name} has no retainer contract in HQ.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
