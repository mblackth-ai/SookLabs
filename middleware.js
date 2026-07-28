import { NextResponse } from "next/server";
import { HQ_COOKIE, resolveSessionSecret, verifySessionToken } from "@/lib/hq/auth";

function isHqHost(host) {
  return host === "hq.sooklabs.com" || host === "hq.localhost";
}

function withSecurityHeaders(response) {
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  );
  return response;
}

// Maps the hq.sooklabs.com subdomain onto the /hq route subtree and guards
// every HQ route behind the Phase 1 password session. The public SookLabs
// site (any non-hq host on non-/hq paths) passes straight through untouched.
export async function middleware(request) {
  const host = (request.headers.get("host") || "").split(":")[0];
  const isHqSubdomain = isHqHost(host);

  let pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();
  let rewroteHost = false;

  // On the HQ subdomain, lift root-level paths into the /hq subtree.
  if (isHqSubdomain && !pathname.startsWith("/hq")) {
    url.pathname = pathname === "/" ? "/hq" : "/hq" + pathname;
    pathname = url.pathname;
    rewroteHost = true;
  }

  // Only HQ routes are governed by this middleware.
  if (!pathname.startsWith("/hq")) {
    return withSecurityHeaders(NextResponse.next());
  }

  // Unauthenticated entry points (cron / agent callback / pending poll use secrets in the route itself).
  const isOpenPath =
    pathname === "/hq/login" ||
    pathname === "/hq/api/login" ||
    pathname === "/hq/api/logout" ||
    pathname === "/hq/api/cron/morning" ||
    pathname === "/hq/api/agents/callback" ||
    pathname === "/hq/api/agents/pending";
  if (isOpenPath) {
    const res = rewroteHost ? NextResponse.rewrite(url) : NextResponse.next();
    return withSecurityHeaders(res);
  }

  const token = request.cookies.get(HQ_COOKIE)?.value;
  const secret = resolveSessionSecret();
  const authed = await verifySessionToken(token, secret);

  if (!authed) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/hq/login";
    // Rewrite (not redirect) so the originally requested URL is preserved.
    return withSecurityHeaders(NextResponse.rewrite(loginUrl));
  }

  const res = rewroteHost ? NextResponse.rewrite(url) : NextResponse.next();
  return withSecurityHeaders(res);
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static asset files.
    // Host-based logic above keeps the public site a pass-through.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|css|js|map|woff|woff2)$).*)",
  ],
};
