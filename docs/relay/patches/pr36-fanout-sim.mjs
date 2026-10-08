// Simulated GitHub: master has 600 linear commits; 20 branches each add 3 commits off master~k.
const [modPath] = process.argv.slice(2);
const N = 600, master = Array.from({ length: N }, (_, i) => `m${N - 1 - i}`); // newest first
const parentOf = new Map(master.map((s, i) => [s, master[i + 1]]));
const branches = [];
for (let b = 0; b < 20; b++) {
  const base = master[b * 5];
  let prev = base;
  for (let k = 0; k < 3; k++) { const s = `b${b}_${k}`; parentOf.set(s, prev); prev = s; }
  branches.push({ name: `feat-${b}`, commit: { sha: prev } });
}
let calls = 0;
globalThis.fetch = async (url) => {
  calls++;
  const u = new URL(url);
  const json = (v) => ({ ok: true, status: 200, headers: new Headers(), json: async () => v, text: async () => JSON.stringify(v) });
  if (/\/repos\/[^/]+\/[^/]+$/.test(u.pathname)) return json({ default_branch: "master" });
  if (u.pathname.endsWith("/branches")) return json(u.searchParams.get("page") === "1" ? [{ name: "master", commit: { sha: master[0] } }, ...branches] : []);
  if (u.pathname.endsWith("/pulls")) return json([]);
  if (u.pathname.endsWith("/commits")) {
    const page = +u.searchParams.get("page"); const chain = [];
    for (let s = u.searchParams.get("sha"); s; s = parentOf.get(s)) chain.push(s);
    return json(chain.slice((page - 1) * 100, page * 100).map((sha) => ({ sha, parents: parentOf.get(sha) ? [{ sha: parentOf.get(sha) }] : [], commit: { message: sha, author: { name: "x", date: "2026-01-01T00:00:00Z" } } })));
  }
  return json([]);
};
process.env.HQ_GITHUB_TOKEN = "test";
process.chdir("/");  // no local git -> GitHub path, like a shallow Vercel clone
const { loadSookLabsRepoGraph } = await import(modPath);
const g1 = await loadSookLabsRepoGraph();
const first = calls;
await loadSookLabsRepoGraph();
console.log(JSON.stringify({ ok: g1.ok !== false, source: g1.source, commits: g1.commits?.length ?? g1.nodes?.length, firstLoadCalls: first, secondLoadCalls: calls - first }));
