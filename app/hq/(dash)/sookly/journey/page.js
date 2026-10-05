import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { SooklyJourneyKanban } from "@/components/hq/SooklyJourneyKanban";
import { SooklyJourneySignalLab } from "@/components/hq/SooklyJourneySignalLab";

export const metadata = {
  title: "Sookly Journey — SookLabs HQ",
  description: "RDUSA order journey kanban, integrations, and next actions (HQ pilot).",
};

export default function SooklyJourneyPage() {
  return (
    <div>
      <TopBar
        title="Sookly Journey / CRM"
        subtitle="Prospect → supplier → quote → payment → fulfilment. Pilot data in HQ until app.sookly.com syncs."
        actions={
          <Badge variant="outline" size="sm">
            Pilot
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            Canonical SOP:{" "}
            <code>docs/SOOKLY-JOURNEY-RDUSA-SOP.md</code>. Integrations:{" "}
            <code>docs/SOOKLY-INTEGRATIONS.md</code>. Product repo:{" "}
            <code>mblackth-ai/sookly-omnichat</code> (not reachable from this agent — HQ mirrors acceptance here).
          </p>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "12px 0 0", lineHeight: 1.6 }}>
            <Link href="/hq/sookly/action-plan" style={{ color: "var(--text-accent)" }}>
              MVP1 action plan
            </Link>{" "}
            tracks build tasks; this board tracks case stage and suggested next actions.
          </p>
        </Card>
        <SooklyJourneyKanban />
        <SooklyJourneySignalLab />
      </div>
    </div>
  );
}
