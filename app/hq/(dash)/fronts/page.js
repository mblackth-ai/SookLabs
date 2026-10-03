import Link from "next/link";
import { TopBar } from "@/components/hq/TopBar";
import { EightFrontsBoard } from "@/components/hq/EightFrontsBoard";
import { EIGHT_FRONTS_BASIS, getEightFrontsOverall } from "@/lib/hq/eight-fronts";

export default function FrontsIndexPage() {
  const overall = getEightFrontsOverall();

  return (
    <div>
      <TopBar
        title="Eight fronts"
        subtitle={EIGHT_FRONTS_BASIS}
        crumbs={[{ label: "Overview", href: "/hq" }, { label: "Eight fronts" }]}
        actions={<span className="hq-text-sm-secondary">{overall}% · eight-front mean</span>}
      />
      <div className="hq-page-content">
        <EightFrontsBoard />
        <p className="hq-text-sm-secondary">
          Older evidence rows stay available from a front detail when they are a different score. The engineering board is{" "}
          <Link href="/hq/engineering/four-fronts">four fronts</Link>.
        </p>
      </div>
    </div>
  );
}
