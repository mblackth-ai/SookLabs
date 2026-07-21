import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { getSeosAppUrl } from "@/lib/hq/paths";

const PROJECT_LINKS = [
  {
    title: "Open SEOS app",
    subtitle: "Operator desk: Context, Refactor, Authority",
    href: null,
    external: true,
    badge: "External",
  },
  {
    title: "Authority",
    subtitle: "Optional product-progress panel — SoT and operator work stay in SEOS",
    href: "/hq/seos/authority",
    badge: "Panel",
  },
  {
    title: "Social GTM",
    subtitle: "Founder build board for social adapters",
    href: "/hq/seos/social-gtm",
    badge: "Board",
  },
];

export default function SeosHubPage() {
  const seosUrl = getSeosAppUrl();

  return (
    <div>
      <TopBar
        title="SEOS"
        subtitle="Outgoing control product. HQ tracks progress; execution lives in the SEOS app."
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            Knowledge Base mirrors, semantic readiness, content gaps, and exports are operated in{" "}
            <strong>SEOS Simple Mode</strong> — not duplicated here. Use Open SEOS for those surfaces.
          </p>
        </Card>
        <div className="hq-grid-2" style={{ gap: "var(--space-3)" }}>
          {PROJECT_LINKS.map((link) => {
            const href = link.external ? seosUrl : link.href;
            return (
              <Link key={link.title} href={href} className="hq-tile-link">
                <Card padding="md" className="hq-card--tile">
                  <div className="hq-card-header hq-mb-2">
                    <div className="hq-card-title">{link.title}</div>
                    <Badge variant="outline" size="sm">
                      {link.badge}
                    </Badge>
                  </div>
                  <p className="hq-text-sm-secondary">{link.subtitle}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
