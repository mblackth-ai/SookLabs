import { BriefingWorkspace } from "@/components/hq/BriefingWorkspace";
import { readOpsData } from "@/lib/hq/ops";
import { readContentSummary } from "@/lib/hq/content-client";
import { contentActionItems } from "@/lib/hq/content-summary.js";
import { getSeosAppUrl } from "@/lib/hq/paths";

export const dynamic = "force-dynamic";

export default async function BriefingPage() {
  const [ops, content] = await Promise.all([readOpsData(), readContentSummary()]);
  const contentActions = { items: contentActionItems(content, { seosUrl: getSeosAppUrl() }), error: content.ok ? null : content.error };

  return <BriefingWorkspace initialData={ops} contentActions={contentActions} />;
}
