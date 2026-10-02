#!/usr/bin/env node
// Visual inspection sweep for SookLabs HQ. Run from a SookLabs checkout whose
// server is up and logged in via driver.mjs (same RUN_SOOKLABS_STATE / PORT):
//
//   node .claude/skills/run-sooklabs/inspect.mjs [--routes /hq,/hq/retainers] [--viewports desktop,tablet,mobile]
//
// For every route × viewport: screenshot of the viewport and of the scrolled
// main panel, plus DOM checks — page-level horizontal overflow, elements past
// the right edge, clipped text, tiny/off-screen controls, console errors,
// uncaught errors and failed requests. Writes <out>/report.json and PNGs
// named <route>__<viewport>.png. Read-only: never clicks anything.

import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const PORT = Number(process.env.PORT || 3008);
const BASE = `http://localhost:${PORT}`;
const STATE = process.env.RUN_SOOKLABS_STATE || "/tmp/run-sooklabs";
const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};
const OUT = arg("out") || join(STATE, "inspect");
mkdirSync(OUT, { recursive: true });

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
};

function discoverRoutes() {
  const routes = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) {
        if (name === "api") continue;
        walk(p);
      } else if (name === "page.js" || name === "page.jsx") {
        const rel = relative(join(ROOT, "app"), dir).split(sep).filter((s) => !/^\(.*\)$/.test(s));
        if (rel.some((s) => s.startsWith("["))) continue; // dynamic: discovered from links later
        routes.push("/" + rel.join("/"));
      }
    }
  };
  walk(join(ROOT, "app/hq"));
  return routes.filter((r) => r !== "/hq/login").sort();
}

function loadPlaywright() {
  const roots = [execSync("npm root -g", { encoding: "utf8" }).trim(), join(process.env.HOME || "/tmp", ".cache/run-sooklabs/node_modules")];
  for (const root of roots) for (const name of ["playwright", "playwright-core"]) {
    try {
      return createRequire(join(root, "noop.js"))(name);
    } catch {}
  }
  throw new Error("playwright not found — run `driver.mjs ss /hq` once to install it");
}

function chromiumPath() {
  for (const p of [process.env.CHROMIUM_PATH, "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"]) if (p && existsSync(p)) return p;
}

