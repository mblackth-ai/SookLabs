"use client";

import { TopBar } from "./TopBar";
import { LongDate } from "./LongDate";
import { AskAIButton, AskAIFocusCard } from "./AskAIButton";
import { BriefingNotesEditor } from "./BriefingNotesEditor";
import { Card } from "./Card";
import { useAskAI } from "./useAskAI";
import { ContentActionItems } from "./ContentActionItems";
import { EnquiryActionItems } from "./EnquiriesPanel";
import { OpsUnavailable } from "./OpsUnavailable";

export function BriefingWorkspace({ initialData, contentActions, enquiryActions }) {
  const ask = useAskAI();

  return (
    <div>
      <TopBar
        title="Daily Briefing"
        subtitle={<LongDate suffix=" · Notes, Ask AI, agent jobs" />}
        actions={<AskAIButton ask={ask} />}
      />
      <div className="hq-page-content hq-page-content--briefing">
        <Card padding="md" className="hq-briefing-ask-card">
          <div className="hq-card-header" style={{ marginBottom: "var(--space-3)" }}>
            <div>
              <div className="hq-card-title">Ask AI focus</div>
              <p className="hq-briefing-ask-hint">Pick a preset or type a focus — dispatch with Ask AI in the header.</p>
            </div>
          </div>
          <AskAIFocusCard ask={ask} />
        </Card>
        {enquiryActions ? <EnquiryActionItems items={enquiryActions.items} error={enquiryActions.error} /> : null}
        {contentActions ? <ContentActionItems items={contentActions.items} error={contentActions.error} /> : null}
        {initialData ? <BriefingNotesEditor initialData={initialData} /> : <OpsUnavailable what="briefing notes and priorities" />}
      </div>
    </div>
  );
}
