import { Card } from "./Card";
import { Button } from "./Button";
import { getSeosAppUrl } from "@/lib/hq/paths";

export function QuickLinks() {
  const seosUrl = getSeosAppUrl();
  return (
    <Card padding="md">
      <div className="hq-card-title" style={{ marginBottom: "var(--space-3)" }}>
        Quick links
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Button variant="secondary" size="sm" href="https://sookly.co">
          sookly.co
        </Button>
        <Button variant="secondary" size="sm" href="https://app.sookly.com">
          app.sookly.com
        </Button>
        <Button variant="secondary" size="sm" href={seosUrl}>
          SEOS app
        </Button>
        <Button variant="ghost" size="sm" href="/hq/goals">
          Goals
        </Button>
        <Button variant="ghost" size="sm" href="/hq/sookly/action-plan">
          Sookly board
        </Button>
        <Button variant="ghost" size="sm" href="/hq/seos">
          SEOS project
        </Button>
        <Button variant="ghost" size="sm" href="/hq/seos/authority">
          Authority panel
        </Button>
        <Button variant="ghost" size="sm" href="/hq/briefing">
          Briefing
        </Button>
        <Button variant="ghost" size="sm" href="/hq/decision-log">
          Decisions
        </Button>
      </div>
    </Card>
  );
}
