import { BriefingWorkspace } from "@/components/hq/BriefingWorkspace";
import { readOpsData } from "@/lib/hq/ops";

export default async function BriefingPage() {
  const ops = await readOpsData();

  return <BriefingWorkspace initialData={ops} />;
}
