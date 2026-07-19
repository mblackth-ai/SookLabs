import { TopBar } from "@/components/hq/TopBar";
import { GoalsPanel } from "@/components/hq/GoalsPanel";
import { BlockersPanel } from "@/components/hq/BlockersPanel";
import { readOpsData } from "@/lib/hq/ops";

export default async function GoalsPage() {
  const ops = await readOpsData();
  return (
    <div>
      <TopBar
        title="Goals & blockers"
        subtitle="Long-horizon outcomes and open blockers — not a product CRM."
      />
      <div className="hq-page-content">
        <div id="goals">
          <GoalsPanel initialData={ops} />
        </div>
        <div id="blockers" style={{ marginTop: 16 }}>
          <BlockersPanel initialData={ops} />
        </div>
      </div>
    </div>
  );
}
