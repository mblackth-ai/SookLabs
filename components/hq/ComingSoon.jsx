import { TopBar } from "./TopBar";
import { Button } from "./Button";
import { Card } from "./Card";

export function ComingSoon({ title, subtitle }) {
  return (
    <div>
      <TopBar title={title} subtitle={subtitle || "Not in HQ MVP1 — use Overview boards instead."} />
      <div className="hq-page-content">
        <Card padding="md">
          <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.6 }}>
            This surface is deferred. The daily command centre lives on Overview, Goals, boards, Decisions, and Briefing.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button href="/hq" size="sm">
              Overview
            </Button>
            <Button href="/hq/sookly/action-plan" variant="secondary" size="sm">
              Sookly board
            </Button>
            <Button href="/hq/seos" variant="ghost" size="sm">
              SEOS hub
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
