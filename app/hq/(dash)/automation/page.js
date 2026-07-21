import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { AutomationConsole } from "@/components/hq/AutomationConsole";
import { getAgentMode, AGENT_PROVIDERS, getProviderBadge } from "@/lib/hq/agent-provider";
import { readOpsData } from "@/lib/hq/ops";

function envStatus(key) {
  return Boolean(process.env[key]?.trim());
}

export default async function AutomationPage() {
  const ops = await readOpsData();
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
        ? "Auto-briefing live: Ask AI / Run morning → OpenAI on n8n → HQ callback (no copy-paste)"
        : "Optional. Without it, jobs stay in the pending queue for Cursor poll or Complete below.",
    },
    ...AGENT_PROVIDERS.filter((p) => p.id !== "n8n").map((p) => ({
      ...p,
      badge: getProviderBadge(p.id, { webhookConfigured }),
      note:
        p.id === "cursor"
          ? webhookConfigured
            ? "Default provider — n8n auto-generates briefing + callback. Copy Cursor prompt is fallback only."
            : "One-click: Copy Cursor prompt → run in Cursor → Complete (paste briefing)."
          : p.id === "codex"
            ? "Manual / scripts/hq-agent-runner.example.mjs — same pending → callback loop"
            : "Manual: Complete in HQ with pasted Claude reply",
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

  const initialJobs = (ops.agentJobs || []).slice(0, 12);

  return (
    <div>
      <TopBar
        title="LLM & Agents"
        subtitle="One-click dispatch + complete — honest Workflow Ready / Manual / Future API badges"
      />
      <div className="hq-page-content">
        <AutomationConsole
          mode={mode}
          webhookConfigured={webhookConfigured}
          callbackConfigured={callbackConfigured}
          anthropicConfigured={anthropicConfigured}
          n8nBase={n8nBase}
          providers={providers}
          initialJobs={initialJobs}
        />

        <Card padding="md" style={{ marginTop: "var(--space-3)" }}>
          <div className="hq-card-title" style={{ marginBottom: 8 }}>
            Endpoints
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
            <li>
              <code>POST /hq/api/briefing/ask</code> — Ask AI (session)
            </li>
            <li>
              <code>POST /hq/api/cron/morning</code> — morning dispatch (session or cron secret)
            </li>
            <li>
              <code>GET /hq/api/agents/pending</code> — poll queue (session or secret)
            </li>
            <li>
              <code>POST /hq/api/agents/callback</code> — complete briefing (session or callback secret)
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
