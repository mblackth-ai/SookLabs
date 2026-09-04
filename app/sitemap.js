import { SITE_URL } from "@/lib/site";
import { listBlogPosts } from "@/lib/blog";

export default function sitemap() {
  const posts = listBlogPosts().map((post) => ({
    url: post.url,
    lastModified: new Date(post.updated || post.date),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/blog/rss.xml`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/llms-full.txt`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.55,
    },
    {
      url: `${SITE_URL}/resources`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/audit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...posts,
  ];
}
