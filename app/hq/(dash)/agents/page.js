import { TopBar } from "@/components/hq/TopBar";
import { Button } from "@/components/hq/Button";
import { StatusDot } from "@/components/hq/StatusDot";
import { AgentCard } from "@/components/hq/AgentCard";
import { agents } from "@/lib/hq/mock-data";

export default function AgentsPage() {
  const running = agents.filter((a) => a.status === "running").length;
  return (
    <div>
      <TopBar
        title="AI Agents"
        subtitle="Department intelligence — autonomous agents that observe, analyse and surface recommendations."
        actions={
          <>
            <StatusDot status="ai" pulse label={`${running} running`} />
            <Button variant="secondary" size="sm">
              Configure
            </Button>
          </>
        }
      />
      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {agents.map((a, i) => (
          <AgentCard key={i} {...a} />
        ))}
      </div>
    </div>
  );
}
