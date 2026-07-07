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
        <Button variant="ghost" size="sm" href="/audit">
          SEO Audit
        </Button>
        <Button variant="ghost" size="sm" href="/hq/sookly/action-plan">
          Sookly action plan
        </Button>
      </div>
    </Card>
  );
}
