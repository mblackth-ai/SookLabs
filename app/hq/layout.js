import localFont from "next/font/local";
import "./hq.css";

// Self-hosted (SIL OFL, see ./fonts/OFL.txt) so builds never fetch Google Fonts;
// that fetch intermittently breaks Turbopack (vercel/next.js#99114).
const geist = localFont({
  src: "./fonts/Geist-Variable.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata = {
  title: "SookLabs HQ",
  description: "SookLabs HQ — Mark’s private founder command centre.",
  robots: { index: false, follow: false },
};

export default function HqLayout({ children }) {
  return (
    <div className={`hq-scope ${geist.variable} ${geistMono.variable}`}>
      {children}
    </div>
  );
}
