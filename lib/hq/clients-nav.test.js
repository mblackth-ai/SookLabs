import { test } from "node:test";
import assert from "node:assert/strict";
import { CLIENTS, clientActionItems, clientNavRows, clientSections, getClient, mentionsClient } from "./clients.js";
import { nav } from "./mock-data.js";
import { getRetainerSnapshot, retainerKeys } from "./retainers.js";
import { assertContractDocument } from "./retainer-doc-check.js";

test("HQ has a client entry for RDUSA, JAKA, SookLabs and Sookly Omnichat", () => {
  assert.deepEqual(CLIENTS.map((c) => c.slug), ["rdusa", "jaka", "sooklabs", "sookly"]);
  assert.equal(getClient("sookly").name, "Sookly Omnichat");
  assert.ok(getClient("jaka").contacts.some((c) => c.value === "(816) 299-7989"));
  assert.ok(getClient("jaka").contacts.some((c) => c.value === "(913) 957-9311"));
});

test("RDUSA and JAKA each get Retainer, Content & Social and Briefing; internal brands have no retainer", () => {
  for (const slug of ["rdusa", "jaka"]) {
    assert.deepEqual(clientSections(getClient(slug)).map((s) => s.href), [
      `/hq/clients/${slug}`,
      `/hq/clients/${slug}/retainer`,
      `/hq/clients/${slug}/content`,
      `/hq/clients/${slug}/briefing`,
    ]);
  }
  assert.deepEqual(clientSections(getClient("sooklabs")).map((s) => s.key), ["overview", "content", "briefing"]);
});

test("sidebar nav lists every client and its section pages, always open, under Clients", () => {
  const i = nav.findIndex((r) => r.id === "clients");
  assert.ok(i >= 0);
  const rows = clientNavRows();
  for (const r of rows) {
    const at = nav.findIndex((n) => n.id === r.id);
    assert.ok(at > i, `${r.id} sits under Clients`);
    assert.equal(nav[at].alwaysOpen, true);
  }
  const hrefs = nav.map((r) => r.href);
  for (const h of ["/hq/retainers", "/hq/clients/rdusa", "/hq/clients/rdusa/retainer", "/hq/clients/rdusa/content", "/hq/clients/rdusa/briefing", "/hq/clients/jaka", "/hq/clients/jaka/retainer", "/hq/clients/jaka/content", "/hq/clients/jaka/briefing"]) {
    assert.ok(hrefs.includes(h), h);
  }
  // No divider or new item between Clients and the last client row (the Sidebar groups subitems by the preceding item).
  const last = nav.findIndex((n) => n.id === rows.at(-1).id);
  assert.ok(nav.slice(i + 1, last + 1).every((r) => r.kind === "subitem" || r.kind === "subsubitem"));
});

test("retainer snapshots exist for RDUSA and JAKA and match their contract documents", () => {
  assert.deepEqual(retainerKeys(), ["rdusa", "jaka"]);
  for (const c of CLIENTS) {
    const s = getRetainerSnapshot(c.retainer);
    if (!c.retainer) { assert.equal(s, null); continue; }
    assert.equal(s.clientId, c.retainer);
    assertContractDocument(s);
  }
});

test("client briefing filters action items by business slug and text mentions by name or alias", () => {
  const items = [{ id: "rdusa:blocked:x" }, { id: "jaka:gaps" }, { id: "sooklabs:push" }];
  assert.deepEqual(clientActionItems(items, getClient("jaka")).map((i) => i.id), ["jaka:gaps"]);
  assert.equal(mentionsClient("Refill the Open Door Movers planner", getClient("jaka")), true);
  assert.equal(mentionsClient("Book the Jakarta trip", getClient("jaka")), false);
  assert.equal(mentionsClient("RDUSA slatwall push", getClient("rdusa")), true);
  assert.equal(mentionsClient("", getClient("rdusa")), false);
});
