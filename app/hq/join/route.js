import { JOIN_GUIDE } from "@/lib/hq/join-guide";

export const dynamic = "force-static";

/** Public, secret-free join guide for agents: GET https://hq.sooklabs.com/hq/join (Markdown). */
export function GET() {
  return new Response(JOIN_GUIDE, {
    headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "public, max-age=300" },
  });
}
