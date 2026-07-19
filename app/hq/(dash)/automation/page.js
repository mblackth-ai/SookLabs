import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { getAgentMode, AGENT_PROVIDERS, getProviderBadge } from "@/lib/hq/agent-provider";

const BADGE_VARIANT = {
  "Workflow Ready": "success",
  Manual: "warning",
  "Future API": "outline",
  "Draft Export": "accent",
};

function envStatus(key) {
  return Boolean(process.env[key]?.trim());
}

export default function AutomationPage() {
  const mode = getAgentMode();
  const webhookConfigured = envStatus("HQ_AGENT_WEBHOOK_URL");
  const callbackConfigured = envStatus("HQ_AGENT_CALLBACK_SECRET");
  const anthropicConfigured = envStatus("ANTHROPIC_API_KEY");
  const n8nBase = process.env.HQ_N8N_BASE_URL?.trim() || "";

  const providers = [
    {
      id: "n8n",
      label: "n8n (orchestrator)",
      badge: getProviderBadge("n8n", { webhookConfigured }),
      note: webhookConfigured
        ? "HQ_AGENT_WEBHOOK_URL set — Ask AI / cron POST here"
        : "Optional. Without it, jobs stay in the pending queue for Cursor/Codex poll or manual callback.",
      href: n8nBase || null,
    },
    ...AGENT_PROVIDERS.filter((p) => p.id !== "n8n").map((p) => ({
      ...p,
      badge: getProviderBadge(p.id, { webhookConfigured }),
      note:
        p.id === "cursor"
          ? "1) GET /hq/api/agents/pending?provider=cursor  2) run the job  3) POST /hq/api/agents/callback with Bearer HQ_AGENT_CALLBACK_SECRET"
          : p.id === "codex"
            ? "Same pending → callback loop, or scripts/hq-agent-runner.example.mjs"
            : "Manual / n8n Manual Task — paste result into callback",
    })),
    {
      id: "anthropic",
      label: "Anthropic API",
      badge: "Future API",
      note: anthropicConfigured
        ? "Key present — enable with HQ_AGENT_MODE=anthropic"
        : "Not required for MVP webhook mode",
    },
  ];

  return (
    <div>
      <TopBar
        title="LLM & Agents"
        subtitle="Honest sync status for agent providers — no fake Connected badges"
      />
      <div className="hq-page-content">
        <Card padding="md">
          <div className="hq-card-header">
            <span className="hq-card-title">Agent mode</span>
            <Badge variant={mode === "webhook" ? "success" : "accent"} size="sm">
              {mode}
            </Badge>
          </div>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "8px 0 0" }}>
            MVP default is <strong>webhook</strong>: jobs queue in ops. Complete them via n8n webhook, Cursor pending poll, or
            callback. No LLM API keys required in Vercel.
          </p>
          <div className="hq-grid-2" style={{ marginTop: 16, gap: 12 }}>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
              Callback secret:{" "}
              <Badge variant={callbackConfigured ? "success" : "warning"} size="sm">
                {callbackConfigured ? "Set" : "Missing"}
              </Badge>
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
              Webhook URL:{" "}
              <Badge variant={webhookConfigured ? "success" : "warning"} size="sm">
                {webhookConfigured ? "Set" : "Optional / unset"}
              </Badge>
            </div>
          </div>
        </Card>

        {!webhookConfigured && (
          <Card padding="md" style={{ marginTop: "var(--space-3)" }}>
            <div className="hq-card-title" style={{ marginBottom: 8 }}>
              Complete Ask AI without n8n
            </div>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: "var(--text-sm)", color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <li>
                After Ask AI, poll <code>GET /hq/api/agents/pending?provider=cursor</code>
              </li>
              <li>Run the job in Cursor / Codex / Claude with the payload context</li>
              <li>
                <code>POST /hq/api/agents/callback</code> with header{" "}
                <code>Authorization: Bearer $HQ_AGENT_CALLBACK_SECRET</code> and body{" "}
                <code>{`{ "jobId", "status": "completed", "text" }`}</code>
              </li>
            </ol>
          </Card>
        )}

        <div className="hq-grid-2" style={{ gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
          {providers.map((p) => (
            <Card key={p.id} padding="md">
              <div className="hq-card-header" style={{ marginBottom: 8 }}>
                <div className="hq-card-title">{p.label}</div>
                <Badge variant={BADGE_VARIANT[p.badge] || "outline"} size="sm">
                  {p.badge}
                </Badge>
              </div>
              <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>{p.note}</p>
              {p.href && (
                <a
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: "var(--text-xs)", marginTop: 10, display: "inline-block" }}
                >
                  Open n8n →
                </a>
              )}
            </Card>
          ))}
        </div>

        <Card padding="md" style={{ marginTop: "var(--space-3)" }}>
          <div className="hq-card-title" style={{ marginBottom: 8 }}>
            Endpoints
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            <li>
              <code>POST /hq/api/agents/dispatch</code> — session; create running job + optional webhook
            </li>
            <li>
              <code>POST /hq/api/agents/callback</code> — Bearer <code>HQ_AGENT_CALLBACK_SECRET</code>; write briefing
            </li>
            <li>
              <code>GET /hq/api/agents/pending?provider=cursor</code> — poll queue for Cursor / Codex runners
            </li>
            <li>
              <code>POST /hq/api/briefing/ask</code> — Ask AI (uses agent provider)
            </li>
            <li>
              <code>POST /hq/api/cron/morning</code> — morning cron (webhook or anthropic)
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
