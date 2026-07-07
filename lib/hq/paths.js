// Canonical /hq/* paths for route matching. On the HQ subdomain, middleware
// serves the /hq tree at root-level URLs (/briefing → /hq/briefing), so
// usePathname() may omit the /hq prefix even though nav hrefs use it.

export function normalizeHqPathname(pathname) {
  const path = (pathname || "/").replace(/\/$/, "") || "/";
  if (path === "/") return "/hq";
  if (path.startsWith("/hq")) return path;
  return `/hq${path}`;
}

export function isHqNavActive(pathname, href) {
  const current = normalizeHqPathname(pathname);
  const target = normalizeHqPathname(href);
  if (target === "/hq") return current === "/hq";
  return current === target || current.startsWith(`${target}/`);
}

/** SEOS product app URL — set NEXT_PUBLIC_SEOS_URL in env (e.g. http://localhost:3000). */
export function getSeosAppUrl() {
  return process.env.NEXT_PUBLIC_SEOS_URL || "http://localhost:3000";
}
