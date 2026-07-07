import { TopBar } from "@/components/hq/TopBar";
import { Button } from "@/components/hq/Button";
import { Badge } from "@/components/hq/Badge";
import { StatusDot } from "@/components/hq/StatusDot";
import { AgentCard } from "@/components/hq/AgentCard";
import { agents } from "@/lib/hq/mock-data";

export default function AgentsPage() {
  const running = agents.filter((a) => a.status === "running").length;
  return (
    <div>
      <TopBar
        title="AI Agents"
        subtitle="Reference demo — not connected to live agents or integrations."
        actions={
          <>
            <Badge variant="neutral" size="sm">
              Reference
            </Badge>
            <StatusDot status="ai" pulse label={`${running} running (mock)`} />
            <Button variant="secondary" size="sm" disabled title="Not available in v1">
              Configure
            </Button>
          </>
        }
      />      <div className="hq-page-content hq-page-content--grid hq-grid-3">
        {agents.map((a, i) => (
          <AgentCard key={i} {...a} />
        ))}
      </div>
    </div>
  );
}
