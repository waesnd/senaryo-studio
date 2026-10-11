import { useEffect } from 'react';
import Head from 'next/head';
import { AuthProvider } from '../lib/useAuth';
import '../styles/studio.css';
export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV === 'production') navigator.serviceWorker.register('/sw.js').catch(() => {});
    else navigator.serviceWorker.getRegistrations().then(regs => {
      for (const reg of regs) if (reg.active?.scriptURL.endsWith('/sw.js')) void reg.unregister();
    }).catch(() => {});
  }, []);
  return <>
    <Head><title>Senaryo Studio — Hikâyene alan aç.</title>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="description" content="Türkçe senaryo çalışma alanın. Hikâyeni geliştir, sahnelerini yaz, sürümlerini koru ve toplulukla paylaş." />
      <meta name="theme-color" content="#f6f5f1" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="icon" href="/studio-mark.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/icon-192.png" />
    </Head>
    <AuthProvider><Component {...pageProps} /></AuthProvider>
  </>;
}
