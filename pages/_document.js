import { Html, Head, Main, NextScript } from 'next/document';
const themeScript = "(function(){try{var t=localStorage.getItem('studio-theme');document.documentElement.dataset.theme=t==='dark'?'dark':'light';}catch(e){}})();";
export default function Document() {
  return <Html lang="tr" data-theme="light">
    <Head><meta name="application-name" content="Senaryo Studio" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content="Senaryo Studio" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
    </Head>
    <body><Main /><NextScript /></body>
  </Html>;
}
