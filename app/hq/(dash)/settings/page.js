import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { getAgentMode } from "@/lib/hq/agent-provider";
import { getSeosAppUrl } from "@/lib/hq/paths";

function envSet(key) {
  return Boolean(process.env[key]?.trim());
}

function tokenConfigured() {
  const t = process.env.SEOS_HQ_API_TOKEN?.trim();
  return Boolean(t && !t.startsWith("change-me"));
}

function webhookHostHint() {
  const url = process.env.HQ_AGENT_WEBHOOK_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return "(invalid URL)";
  }
}

export default function SettingsPage() {
  const seosUrl = getSeosAppUrl();
  const hasHqDb = envSet("HQ_DATABASE_URL") || envSet("DATABASE_URL");
  const hasSeosToken = tokenConfigured();
  const hasWebhook = envSet("HQ_AGENT_WEBHOOK_URL");
  const hasN8nBase = envSet("HQ_N8N_BASE_URL");
  const hasCallback = envSet("HQ_AGENT_CALLBACK_SECRET");
  const hasCron = envSet("HQ_CRON_SECRET") || envSet("CRON_SECRET");
  const agentMode = getAgentMode();
  const webhookHost = webhookHostHint();

  return (
    <div>
      <TopBar
        title="Settings"
        subtitle="Private founder HQ — access, links, and storage honesty."
      />
      <div className="hq-page-content" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card padding="md">
          <div className="hq-card-title">Access</div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.6 }}>
            HQ uses a shared password session (<code>HQ_ACCESS_PASSWORD</code>). This is a private command centre, not
            multi-user SaaS IAM.
          </p>
        </Card>
        <Card padding="md">
          <div className="hq-card-title">Product links</div>
          <ul style={{ marginTop: 8, paddingLeft: 18, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.7 }}>
            <li>
              SEOS operator desk:{" "}
              <a href={seosUrl} style={{ color: "var(--text-accent)" }}>
                {seosUrl}
              </a>
            </li>
            <li>Sookly product: https://sookly.co</li>
            <li>Public brand: https://sooklabs.com</li>
          </ul>
        </Card>
        <Card padding="md">
          <div className="hq-card-title">Environment health</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <Badge variant={hasHqDb ? "success" : "outline"} size="sm">
              Ops store: {hasHqDb ? "Postgres" : "File (ops.json)"}
            </Badge>
            <Badge variant={hasSeosToken ? "success" : "outline"} size="sm">
              SEOS Authority token: {hasSeosToken ? "configured" : "not set"}
            </Badge>
            <Badge variant={hasWebhook ? "success" : "outline"} size="sm">
              Agent webhook: {hasWebhook ? `set${webhookHost ? ` · ${webhookHost}` : ""}` : "optional / unset"}
            </Badge>
            <Badge variant={hasN8nBase ? "success" : "outline"} size="sm">
              n8n base URL: {hasN8nBase ? "set" : "optional / unset"}
            </Badge>
            <Badge variant={hasCallback ? "success" : "outline"} size="sm">
              Callback secret: {hasCallback ? "set" : "missing"}
            </Badge>
            <Badge variant={hasCron ? "success" : "outline"} size="sm">
              Cron secret: {hasCron ? "set" : "missing"}
            </Badge>
            <Badge variant="outline" size="sm">
              Agent mode: {agentMode}
            </Badge>
            <Badge variant="outline" size="sm">
              Sync badges: Manual / Draft / Workflow Ready / Future API only
            </Badge>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginTop: 12, lineHeight: 1.6 }}>
            Webhook set ≠ Connected social/OAuth. It only means Ask AI / morning can POST to n8n. Completion still uses
            callback or Cursor pending poll — never fake “Live” sync.
          </p>
          {!hasHqDb && (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-warning)", marginTop: 12, lineHeight: 1.6 }}>
              Production on Vercel should set <code>HQ_DATABASE_URL</code>. File mode can wipe founder ops on redeploy.
            </p>
          )}
          {hasHqDb && (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginTop: 12, lineHeight: 1.6 }}>
              Durable ops enabled via <code>HQ_DATABASE_URL</code>. Confirm Overview badge shows Postgres after deploy.
            </p>
          )}
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-tertiary)", marginTop: 12, lineHeight: 1.6 }}>
            Agent wiring:{" "}
            <a href="/hq/automation" style={{ color: "var(--text-accent)" }}>
              LLM &amp; Agents
            </a>
            {" · "}
            SEOS URL in use: <code>{seosUrl}</code>
          </p>
        </Card>
      </div>
    </div>
  );
}
