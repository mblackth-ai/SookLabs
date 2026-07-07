const BASE = "http://localhost:3008";
const PASSWORD = "sooklabs-hq-dev";

const routes = [
  "/hq/login",
  "/hq",
  "/hq/briefing",
  "/hq/agents",
  "/hq/portfolio",
  "/hq/automation",
  "/hq/sookly",
  "/hq/sookly/action-plan",
  "/hq/sookly/receptionist-readiness",
  "/hq/sookly/knowledge-usage",
  "/hq/decision-log",
  "/hq/seos",
  "/hq/seos/knowledge-base",
  "/hq/seos/semantic-readiness",
  "/hq/seos/content-gaps",
  "/hq/seos/competitor-signals",
  "/hq/seos/distribution-map",
  "/hq/seos/exports",
  "/hq/roastmyopsec",
  "/hq/marketing",
  "/hq/engineering",
  "/hq/integrations",
  "/hq/settings",
  "/assets/sooklabs/sooklabs-glyph.png",
];

async function fetchStatus(path, cookie = "") {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const res = await fetch(BASE + path, {
      redirect: "manual",
      signal: ctrl.signal,
      headers: cookie ? { cookie } : {},
    });
    clearTimeout(t);
    const text = await res.text();
    return { path, status: res.status, len: text.length, hasError: /Application error|Module not found|Hydration failed/i.test(text) };
  } catch (e) {
    clearTimeout(t);
    return { path, status: "ERR", error: e.message };
  }
}

async function login() {
  const res = await fetch(BASE + "/hq/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: PASSWORD }),
  });
  const data = await res.json();
  const setCookie = res.headers.getSetCookie?.() ?? [];
  const cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  return { ok: res.ok && data.ok, status: res.status, data, cookie };
}

async function testOpsApi(cookie) {
  const getRes = await fetch(BASE + "/hq/api/ops", { headers: { cookie } });
  const getData = await getRes.json();
  const patchRes = await fetch(BASE + "/hq/api/ops", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ briefingNotes: { sections: { priorities: "smoke test" } } }),
  });
  const patchData = await patchRes.json();
  return {
    get: { ok: getRes.ok && getData.ok, status: getRes.status },
    patch: { ok: patchRes.ok && patchData.ok, status: patchRes.status },
  };
}

const unauth = [];
for (const path of routes) {
  unauth.push(await fetchStatus(path));
}

const loginResult = await login();
const authed = [];
let opsApi = null;
if (loginResult.cookie) {
  for (const path of routes.filter((p) => p.startsWith("/hq") && p !== "/hq/login")) {
    authed.push(await fetchStatus(path, loginResult.cookie));
  }
  opsApi = await testOpsApi(loginResult.cookie);
}

const failures = authed.filter((r) => r.status !== 200 || r.hasError);
console.log(
  JSON.stringify(
    {
      loginResult: { ...loginResult, cookie: loginResult.cookie ? "[set]" : "" },
      opsApi,
      authedFailures: failures,
      unauth,
      authed,
    },
    null,
    2
  )
);

if (!loginResult.ok || failures.length > 0 || (opsApi && (!opsApi.get.ok || !opsApi.patch.ok))) {
  process.exit(1);
}
