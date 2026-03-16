import { useEffect, useState, createContext, useContext } from "react";
import Head from "next/head";
import { supabase } from "../lib/supabase";


// ── MERKEZI AUTH CONTEXT ──────────────────────────────────────────────────────
export var AuthContext = createContext({user:null, profil:null, authHazir:false});
export function useAuth(){ return useContext(AuthContext); }

function AuthProvider({children}){
  var [user,setUser]=useState(null);
  var [profil,setProfil]=useState(null);
  var [authHazir,setAuthHazir]=useState(false);

  useEffect(()=>{
    supabase.auth.getSession().then(({data})=>{
      var u=data?.session?.user||null;
      setUser(u);
      if(u) loadProfil(u);
      else setAuthHazir(true);
    });
    var {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="TOKEN_REFRESHED"||event==="INITIAL_SESSION") return;
      var u=session?.user||null;
      setUser(prev=>{
        if(prev?.id===u?.id) return prev;
        if(u) loadProfil(u);
        else{ setProfil(null); setAuthHazir(true); }
        return u;
      });
    });
    return()=>subscription?.unsubscribe();
  },[]);

  function loadProfil(u){
    supabase.from("profiles").select("*").eq("id",u.id).single()
      .then(({data})=>{ if(data)setProfil(data); setAuthHazir(true); });
  }

  return(
    <AuthContext.Provider value={{user,profil,authHazir,setProfil}}>
      {children}
    </AuthContext.Provider>
  );
}

export const MIDNIGHT = {
  black:"#0A0F1E", deep:"#0F172A", surface:"#1E293B", card:"#162032",
  border:"rgba(56,189,248,0.12)", borderHov:"rgba(56,189,248,0.4)",
  blue:"#38BDF8", blueL:"#7DD3FC", blueD:"#0EA5E9",
  blueGrad:"linear-gradient(135deg,#0EA5E9 0%,#38BDF8 40%,#7DD3FC 70%,#0EA5E9 100%)",
  purple:"#8B5CF6", purpleL:"#A78BFA", purpleD:"#7C3AED",
  purpleGrad:"linear-gradient(135deg,#7C3AED 0%,#8B5CF6 50%,#A78BFA 100%)",
  red:"#EF4444", redL:"#F87171",
  green:"#22C55E", greenL:"#4ADE80",
  amber:"#F59E0B", amberL:"#FCD34D",
  text:"#F1F5F9", textMuted:"rgba(241,245,249,0.5)", textDim:"rgba(241,245,249,0.25)",
  glowBlue:"0 0 24px rgba(56,189,248,0.25)",
  glowPurple:"0 0 24px rgba(139,92,246,0.25)",
  glowRed:"0 0 16px rgba(239,68,68,0.3)",
  shadow:"0 8px 40px rgba(0,0,0,0.7)",
  fontDisp:"'Bebas Neue','Arial Narrow',sans-serif",
  fontBody:"'DM Sans',system-ui,sans-serif",
};

export default function App({ Component, pageProps }){

  useEffect(()=>{
    if("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(()=>{});
  },[]);

  return(
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
        <meta name="theme-color" content="#0A0F1E"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="Scriptify"/>
        <meta name="description" content="AI destekli senaryo üretici ve sosyal platform"/>
        <meta property="og:title" content="Scriptify — AI Senaryo Platformu"/>
        <meta property="og:description" content="Yapay zeka ile senaryo üret, topluluğu keşfet"/>
        <meta property="og:type" content="website"/>
        <link rel="manifest" href="/manifest.json"/>
        <link rel="icon" href="/favicon.ico"/>
        <link rel="apple-touch-icon" href="/icon-192.png"/>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800;1,9..40,400&display=swap" rel="stylesheet"/>
      </Head>

      <style jsx global>{`
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          -webkit-text-size-adjust: 100%;
          scroll-behavior: smooth;
        }

        body {
          background: #0A0F1E;
          color: #F1F5F9;
          font-family: 'DM Sans', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          overflow-x: hidden;
          /* Siber arka plan pattern */
          background-image:
            radial-gradient(ellipse at 20% 0%, rgba(56,189,248,0.04) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, rgba(139,92,246,0.04) 0%, transparent 50%);
          background-attachment: fixed;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0A0F1E; }
        ::-webkit-scrollbar-thumb { background: #0EA5E9; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #38BDF8; }

        /* Seçim */
        ::selection {
          background: rgba(56,189,248,0.2);
          color: #7DD3FC;
        }

        /* Temel elemanlar */
        a { text-decoration: none; color: inherit; }
        button { font-family: 'DM Sans', sans-serif; cursor: pointer; }
        input, textarea { font-family: 'DM Sans', sans-serif; }
        input::placeholder, textarea::placeholder { color: rgba(241,245,249,0.25); }

        /* ── ANİMASYONLAR ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(56,189,248,0); }
          50%       { box-shadow: 0 0 0 6px rgba(56,189,248,0.08); }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1; }
        }
        @keyframes neonFlicker {
          0%, 100% { opacity: 1; }
          92%       { opacity: 0.85; }
          95%       { opacity: 0.6; }
          97%       { opacity: 1; }
        }
        @keyframes scanLine {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(200vh); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        /* ── UTILITY SINIFLARI ── */

        /* Fade animasyonu */
        .ma-fade { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }

        /* Neon mavi gradient yazı */
        .blue-text {
          background: linear-gradient(135deg, #0EA5E9 0%, #38BDF8 50%, #7DD3FC 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Mor gradient yazı */
        .purple-text {
          background: linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Skeleton loading */
        .skeleton {
          background: linear-gradient(
            90deg,
            #1E293B 25%,
            #243048 50%,
            #1E293B 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }

        /* Neon kart */
        .neon-card {
          background: linear-gradient(145deg, #1E293B, #162032);
          border: 1px solid rgba(56,189,248,0.12);
          border-radius: 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .neon-card:hover {
          border-color: rgba(56,189,248,0.35);
          box-shadow: 0 0 24px rgba(56,189,248,0.12);
        }

        /* Glass efekti */
        .glass {
          background: rgba(30,41,59,0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(56,189,248,0.1);
        }

        /* Hover geçiş */
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
        }

        /* Scroll gizle */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Overflow ellipsis */
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* 2 satır kırp */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Siber ızgara arka plan */
        .cyber-grid {
          background-image:
            linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Neon alt çizgi animasyonu */
        .neon-underline {
          position: relative;
        }
        .neon-underline::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #38BDF8, transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .neon-underline:hover::after { opacity: 1; }

        /* PWA safe area */
        .safe-bottom {
          padding-bottom: max(env(safe-area-inset-bottom, 0px), 10px);
        }

        /* Responsive max-width konteyner */
        .container {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 16px;
        }
      `}</style>

      <AuthProvider>
        <Component {...pageProps}/>
      </AuthProvider>
    </>
  );
}
