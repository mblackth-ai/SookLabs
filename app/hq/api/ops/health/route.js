import { NextResponse } from "next/server";
import { isHqSessionValid } from "@/lib/hq/session";
import { readOpsData, getOpsStorageMode } from "@/lib/hq/ops";
import { getAgentMode } from "@/lib/hq/agent-provider";

export async function GET() {
  if (!(await isHqSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ops = await readOpsData();
    const runningJobs = (ops.agentJobs || []).filter((j) => j.status === "running").length;
    return NextResponse.json({
      ok: true,
      storage: getOpsStorageMode(),
      updatedAt: ops.updatedAt,
      agentMode: getAgentMode(),
      counts: {
        prioritiesOpen: (ops.todayPriorities || []).filter((p) => !p.done).length,
        decisions: (ops.decisions || []).length,
        agentJobs: (ops.agentJobs || []).length,
        agentJobsRunning: runningJobs,
      },
      env: {
        database: Boolean(process.env.HQ_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()),
        webhook: Boolean(process.env.HQ_AGENT_WEBHOOK_URL?.trim()),
        callbackSecret: Boolean(process.env.HQ_AGENT_CALLBACK_SECRET?.trim()),
        cronSecret: Boolean(process.env.HQ_CRON_SECRET?.trim() || process.env.CRON_SECRET?.trim()),
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message || "Health check failed" }, { status: 503 });
  }
}
