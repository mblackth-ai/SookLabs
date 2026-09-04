import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { PublicHeader } from "@/components/site/PublicHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ShareBar } from "@/components/site/ShareBar";
import { BLOG_PAGE, blogIndexUrl, formatBlogDate, listBlogPosts } from "@/lib/blog";
import { blogIndexSchemaGraph } from "@/lib/schema";

function Overline({ children }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--accent-glow)",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: "var(--accent-glow)",
          boxShadow: "0 0 8px var(--accent-glow)",
        }}
      />
      {children}
    </span>
  );
}

export default function BlogIndexPage() {
  const posts = listBlogPosts();

  return (
    <>
      <JsonLd data={blogIndexSchemaGraph(posts)} />
      <PublicHeader current="blog" />
      <main id="main-content">
        <section className="sl-blog-hero">
          <div aria-hidden className="sl-grid-bg" />
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0 32px",
              position: "relative",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 22 }}>
              <Overline>Blog</Overline>
            </div>
            <h1
              style={{
                margin: "0 0 16px",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(32px, 5vw, 48px)",
                letterSpacing: "-0.035em",
                color: "var(--text-heading)",
              }}
            >
              Decide, then publish
            </h1>
            <p
              style={{
                margin: "0 auto",
                maxWidth: 640,
                fontSize: 17,
                lineHeight: 1.6,
                color: "var(--text-secondary)",
              }}
            >
              {BLOG_PAGE.description}
            </p>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}>
              <ShareBar
                url={blogIndexUrl()}
                title="SookLabs Blog"
                text={BLOG_PAGE.description}
                compact
              />
            </div>
          </div>
        </section>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px" }} className="sl-blog-index">
          {posts.map((post) => (
            <Link key={post.slug} href={post.path} className="sl-blog-card">
              <div className="sl-blog-meta">
                <span>{post.categoryLabel}</span>
                <span>{formatBlogDate(post.date)}</span>
                <span>{post.readingMinutes} min read</span>
              </div>
              <h2>{post.title}</h2>
              <p className="sl-blog-excerpt">{post.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
