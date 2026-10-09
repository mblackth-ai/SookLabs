import { headers } from "next/headers";
import { peekOwnerInvite } from "@/lib/hq/owner-portal";
import { readAnalyticsSummary } from "@/lib/hq/analytics-client";
import { OWNER_JOIN_ERRORS, ownerJoinErrorText } from "@/lib/hq/owner-join-errors";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your reports · SookLabs", robots: { index: false, follow: false } };

const box = { maxWidth: 520, margin: "12vh auto", padding: 24, display: "grid", gap: 14, fontFamily: "var(--font-sans)", color: "var(--text-primary)" };
const button = {
  background: "var(--color-cyan-400)", color: "#041014", border: 0, borderRadius: "var(--radius-md)",
  padding: "10px 16px", fontSize: "var(--text-sm)", fontWeight: 600, cursor: "pointer",
};

/** GET never uses the link (chat-app previews can't burn it); the button POSTs it once. */
export default async function OwnerJoinPage({ params, searchParams }) {
  const { token } = await params;
  const { error } = (await searchParams) || {};
  const host = ((await headers()).get("host") || "").split(":")[0];
  const action = host === "hq.sooklabs.com" ? "/api/client/redeem" : "/hq/api/client/redeem";

  let peek = { state: "unknown" };
  try {
    peek = await peekOwnerInvite(token);
  } catch {
    peek = { state: "unavailable" };
  }
  let name = "";
  if (peek.state === "ready") {
    const summary = await readAnalyticsSummary(1);
    name = summary.data.workspaces.find((w) => w.slug === peek.business)?.name || "";
  }

  const message = OWNER_JOIN_ERRORS[peek.state];
  const alert = ownerJoinErrorText(error);

  return (
    <div className="hq-owner-page"><main style={box}>
      <h1 style={{ margin: 0, fontSize: "var(--text-2xl)" }}>{name ? `${name} reports` : "Your reports"}</h1>
      {peek.state === "ready" ? (
        <>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
            SookLabs has invited {peek.label ? <strong>{peek.label}</strong> : "you"} to a private room with your search rankings and the
            work underway. This link works once: opening the room keeps you signed in on this device.
          </p>
          {alert && <p role="alert" style={{ margin: 0, color: "var(--color-error)", fontSize: "var(--text-sm)" }}>{alert}</p>}
          <form method="post" action={action}>
            <input type="hidden" name="token" value={token} />
            <button type="submit" style={button}>Open my reports</button>
          </form>
        </>
      ) : (
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{message}</p>
      )}
    </main></div>
  );
}
