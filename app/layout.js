import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
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
  title: "SookLabs — Practical AI, SEO, and workflow tools for service businesses",
  description:
    "SookLabs is the product lab behind focused systems for service businesses — from Sookly chat operations to SEO and workflow tools that reduce chaos.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-slate-950 focus:rounded-lg focus:shadow-lg focus:outline focus:outline-2 focus:outline-sky-500"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
