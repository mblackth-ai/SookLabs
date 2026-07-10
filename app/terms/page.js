import JsonLd from "@/components/JsonLd";
import { LegalPageShell } from "@/components/site/LegalPageShell";
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED, SITE_URL } from "@/lib/site";
import { legalPageSchemaGraph } from "@/lib/schema";

export const metadata = {
  title: "Terms of Service — SookLabs",
  description:
    "Terms for using the public SookLabs website, including the free GEO audit request form and linked resources.",
};

const description =
  "Terms for using the public SookLabs website, including the free GEO audit request form and linked resources.";

export default function TermsPage() {
  return (
    <>
      <JsonLd data={legalPageSchemaGraph({ path: "/terms", title: metadata.title, description })} />
      <LegalPageShell title="Terms of Service" lastUpdated={LEGAL_LAST_UPDATED}>
        <p>
          These terms apply to your use of the public SookLabs website at{" "}
          <a href={SITE_URL}>{SITE_URL.replace(/^https?:\/\//, "")}</a> and its pages (including the audit request
          form). By using the site, you agree to these terms. If you do not agree, please do not use the site.
        </p>

        <h2>What this site provides</h2>
        <p>
          SookLabs publishes information about our work, ecosystem products, and services. Some pages let you request
          contact or a free GEO audit. Content on the site is provided for general information; it is not a binding
          offer, guarantee of results, or professional advice unless we agree otherwise in writing.
        </p>

        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the site in a way that breaks applicable law or infringes others&apos; rights.</li>
          <li>Attempt to disrupt, probe, or gain unauthorized access to the site or related systems.</li>
          <li>Submit false, misleading, or abusive form content.</li>
          <li>Scrape or automate access in a way that imposes unreasonable load on the service.</li>
        </ul>

        <h2>Forms and communications</h2>
        <p>
          When you submit a contact or audit form, you confirm that the details you provide are accurate to the best of
          your knowledge and that you are authorized to share them. We may use your submission to respond, prepare an
          audit, or follow up by email. Delivery uses third-party email infrastructure (Resend) as described in our{" "}
          <a href="/privacy">Privacy Policy</a>.
        </p>
        <p>
          Submitting a form does not create a client relationship, service contract, or obligation for us to provide an
          audit or proposal within any particular timeframe.
        </p>

        <h2>Free GEO audit</h2>
        <p>
          The audit request page describes what we aim to review. We may decline, limit, or prioritize requests at our
          discretion. Any audit output is informational and based on what we can observe at the time of review; search
          and AI systems change frequently.
        </p>

        <h2>Third-party links</h2>
        <p>
          The site links to external properties (for example Sookly, social profiles, and documentation when available).
          We do not control those sites and are not responsible for their content, availability, or practices.
        </p>

        <h2>Intellectual property</h2>
        <p>
          Site text, branding, and design elements are owned by SookLabs or used with permission. You may view and share
          links to public pages. You may not copy, modify, or republish substantial portions of the site for commercial
          use without our prior written consent.
        </p>

        <h2>Disclaimers</h2>
        <p>
          The site and its content are provided &quot;as is&quot; and &quot;as available&quot;. We do not warrant that
          the site will be uninterrupted, error-free, or fit for a particular purpose. To the fullest extent permitted by
          applicable law, SookLabs disclaims liability for indirect, incidental, or consequential damages arising from
          use of the public site.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          If liability cannot be excluded, our total liability for claims relating to the public site is limited to the
          amount you paid us for use of the site in the twelve months before the claim (which, for free use of this
          site, is zero), unless a different limit is required by law.
        </p>

        <h2>Changes and availability</h2>
        <p>
          We may update these terms or change site content at any time. Continued use after changes are posted means you
          accept the updated terms. We may suspend or remove pages for maintenance or operational reasons.
        </p>

        <h2>Governing approach</h2>
        <p>
          These terms are intended to reflect how we operate the public site from Thailand. They are practical website
          terms, not a substitute for counsel. Disputes should first be raised with us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> so we can try to resolve them directly.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalPageShell>
    </>
  );
}
