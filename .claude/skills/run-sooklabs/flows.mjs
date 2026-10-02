#!/usr/bin/env node
// Interaction flows for SookLabs HQ. Server up + `driver.mjs login` done first.
//   node .claude/skills/run-sooklabs/flows.mjs [--out dir] [--only name,name]
// Each flow drives real controls, screenshots each state, and prints PASS/FAIL
// with what it saw. Safe: never clicks Ask AI, dispatch, cron, publish or
// anything outbound. Writes go only to the local file-mode ops store.

import { execSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PORT = Number(process.env.PORT || 3008);
const BASE = `http://localhost:${PORT}`;
const STATE = process.env.RUN_SOOKLABS_STATE || "/tmp/run-sooklabs";
const arg = (n) => (process.argv.includes(`--${n}`) ? process.argv[process.argv.indexOf(`--${n}`) + 1] : undefined);
const OUT = arg("out") || join(STATE, "flows");
mkdirSync(OUT, { recursive: true });
const ONLY = arg("only")?.split(",");

const req = (() => {
  for (const root of [execSync("npm root -g", { encoding: "utf8" }).trim(), join(process.env.HOME || "/tmp", ".cache/run-sooklabs/node_modules")])
    for (const n of ["playwright", "playwright-core"]) {
      try {
        return createRequire(join(root, "noop.js"))(n);
      } catch {}
    }
  throw new Error("playwright not found — run `driver.mjs ss /hq` once");
})();
const chromiumPath = ["/opt/pw-browsers/chromium-1194/chrome-linux/chrome", process.env.CHROMIUM_PATH].find((p) => p && existsSync(p));
const envFile = (k) => {
  for (const l of existsSync("sooklabs.env.local") ? readFileSync("sooklabs.env.local", "utf8").split("\n") : []) {
    const m = l.match(/^([A-Z_]+)=(.*)$/);
    if (m && m[1] === k) return m[2];
  }
  return process.env[k];
};

const results = [];
const shot = async (page, name) => {
  const p = join(OUT, `${name}.png`);
  await page.screenshot({ path: p });
  return p;
};
const record = (name, pass, saw, shots) => {
  results.push({ name, pass, saw, shots });
  console.log(`${pass ? "PASS" : "FAIL"} ${name} — ${saw}`);
};

async function authedContext(browser, viewport) {
  const ctx = await browser.newContext({ viewport, ...(viewport.width < 500 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 2 } : {}) });
  const [name, value] = readFileSync(join(STATE, "cookie"), "utf8").trim().split(/=(.*)/s);
  await ctx.addCookies([{ name, value, domain: "localhost", path: "/", httpOnly: true, sameSite: "Lax" }]);
  return ctx;
}

