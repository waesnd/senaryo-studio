import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <meta charSet="utf-8" />
        <meta name="application-name" content="Scriptify" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Scriptify" />
        <meta name="description" content="AI destekli senaryo yazma ve paylaşma platformu" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#0891b2" />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png" />

        {/* Open Graph */}
        <meta property="og:site_name" content="Scriptify" />
        <meta property="og:title" content="Scriptify — AI Senaryo Platformu" />
        <meta property="og:description" content="AI ile özgün film & dizi senaryoları üret, paylaş, keşfet." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://senaryo-studio-git-main-waesnds-projects.vercel.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Scriptify — AI Senaryo Platformu" />
        <meta name="twitter:description" content="AI ile özgün film & dizi senaryoları üret, paylaş, keşfet." />
        <meta name="twitter:image" content="https://senaryo-studio-git-main-waesnds-projects.vercel.app/og-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
