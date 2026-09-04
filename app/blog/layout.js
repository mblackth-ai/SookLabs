import { Space_Grotesk, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { BLOG_PAGE, blogRssUrl } from "@/lib/blog";
import "../sooklabs-v2/sooklabs-v2.css";
import "./blog.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--sl-font-display",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--sl-font-body",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--sl-font-mono",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: BLOG_PAGE.title,
  description: BLOG_PAGE.description,
  alternates: {
    canonical: BLOG_PAGE.path,
    types: {
      "application/rss+xml": blogRssUrl(),
    },
  },
  openGraph: {
    title: BLOG_PAGE.title,
    description: BLOG_PAGE.description,
    type: "website",
    url: BLOG_PAGE.path,
    siteName: "SookLabs",
    images: [{ url: "/assets/sooklabs/sooklabs-glyph.png", alt: "SookLabs" }],
  },
  twitter: {
    card: "summary",
    title: BLOG_PAGE.title,
    description: BLOG_PAGE.description,
    images: ["/assets/sooklabs/sooklabs-glyph.png"],
  },
};

export default function BlogLayout({ children }) {
  return (
    <div
      className={`sl-v2-root sl-blog-root ${spaceGrotesk.variable} ${dmSans.variable} ${ibmPlexMono.variable}`}
    >
      {children}
    </div>
  );
}
