import { TopBar } from "@/components/hq/TopBar";
import { Card } from "@/components/hq/Card";
import { Badge } from "@/components/hq/Badge";
import { CommandCenterProjectList } from "@/components/seos/CommandCenterProjectList";
import { getCommandCenterRollups } from "@/lib/seos/command-center";

export default async function CommandCenterPage() {
  const rollups = await getCommandCenterRollups();

  return (
    <div>
      <TopBar
        title="Command Center"
        subtitle="Oversee agents by project — connections and workflows with honest Manual / Draft Export badges."
        actions={
          <Badge variant="warning" size="sm" caps>
            Manual / Draft Export
          </Badge>
        }
      />
      <div className="hq-page-content">
        <Card padding="md" style={{ marginBottom: 16 }}>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
            Config-driven v1 — no live Meta Graph polling. <strong>Connected</strong> appears only when health is
            verified in config. Unknown timestamps stay <em>unknown</em>.
          </p>
        </Card>
        <CommandCenterProjectList rollups={rollups} />
      </div>
    </div>
  );
}
