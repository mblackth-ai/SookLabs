import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { RetainerClientCard } from "@/components/hq/RetainerDeliveryBoard";
import { getRdusaRetainerContractSnapshot } from "@/lib/hq/rdusa-retainer-contract";
import { getJakaRetainerContractSnapshot } from "@/lib/hq/jaka-retainer-contract";
import { RETAINER_AS_OF, RETAINER_GOLDEN_RULE } from "@/lib/hq/retainer-delivery";

export default function RetainersPage() {
  const rdusa = getRdusaRetainerContractSnapshot();
  const jaka = getJakaRetainerContractSnapshot();

  return (
    <div>
      <TopBar
        title="Client retainers"
        subtitle={`Score date ${RETAINER_AS_OF}, Asia/Bangkok. Relays cite the control plane. This is not the four-front engineering board.`}
        actions={<Badge variant="outline" size="sm">Read-first</Badge>}
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: 16 }}>
          <div className="hq-section-label">Retainer Golden Rule</div>
          <p className="hq-text-sm-secondary" style={{ margin: "8px 0 0" }}>{RETAINER_GOLDEN_RULE}</p>
          <p className="hq-text-xs-muted" style={{ margin: "8px 0 0" }}>
            RDUSA Journey readiness stays on the pilot acceptance contract. Jaka is not front number five.
          </p>
        </Card>
        <RetainerClientCard snapshot={rdusa} />
        <RetainerClientCard snapshot={jaka} />
      </div>
    </div>
  );
}
