import { Geist, Geist_Mono } from "next/font/google";
import "../hq/hq.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata = {
  title: "SookLabs Expansion OS",
  description: "SEOS — Search Expansion Operating System. MVP 1 Simple Mode.",
  robots: { index: false, follow: false },
};

export default function SeosLayout({ children }) {
  return (
    <div className={`hq-scope ${geist.variable} ${geistMono.variable}`}>
      {children}
    </div>
  );
}
