/**
 * Renders JSON-LD in a hydration-safe script tag.
 * Pass a single schema object or an array (wrapped in @graph).
 */
export default function JsonLd({ data }) {
  if (!data) return null;

  const schema = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : { "@context": "https://schema.org", ...data };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
      }}
    />
  );
}
