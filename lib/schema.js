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
  ECOSYSTEM_PRODUCTS,
  AUDIT_PAGE,
  absoluteUrl,
} from "./site";

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
    sameAs: SOCIAL_PROFILES.map((profile) => profile.url),
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

export function itemListSchema({ name, description, items }) {
  if (!items?.length) return undefined;
  return compact({
    "@type": "ItemList",
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
