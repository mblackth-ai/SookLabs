import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ShareBar } from "@/components/site/ShareBar";
import { formatBlogDate, getBlogPost, listBlogPosts, relatedPosts } from "@/lib/blog";
import { SITE_NAME } from "@/lib/site";
import { blogPostSchemaGraph } from "@/lib/schema";

export const dynamicParams = false;

export function generateStaticParams() {
  return listBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) {
    return { title: `Post not found — ${SITE_NAME}` };
  }
  return {
    title: `${post.title} — ${SITE_NAME}`,
    description: post.description,
    alternates: { canonical: post.path },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: post.path,
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      siteName: SITE_NAME,
      images: [{ url: "/assets/sooklabs/sooklabs-glyph.png", alt: SITE_NAME }],
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.description,
      images: ["/assets/sooklabs/sooklabs-glyph.png"],
    },
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const related = relatedPosts(post);

  return (
    <>
      <JsonLd data={blogPostSchemaGraph(post)} />
      <PublicHeader current="blog" />
      <main id="main-content">
        <article className="sl-blog-article" style={{ paddingLeft: 32, paddingRight: 32 }}>
          <div className="sl-blog-meta">
            <Link href="/blog" className="sl-navlink" style={{ color: "var(--accent-glow)", textTransform: "uppercase" }}>
              Blog
            </Link>
            <span>{post.categoryLabel}</span>
            <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
            <span>{post.readingMinutes} min read</span>
            <span>{post.wordCount.toLocaleString()} words</span>
          </div>
          <h1>{post.title}</h1>
          <div style={{ marginBottom: 28 }}>
            <ShareBar url={post.url} title={post.title} text={post.description} compact />
          </div>
          <div className="sl-blog-prose" dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>
        {related.length > 0 && (
          <section style={{ maxWidth: 740, margin: "0 auto", padding: "0 32px 24px" }}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                letterSpacing: "-0.03em",
                margin: "0 0 14px",
              }}
            >
              Related guides
            </h2>
            <div className="sl-blog-related">
              {related.map((item) => (
                <Link key={item.slug} href={item.path}>
                  <div className="sl-blog-meta">
                    <span>{item.categoryLabel}</span>
                    <span>{formatBlogDate(item.date)}</span>
                  </div>
                  <div style={{ marginTop: 8, fontFamily: "var(--font-display)", fontWeight: 650 }}>
                    {item.title}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
