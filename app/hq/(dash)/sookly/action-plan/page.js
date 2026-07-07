import { TopBar } from "@/components/hq/TopBar";
import { ActionPlanBoard } from "@/components/hq/ActionPlanBoard";
import { readOpsData } from "@/lib/hq/ops";

export default function SooklyActionPlanPage() {
  const ops = readOpsData();

  return (
    <div>
      <TopBar
        title="Sookly Action Plan"
        subtitle="sookly.co website + app.sookly.com app workstreams"
      />
      <div className="hq-page-content">
        <ActionPlanBoard initialData={ops} />
      </div>
    </div>
  );
}
