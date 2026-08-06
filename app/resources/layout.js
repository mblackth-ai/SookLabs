import JsonLd from "@/components/JsonLd";
import { RESOURCES_PAGE } from "@/lib/resources";
import { resourcesPageSchemaGraph } from "@/lib/schema";

export const metadata = {
  title: RESOURCES_PAGE.title,
  description: RESOURCES_PAGE.description,
  openGraph: {
    title: RESOURCES_PAGE.title,
    description: RESOURCES_PAGE.description,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: RESOURCES_PAGE.title,
    description: RESOURCES_PAGE.description,
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
