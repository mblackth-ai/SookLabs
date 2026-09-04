import { BLOG_PAGE, listBlogPosts, blogIndexUrl, blogRssUrl } from "@/lib/blog";
import { SITE_NAME } from "@/lib/site";

function xmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const posts = listBlogPosts();
  const items = posts
    .map(
      (post) => `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${xmlEscape(post.url)}</link>
      <guid>${xmlEscape(post.url)}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${xmlEscape(post.description)}</description>
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(`${SITE_NAME} Blog`)}</title>
    <link>${xmlEscape(blogIndexUrl())}</link>
    <description>${xmlEscape(BLOG_PAGE.description)}</description>
    <language>en</language>
    <atom:link href="${xmlEscape(blogRssUrl())}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
