import { NextResponse } from "next/server";
import { HQ_COOKIE, resolveSessionSecret as resolveHqSecret, verifySessionToken } from "@/lib/hq/auth";
import { SEOS_COOKIE, resolveSessionSecret as resolveSeosSecret } from "@/lib/seos/auth";

function isHqHost(host) {
  return host === "hq.sooklabs.com" || host === "hq.localhost";
}

function isSeosHost(host) {
  return host === "seos.sooklabs.com" || host === "seos.localhost";
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

async function guardHq(request, pathname, url, rewroteHost) {
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
  const secret = resolveHqSecret();
  const authed = await verifySessionToken(token, secret);

  if (!authed) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/hq/login";
    return withSecurityHeaders(NextResponse.rewrite(loginUrl));
  }

  const res = rewroteHost ? NextResponse.rewrite(url) : NextResponse.next();
  return withSecurityHeaders(res);
}

async function guardSeos(request, pathname, url, rewroteHost) {
  const isOpenPath =
    pathname === "/seos/login" ||
    pathname === "/seos/api/login" ||
    pathname === "/seos/api/logout";
  if (isOpenPath) {
    const res = rewroteHost ? NextResponse.rewrite(url) : NextResponse.next();
    return withSecurityHeaders(res);
  }

  const token = request.cookies.get(SEOS_COOKIE)?.value;
  const secret = resolveSeosSecret();
  const authed = await verifySessionToken(token, secret);

  if (!authed) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/seos/login";
    return withSecurityHeaders(NextResponse.rewrite(loginUrl));
  }

  const res = rewroteHost ? NextResponse.rewrite(url) : NextResponse.next();
  return withSecurityHeaders(res);
}

export async function middleware(request) {
  const host = (request.headers.get("host") || "").split(":")[0];
  const isHqSubdomain = isHqHost(host);
  const isSeosSubdomain = isSeosHost(host);

  let pathname = request.nextUrl.pathname;
  const url = request.nextUrl.clone();
  let rewroteHost = false;

  if (isHqSubdomain && !pathname.startsWith("/hq")) {
    url.pathname = pathname === "/" ? "/hq" : `/hq${pathname}`;
    pathname = url.pathname;
    rewroteHost = true;
  } else if (isSeosSubdomain && !pathname.startsWith("/seos")) {
    url.pathname = pathname === "/" ? "/seos" : `/seos${pathname}`;
    pathname = url.pathname;
    rewroteHost = true;
  }

  if (pathname.startsWith("/hq")) {
    return guardHq(request, pathname, url, rewroteHost);
  }

  if (pathname.startsWith("/seos")) {
    return guardSeos(request, pathname, url, rewroteHost);
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|css|js|map|woff|woff2)$).*)",
  ],
};
