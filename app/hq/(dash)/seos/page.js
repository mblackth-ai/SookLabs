import { HubPage } from "@/components/hq/HubPage";
import { seosHubLinks } from "@/lib/hq/knowledge-mock";

export default function SeosHubPage() {
  return (
    <HubPage
      title="SEOS"
      subtitle="SookLabs Expansion Operating System · Knowledge Base is canonical truth"
      links={seosHubLinks}
      footerNote="Open the full SEOS product app for editing and exports. HQ shows portfolio summaries only — business facts are edited in SEOS Knowledge Base, not here."
    />
  );
}