const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const flows = {
  async loginStates(browser) {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/hq`, { waitUntil: "networkidle" });
    // Middleware rewrites (not redirects) unauthenticated requests: URL stays /hq, login form is served.
    const redirected = await page.locator("input[type=password]").isVisible();
    const s1 = await shot(page, "login__default");
    await page.locator("button[type=submit]").click();
    await page.waitForTimeout(600);
    const emptyErr = await page.locator(".hq-login-error, [role=alert]").first().textContent().catch(() => null);
    const emptyValid = await page.locator("input[type=password]").evaluate((i) => i.validationMessage).catch(() => "");
    const s2 = await shot(page, "login__empty-submit");
    await page.fill("input[type=password]", "definitely-wrong");
    await page.locator("button[type=submit]").click();
    await page.waitForSelector("[role=alert]", { timeout: 10_000 }).catch(() => {});
    const wrongErr = await page.locator("[role=alert]").first().textContent().catch(() => null);
    const s3 = await shot(page, "login__wrong-password");
    await page.fill("input[type=password]", envFile("HQ_ACCESS_PASSWORD"));
    await page.locator("button[type=submit]").click();
    await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30_000 }).catch(() => {});
    const landed = page.url().replace(BASE, "");
    const s4 = await shot(page, "login__success");
    record(
      "login states",
      redirected && !!wrongErr && !landed.includes("login"),
      `unauth /hq shows login form (URL kept)=${redirected}; empty submit: ${emptyErr || `browser validation "${emptyValid}"`}; wrong pw: "${wrongErr?.trim()}"; correct pw lands on ${landed}`,
      [s1, s2, s3, s4]
    );
    await ctx.close();
  },

  async mobileNav(browser) {
    const ctx = await authedContext(browser, MOBILE);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/hq`, { waitUntil: "networkidle" });
    const open = page.getByRole("button", { name: "Open navigation" });
    const s1 = await shot(page, "mobile-nav__closed");
    await open.click();
    await page.waitForTimeout(400);
    const expanded = await open.getAttribute("aria-expanded");
    const s2 = await shot(page, "mobile-nav__open");
    const link = page.locator("a.hq-sidebar-nav-link", { hasText: "Retainers" }).first();
    const linkVisible = await link.isVisible();
    await link.click();
    await page.waitForURL("**/hq/retainers", { timeout: 30_000 }).catch(() => {});
    await page.waitForTimeout(500);
    const closedAfterNav = await page.locator("button.hq-sidebar-close").evaluate((b) => b.getBoundingClientRect().right <= 0 || b.getBoundingClientRect().left >= innerWidth).catch(() => null);
    const s3 = await shot(page, "mobile-nav__after-navigate");
    await open.click();
    await page.waitForTimeout(300);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(400);
    const escClosed = (await open.getAttribute("aria-expanded")) === "false";
    const s4 = await shot(page, "mobile-nav__after-escape");
    record(
      "mobile nav drawer",
      expanded === "true" && linkVisible && page.url().endsWith("/hq/retainers") && closedAfterNav !== false,
      `aria-expanded on open=${expanded}; Retainers link visible=${linkVisible}; navigated to ${page.url().replace(BASE, "")}; drawer closed after navigation=${closedAfterNav}; Escape closes=${escClosed}`,
      [s1, s2, s3, s4]
    );
    await ctx.close();
  },

  async desktopNavAndHistory(browser) {
    const ctx = await authedContext(browser, DESKTOP);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/hq`, { waitUntil: "networkidle" });
    const visited = [];
    for (const [label, path] of [["Retainers", "/hq/retainers"], ["Portfolio", "/hq/portfolio"], ["SEOS", "/hq/seos"], ["Settings", "/hq/settings"]]) {
      await page.locator(`a.hq-sidebar-nav-link[href="${path}"]`).first().click();
      await page.waitForURL(`**${path}`, { timeout: 30_000 }); // client-side navigation
      await page.waitForLoadState("networkidle");
      const active = await page.locator("a.hq-sidebar-nav-link--active").allTextContents();
      visited.push(`${label}→${page.url().replace(BASE, "")} [active: ${active.map((t) => t.trim()).join("|")}]`);
    }
    await page.goBack();
    await page.waitForURL("**/hq/seos");
    const back = page.url().replace(BASE, "");
    await page.goForward();
    await page.waitForURL("**/hq/settings");
    await page.waitForLoadState("networkidle");
    const fwd = page.url().replace(BASE, "");
    await page.goto(`${BASE}/hq`, { waitUntil: "networkidle" });
    const overviewActive = await page.locator("a.hq-sidebar-nav-link--active").allTextContents();
    const hover = page.locator("a.hq-sidebar-nav-link", { hasText: "Goals" }).first();
    const before = await hover.evaluate((a) => getComputedStyle(a).backgroundColor);
    await hover.hover();
    await page.waitForTimeout(250);
    const after = await hover.evaluate((a) => getComputedStyle(a).backgroundColor);
    const s1 = await shot(page, "desktop-nav__hover-goals");
    record(
      "desktop nav, active state, back/forward, hover",
      back.includes("/hq/seos") && fwd.includes("/hq/settings"),
      `${visited.join("; ")}; back→${back}; forward→${fwd}; on /hq active items: ${overviewActive.map((t) => t.trim()).join(" + ")}; hover bg ${before}→${after}`,
      [s1]
    );
    await ctx.close();
  },

  async keyboardFocus(browser) {
    const ctx = await authedContext(browser, DESKTOP);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/hq`, { waitUntil: "networkidle" });
    const stops = [];
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press("Tab");
      stops.push(
        await page.evaluate(() => {
          const el = document.activeElement;
          const s = getComputedStyle(el);
          const ring = s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0 ? `outline ${s.outlineWidth} ${s.outlineColor}` : s.boxShadow !== "none" ? "box-shadow" : "NO VISIBLE RING";
          return `${el.tagName.toLowerCase()} "${(el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 30)}" ${ring}`;
        })
      );
      if (i === 0) await shot(page, "keyboard__first-tab-skip-link");
    }
    const s = await shot(page, "keyboard__6th-tab");
    record("keyboard focus order + visible ring", !stops.some((x) => x.includes("NO VISIBLE RING")), stops.join(" → "), [s]);
    await ctx.close();
  },

  async storageBanner(browser) {
    const ctx = await authedContext(browser, DESKTOP);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/hq`, { waitUntil: "networkidle" });
    const banner = page.getByText("Ops store is file-backed", { exact: false });
    const visible1 = await banner.isVisible();
    await page.getByText("Dismiss for session").click();
    await page.waitForTimeout(300);
    const visible2 = await banner.isVisible().catch(() => false);
    const s1 = await shot(page, "banner__dismissed");
    await page.reload({ waitUntil: "networkidle" });
    const visible3 = await banner.isVisible().catch(() => false);
    record("ops file-store banner dismiss", visible1 && !visible2 && !visible3, `shown=${visible1}; after dismiss=${visible2}; after reload (same session)=${visible3}`, [s1]);
    await ctx.close();
  },

  // Branch-only (cursor/hq-tl-readonly-git-graph): /hq/fronts/hq repo timeline + commit drawer.
  async repoTimeline(browser) {
    for (const [vp, size] of [["desktop", DESKTOP], ["mobile", MOBILE]]) {
      const ctx = await authedContext(browser, size);
      const page = await ctx.newPage();
      const apiCalls = [];
      page.on("response", (r) => r.url().includes("/hq/api/repo-timeline") && apiCalls.push(`${r.status()} ${r.url().replace(BASE, "").slice(0, 60)}`));
      await page.goto(`${BASE}/hq/fronts/hq`, { waitUntil: "networkidle" });
      const expand = page.getByRole("button", { name: /expand timeline/i });
      await expand.scrollIntoViewIfNeeded();
      const shots = [await shot(page, `timeline__${vp}__collapsed`)];
      await expand.click();
      const t0 = Date.now();
      const loading = await page.locator(".hq-repo-skeleton").isVisible().catch(() => false);
      if (loading) shots.push(await shot(page, `timeline__${vp}__loading`));
      await page.waitForSelector(".hq-repo-node, .hq-repo-state[role=alert]", { timeout: 60_000 }).catch(() => {});
      const loadMs = Date.now() - t0;
      const err = await page.locator(".hq-repo-state[role=alert]").textContent().catch(() => null);
      const nodes = await page.locator(".hq-repo-node").count();
      await page.locator(".hq-repo-timeline").scrollIntoViewIfNeeded().catch(() => {});
      shots.push(await shot(page, `timeline__${vp}__expanded`));
      const scroll = await page.locator(".hq-repo-scroll").evaluate((e) => ({ sw: e.scrollWidth, cw: e.clientWidth })).catch(() => null);
      let drawer = "not opened";
      let escape = "n/a";
      let navBtns = "n/a";
      if (nodes) {
        await page.locator(".hq-repo-node").last().click();
        await page.waitForSelector(".hq-repo-drawer", { timeout: 20_000 }).catch(() => {});
        await page.waitForTimeout(1500);
        const d = page.locator(".hq-repo-drawer");
        drawer = (await d.isVisible())
          ? `open; title "${(await d.locator(".hq-repo-drawer-title").textContent()).trim().slice(0, 50)}"; within viewport width=${await d.evaluate((e) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth + 1; })}`
          : "did not open";
        await d.scrollIntoViewIfNeeded().catch(() => {});
        shots.push(await shot(page, `timeline__${vp}__drawer`));
        await page.locator(".hq-repo-scroll").focus();
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
        escape = (await d.isVisible().catch(() => false)) ? "still open" : "closed";
        const before = await page.locator(".hq-repo-scroll").evaluate((e) => e.scrollLeft);
        await page.getByRole("button", { name: "Older" }).click();
        await page.waitForTimeout(600);
        const older = await page.locator(".hq-repo-scroll").evaluate((e) => e.scrollLeft);
        await page.getByRole("button", { name: "Current tip" }).click();
        await page.waitForTimeout(600);
        const tip = await page.locator(".hq-repo-scroll").evaluate((e) => e.scrollLeft);
        navBtns = `scrollLeft ${Math.round(before)} → Older ${Math.round(older)} → Current tip ${Math.round(tip)}`;
        shots.push(await shot(page, `timeline__${vp}__after-older-tip`));
      }
      record(
        `repo timeline (${vp})`,
        !err && nodes > 0 && drawer.startsWith("open") && escape === "closed",
        `api: ${apiCalls.join(", ") || "none"}; loaded in ${loadMs}ms (skeleton seen=${loading}); error=${err?.trim().slice(0, 80) || "none"}; nodes=${nodes}; scroller ${scroll ? `${scroll.sw}/${scroll.cw}px` : "n/a"}; drawer: ${drawer}; Escape: ${escape}; ${navBtns}`,
        shots
      );
      await ctx.close();
    }
  },

  // Branch-only: the Merge / Remove buttons on /hq/fronts/hq are localStorage-only.
  async branchCardActions(browser) {
    const ctx = await authedContext(browser, DESKTOP);
    const page = await ctx.newPage();
    const outbound = [];
    page.on("request", (r) => !r.url().startsWith(BASE) && !r.url().includes("vercel-scripts") && outbound.push(r.url()));
    await page.goto(`${BASE}/hq/fronts/hq`, { waitUntil: "networkidle" });
    const card = page.locator(".hq-branch-card").first();
    await card.scrollIntoViewIfNeeded();
    const s1 = await shot(page, "branch-card__default");
    await card.getByRole("button", { name: "Merge", exact: true }).click();
    const mergeConfirm = await card.locator(".hq-branch-confirm").innerText().catch(() => "");
    const s2 = await shot(page, "branch-card__merge-confirm");
    await card.getByRole("button", { name: "Cancel" }).click();
    await card.getByRole("button", { name: "Remove", exact: true }).click();
    await card.getByRole("button", { name: "Delete remote branch" }).click();
    const destroyText = await card.locator(".hq-branch-confirm").innerText().catch(() => "");
    const s3 = await shot(page, "branch-card__delete-remote-confirm");
    await card.getByRole("button", { name: "Cancel" }).click();
    record(
      "branch card Merge/Remove (local-only)",
      outbound.length === 0,
      `outbound requests=${outbound.length}; Merge confirm: "${mergeConfirm.replace(/\s+/g, " ").slice(0, 160)}"; Delete remote confirm: "${destroyText.replace(/\s+/g, " ").slice(0, 160)}"`,
      [s1, s2, s3]
    );
    await ctx.close();
  },

  async signOut(browser) {
    const ctx = await authedContext(browser, DESKTOP);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/hq/retainers`, { waitUntil: "networkidle" });
    await page.locator('a.hq-sidebar-nav-link[href="/hq/settings"]').first().click();
    await page.waitForURL("**/hq/settings");
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL("**/hq/login**", { timeout: 15_000 }).catch(() => {});
    const out = page.url().replace(BASE, "");
    await page.goBack();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    const back = page.url().replace(BASE, "");
    const dataShown = await page.getByText(/Client retainers|Four Fronts|Good morning/).first().isVisible().catch(() => false);
    const loginShown = await page.locator("input[type=password]").isVisible().catch(() => false);
    const s = await shot(page, "signout__back-button");
    record("sign out + back button stays locked", out.includes("/hq/login") && !dataShown, `after sign out: ${out}; browser Back → ${back}: dashboard data visible=${dataShown}, login form=${loginShown}`, [s]);
    await ctx.close();
  },
};

const BRANCH_ONLY = { repoTimeline: "/hq/fronts/hq", branchCardActions: "/hq/fronts/hq" };
const cookie = readFileSync(join(STATE, "cookie"), "utf8").trim();
const browser = await req.chromium.launch({ executablePath: chromiumPath });
for (const [name, fn] of Object.entries(flows)) {
  if (ONLY && !ONLY.includes(name)) continue;
  if (BRANCH_ONLY[name]) {
    const res = await fetch(`${BASE}${BRANCH_ONLY[name]}`, { headers: { Cookie: cookie } });
    if (res.status === 404) {
      console.log(`SKIP ${name} — ${BRANCH_ONLY[name]} not in this build`);
      continue;
    }
  }
  try {
    await fn(browser);
  } catch (e) {
    record(name, false, `threw: ${e.message.split("\n")[0]}`, []);
  }
}
await browser.close();
writeFileSync(join(OUT, "flows.json"), JSON.stringify(results, null, 2));
