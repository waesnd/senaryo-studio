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
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta property="og:title" content="Scriptify" />
        <meta property="og:description" content="AI destekli senaryo yazma platformu" />
        <meta property="og:type" content="website" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
