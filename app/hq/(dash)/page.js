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
import { ClickPlayDraftHint } from "@/components/hq/ClickPlayDraftHint";
import { OverviewStorageWarn } from "@/components/hq/OverviewStorageWarn";
import { OverviewMoreToday } from "@/components/hq/OverviewMoreToday";
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
  const primaryHref = ops.primaryBoardHref || "/hq/sookly/action-plan";
  const hasRunningJobs = (ops.agentJobs || []).some((j) => j.status === "running");

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
        {/* Pulse */}
        <section className="hq-band hq-band--pulse" aria-label="Day pulse">
          <div className="hq-overview-pulse">
            <a className="hq-overview-pulse-item" href="#priorities">
              <span className="hq-section-label">Priorities</span>
              <strong>{openPriorities}</strong>
            </a>
            <a className="hq-overview-pulse-item" href="/hq/portfolio">
              <span className="hq-section-label">Tasks</span>
              <strong>{openTasks}</strong>
            </a>
            <a className="hq-overview-pulse-item" href="#blockers">
              <span className="hq-section-label">Blockers</span>
              <strong className={blockers.length ? "hq-text-danger" : "hq-text-ok"}>{blockers.length}</strong>
            </a>
            <a className="hq-overview-pulse-item" href="#goals">
              <span className="hq-section-label">Goals</span>
              <strong>{activeGoals}</strong>
            </a>
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
              <Button variant="secondary" size="sm" href={primaryHref}>
                Primary board
              </Button>
              <Button variant="ghost" size="sm" href="/hq/decision-log">
                Decisions
              </Button>
            </div>
          </div>
          {storage === "file" && <OverviewStorageWarn />}
        </section>

        {/* Act */}
        <section className="hq-band hq-band--act" aria-label="Act">
          <p className="hq-band-label">Act</p>
          <MorningLoopCard initialData={ops} />
          <PriorityList initialData={ops} />
          <div className="hq-grid-2">
            <div id="goals">
              <GoalsPanel initialData={ops} compact />
            </div>
            <div id="blockers">
              <BlockersPanel initialData={ops} />
            </div>
          </div>
          <div className="hq-grid-2">
            <TopOpenItems items={topOpen} href="/hq/portfolio" linkLabel="Portfolio →" />
            <OpsAttentionList items={attention} />
          </div>
        </section>

        {/* Review / more */}
        <EndOfDayCard initialData={ops} />

        <OverviewMoreToday defaultOpen={hasRunningJobs}>
          <ClickPlayDraftHint />
          <AgentJobLog jobs={ops.agentJobs} compact />
          {hasRunningJobs ? (
            <p className="hq-running-jobs-hint">
              Running agent jobs —{" "}
              <a href="/hq/automation">open Automation to complete or dismiss →</a>
            </p>
          ) : null}
          <PortfolioStrip products={portfolio} />
        </OverviewMoreToday>
      </div>
    </div>
  );
}
