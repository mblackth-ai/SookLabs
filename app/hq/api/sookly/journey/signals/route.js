import { isHqSessionValid } from "@/lib/hq/session";
import { json } from "@/lib/hq/room-http";
import { ingestJourneySignal } from "@/lib/sookly/journey-ingest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request) {
  if (!(await isHqSessionValid())) {
    return json({ ok: false, error: "HQ login required." }, 401);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "JSON body required." }, 400);
  }

  const source = body?.source;
  if (source !== "email" && source !== "quo" && source !== "calendar") {
    return json({ ok: false, error: 'source must be "email", "quo", or "calendar".' }, 400);
  }

  const result = ingestJourneySignal({
    source,
    caseId: body.caseId,
    currentStageId: body.currentStageId,
    payload: body.payload,
  });

  if (!result.ok) {
    return json({ ok: false, error: result.error }, 400);
  }

  return json({ ok: true, ...result });
}
