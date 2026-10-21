import { notFound } from "next/navigation";
import { TopBar } from "@/components/hq/TopBar";
import { Button } from "@/components/hq/Button";
import { ClientSectionTabs } from "@/components/hq/ClientSectionTabs";
import { BusinessContentCard, ContentUnavailable } from "@/components/hq/ContentSocialBoard";
import { readContentSummary } from "@/lib/hq/content-client";
import { businessSummary } from "@/lib/hq/content-summary.js";
import { getClient } from "@/lib/hq/clients";
import { getSeosAppUrl } from "@/lib/hq/paths";

export const dynamic = "force-dynamic";

export default async function ClientContentPage({ params }) {
  const { slug } = await params;
  const client = getClient(slug);
  if (!client) notFound();
  const result = await readContentSummary();
  const b = businessSummary(result, client.seosBusiness);
  const seosUrl = getSeosAppUrl();
  return (
    <div>
      <TopBar
        title={`${client.short}: Content & Social`}
        subtitle="Scheduled and published posts, gap days, failed or blocked posts and publisher health, read from SEOS."
        crumbs={[{ label: "Clients", href: "/hq/clients" }, { label: client.short, href: `/hq/clients/${client.slug}` }, { label: "Content & Social" }]}
        actions={<Button variant="secondary" size="sm" href={seosUrl}>Open in SEOS</Button>}
      />
      <div className="hq-page-content">
        <ClientSectionTabs client={client} active="content" />
        {b ? <BusinessContentCard b={b} seosUrl={seosUrl} /> : <ContentUnavailable result={result} seosUrl={seosUrl} />}
      </div>
    </div>
  );
}
