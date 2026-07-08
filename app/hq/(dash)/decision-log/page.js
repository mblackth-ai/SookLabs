import { TopBar } from "@/components/hq/TopBar";
import { DecisionLogEditor } from "@/components/hq/DecisionLogEditor";
import { readOpsData } from "@/lib/hq/ops";

export default async function DecisionLogPage() {
  const ops = await readOpsData();

  return (
    <div>
      <TopBar title="Decision Log" subtitle="Architecture and product decisions · saved to HQ ops" />
      <div className="hq-page-content">
        <DecisionLogEditor initialData={ops} />
      </div>
    </div>
  );
}
