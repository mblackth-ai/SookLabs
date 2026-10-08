import { TopBar } from "@/components/hq/TopBar";
import { ReportsBoard } from "@/components/hq/ReportsBoard";
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
        <ReportsBoard result={result} seosUrl={getSeosAppUrl()} selected={selected} />
      </div>
    </div>
  );
}
