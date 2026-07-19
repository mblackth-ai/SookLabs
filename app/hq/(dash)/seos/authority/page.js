import { TopBar } from "@/components/hq/TopBar";
import { AuthorityOversightClient } from "@/components/hq/AuthorityOversightClient";
import { readAuthoritySummary } from "@/lib/hq/authority-client";
import { getSeosAppUrl } from "@/lib/hq/paths";

export default async function AuthorityOversightPage() {
  const result = await readAuthoritySummary();
  return (
    <div>
      <TopBar
        title="Authority"
        subtitle="Product progress → SEOS. Optional summary from SEOS Authority Tracker — not HQ’s core. SoT stays in SEOS."
      />
      <div className="hq-page-content">
        <AuthorityOversightClient initialResult={result} seosUrl={getSeosAppUrl()} />
      </div>
    </div>
  );
}
