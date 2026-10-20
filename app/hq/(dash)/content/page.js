import { TopBar } from "@/components/hq/TopBar";
import { Button } from "@/components/hq/Button";
import { ContentSocialBoard } from "@/components/hq/ContentSocialBoard";
import { readContentSummary } from "@/lib/hq/content-client";
import { CLIENTS } from "@/lib/hq/clients";
import { getSeosAppUrl } from "@/lib/hq/paths";

export const dynamic = "force-dynamic";

export default async function ContentSocialPage() {
  const result = await readContentSummary();
  const seosUrl = getSeosAppUrl();
  return (
    <div>
      <TopBar
        title="Content & Social"
        subtitle="Scheduled and published posts per business, gap days, failed or blocked posts and approvals, read from SEOS."
        actions={<Button variant="secondary" size="sm" href={seosUrl}>Open SEOS calendar</Button>}
      />
      <div className="hq-page-content">
        <ContentSocialBoard result={result} seosUrl={seosUrl} clientSlugs={CLIENTS.map((c) => c.slug)} />
      </div>
    </div>
  );
}
