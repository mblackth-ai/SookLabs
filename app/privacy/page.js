import JsonLd from "@/components/JsonLd";
import { LegalPageShell } from "@/components/site/LegalPageShell";
import {
  CONTACT_EMAIL,
  DISCORD_BOT_NAME,
  DISCORD_INVITE_URL,
  DISCORD_SERVER_NAME,
  LEGAL_LAST_UPDATED,
  SITE_URL,
} from "@/lib/site";
import { legalPageSchemaGraph } from "@/lib/schema";

export const metadata = {
  title: "Privacy Policy — SookLabs",
  description:
    "How SookLabs handles information on sooklabs.com, in our Discord community, and through our Discord bot and applications.",
};

const description =
  "How SookLabs handles information on sooklabs.com, in our Discord community, and through our Discord bot and applications.";

function DiscordLink({ children }) {
  if (!DISCORD_INVITE_URL) return children;
  return (
    <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <JsonLd data={legalPageSchemaGraph({ path: "/privacy", title: metadata.title, description })} />
      <LegalPageShell title="Privacy Policy" lastUpdated={LEGAL_LAST_UPDATED}>
        <p>
          This policy describes how SookLabs (&quot;we&quot;, &quot;us&quot;) handles information when you use{" "}
          <strong>sooklabs.com</strong>, join our Discord community, interact with our Discord bot, or use SookLabs
          Discord applications and activities. It is written for visitors and community members. It is practical
          guidance, not legal advice.
        </p>

        <h2>Who operates SookLabs</h2>
        <p>
          SookLabs operates this website and our community services from Thailand. For privacy questions, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>

        <h2>What this policy covers</h2>
        <ul>
          <li>
            The public website at <a href={SITE_URL}>{SITE_URL.replace(/^https?:\/\//, "")}</a> (contact forms, audit
            requests, analytics).
          </li>
          <li>
            The <strong>{DISCORD_SERVER_NAME}</strong> Discord server
            {DISCORD_INVITE_URL ? (
              <>
                {" "}
                (<DiscordLink>join link</DiscordLink>)
              </>
            ) : (
              " (invite linked from the site footer when available)"
            )}
            .
          </li>
          <li>
            Interactions with <strong>{DISCORD_BOT_NAME}</strong> and related Discord bots we operate in the server.
          </li>
          <li>
            Discord applications, activities, and integrations we build or host as part of our first community
            iteration (for example onboarding flows, pillar channels, or builder tools inside Discord).
          </li>
        </ul>
        <p>
          Other SookLabs products (for example <a href="https://sookly.co">sookly.co</a> or{" "}
          <a href="https://seos.sooklabs.com">seos.sooklabs.com</a>) may have their own policies. Internal HQ tools at{" "}
          <strong>hq.sooklabs.com</strong> are password-protected and excluded from public search indexing.
        </p>

        <h2>Information we collect</h2>
        <h3>Website</h3>
        <ul>
          <li>
            <strong>Contact and audit form data</strong> — name, email, optional website URL, message content, and form
            type when you submit through the site.
          </li>
          <li>
            <strong>Technical usage data</strong> — aggregated page views and performance data through Vercel Analytics
            where enabled (route, referrer, browser type, general device information). We do not run advertising trackers
            on this site.
          </li>
          <li>
            <strong>Server and delivery logs</strong> — Vercel and Resend may process IP addresses, timestamps, and
            request metadata needed to deliver the site and send form notifications.
          </li>
        </ul>

        <h3>Discord community, bot, and applications</h3>
        <p>
          When you join or use our Discord services, Discord processes data under{" "}
          <a href="https://discord.com/privacy" target="_blank" rel="noopener noreferrer">
            Discord&apos;s Privacy Policy
          </a>
          . Depending on how you participate, we may also receive or store:
        </p>
        <ul>
          <li>
            <strong>Discord account identifiers</strong> — user ID, username, display name, avatar, roles, and server
            membership status.
          </li>
          <li>
            <strong>Messages and interactions</strong> — content you send in channels where our bot is present, direct
            messages to the bot where enabled, slash-command inputs, button or menu selections, and reactions where
            logged for moderation or product development.
          </li>
          <li>
            <strong>Application activity data</strong> — data generated when you use SookLabs Discord apps or activities
            (for example onboarding answers, preferences, session state, or feature usage needed to run the experience).
          </li>
          <li>
            <strong>Moderation and safety records</strong> — reports, warnings, mutes, bans, or audit notes created by
            moderators or automated safety tools.
          </li>
        </ul>
        <p>
          We do not ask for payment details through Discord in this first iteration. Do not share passwords, one-time
          codes, or sensitive financial or health information in public channels.
        </p>

        <h2>How we use information</h2>
        <ul>
          <li>Operate the public website and respond to contact or audit requests.</li>
          <li>Run, moderate, and improve the Discord community across our three pillars: Psychology, Investment, and Technology.</li>
          <li>Provide bot replies, routing, onboarding, and Discord application features.</li>
          <li>Develop and test community tooling and integrations inside Discord.</li>
          <li>Protect members, enforce community rules, and investigate abuse or spam.</li>
          <li>Understand aggregate usage to reduce repetition, interruptions, cognitive load, and waiting time.</li>
        </ul>
        <p>We do not sell your personal information.</p>

        <h2>Legal bases and your rights (PDPA and international visitors)</h2>
        <p>
          SookLabs operates from Thailand. Where the{" "}
          <strong>Personal Data Protection Act (PDPA) B.E. 2562 (2019)</strong> applies, we process personal data based
          on one or more of: your consent (for example joining Discord or opting into bot features), contractual
          necessity (responding to a request you make), legitimate interests (security, moderation, product improvement),
          or legal obligation.
        </p>
        <p>Depending on where you live and what data we hold, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion or restriction of processing where applicable.</li>
          <li>Withdraw consent where processing is consent-based (for example leaving the server or disabling bot features).</li>
          <li>Object to certain processing based on legitimate interests.</li>
          <li>Lodge a complaint with a relevant supervisory authority.</li>
        </ul>
        <p>
          If you are in the European Economic Area, United Kingdom, or another region with similar data-protection laws,
          we aim to honour comparable requests even though our primary operations are in Thailand. Contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> to exercise these rights. We may need to verify your
          identity (for example by confirming your Discord user ID or the email used in a prior website inquiry).
        </p>

        <h2>How form submissions are delivered</h2>
        <p>
          Website form submissions are sent to our team by email through <strong>Resend</strong>, delivered to{" "}
          {CONTACT_EMAIL}. Your email address is used as the reply-to address so we can respond directly.
        </p>

        <h2>Third-party services</h2>
        <ul>
          <li>
            <strong>Vercel</strong> — hosts sooklabs.com and may provide analytics and infrastructure logs.
          </li>
          <li>
            <strong>Resend</strong> — delivers email notifications for website form submissions.
          </li>
          <li>
            <strong>Discord</strong> — hosts the {DISCORD_SERVER_NAME} server, bot platform, and application runtime.
            Discord processes and stores data on its infrastructure. Review Discord&apos;s privacy policy and settings in
            your Discord account.
          </li>
        </ul>
        <p>
          Each provider processes data under its own terms. When you follow links to other SookLabs properties or leave
          our Discord server for third-party sites, those services govern their own practices.
        </p>

        <h2>Cookies and similar technologies</h2>
        <p>
          The public website uses minimal cookies or local storage mainly for analytics and normal site operation. We do
          not use cookies for third-party advertising on this site. Discord may use its own cookies and local storage in
          the Discord app or web client under Discord&apos;s policies.
        </p>

        <h2>Retention</h2>
        <ul>
          <li>
            Website form submissions are kept in our email inbox as long as needed to handle your request and maintain
            ordinary business records.
          </li>
          <li>
            Discord messages and bot logs are retained only as long as needed for community operation, moderation,
            debugging, and product development, unless Discord&apos;s platform retention or applicable law requires
            longer storage.
          </li>
          <li>Aggregated analytics data is retained according to Vercel&apos;s analytics settings.</li>
        </ul>

        <h2>Security</h2>
        <p>
          We use reasonable technical and organisational measures appropriate to a small operator (access controls,
          moderation, least-privilege bot permissions, and careful handling of secrets). No online service is perfectly
          secure; please use strong Discord account security and report concerns promptly.
        </p>

        <h2>Children</h2>
        <p>
          Our Discord community and website are not directed at children under 13 (or the minimum age required by Discord
          in your region). If you believe a child has provided personal data to us, contact{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will take reasonable steps to delete it.
        </p>

        <h2>International transfers</h2>
        <p>
          Your information may be processed in Thailand and in countries where Vercel, Resend, or Discord operate
          infrastructure (including the United States). By using our website or Discord services, you understand that
          cross-border transfer may occur.
        </p>

        <h2>Changes</h2>
        <p>
          We may update this page when our website, Discord community, bot, or application practices change. Material
          updates may also be announced in Discord. The &quot;Last updated&quot; date at the top shows when this version
          was published.
        </p>

        <h2>Contact</h2>
        <p>
          Privacy questions or rights requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Community
          conduct questions are covered in our <a href="/terms">Terms of Use</a>.
        </p>
      </LegalPageShell>
    </>
  );
}
