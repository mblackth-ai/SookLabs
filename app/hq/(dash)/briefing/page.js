import { TopBar } from "@/components/hq/TopBar";
import { LongDate } from "@/components/hq/LongDate";
import { AskAIButton } from "@/components/hq/AskAIButton";
import { BriefingNotesEditor } from "@/components/hq/BriefingNotesEditor";
import { readOpsData } from "@/lib/hq/ops";

export default async function BriefingPage() {
  const ops = await readOpsData();

  return (
    <div>
      <TopBar
        title="Daily Briefing"
        subtitle={<LongDate suffix=" · Notes, Ask AI, agent jobs" />}
        actions={<AskAIButton showFocus />}
      />
      <div className="hq-page-content hq-page-content--narrow">
        <BriefingNotesEditor initialData={ops} />
      </div>
    </div>
  );
}
