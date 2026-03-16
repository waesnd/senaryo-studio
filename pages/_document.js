import { Html, Head, Main, NextScript } from "next/document";

export default function Document(){
  return(
    <Html lang="tr">
      <Head>
        <meta charSet="utf-8"/>
        <meta name="application-name" content="Scriptify"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="Scriptify"/>
        <meta name="description" content="AI destekli senaryo yazma ve paylaşma platformu — Üret, paylaş, keşfet."/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="theme-color" content="#0A0F1E"/>
        <meta name="msapplication-TileColor" content="#0A0F1E"/>

        {/* PWA */}
        <link rel="manifest" href="/manifest.json"/>
        <link rel="apple-touch-icon" href="/icon-192.png"/>
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png"/>
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png"/>

        {/* Open Graph */}
        <meta property="og:site_name" content="Scriptify"/>
        <meta property="og:title" content="Scriptify — AI Senaryo Platformu"/>
        <meta property="og:description" content="AI ile özgün film & dizi senaryoları üret, paylaş, keşfet."/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://senaryo-studio-git-main-waesnds-projects.vercel.app"/>
        <meta property="og:image" content="https://senaryo-studio-git-main-waesnds-projects.vercel.app/og-image.png"/>
        <meta property="og:image:width" content="1200"/>
        <meta property="og:image:height" content="630"/>
        <meta property="og:locale" content="tr_TR"/>

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content="Scriptify — AI Senaryo Platformu"/>
        <meta name="twitter:description" content="AI ile özgün film & dizi senaryoları üret, paylaş, keşfet."/>
        <meta name="twitter:image" content="https://senaryo-studio-git-main-waesnds-projects.vercel.app/og-image.png"/>
        <meta name="twitter:creator" content="@uykusuzyazar"/>

        {/* Fontlar */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800;1,9..40,400&display=swap" rel="stylesheet"/>

        {/* Splash screen rengi iOS için */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <style>{`
          /* Flash of unstyled content engelle */
          html { background: #0A0F1E; }
          body { background: #0A0F1E; color: #F1F5F9; }
        `}</style>
      </Head>
      <body>
        <Main/>
        <NextScript/>
      </body>
    </Html>
  );
}
