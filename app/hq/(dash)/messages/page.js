import { ComingSoon } from "@/components/hq/ComingSoon";
import { COMING_SOON } from "@/lib/hq/nav";

export const metadata = { title: "Messages · SookLabs HQ" };

export default function MessagesPage() {
  return <ComingSoon section={COMING_SOON.messages} />;
}
