import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { COMING_SOON, filterNavPages, nav, navPages, TOP_LEVEL_IDS } from "./nav.js";
import { nav as legacyNav } from "./mock-data.js";

const ROOTS = [new URL("../../app/hq/(dash)/", import.meta.url), new URL("../../app/hq/", import.meta.url)];

function pageExists(href) {
  const rel = href.replace(/^\/hq\/?/, "");
  const parts = rel ? rel.split("/") : [];
  // Client pages live under the dynamic [slug] segment.
  if (parts[0] === "clients" && parts.length >= 2) parts[1] = "[slug]";
  return ROOTS.some((root) => existsSync(new URL([...parts, "page.js"].join("/"), root)));
}

test("top-level nav is the ten command-center sections in mockup order", () => {
  const items = nav.filter((r) => r.kind === "item");
  assert.deepEqual(items.map((r) => r.label), ["Home", "Social", "Messages", "Customers", "Tasks", "Content", "Campaigns", "Analytics", "Team", "Settings"]);
  assert.deepEqual(items.map((r) => r.id), TOP_LEVEL_IDS);
  assert.equal(legacyNav, nav, "mock-data re-exports the same nav");
});

test("every nav row links to a page that exists (no dead links)", () => {
  for (const r of nav) {
    assert.ok(r.href, `${r.id} has an href`);
    assert.ok(pageExists(r.href), `${r.id} → ${r.href} has a page`);
  }
});

test("sections without a page are flagged Coming soon and have a Coming soon page", () => {
  const soon = nav.filter((r) => r.soon).map((r) => r.id);
  assert.deepEqual(soon.sort(), Object.keys(COMING_SOON).sort());
  for (const id of soon) {
    assert.ok(pageExists(`/hq/${id}`));
    for (const l of COMING_SOON[id].today) assert.ok(pageExists(l.href), l.href);
  }
});

test("every page from the previous nav is still reachable", () => {
  const hrefs = new Set(nav.map((r) => r.href));
  for (const h of ["/hq", "/hq/goals", "/hq/briefing", "/hq/decision-log", "/hq/review", "/hq/portfolio", "/hq/sookly", "/hq/sookly/action-plan", "/hq/seos", "/hq/seos/authority", "/hq/seos/social-gtm", "/hq/content", "/hq/clients", "/hq/retainers", "/hq/reports", "/hq/roastmyopsec", "/hq/community", "/hq/room", "/hq/automation", "/hq/settings"]) {
    assert.ok(hrefs.has(h), h);
  }
});

test("JAKA and RDUSA submenus stay nested under Customers", () => {
  const customers = nav.findIndex((r) => r.id === "clients");
  assert.equal(nav[customers].label, "Customers");
  const next = nav.findIndex((r, i) => i > customers && r.kind === "item");
  const group = nav.slice(customers + 1, next);
  for (const slug of ["rdusa", "jaka"]) {
    const head = group.find((r) => r.id === `client-${slug}`);
    assert.ok(head, `${slug} under Customers`);
    assert.equal(head.kind, "subitem");
    const subs = group.filter((r) => r.id.startsWith(`client-${slug}-`));
    assert.deepEqual(subs.map((r) => r.href), [`/hq/clients/${slug}/retainer`, `/hq/clients/${slug}/content`, `/hq/clients/${slug}/briefing`]);
    assert.ok(subs.every((r) => r.kind === "subsubitem" && r.alwaysOpen));
  }
});

test("search filters pages client-side by label, trail and keywords", () => {
  const pages = navPages();
  assert.equal(new Set(pages.map((p) => p.href)).size, pages.length, "deduped");
  assert.deepEqual(filterNavPages("", pages), []);
  assert.deepEqual(filterNavPages("   ", pages), []);
  assert.equal(filterNavPages("brief", pages)[0].href, "/hq/briefing");
  const jaka = filterNavPages("jaka retainer", pages);
  assert.equal(jaka[0].href, "/hq/clients/jaka/retainer");
  assert.deepEqual(jaka[0].trail, ["Customers", "JAKA", "Retainer"]);
  assert.equal(filterNavPages("clients", pages)[0].href, "/hq/clients");
  assert.ok(filterNavPages("messages", pages)[0].soon);
  assert.deepEqual(filterNavPages("zzzz-no-such-page", pages), []);
});
