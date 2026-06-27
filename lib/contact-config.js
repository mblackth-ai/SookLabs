const DEFAULT_TO = "sooklabs.th@gmail.com";
/** Resend requires a verified domain for custom From; use their sender until sooklabs.com is verified. */
const DEFAULT_FROM = "SookLabs <onboarding@resend.dev>";

export function getContactConfig() {
  const fromRaw = process.env.CONTACT_FROM_EMAIL?.trim() || "";
  const fromEmail =
    fromRaw && !fromRaw.includes("gmail.com") ? fromRaw : DEFAULT_FROM;

  return {
    resendApiKey: process.env.RESEND_API_KEY?.trim() || "",
    toEmail: process.env.CONTACT_TO_EMAIL?.trim() || DEFAULT_TO,
    fromEmail,
  };
}

export function isContactConfigured() {
  return Boolean(getContactConfig().resendApiKey);
}
