import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  ORG_DESCRIPTION,
  ORG_SUMMARY,
  DEFAULT_LANGUAGE,
  LOGO_PATH,
  CONTACT_EMAIL,
  SOCIAL_PROFILES,
  DISCORD_INVITE_URL,
  ECOSYSTEM_PRODUCTS,
  AUDIT_PAGE,
  absoluteUrl,
} from "./site";
import { RESOURCE_TOOLS, RESOURCES_PAGE } from "./resources";
import { BLOG_PAGE, blogIndexUrl } from "./blog";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function compact(value) {
  if (Array.isArray(value)) {
    const items = value.map(compact).filter(Boolean);
    return items.length ? items : undefined;
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      const next = compact(val);
      if (next !== undefined && next !== "") out[key] = next;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return value === undefined || value === null || value === "" ? undefined : value;
}

export function organizationSchema() {
  return compact({
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(LOGO_PATH),
    description: ORG_DESCRIPTION,
    slogan: SITE_TAGLINE,
    email: CONTACT_EMAIL,
    sameAs: [
      ...SOCIAL_PROFILES.map((profile) => profile.url),
      DISCORD_INVITE_URL,
    ].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_EMAIL,
      availableLanguage: DEFAULT_LANGUAGE,
    },
  });
}

export function websiteSchema() {
  return compact({
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    description: ORG_DESCRIPTION,
    inLanguage: DEFAULT_LANGUAGE,
    publisher: { "@id": ORG_ID },
  });
}

export function webPageSchema({
  path = "/",
  name,
  description,
  pageId,
  mainEntity,
}) {
  const url = absoluteUrl(path);
  return compact({
    "@type": "WebPage",
    "@id": pageId || `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: DEFAULT_LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    mainEntity,
  });
}

export function breadcrumbListSchema(items) {
  if (!items?.length) return undefined;
  return compact({
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) =>
      compact({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: absoluteUrl(item.path),
      })
    ),
  });
}

export function itemListSchema({ id, name, description, items }) {
  if (!items?.length) return undefined;
  return compact({
    "@type": "ItemList",
    "@id": id,
    name,
    description,
    itemListElement: items.map((item, index) =>
      compact({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        description: item.description,
        url: item.url,
      })
    ),
  });
}

export function serviceSchema({
  name,
  description,
  path,
  serviceType,
  audienceType,
}) {
  return compact({
    "@type": "Service",
    name,
    description,
    url: absoluteUrl(path),
    serviceType,
    provider: { "@id": ORG_ID },
    areaServed: "Worldwide",
    audience: audienceType
      ? {
          "@type": "Audience",
          audienceType,
        }
      : undefined,
  });
}

export function homePageSchemaGraph() {
  const homeUrl = SITE_URL;
  const ecosystemItems = ECOSYSTEM_PRODUCTS.map((product) =>
    compact({
      name: product.name,
      description: product.description,
      url: product.url,
    })
  );

  return compact([
    organizationSchema(),
    websiteSchema(),
    webPageSchema({
      path: "/",
      pageId: `${homeUrl}#webpage`,
      name: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: ORG_DESCRIPTION,
    }),
    itemListSchema({
      name: "SookLabs ecosystem",
      description: ORG_SUMMARY,
      items: ecosystemItems,
    }),
  ]);
}

export function auditPageSchemaGraph() {
  const auditUrl = absoluteUrl(AUDIT_PAGE.path);

  return compact([
    organizationSchema(),
    websiteSchema(),
    webPageSchema({
      path: AUDIT_PAGE.path,
      pageId: `${auditUrl}#webpage`,
      name: AUDIT_PAGE.title,
      description: AUDIT_PAGE.description,
      mainEntity: {
        "@type": "Service",
        name: AUDIT_PAGE.serviceName,
        description: AUDIT_PAGE.serviceDescription,
        url: auditUrl,
        provider: { "@id": ORG_ID },
        serviceType: "Generative engine optimisation audit",
        audience: {
          "@type": "Audience",
          audienceType: AUDIT_PAGE.audienceType,
        },
      },
    }),
    breadcrumbListSchema([
      { name: "Home", path: "/" },
      { name: AUDIT_PAGE.name, path: AUDIT_PAGE.path },
    ]),
  ]);
}

