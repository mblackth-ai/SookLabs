import { joinGuideFor } from "@/lib/hq/join-guide";

/** Public, secret-free join guide for one seat: GET https://hq.sooklabs.com/hq/join/<seat> (Markdown). */
export async function GET(request, { params }) {
  const { seat } = await params;
  const guide = joinGuideFor(String(seat || "").toLowerCase());
  if (!guide) return new Response("No such agent seat. See https://hq.sooklabs.com/hq/join\n", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  return new Response(guide, {
    headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}
