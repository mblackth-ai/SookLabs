import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sooklabs.com"),
  title: "SookLabs — Reduce the noise. Build the system.",
  description:
    "SookLabs builds focused AI, SEO, and workflow systems that help website-dependent companies stay relevant as search shifts to AI answer engines.",
  openGraph: {
    title: "SookLabs — Reduce the noise. Build the system.",
    description:
      "SookLabs builds focused AI, SEO, and workflow systems that help website-dependent companies stay relevant as search shifts to AI answer engines.",
    type: "website",
    siteName: "SookLabs",
    images: [{ url: "/assets/sooklabs/sooklabs-mark.svg", alt: "SookLabs" }],
  },
  twitter: {
    card: "summary",
    title: "SookLabs — Reduce the noise. Build the system.",
    description:
      "Focused AI, SEO, and workflow systems for website-dependent companies.",
    images: ["/assets/sooklabs/sooklabs-mark.svg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
