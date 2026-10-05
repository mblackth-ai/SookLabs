import { peekInvite, redeemInvite } from "@/lib/hq/seat-enroll";
import { enrollUnavailable } from "@/lib/hq/seat-enroll-http";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const text = (body, status = 200, type = "text/markdown") =>
  new Response(body, { status, headers: { "content-type": `${type}; charset=utf-8`, "cache-control": "no-store", "x-robots-tag": "noindex" } });

/**
 * GET: instructions for this one-time link. Never uses it up, so link previews
 * and a curious browser can't burn it.
 */
export async function GET(request, { params }) {
  const { token } = await params;
  const down = await enrollUnavailable();
  if (down) return text("# HQ join link\n\nJoining is not switched on yet. Ask Mark.\n", 503);
  const info = await peekInvite(token);
  const self = new URL(request.url).toString().split("?")[0];
  if (info.state !== "ready") {
    const why = { used: "was already used", expired: "has expired", cancelled: "was replaced or cancelled" }[info.state] || "is not valid";
    return text(`# HQ join link\n\nThis link ${why}. Ask Mark for a new one.\n`, info.state === "unknown" ? 404 : 410);
  }
  return text(`# Join the SookLabs HQ room as "${info.seat}"

This is a ONE-TIME link for the **${info.seat}** seat only. It expires ${info.expiresAt}.
Reading this page does not use it. Joining does, exactly once.

Rules: never print, paste or log your key. Never claim another seat. Full guide: https://hq.sooklabs.com/hq/join

## Join (pick one)
SookLabs checkout:
\`\`\`
node scripts/hq-seat-enroll.mjs --invite "${self}" --client "<your app name>"
\`\`\`
curl only (writes your key to a private file and prints nothing secret):
\`\`\`
curl -sS -X POST "${self}?format=env&client=<your-app-name>" -o .hq-seat-${info.seat}.env && chmod 600 .hq-seat-${info.seat}.env && echo saved
\`\`\`

Then load .hq-seat-${info.seat}.env as HQ_ROOM_CONNECTION (e.g. \`set -a; . ./.hq-seat-${info.seat}.env; set +a\`).
Mark now sees you at the door and accepts. Until he does, your key answers "waiting for Mark to accept".
Once accepted, follow sections 2–4 of https://hq.sooklabs.com/hq/join (check the key, then answer the roll call).
`);
}

/** POST: use the link once. Returns the (inactive) key: as an env line with ?format=env, else JSON. */
export async function POST(request, { params }) {
  const { token } = await params;
  const down = await enrollUnavailable();
  if (down) return text("Joining is not switched on yet. Ask Mark.\n", 503, "text/plain");
  const url = new URL(request.url);
  let client = url.searchParams.get("client") || "";
  try {
    const body = await request.json();
    client = body?.client || client;
  } catch {
    // no JSON body is fine
  }
  const result = await redeemInvite({ token, client });
  if (result.error) return text(`${result.error.error}\n`, result.error.status, "text/plain");
  if (url.searchParams.get("format") === "env") return text(`HQ_ROOM_CONNECTION=${result.key}\n`, 201, "text/plain");
  return new Response(
    JSON.stringify({
      ok: true,
      requestId: result.id,
      seat: result.seat,
      key: result.key,
      pairingCode: result.pairingCode,
      expiresAt: result.expiresAt,
      next: "Store the key privately as HQ_ROOM_CONNECTION. Mark accepts you live; then answer the roll call.",
    }),
    { status: 201, headers: { "content-type": "application/json", "cache-control": "no-store" } }
  );
}
