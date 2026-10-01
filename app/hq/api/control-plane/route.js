import { NextResponse } from "next/server";
import { isHqSessionValid } from "@/lib/hq/session";
import { getControlPlaneSnapshot } from "@/lib/hq/control-plane";

export async function GET() {
  if (!(await isHqSessionValid())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getControlPlaneSnapshot();
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Control-plane snapshot failed" },
      { status: 503 }
    );
  }
}
