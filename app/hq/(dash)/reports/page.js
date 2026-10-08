import { TopBar } from "@/components/hq/TopBar";
import { ReportsBoard } from "@/components/hq/ReportsBoard";
import { OwnerAccessPanel } from "@/components/hq/OwnerAccessPanel";
import { readAnalyticsSummary } from "@/lib/hq/analytics-client";
import { getSeosAppUrl } from "@/lib/hq/paths";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ searchParams }) {
  const params = await searchParams;
  const selected = typeof params?.business === "string" ? params.business : null;
  const result = await readAnalyticsSummary(6);
  return (
    <div>
      <TopBar
        title="Reports"
        subtitle="Rankings and traffic for each business we manage, read from SEOS. Outriggers and Slatwall first for RDUSA."
      />
      <div className="hq-page-content">
        <div style={{ display: "grid", gap: 24 }}>
          <ReportsBoard result={result} seosUrl={getSeosAppUrl()} selected={selected} />
          {result.ok && result.data.workspaces.length > 0 && (
            <OwnerAccessPanel businesses={result.data.workspaces.map((w) => ({ slug: w.slug, name: w.name }))} />
          )}
        </div>
      </div>
    </div>
  );
}
