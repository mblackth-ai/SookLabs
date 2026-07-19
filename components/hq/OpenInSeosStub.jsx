import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { getSeosAppUrl } from "@/lib/hq/paths";

/**
 * Thin HQ stub for SEOS operator surfaces — no fake completeness scores.
 * Operator work lives in the SEOS app (Knowledge Base, Refactor, etc.).
 */
export function OpenInSeosStub({ title, blurb }) {
  const seosUrl = getSeosAppUrl();
  return (
    <div>
      <TopBar
        title={title}
        subtitle="Projects → SEOS · open the SEOS app for operator work"
        actions={
          <Badge variant="outline" size="sm">
            Open in SEOS
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md">
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            {blurb ||
              "This surface is operated in SEOS Simple Mode. HQ does not maintain a parallel Knowledge Base or SEO scoreboard."}
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Button href={seosUrl} external size="sm">
              Open SEOS app
            </Button>
            <Button href="/hq/seos" variant="secondary" size="sm">
              SEOS hub
            </Button>
            <Button href="/hq/seos/authority" variant="ghost" size="sm">
              Authority panel
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
