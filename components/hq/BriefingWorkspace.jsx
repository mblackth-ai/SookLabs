"use client";

import { TopBar } from "./TopBar";
import { LongDate } from "./LongDate";
import { AskAIButton, AskAIFocusCard } from "./AskAIButton";
import { BriefingNotesEditor } from "./BriefingNotesEditor";
import { Card } from "./Card";
import { useAskAI } from "./useAskAI";

export function BriefingWorkspace({ initialData }) {
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
        <BriefingNotesEditor initialData={initialData} />
      </div>
    </div>
  );
}
