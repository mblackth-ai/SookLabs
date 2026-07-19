import { TopBar } from "@/components/hq/TopBar";
import { Badge } from "@/components/hq/Badge";
import { Button } from "@/components/hq/Button";
import { LongDate } from "@/components/hq/LongDate";
import { PriorityList } from "@/components/hq/PriorityList";
import { TopOpenItems } from "@/components/hq/TopOpenItems";
import { PortfolioStrip } from "@/components/hq/PortfolioStrip";
import { OpsAttentionList } from "@/components/hq/OpsAttentionList";
import { MorningLoopCard } from "@/components/hq/MorningLoopCard";
import { GoalsPanel } from "@/components/hq/GoalsPanel";
import { BlockersPanel } from "@/components/hq/BlockersPanel";
import { EndOfDayCard } from "@/components/hq/EndOfDayCard";
import { AgentJobLog } from "@/components/hq/AgentJobLog";
import {
  readOpsData,
  getTopOpenItems,
  getPortfolioSummary,
  getOpsAttention,
  getMergedBlockers,
  getOpsStorageMode,
} from "@/lib/hq/ops";

export default async function OverviewPage() {
  const ops = await readOpsData();
  const storage = getOpsStorageMode();
  const topOpen = getTopOpenItems(ops, 5);
  const portfolio = getPortfolioSummary(ops);
  const attention = getOpsAttention(ops);
  const blockers = getMergedBlockers(ops);
  const openPriorities = ops.todayPriorities.filter((p) => !p.done).length;
  const openTasks = Object.values(ops.workstreams || {}).reduce(
    (n, s) => n + (s.items || []).filter((i) => i.status !== "done").length,
    0
  );
  const activeGoals = (ops.goals || []).filter((g) => g.status === "active").length;

  return (
    <div>
      <TopBar
        title="Good morning."
        subtitle={<LongDate suffix=" · Private founder command centre." />}
        actions={
          <Button variant="secondary" size="sm" href="/hq/briefing">
            Briefing · Ask AI
          </Button>
        }
      />

      <div className="hq-page-content">
        <div className="hq-overview-pulse" aria-label="Day pulse">
          <div className="hq-overview-pulse-item">
            <span className="hq-section-label">Priorities</span>
            <strong>{openPriorities}</strong>
          </div>
          <div className="hq-overview-pulse-item">
            <span className="hq-section-label">Tasks</span>
            <strong>{openTasks}</strong>
          </div>
          <div className="hq-overview-pulse-item">
            <span className="hq-section-label">Blockers</span>
            <strong className={blockers.length ? "hq-text-danger" : undefined}>{blockers.length}</strong>
          </div>
          <div className="hq-overview-pulse-item">
            <span className="hq-section-label">Goals</span>
            <strong>{activeGoals}</strong>
          </div>
          <div className="hq-overview-pulse-item hq-overview-pulse-item--wide">
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
            <Button variant="ghost" size="sm" href="/hq/sookly/action-plan">
              Sookly board
            </Button>
            <Button variant="ghost" size="sm" href="/hq/seos/social-gtm">
              SEOS board
            </Button>
            <Button variant="ghost" size="sm" href="/hq/decision-log">
              Decisions
            </Button>
          </div>
        </div>

        {storage === "file" && (
          <p className="hq-storage-warn">
            Ops store is file-backed. On Vercel/ephemeral hosts, set <code>HQ_DATABASE_URL</code> (Postgres) so
            priorities and boards survive deploys.{" "}
            <a href="/hq/settings">Settings →</a>
          </p>
        )}

        <MorningLoopCard initialData={ops} />

        <div className="hq-grid-2">
          <GoalsPanel initialData={ops} compact />
          <div id="blockers">
            <BlockersPanel initialData={ops} />
          </div>
        </div>

        <PriorityList initialData={ops} />

        <div className="hq-grid-2">
          <TopOpenItems items={topOpen} href="/hq/portfolio" linkLabel="Portfolio →" />
          <OpsAttentionList items={attention} />
        </div>

        <EndOfDayCard initialData={ops} />

        <AgentJobLog jobs={ops.agentJobs} compact />

        <PortfolioStrip products={portfolio} />
      </div>
    </div>
  );
}
