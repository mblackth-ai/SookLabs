import { cookies } from "next/headers";
import { SEOS_COOKIE, resolveSessionSecret, verifySessionToken } from "@/lib/seos/auth";

export async function isSeosSessionValid() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SEOS_COOKIE)?.value;
  const secret = resolveSessionSecret();
  return verifySessionToken(token, secret);
}
