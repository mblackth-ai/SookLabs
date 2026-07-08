import { TopBar } from "@/components/hq/TopBar";
import { Button } from "@/components/hq/Button";
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
        subtitle={<LongDate suffix=" · Your notes and priorities" />}
        actions={
          <>
            <Button variant="secondary" size="sm" disabled title="Not available in v1">
              Export PDF
            </Button>
            <AskAIButton />
          </>
        }
      />
      <div className="hq-page-content hq-page-content--narrow">
        <BriefingNotesEditor initialData={ops} />
      </div>
    </div>
  );
}
