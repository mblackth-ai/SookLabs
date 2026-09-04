import { cache } from "react";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { absoluteUrl } from "./site";
import { extractFaq, markdownToHtml } from "./blog-markdown";

export const BLOG_PAGE = {
  path: "/blog",
  name: "Blog",
  title: "Blog — SookLabs",
  description:
    "Practical guides on AI, SaaS, automation, GEO, inbound systems, and operator security — written to help website-dependent companies decide, not just read.",
};

export const BLOG_CATEGORIES = [
  { id: "visibility", label: "Visibility" },
  { id: "automation", label: "Automation" },
  { id: "inbound", label: "Inbound" },
  { id: "security", label: "Security" },
  { id: "knowledge", label: "Knowledge" },
  { id: "industry", label: "Industry" },
];

const POSTS_DIR = join(process.cwd(), "data", "blog", "posts");

function parseFrontmatter(raw) {
  const match = String(raw || "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: String(raw || "").trim() };
  const meta = {};
  for (const line of match[1].split(/\r?\n/)) {
    const eq = line.indexOf(":");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[key] = value;
  }
  return { meta, body: match[2].trim() };
}

function splitList(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function wordCount(text) {
  return String(text || "")
    .replace(/[#>*`|\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function normalizePost(filename, raw) {
  const { meta, body } = parseFrontmatter(raw);
  const slug = String(meta.slug || filename.replace(/\.md$/, "")).trim();
  const title = String(meta.title || slug).trim();
  const description = String(meta.description || "").trim();
  const category = String(meta.category || "industry").trim();
  const categoryMeta = BLOG_CATEGORIES.find((item) => item.id === category);
  const words = wordCount(body);
  const faq = extractFaq(body);
  return {
    slug,
    title,
    description,
    date: String(meta.date || "").slice(0, 10),
    updated: String(meta.updated || meta.date || "").slice(0, 10),
    category,
    categoryLabel: categoryMeta?.label || "Industry",
    tags: splitList(meta.tags),
    products: splitList(meta.products),
    body,
    html: markdownToHtml(body),
    faq,
    wordCount: words,
    readingMinutes: Math.max(8, Math.round(words / 220)),
    path: `/blog/${slug}`,
    url: absoluteUrl(`/blog/${slug}`),
  };
}

export const listBlogPosts = cache(() => {
  if (!existsSync(POSTS_DIR)) return [];
  const files = readdirSync(POSTS_DIR).filter((name) => name.endsWith(".md"));
  const posts = files
    .map((name) => {
      const raw = readFileSync(join(POSTS_DIR, name), "utf8");
      return normalizePost(name, raw);
    })
    .filter((post) => post.slug && post.title && post.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)) || a.slug.localeCompare(b.slug));
  return posts;
});

export function getBlogPost(slug) {
  return listBlogPosts().find((post) => post.slug === slug) || null;
}

export function relatedPosts(post, limit = 3) {
  const all = listBlogPosts();
  const scored = all
    .filter((item) => item.slug !== post.slug)
    .map((item) => {
      let score = 0;
      if (item.category === post.category) score += 3;
      const overlap = item.tags.filter((tag) => post.tags.includes(tag)).length;
      score += overlap;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score || String(b.item.date).localeCompare(String(a.item.date)));
  return scored.slice(0, limit).map((row) => row.item);
}

export function formatBlogDate(iso) {
  if (!iso) return "";
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function blogIndexUrl() {
  return absoluteUrl(BLOG_PAGE.path);
}

export function blogRssUrl() {
  return absoluteUrl("/blog/rss.xml");
}
