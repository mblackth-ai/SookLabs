import { NextResponse } from "next/server";
import { isHqSessionValid } from "@/lib/hq/session";
import { decideAuthorityApproval, readAuthoritySummary } from "@/lib/hq/authority-client";

export async function GET() {
  if (!(await isHqSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const result = await readAuthoritySummary();
  return NextResponse.json(result, { status: result.ok ? 200 : 503 });
}

export async function PATCH(request) {
  if (!(await isHqSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const data = await decideAuthorityApproval({
      ...body,
      approver: body.approver || "SookLabs HQ",
    });
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Authority approval failed" },
      { status: 400 }
    );
  }
}
