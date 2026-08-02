import { TopBar } from "@/components/hq/TopBar";
import { ActionPlanBoard } from "@/components/hq/ActionPlanBoard";
import { PlatformMatrixCard } from "@/components/hq/PlatformMatrixCard";
import { Badge } from "@/components/hq/Badge";
import { Card } from "@/components/hq/Card";
import { ClickPlaySandbox } from "@/components/hq/ClickPlaySandbox";
import { readOpsData } from "@/lib/hq/ops";

const REDDIT_FOUNDER_LINKS = [
  {
    label: "Founder submit checklist",
    href: "https://github.com/mblackth-ai/SEOS/blob/main/docs/REDDIT_FOUNDER_SUBMIT.md",
  },
  {
    label: "Access request pack",
    href: "https://github.com/mblackth-ai/SEOS/blob/main/docs/REDDIT_ACCESS_REQUEST_PACK.md",
  },
  { label: "Privacy (live)", href: "https://sooklabs.com/privacy" },
  { label: "Terms (live)", href: "https://sooklabs.com/terms" },
  {
    label: "Responsible Builder Policy",
    href: "https://support.reddithelp.com/hc/en-us/articles/42728983564564-Responsible-Builder-Policy",
  },
  { label: "Reddit Help request form", href: "https://support.reddithelp.com/hc/en-us/requests/new" },
];

export default async function SeosSocialGtmPage() {
  const ops = await readOpsData();
  const redditJobs = (ops.workstreams?.seosSocial?.items || []).filter((i) => i.platform === "reddit");
  const redditOpen = redditJobs.filter((i) => i.status !== "done");
  const redditDone = redditJobs.filter((i) => i.status === "done").length;

  return (
    <div>
      <TopBar
        title="SEOS Social GTM"
        subtitle="Content refactor → multi-platform draft · click-and-play — no live OAuth"
        crumbs={[
          { label: "Overview", href: "/hq" },
          { label: "SEOS", href: "/hq/seos" },
          { label: "Social GTM" },
        ]}
        actions={
          <Badge variant="warning" size="sm">
            Manual · 0 OAuth
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: "var(--space-4)" }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.55 }}>
            Generate a Draft Export pack below, then tick the durable board. Platforms stay Manual / Draft / Future OAuth
            until you approve credentials. Business facts stay in SEOS Knowledge Base.
          </p>
        </Card>

        <Card padding="md" style={{ marginBottom: "var(--space-4)" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: "var(--space-3)",
            }}
          >
            <div>
              <div className="hq-card-title">Reddit readiness</div>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)", margin: "6px 0 0", lineHeight: 1.5 }}>
                Legal + access pack done. Your remaining action: submit the commercial Reddit request, then stay Manual
                until approval.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge variant="success" size="sm">
                {redditDone} Reddit jobs done
              </Badge>
              <Badge variant={redditOpen.length ? "warning" : "neutral"} size="sm">
                {redditOpen.length ? `${redditOpen.length} open` : "Board clear"}
              </Badge>
              <Badge variant="neutral" size="sm">
                Mode · Manual
              </Badge>
            </div>
          </div>
          <ol
            style={{
              margin: "0 0 var(--space-3)",
              paddingLeft: 18,
              fontSize: "var(--text-sm)",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            <li>Open the founder submit doc and paste the use-case block into Reddit Help</li>
            <li>File as commercial — SEOS is a product (identity + read scopes first)</li>
            <li>Save the ticket ID into HQ briefing / decisions</li>
            <li>Do not flip Connected or build live OAuth UI until Reddit says yes</li>
          </ol>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {REDDIT_FOUNDER_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hq-navlink"
                style={{
                  fontSize: "var(--text-xs)",
                  padding: "6px 10px",
                  border: "1px solid var(--border-faint)",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "var(--text-secondary)",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </Card>

        <ClickPlaySandbox sectionId="seosSocial" />
        <div className="hq-grid-2" style={{ alignItems: "start", marginBottom: "var(--space-4)" }}>
          <PlatformMatrixCard platforms={ops.platformMatrix} />
          <Card padding="md">
            <div className="hq-card-title" style={{ marginBottom: "var(--space-2)" }}>
              Target platforms (7)
            </div>
            <ol
              style={{
                margin: 0,
                paddingLeft: 18,
                fontSize: "var(--text-sm)",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              <li>Facebook Page — Future OAuth · Graph</li>
              <li>Instagram — Future OAuth · draft media</li>
              <li>TikTok — Manual → Future OAuth</li>
              <li>
                Reddit — Manual · RBP gate · founder submit next · never fake Connected
              </li>
              <li>LinkedIn — Draft → Future OAuth (stub provisioned)</li>
              <li>X (Twitter) — Draft → Future OAuth (stub provisioned)</li>
              <li>Threads — Manual (#7)</li>
            </ol>
          </Card>
        </div>
        <ActionPlanBoard initialData={ops} streamKeys={["seosSocial"]} columns={1} />
      </div>
    </div>
  );
}
