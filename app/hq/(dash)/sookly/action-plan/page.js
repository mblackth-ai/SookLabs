import { TopBar } from "@/components/hq/TopBar";
import { ActionPlanBoard } from "@/components/hq/ActionPlanBoard";
import { readOpsData } from "@/lib/hq/ops";

export default async function SooklyActionPlanPage() {
  const ops = await readOpsData();

  return (
    <div>
      <TopBar
        title="Sookly MVP1 Action Plan"
        subtitle="sookly.co website + app.sookly.com — primary build checklist"
        crumbs={[
          { label: "Overview", href: "/hq" },
          { label: "Sookly", href: "/hq/sookly" },
          { label: "Action Plan" },
        ]}
      />
      <div className="hq-page-content">
        <ActionPlanBoard initialData={ops} streamKeys={["sooklyWebsite", "sooklyApp"]} columns={2} />
      </div>
    </div>
  );
}
