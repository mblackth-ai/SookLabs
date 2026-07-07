import { cookies } from "next/headers";
import { HQ_COOKIE, verifySessionToken } from "@/lib/hq/auth";

export async function isHqSessionValid() {
  const cookieStore = await cookies();
  const token = cookieStore.get(HQ_COOKIE)?.value;
  const secret = process.env.HQ_SESSION_SECRET?.trim();
  return verifySessionToken(token, secret);
}
