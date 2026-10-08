import { cookies, headers } from "next/headers";
import { BusinessSection } from "@/components/hq/ReportsBoard";
import { OWNER_COOKIE, ownerForKey } from "@/lib/hq/owner-portal";
import { readAnalyticsSummary } from "@/lib/hq/analytics-client";
import { getSeosAppUrl } from "@/lib/hq/paths";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your reports · SookLabs", robots: { index: false, follow: false } };

const shell = { maxWidth: 1100, margin: "0 auto", padding: "32px 20px 48px", display: "grid", gap: 20, fontFamily: "var(--font-sans)" };

/** Owner room: one business only, chosen by the owner's key, never by the URL. */
export default async function OwnerRoomPage() {
  const key = (await cookies()).get(OWNER_COOKIE)?.value;
  let owner = null;
  try {
    owner = await ownerForKey(key);
  } catch {
    owner = null;
  }
  if (!owner) {
    return (
      <div className="hq-owner-page"><main style={shell}>
        <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", color: "var(--text-primary)" }}>Your reports</h1>
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
          Open the invite link SookLabs sent you to see your reports on this device.
        </p>
      </main></div>
    );
  }

  const host = ((await headers()).get("host") || "").split(":")[0];
  const logoutAction = host === "hq.sooklabs.com" ? "/api/client/logout" : "/hq/api/client/logout";
  const result = await readAnalyticsSummary(6);
  const business = result.data.workspaces.find((w) => w.slug === owner.business);

  return (
    <div className="hq-owner-page"><main style={shell}>
      <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>SookLabs · private report room</div>
        <form method="post" action={logoutAction}>
          <button type="submit" style={{ background: "transparent", border: "1px solid var(--border-default)", color: "var(--text-secondary)", borderRadius: "var(--radius-md)", padding: "6px 12px", fontSize: "var(--text-xs)", cursor: "pointer" }}>
            Sign out on this device
          </button>
        </form>
      </header>
      {business ? (
        <BusinessSection business={business} seosUrl={getSeosAppUrl()} ownerView />
      ) : (
        <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
          Your reports are unavailable right now. Try again shortly.
        </p>
      )}
      <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--text-tertiary)" }}>
        Positions come from Google Search Console; lower is better (#1 is the top result). Updated monthly.
      </p>
    </main></div>
  );
}
