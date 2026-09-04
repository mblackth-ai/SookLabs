import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "";

/**
 * Loads GA4 only when NEXT_PUBLIC_GA_MEASUREMENT_ID is set (e.g. G-XXXXXXXX).
 * Vercel Analytics remains separate and always on.
 */
export function GoogleAnalytics() {
  if (!GA_ID || !/^G-[A-Z0-9]+$/i.test(GA_ID)) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
