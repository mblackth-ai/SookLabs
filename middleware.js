import { NextResponse } from "next/server";
import { HQ_COOKIE, verifySessionToken } from "@/lib/hq/auth";

// Maps the hq.sooklabs.com subdomain onto the /hq route subtree and guards
// every HQ route behind the Phase 1 password session. The public SookLabs
// site (any non-hq host on non-/hq paths) passes straight through untouched.
export async function middleware(request) {
  const host = (request.headers.get("host") || "").split(":")[0];
  const isHqHost = host === "hq.sooklabs.com" || host.startsWith("hq.localhost");

  let pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();
  let rewroteHost = false;

  // On the HQ subdomain, lift root-level paths into the /hq subtree.
  if (isHqHost && !pathname.startsWith("/hq")) {
    url.pathname = pathname === "/" ? "/hq" : "/hq" + pathname;
    pathname = url.pathname;
    rewroteHost = true;
  }

  // Only HQ routes are governed by this middleware.
  if (!pathname.startsWith("/hq")) {
    return NextResponse.next();
  }

  // Unauthenticated entry points.
  const isOpenPath =
    pathname === "/hq/login" || pathname === "/hq/api/login" || pathname === "/hq/api/logout";
  if (isOpenPath) {
    return rewroteHost ? NextResponse.rewrite(url) : NextResponse.next();
  }

  const token = request.cookies.get(HQ_COOKIE)?.value;
  const authed = await verifySessionToken(token, process.env.HQ_SESSION_SECRET);

  if (!authed) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/hq/login";
    // Rewrite (not redirect) so the originally requested URL is preserved.
    return NextResponse.rewrite(loginUrl);
  }

  return rewroteHost ? NextResponse.rewrite(url) : NextResponse.next();
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static asset files.
    // Host-based logic above keeps the public site a pass-through.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|css|js|map|woff|woff2)$).*)",
  ],
};
