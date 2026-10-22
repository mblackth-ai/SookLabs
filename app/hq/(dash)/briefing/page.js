import { BriefingWorkspace } from "@/components/hq/BriefingWorkspace";
import { readOpsData } from "@/lib/hq/ops";
import { readContentSummary } from "@/lib/hq/content-client";
import { contentActionItems } from "@/lib/hq/content-summary.js";
import { getSeosAppUrl } from "@/lib/hq/paths";
import { readRdusaEnquiries } from "@/lib/hq/enquiries-client";
import { enquiryActionItems } from "@/lib/hq/enquiries.js";

export const dynamic = "force-dynamic";

export default async function BriefingPage() {
  const [ops, content, enquiries] = await Promise.all([readOpsData(), readContentSummary(), readRdusaEnquiries()]);
  const contentActions = { items: contentActionItems(content, { seosUrl: getSeosAppUrl() }), error: content.ok ? null : content.error };

  const enquiryActions = { items: enquiryActionItems(enquiries), error: enquiries.ok ? null : enquiries.error };

  return <BriefingWorkspace initialData={ops} contentActions={contentActions} enquiryActions={enquiryActions} />;
}