const slug = (route) => route.replace(/^\//, "").replace(/[^a-z0-9]+/gi, "_") || "root";

// Runs in the page.
function domChecks() {
  const vw = window.innerWidth;
  const visible = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.display !== "none" && s.visibility !== "hidden" && Number(s.opacity) > 0 && r.width > 0 && r.height > 0;
  };
  const label = (el) =>
    `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".") : ""}` +
    ` "${(el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 50)}"`;
  const srOnly = (el) => /skip-link|sr-only|visually-hidden/.test(el.className || "") || getComputedStyle(el).clip === "rect(0px, 0px, 0px, 0px)";
  const inClosedDrawer = (el) => {
    const drawer = el.closest("aside, [role=dialog], [class*=sidebar], [class*=drawer]");
    if (!drawer) return false;
    const r = drawer.getBoundingClientRect();
    return r.right <= 0 || r.left >= vw;
  };
  const inScroller = (el) => {
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const ox = getComputedStyle(p).overflowX;
      if ((ox === "auto" || ox === "scroll") && p.scrollWidth > p.clientWidth) return true;
    }
    return false;
  };

  const docOverflow = document.documentElement.scrollWidth - vw;
  const pastRight = [];
  const clipped = [];
  const tinyControls = [];
  const offscreenControls = [];
  for (const el of document.querySelectorAll("body *")) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (srOnly(el) || inClosedDrawer(el)) continue;
    if (r.right > vw + 2 && !inScroller(el) && pastRight.length < 8) pastRight.push(`${label(el)} right=${Math.round(r.right)}`);
    const s = getComputedStyle(el);
    if (
      el.children.length === 0 &&
      el.innerText?.trim() &&
      el.scrollWidth > el.clientWidth + 1 &&
      (s.overflowX === "hidden" || s.overflow === "hidden") &&
      s.textOverflow !== "ellipsis" &&
      clipped.length < 8
    ) clipped.push(label(el));
  }
  for (const el of document.querySelectorAll("a[href], button, [role=button], input, select, textarea, [role=tab]")) {
    if (!visible(el) || srOnly(el) || inClosedDrawer(el)) continue;
    const r = el.getBoundingClientRect();
    if ((r.width < 24 || r.height < 24) && el.closest("nav, aside, header, main") && tinyControls.length < 8 && (el.innerText || "").trim().length < 3)
      tinyControls.push(`${label(el)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    if ((r.left < -2 || r.right > vw + 2) && !inScroller(el) && offscreenControls.length < 8) offscreenControls.push(label(el));
  }

  const scroller = [...document.querySelectorAll("main, [class*=main], [class*=content]")]
    .filter((el) => el.scrollHeight > el.clientHeight + 20 && ["auto", "scroll"].includes(getComputedStyle(el).overflowY))
    .sort((a, b) => b.scrollHeight - a.scrollHeight)[0];

  const bs = getComputedStyle(document.body);
  const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
  const bodyFrame = parseFloat(bs.marginTop) + parseFloat(bs.marginLeft) > 0 ? `body margin ${bs.margin}, html bg ${htmlBg}, body bg ${bs.backgroundColor}` : null;
  const ownText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const defaultBlueLinks = [...document.querySelectorAll("a[href]")]
    .filter((a) => visible(a) && !srOnly(a) && ownText(a) && ["rgb(0, 0, 238)", "rgb(85, 26, 139)"].includes(getComputedStyle(a).color))
    .map(label).slice(0, 6);
  // Small fixed-height elements (badges, pills) whose text wraps and spills out.
  const wrappedBadges = [...document.querySelectorAll("body *")]
    .filter((b) => visible(b) && !srOnly(b) && !inClosedDrawer(b) && ownText(b) && b.clientHeight > 0 && b.clientHeight <= 30 && b.scrollHeight > b.clientHeight + 4)
    .map((b) => `${label(b)} h=${b.clientHeight} content=${b.scrollHeight}`).slice(0, 6);
  return {
    bodyFrame,
    defaultBlueLinks,
    wrappedBadges,
    title: document.title,
    h1: [...document.querySelectorAll("h1")].map((h) => h.innerText.trim()).slice(0, 2),
    bodyTextLength: document.body.innerText.trim().length,
    errorText: (document.body.innerText.match(/(unhandled runtime error|application error|500|something went wrong|not configured|unavailable)[^\n]{0,80}/gi) || []).slice(0, 4),
    docOverflowPx: docOverflow,
    pastRight,
    clipped,
    tinyControls,
    offscreenControls,
    scrollPanel: scroller ? { label: label(scroller), scrollHeight: scroller.scrollHeight, clientHeight: scroller.clientHeight } : null,
    navLinks: [...document.querySelectorAll("nav a[href], aside a[href]")].filter(visible).length,
    hiddenNavLinks: [...document.querySelectorAll("nav a[href], aside a[href]")].filter((a) => !visible(a)).length,
    links: [...new Set([...document.querySelectorAll("a[href^='/hq']")].map((a) => a.getAttribute("href")))],
  };
}

async function main() {
  const { chromium } = loadPlaywright();
  const cookie = readFileSync(join(STATE, "cookie"), "utf8").trim();
  const [cname, cvalue] = cookie.split(/=(.*)/s);
  const routes = arg("routes") ? arg("routes").split(",") : discoverRoutes();
  const viewports = (arg("viewports") || "desktop,tablet,mobile").split(",");
  const browser = await chromium.launch({ executablePath: chromiumPath() });
  const results = [];
  const dynamicLinks = new Set();

  for (const vpName of viewports) {
    const context = await browser.newContext({ viewport: { width: VIEWPORTS[vpName].width, height: VIEWPORTS[vpName].height }, ...VIEWPORTS[vpName] });
    await context.addCookies([{ name: cname, value: cvalue, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
    const queue = [...routes];
    for (let i = 0; i < queue.length; i++) {
      const route = queue[i];
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      const failed = [];
      page.on("console", (m) => m.type() === "error" && !/ERR_TUNNEL_CONNECTION_FAILED/.test(m.text()) && consoleErrors.push(m.text().slice(0, 200)));
      page.on("pageerror", (e) => pageErrors.push(String(e.message).slice(0, 200)));
      page.on("requestfailed", (r) => !r.url().includes("vercel-scripts.com") && failed.push(`FAILED ${r.failure()?.errorText} ${r.url().replace(BASE, "").slice(0, 120)}`));
      page.on("response", (r) => r.status() >= 400 && !r.url().includes("favicon") && failed.push(`${r.status()} ${r.url().replace(BASE, "")}`));
      const t0 = Date.now();
      let status = 0;
      try {
        const res = await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 90_000 });
        status = res?.status() ?? 0;
      } catch (e) {
        pageErrors.push(`navigation: ${e.message.slice(0, 120)}`);
      }
      await page.waitForTimeout(400);
      const dom = await page.evaluate(domChecks).catch((e) => ({ error: e.message }));
      const shot = join(OUT, `${slug(route)}__${vpName}.png`);
      await page.screenshot({ path: shot });
      let panelShot = null;
      if (dom.scrollPanel) {
        panelShot = join(OUT, `${slug(route)}__${vpName}__scrolled.png`);
        await page.evaluate(() => {
          const el = [...document.querySelectorAll("main, [class*=main], [class*=content]")]
            .filter((e) => e.scrollHeight > e.clientHeight + 20 && ["auto", "scroll"].includes(getComputedStyle(e).overflowY))
            .sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
          if (el) el.scrollTop = el.scrollHeight;
        });
        await page.waitForTimeout(250);
        await page.screenshot({ path: panelShot });
      } else if (vpName !== "desktop") {
        panelShot = join(OUT, `${slug(route)}__${vpName}__full.png`);
        await page.screenshot({ path: panelShot, fullPage: true });
      }
      for (const l of dom.links || []) if (/\/hq\/fronts\/[^/]+$/.test(l)) dynamicLinks.add(l);
      if (i === queue.length - 1 && !arg("routes")) for (const l of dynamicLinks) if (!queue.includes(l)) queue.push(l);
      delete dom.links;
      results.push({ route, viewport: vpName, status, finalUrl: page.url().replace(BASE, ""), ms: Date.now() - t0, consoleErrors, pageErrors, failed: [...new Set(failed)], ...dom, shot, panelShot });
      const flags = [
        status >= 400 && `HTTP ${status}`,
        page.url().includes("/hq/login") && "redirected to login",
        dom.docOverflowPx > 0 && `page overflows ${dom.docOverflowPx}px`,
        dom.pastRight?.length && `${dom.pastRight.length} past right edge`,
        dom.clipped?.length && `${dom.clipped.length} clipped`,
        dom.bodyFrame && "body margin frame",
        dom.defaultBlueLinks?.length && `${dom.defaultBlueLinks.length} unstyled links`,
        dom.wrappedBadges?.length && `${dom.wrappedBadges.length} wrapped badges`,
        dom.offscreenControls?.length && `${dom.offscreenControls.length} offscreen controls`,
        consoleErrors.length && `${consoleErrors.length} console errors`,
        pageErrors.length && `${pageErrors.length} page errors`,
        failed.length && `${failed.length} failed requests`,
      ].filter(Boolean);
      console.log(`${vpName.padEnd(7)} ${route.padEnd(40)} ${status} ${String(Date.now() - t0).padStart(5)}ms ${flags.join(", ") || "ok"}`);
      await page.close();
    }
    await context.close();
  }
  await browser.close();
  writeFileSync(join(OUT, "report.json"), JSON.stringify(results, null, 2));
  console.log(`\n${results.length} checks → ${join(OUT, "report.json")}`);
}

await main();
