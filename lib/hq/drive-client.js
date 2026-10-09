import { createSign } from "node:crypto";

// Read-only Google Drive client for the Drive ↔ room bridge. Service-account
// JWT auth with Node's crypto (no new dependency), drive.readonly scope only.
// The credential itself is Mark's gate: nothing here runs until
// HQ_DRIVE_SERVICE_ACCOUNT_JSON and HQ_DRIVE_RELAY_FOLDER are set.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const FILES_URL = "https://www.googleapis.com/drive/v3/files";
const SCOPE = "https://www.googleapis.com/auth/drive.readonly";
const TEXT_TYPES = ["text/markdown", "text/plain", "text/x-markdown"];
const GOOGLE_DOC = "application/vnd.google-apps.document";

const b64url = (value) => Buffer.from(value).toString("base64url");

/** The signed RS256 assertion for the OAuth token exchange. */
export function serviceAccountAssertion({ client_email, private_key }, nowSeconds) {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({ iss: client_email, scope: SCOPE, aud: TOKEN_URL, iat: nowSeconds, exp: nowSeconds + 3600 }));
  const signature = createSign("RSA-SHA256").update(`${header}.${claims}`).sign(private_key).toString("base64url");
  return `${header}.${claims}.${signature}`;
}

/** Drive query for files directly in the folder, changed after `since`. Quotes are escaped. */
export function changedQuery(folderId, sinceIso) {
  const esc = (value) => String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `'${esc(folderId)}' in parents and trashed = false and modifiedTime > '${esc(sinceIso)}'`;
}

/**
 * credentials: parsed service-account JSON. Returns { changedFiles(sinceIso) } →
 * [{ fileId, title, mimeType, modifiedTime, viewUrl, text }] for Docs and text/markdown files.
 */
export function createDriveClient({ credentials, folderId, fetchImpl = fetch, now = Date.now }) {
  let cached = null;

  async function token() {
    if (cached && cached.expiresAt - 60_000 > now()) return cached.value;
    const res = await fetchImpl(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: serviceAccountAssertion(credentials, Math.floor(now() / 1000)),
      }).toString(),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) throw new Error(`Drive token exchange failed (HTTP ${res.status}).`);
    cached = { value: data.access_token, expiresAt: now() + Number(data.expires_in || 3600) * 1000 };
    return cached.value;
  }

  async function get(url, as = "json") {
    const res = await fetchImpl(url, { headers: { authorization: `Bearer ${await token()}` } });
    if (!res.ok) throw new Error(`Drive request failed (HTTP ${res.status}).`);
    return as === "text" ? res.text() : res.json();
  }

  async function changedFiles(sinceIso) {
    const files = [];
    let pageToken = "";
    do {
      const params = new URLSearchParams({
        q: changedQuery(folderId, sinceIso),
        fields: "nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink)",
        orderBy: "modifiedTime",
        pageSize: "100",
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
      });
      if (pageToken) params.set("pageToken", pageToken);
      const page = await get(`${FILES_URL}?${params}`);
      files.push(...(page.files || []));
      pageToken = page.nextPageToken || "";
    } while (pageToken && files.length < 500);

    const out = [];
    for (const file of files) {
      const id = encodeURIComponent(file.id);
      let text;
      if (file.mimeType === GOOGLE_DOC) text = await get(`${FILES_URL}/${id}/export?mimeType=text%2Fplain`, "text");
      else if (TEXT_TYPES.includes(file.mimeType)) text = await get(`${FILES_URL}/${id}?alt=media&supportsAllDrives=true`, "text");
      else continue; // folders, PDFs, images: not bridge entries
      out.push({ fileId: file.id, title: file.name, mimeType: file.mimeType, modifiedTime: file.modifiedTime, viewUrl: file.webViewLink || "", text });
    }
    return out;
  }

  return { changedFiles };
}
