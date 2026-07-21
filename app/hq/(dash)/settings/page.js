import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { getAgentMode } from "@/lib/hq/agent-provider";
import { getOpsStorageMode } from "@/lib/hq/ops";
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

function envTone(ok, warn = false) {
  if (ok) return "ok";
  if (warn) return "warn";
  return "muted";
}

export default function SettingsPage() {
  const seosUrl = getSeosAppUrl();
  const storage = getOpsStorageMode();
  const hasHqDb = envSet("HQ_DATABASE_URL") || envSet("DATABASE_URL");
  const hasSeosToken = tokenConfigured();
  const hasWebhook = envSet("HQ_AGENT_WEBHOOK_URL");
  const hasN8nBase = envSet("HQ_N8N_BASE_URL");
  const hasCallback = envSet("HQ_AGENT_CALLBACK_SECRET");
  const hasCron = envSet("HQ_CRON_SECRET") || envSet("CRON_SECRET");
  const agentMode = getAgentMode();
  const webhookHost = webhookHostHint();

  const envRows = [
    {
      label: "Ops store",
      value: hasHqDb ? "Postgres" : "File (ops.json)",
      tone: envTone(hasHqDb, !hasHqDb),
    },
    {
      label: "SEOS Authority token",
      value: hasSeosToken ? "configured" : "not set",
      tone: envTone(hasSeosToken),
    },
    {
      label: "Agent webhook",
      value: hasWebhook ? `set${webhookHost ? ` · ${webhookHost}` : ""}` : "optional / unset",
      tone: envTone(hasWebhook),
    },
    {
      label: "n8n base URL",
      value: hasN8nBase ? "set" : "optional / unset",
      tone: envTone(hasN8nBase),
    },
    {
      label: "Callback secret",
      value: hasCallback ? "set" : "missing",
      tone: envTone(hasCallback, !hasCallback),
    },
    {
      label: "Cron secret",
      value: hasCron ? "set" : "missing",
      tone: envTone(hasCron, !hasCron),
    },
    {
      label: "Agent mode",
      value: agentMode,
      tone: "muted",
    },
    {
      label: "Sync badges policy",
      value: "Manual / Draft / Workflow Ready / Future API",
      tone: "muted",
    },
  ];

  return (
    <div>
      <TopBar
        title="Settings"
        subtitle="Private founder HQ — access, links, and storage honesty."
        actions={
          <Badge
            variant={storage === "postgres" ? "success" : "warning"}
            size="sm"
            title={
              storage === "file"
                ? "File ops.json may reset on serverless deploys — set HQ_DATABASE_URL"
                : "Postgres ops store"
            }
          >
            {storage === "postgres" ? "Ops: Postgres" : "Ops: File"}
          </Badge>
        }
      />
      <div className="hq-page-content hq-stack-3">
        <Card padding="md">
          <div className="hq-card-title">Access</div>
          <p className="hq-text-sm-secondary hq-mt-2">
            HQ uses a shared password session (<code>HQ_ACCESS_PASSWORD</code>). This is a private command centre, not
            multi-user SaaS IAM.
          </p>
        </Card>
        <Card padding="md">
          <div className="hq-card-title">Product links</div>
          <ul className="hq-text-sm-secondary hq-mt-2" style={{ paddingLeft: 18, lineHeight: 1.7 }}>
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
          <dl className="hq-env-list">
            {envRows.map((row) => (
              <div key={row.label} className="hq-env-row">
                <dt className="hq-env-key">{row.label}</dt>
                <dd className={`hq-env-value hq-env-value--${row.tone}`}>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="hq-text-sm-secondary hq-mt-3">
            Webhook set ≠ Connected social/OAuth. It only means Ask AI / morning can POST to n8n. Completion still uses
            callback or Cursor pending poll — never fake “Live” sync.
          </p>
          {!hasHqDb && (
            <p className="hq-text-sm-secondary hq-mt-3" style={{ color: "var(--color-warning)" }}>
              Production on Vercel should set <code>HQ_DATABASE_URL</code>. File mode can wipe founder ops on redeploy.
            </p>
          )}
          {hasHqDb && (
            <p className="hq-text-xs-muted hq-mt-3">
              Durable ops enabled via <code>HQ_DATABASE_URL</code>. Confirm Overview badge shows Postgres after deploy.
            </p>
          )}
          <p className="hq-text-xs-muted hq-mt-3">
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
