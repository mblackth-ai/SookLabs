import { ComingSoon } from "@/components/hq/ComingSoon";
import { COMING_SOON } from "@/lib/hq/nav";

export const metadata = { title: "Campaigns · SookLabs HQ" };

export default function CampaignsPage() {
  return <ComingSoon section={COMING_SOON.campaigns} />;
}
