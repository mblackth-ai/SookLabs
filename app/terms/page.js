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
  title: "Terms of Use — SookLabs",
  description:
    "Terms for using sooklabs.com, joining the SookLabs Discord community, interacting with our bot, and participating in Discord application development.",
};

const description =
  "Terms for using sooklabs.com, joining the SookLabs Discord community, interacting with our bot, and participating in Discord application development.";

function DiscordLink({ children }) {
  if (!DISCORD_INVITE_URL) return children;
  return (
    <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export default function TermsPage() {
  return (
    <>
      <JsonLd data={legalPageSchemaGraph({ path: "/terms", title: metadata.title, description })} />
      <LegalPageShell title="Terms of Use" lastUpdated={LEGAL_LAST_UPDATED}>
        <p>
          These terms apply to your use of the public SookLabs website at{" "}
          <a href={SITE_URL}>{SITE_URL.replace(/^https?:\/\//, "")}</a>, our Discord community, our Discord bot, and
          SookLabs Discord applications and activities we operate as part of our first community iteration. By using
          these services, you agree to these terms. If you do not agree, please do not use them.
        </p>

        <h2 id="discord-community">What we provide</h2>
        <h3>Website</h3>
        <p>
          SookLabs publishes information about our work, ecosystem products, and services. Some pages let you request
          contact or a free GEO audit. Site content is for general information; it is not a binding offer, guarantee
          of results, or professional advice unless we agree otherwise in writing.
        </p>

        <h3>Discord community (first iteration)</h3>
        <p>
          Our first public community iteration runs on Discord as <strong>{DISCORD_SERVER_NAME}</strong>
          {DISCORD_INVITE_URL ? (
            <>
              {" "}
              (<DiscordLink>join link</DiscordLink>)
            </>
          ) : (
            " (invite linked from the site footer when available)"
          )}
          . The server is organised around three pillars:
        </p>
        <ul>
          <li>
            <strong>Psychology</strong> — thinking tools, habits, clarity under noise.
          </li>
          <li>
            <strong>Investment</strong> — long-term leverage and disciplined decision-making (not hype trading or
            financial advice).
          </li>
          <li>
            <strong>Technology</strong> — builders, systems, and AI that reduces load.
          </li>
        </ul>
        <p>
          Features, channels, roles, bots, and Discord applications may change as we develop the community. Paid
          subscriptions or advanced gating, if added later, will be described separately before they apply.
        </p>

        <h3>Discord bot and applications</h3>
        <p>
          <strong>{DISCORD_BOT_NAME}</strong> and related SookLabs Discord apps may provide onboarding, information,
          routing, moderation helpers, or experimental builder tools inside the server. These services are provided on
          a best-effort basis during early development. Outputs may be incomplete, delayed, or incorrect — verify
          important information yourself.
        </p>

        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Break applicable law or infringe others&apos; rights.</li>
          <li>Harass, threaten, dox, spam, or discriminate against others.</li>
          <li>Share malware, exploit links, or attempt unauthorized access to our or Discord&apos;s systems.</li>
          <li>Impersonate SookLabs staff, moderators, or other members.</li>
          <li>Use the bot or applications to scrape, overload, or reverse-engineer our services beyond normal use.</li>
          <li>Submit false, misleading, or abusive content through website forms or Discord interactions.</li>
          <li>Post unsolicited promotions, referral spam, or off-topic funnels without moderator approval.</li>
          <li>Share others&apos; private messages or personal data without consent.</li>
        </ul>
        <p>
          Investment and technology discussions are for education and community exchange only. Nothing in the server or
          on the website is financial, legal, tax, medical, or security advice. Make your own decisions with qualified
          professionals where needed.
        </p>

        <h2>Discord platform terms</h2>
        <p>
          Your use of Discord is also governed by{" "}
          <a href="https://discord.com/terms" target="_blank" rel="noopener noreferrer">
            Discord&apos;s Terms of Service
          </a>{" "}
          and{" "}
          <a href="https://discord.com/guidelines" target="_blank" rel="noopener noreferrer">
            Community Guidelines
          </a>
          . Discord may suspend or terminate your account independently of SookLabs. We are not responsible for Discord
          outages, policy changes, or platform actions.
        </p>

        <h2>Community moderation</h2>
        <p>
          Moderators may warn, mute, remove roles, remove messages, or ban members who violate these terms or channel
          rules. Decisions aim to keep the community usable and safe; they are not public arbitration. To appeal a
          moderation action, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with your Discord username
          and a concise summary.
        </p>

        <h2>Forms and communications</h2>
        <p>
          When you submit a website contact or audit form, you confirm the details are accurate to the best of your
          knowledge and that you are authorized to share them. Delivery uses Resend as described in our{" "}
          <a href="/privacy">Privacy Policy</a>. Submitting a form does not create a client relationship or obligation
          for us to deliver an audit within any particular timeframe.
        </p>

        <h2>Free GEO audit</h2>
        <p>
          Audit requests are informational. We may decline, limit, or prioritize requests at our discretion. Audit
          output reflects what we can observe at the time of review; search and AI systems change frequently.
        </p>

        <h2>Discord bot and application development participation</h2>
        <p>
          If you test early bot commands, activities, or integrations:
        </p>
        <ul>
          <li>Features may be unstable, change without notice, or be removed.</li>
          <li>Feedback you provide may be used to improve SookLabs products without compensation unless we agree otherwise in writing.</li>
          <li>Do not rely on bot output for critical decisions without independent verification.</li>
          <li>Report bugs or safety issues to moderators or {CONTACT_EMAIL} rather than exploiting them.</li>
        </ul>

        <h2>Intellectual property</h2>
        <p>
          Site text, branding, bot software, Discord application assets, and community materials created by SookLabs are
          owned by SookLabs or used with permission. You may share links to public pages and participate in community
          discussion. You may not copy, modify, or republish substantial portions for commercial use without our prior
          written consent.
        </p>
        <p>
          You keep ownership of content you post, but grant SookLabs a non-exclusive license to host, display, and
          moderate that content within the community services as needed to operate the server.
        </p>

        <h2>Privacy and PDPA</h2>
        <p>
          Our handling of personal data is described in the <a href="/privacy">Privacy Policy</a>, including rights under
          Thailand&apos;s Personal Data Protection Act (PDPA) and comparable requests from international visitors. By
          joining Discord or using our bot and applications, you acknowledge that processing described there will occur.
        </p>

        <h2>Third-party links</h2>
        <p>
          The site and Discord server may link to external properties (Sookly, SEOS, social profiles, documentation,
          tools). We do not control those sites and are not responsible for their content, availability, or practices.
        </p>

        <h2>Disclaimers</h2>
        <p>
          The website, Discord community, bot, and applications are provided &quot;as is&quot; and &quot;as available&quot;.
          We do not warrant uninterrupted, error-free, or fit-for-purpose operation. To the fullest extent permitted by
          applicable law, SookLabs disclaims liability for indirect, incidental, or consequential damages arising from
          use of these services.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          If liability cannot be excluded, our total liability for claims relating to the public site and Discord
          services is limited to the amount you paid us for those services in the twelve months before the claim
          (which, for free community use, is zero), unless a different limit is required by law.
        </p>

        <h2>Changes and availability</h2>
        <p>
          We may update these terms, community structure, bot features, or site content at any time. Continued use after
          changes are posted means you accept the updated terms. Material Discord changes may be announced in-server. We
          may suspend or remove pages, channels, bots, or applications for maintenance, safety, or operational reasons.
        </p>

        <h2>Governing approach</h2>
        <p>
          These terms reflect how we operate from Thailand. They are practical terms, not a substitute for counsel.
          Disputes should first be raised with us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> so we can
          try to resolve them directly.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalPageShell>
    </>
  );
}
