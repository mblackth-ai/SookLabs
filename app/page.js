import JsonLd from "@/components/JsonLd";
import { homePageSchemaGraph } from "@/lib/schema";
import SookLabsV2Page from "./sooklabs-v2/page";

export default function HomePage() {
  return (
    <>
      <JsonLd data={homePageSchemaGraph()} />
      <SookLabsV2Page />
    </>
  );
}
