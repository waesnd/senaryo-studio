import { Html, Head, Main, NextScript } from "next/document";

export default function Document(){
  return(
    <Html lang="tr">
      <Head>
        <meta charSet="utf-8"/>
        <meta name="application-name" content="Fabularc"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="Fabularc"/>
        <meta name="description" content="Profesyonel senaryo, yaratıcı yazarlık ve yapay zekâ destekli hikâye geliştirme platformu."/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="theme-color" content="#063B32"/>
        <meta name="msapplication-TileColor" content="#063B32"/>

        {/* PWA */}
        <link rel="manifest" href="/manifest.json"/>
        <link rel="icon" type="image/svg+xml" href="/brand/fabularc-favicon.svg"/>
        {/* Apple/PWA raster icons remain on existing paths until the approved PNG package is deployed. */}
        <link rel="apple-touch-icon" href="/icon-192.png"/>

        {/* Open Graph */}
        <meta property="og:site_name" content="Fabularc"/>
        <meta property="og:title" content="Fabularc — Yaratıcı Yazarlık ve Senaryo Platformu"/>
        <meta property="og:description" content="Senaryo ve edebî eserlerini yaz, geliştir ve yaratıcı toplulukla paylaş."/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://senaryo-studio-git-main-waesnds-projects.vercel.app"/>
        <meta property="og:image" content="https://senaryo-studio-git-main-waesnds-projects.vercel.app/og-image.png"/>
        <meta property="og:image:width" content="1200"/>
        <meta property="og:image:height" content="630"/>
        <meta property="og:locale" content="tr_TR"/>

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:title" content="Fabularc — AI Senaryo Platformu"/>
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
          html { background: #063B32; }
          body { background: #063B32; color: #F1F5F9; }
        `}</style>
      </Head>
      <body>
        <Main/>
        <NextScript/>
      </body>
    </Html>
  );
}
