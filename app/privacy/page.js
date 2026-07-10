import JsonLd from "@/components/JsonLd";
import { LegalPageShell } from "@/components/site/LegalPageShell";
import { CONTACT_EMAIL, LEGAL_LAST_UPDATED } from "@/lib/site";
import { legalPageSchemaGraph } from "@/lib/schema";

export const metadata = {
  title: "Privacy Policy — SookLabs",
  description:
    "How SookLabs collects, uses, and stores information when you visit sooklabs.com or submit a contact or audit request.",
};

const description =
  "How SookLabs collects, uses, and stores information when you visit sooklabs.com or submit a contact or audit request.";

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={legalPageSchemaGraph({ path: "/privacy", title: metadata.title, description })} />
      <LegalPageShell title="Privacy Policy" lastUpdated={LEGAL_LAST_UPDATED}>
        <p>
          This policy describes how SookLabs (&quot;we&quot;, &quot;us&quot;) handles information on{" "}
          <strong>sooklabs.com</strong> and related public pages. It is written for visitors and people who contact us
          through the website. It is not legal advice and does not claim full compliance with any specific law.
        </p>

        <h2>Who operates this site</h2>
        <p>
          SookLabs operates this website from Thailand. For privacy questions, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>What we collect</h2>
        <p>Depending on how you use the site, we may process:</p>
        <ul>
          <li>
            <strong>Contact and audit form data</strong> — name, email address, optional website URL, optional message
            or context, and a subject or form type when you submit the contact or audit form.
          </li>
          <li>
            <strong>Technical usage data</strong> — if Vercel Analytics is enabled, aggregated page-view and performance
            data (for example route, referrer, browser type, and general device information). We do not run advertising
            trackers on this site.
          </li>
          <li>
            <strong>Server and delivery logs</strong> — our hosting provider (Vercel) and email provider (Resend) may
            process IP addresses, timestamps, and request metadata needed to deliver the site and send form
            notifications.
          </li>
        </ul>
        <p>
          We do not ask for payment details on sooklabs.com. Internal tools such as HQ at{" "}
          <strong>hq.sooklabs.com</strong> are password-protected and excluded from public search indexing; this policy
          focuses on the public marketing site.
        </p>

        <h2>How we use information</h2>
        <ul>
          <li>Respond to inquiries and audit requests you send through the forms.</li>
          <li>Operate, secure, and improve the public website.</li>
          <li>Understand aggregate traffic patterns through analytics, where enabled.</li>
        </ul>
        <p>We do not sell your personal information.</p>

        <h2>How form submissions are delivered</h2>
        <p>
          When you submit a contact or audit form, the site sends your details to our team by email through{" "}
          <strong>Resend</strong>. The message is delivered to the address configured for the site (currently{" "}
          {CONTACT_EMAIL}). Your email address is used as the reply-to address so we can respond directly.
        </p>

        <h2>Third-party services</h2>
        <ul>
          <li>
            <strong>Vercel</strong> — hosts sooklabs.com and may provide analytics and infrastructure logs.
          </li>
          <li>
            <strong>Resend</strong> — delivers email notifications for form submissions.
          </li>
        </ul>
        <p>
          Each provider processes data under its own terms and privacy practices. Links to other SookLabs properties
          (for example <a href="https://sookly.co">sookly.co</a>) are governed by those sites&apos; policies when you
          leave sooklabs.com.
        </p>

        <h2>Cookies and similar technologies</h2>
        <p>
          The public site uses minimal cookies or local storage mainly for analytics and normal site operation. We do not
          use cookies for third-party advertising on this site. Your browser may let you block or delete cookies; some
          features may still work without them.
        </p>

        <h2>Retention</h2>
        <p>
          Form submissions are retained in our email inbox for as long as needed to handle your request and maintain
          ordinary business records. Aggregated analytics data is retained according to Vercel&apos;s analytics
          settings. We do not keep a separate marketing database for public-site visitors beyond what is described here.
        </p>

        <h2>Your choices</h2>
        <ul>
          <li>You can contact us by email instead of using the web form.</li>
          <li>You can ask us what information we hold about a prior inquiry and request correction or deletion where reasonable.</li>
          <li>You can use browser controls to limit analytics cookies where applicable.</li>
        </ul>

        <h2>International visitors</h2>
        <p>
          If you access the site from outside Thailand, your information may be processed in Thailand and in countries
          where Vercel or Resend operate infrastructure. By using the site, you understand that transfer may occur.
        </p>

        <h2>Changes</h2>
        <p>
          We may update this page when the site&apos;s practices change. The &quot;Last updated&quot; date at the top
          shows when this version was published.
        </p>
      </LegalPageShell>
    </>
  );
}
