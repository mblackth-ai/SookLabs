import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { RetainerClientCard } from "@/components/hq/RetainerDeliveryBoard";
import { CLIENTS } from "@/lib/hq/clients";
import { getRetainerSnapshot } from "@/lib/hq/retainers";
import { RETAINER_AS_OF, RETAINER_GOLDEN_RULE } from "@/lib/hq/retainer-delivery";

export default function RetainersPage() {
  const snapshots = CLIENTS.map((c) => getRetainerSnapshot(c.retainer)).filter(Boolean);
  return (
    <div>
      <TopBar
        title="Client retainers"
        subtitle={`90-day retainer contracts. Score date ${RETAINER_AS_OF}, Asia/Bangkok.`}
        crumbs={[{ label: "Clients", href: "/hq/clients" }, { label: "Retainers" }]}
        actions={<Badge variant="outline" size="sm">Score date {RETAINER_AS_OF}</Badge>}
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: 16 }}>
          <div className="hq-section-label">Retainer Golden Rule</div>
          <p className="hq-text-sm-secondary" style={{ margin: "8px 0 0" }}>{RETAINER_GOLDEN_RULE}</p>
        </Card>
        {snapshots.map((s) => (
          <RetainerClientCard key={s.clientId} snapshot={s} />
        ))}
      </div>
    </div>
  );
}