export function legalPageSchemaGraph({ path, title, description }) {
  const url = absoluteUrl(path);
  return compact([
    organizationSchema(),
    websiteSchema(),
    webPageSchema({
      path,
      pageId: `${url}#webpage`,
      name: title,
      description,
    }),
    breadcrumbListSchema([
      { name: "Home", path: "/" },
      { name: title.replace(/^SookLabs — /, "").replace(/ — SookLabs$/, ""), path },
    ]),
  ]);
}

export function resourcesPageSchemaGraph() {
  const resourcesUrl = absoluteUrl(RESOURCES_PAGE.path);
  const listId = `${resourcesUrl}#tools`;
  const toolItems = RESOURCE_TOOLS.map((tool) =>
    compact({
      name: tool.title,
      description: tool.summary,
      url: `${resourcesUrl}#${tool.id}`,
    })
  );

  return compact([
    organizationSchema(),
    websiteSchema(),
    webPageSchema({
      path: RESOURCES_PAGE.path,
      pageId: `${resourcesUrl}#webpage`,
      name: RESOURCES_PAGE.title,
      description: RESOURCES_PAGE.description,
      mainEntity: { "@id": listId },
    }),
    itemListSchema({
      id: listId,
      name: "SookLabs resource tools",
      description: RESOURCES_PAGE.description,
      items: toolItems,
    }),
    breadcrumbListSchema([
      { name: "Home", path: "/" },
      { name: RESOURCES_PAGE.name, path: RESOURCES_PAGE.path },
    ]),
  ]);
}

export function blogIndexSchemaGraph(posts) {
  const blogUrl = blogIndexUrl();
  const listId = `${blogUrl}#posts`;
  const items = (posts || []).map((post) =>
    compact({
      name: post.title,
      description: post.description,
      url: post.url,
    })
  );

  return compact([
    organizationSchema(),
    websiteSchema(),
    compact({
      "@type": "Blog",
      "@id": `${blogUrl}#blog`,
      name: BLOG_PAGE.title,
      description: BLOG_PAGE.description,
      url: blogUrl,
      inLanguage: DEFAULT_LANGUAGE,
      publisher: { "@id": ORG_ID },
      blogPost: items.map((item) => ({ "@type": "BlogPosting", headline: item.name, url: item.url })),
    }),
    webPageSchema({
      path: BLOG_PAGE.path,
      pageId: `${blogUrl}#webpage`,
      name: BLOG_PAGE.title,
      description: BLOG_PAGE.description,
      mainEntity: { "@id": listId },
    }),
    itemListSchema({
      id: listId,
      name: "SookLabs blog posts",
      description: BLOG_PAGE.description,
      items,
    }),
    breadcrumbListSchema([
      { name: "Home", path: "/" },
      { name: BLOG_PAGE.name, path: BLOG_PAGE.path },
    ]),
  ]);
}

export function blogPostSchemaGraph(post) {
  if (!post) return undefined;
  const url = post.url;
  const articleId = `${url}#article`;
  const faq = (post.faq || []).map((item) =>
    compact({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })
  );

  return compact([
    organizationSchema(),
    websiteSchema(),
    compact({
      "@type": "BlogPosting",
      "@id": articleId,
      headline: post.title,
      name: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.updated || post.date,
      inLanguage: DEFAULT_LANGUAGE,
      wordCount: post.wordCount,
      articleSection: post.categoryLabel,
      keywords: (post.tags || []).join(", "),
      url,
      mainEntityOfPage: `${url}#webpage`,
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      image: absoluteUrl(LOGO_PATH),
    }),
    webPageSchema({
      path: post.path,
      pageId: `${url}#webpage`,
      name: `${post.title} — ${SITE_NAME}`,
      description: post.description,
      mainEntity: { "@id": articleId },
    }),
    faq.length
      ? compact({
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          mainEntity: faq,
        })
      : undefined,
    breadcrumbListSchema([
      { name: "Home", path: "/" },
      { name: BLOG_PAGE.name, path: BLOG_PAGE.path },
      { name: post.title, path: post.path },
    ]),
  ]);
}
