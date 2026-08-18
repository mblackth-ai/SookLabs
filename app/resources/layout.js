import JsonLd from "@/components/JsonLd";
import { RESOURCES_PAGE } from "@/lib/resources";
import { resourcesPageSchemaGraph } from "@/lib/schema";

export const metadata = {
  title: RESOURCES_PAGE.title,
  description: RESOURCES_PAGE.description,
  alternates: {
    canonical: RESOURCES_PAGE.path,
  },
  openGraph: {
    title: RESOURCES_PAGE.title,
    description: RESOURCES_PAGE.description,
    type: "website",
    url: RESOURCES_PAGE.path,
    siteName: "SookLabs",
    images: [{ url: "/assets/sooklabs/sooklabs-glyph.png", alt: "SookLabs" }],
  },
  twitter: {
    card: "summary",
    title: RESOURCES_PAGE.title,
    description: RESOURCES_PAGE.description,
    images: ["/assets/sooklabs/sooklabs-glyph.png"],
  },
};

export default function ResourcesLayout({ children }) {
  return (
    <>
      <JsonLd data={resourcesPageSchemaGraph()} />
      {children}
    </>
  );
}
