import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

// ── GLOBAL CİNEMA DESIGN SYSTEM ───────────────────────────────────────────────
export const CINEMA = {
  black:     "#080808",
  deep:      "#0d0d0d",
  surface:   "#111111",
  card:      "#161616",
  border:    "rgba(212,175,55,0.15)",
  borderHov: "rgba(212,175,55,0.4)",
  gold:      "#D4AF37",
  goldL:     "#F2D46F",
  goldD:     "#A8892A",
  goldGrad:  "linear-gradient(135deg, #D4AF37 0%, #F2D46F 40%, #A8892A 70%, #D4AF37 100%)",
  goldMetal: "linear-gradient(135deg, #BFA340 0%, #F5E27A 35%, #C9A227 65%, #E8CC5A 100%)",
  red:       "#C0392B",
  redL:      "#E74C3C",
  redGrad:   "linear-gradient(135deg, #C0392B, #E74C3C)",
  silver:    "#A8A9AD",
  silverL:   "#D4D5D9",
  chrome:    "linear-gradient(135deg, #868686 0%, #D4D5D9 35%, #868686 65%, #C0C0C0 100%)",
  text:      "#F5F0E8",
  textMuted: "rgba(245,240,232,0.45)",
  textDim:   "rgba(245,240,232,0.22)",
  glow:      "0 0 30px rgba(212,175,55,0.2), 0 0 60px rgba(212,175,55,0.08)",
  glowRed:   "0 0 20px rgba(192,57,43,0.3)",
  shadow:    "0 8px 40px rgba(0,0,0,0.8)",
  shadowGold:"0 4px 24px rgba(212,175,55,0.25)",
  fontDisp:  "'Bebas Neue', 'Arial Narrow', sans-serif",
  fontBody:  "'DM Sans', system-ui, sans-serif",
};

// ── SPLASH SCREEN ─────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  var [phase, setPhase] = useState(0);

  useEffect(() => {
    var timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 800),
      setTimeout(() => setPhase(3), 1500),
      setTimeout(() => setPhase(4), 2500),
      setTimeout(() => onDone(), 3100),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "#000",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      overflow: "hidden",
      opacity: phase === 4 ? 0 : 1,
      transition: phase === 4 ? "opacity 0.6s ease" : "none",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;800&display=swap');
        @keyframes beam { from{opacity:0;transform:scaleY(0.2)} to{opacity:1;transform:scaleY(1)} }
        @keyframes logoIn { from{opacity:0;transform:translateY(20px) scale(0.9);filter:blur(10px)} to{opacity:1;transform:none;filter:none} }
        @keyframes tagIn { from{opacity:0;letter-spacing:0.5em} to{opacity:1;letter-spacing:0.2em} }
        @keyframes scan { from{top:-5%} to{top:105%} }
        @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:1} 93%{opacity:0.6} 94%{opacity:1} 97%{opacity:0.8} 98%{opacity:1} }
      `}</style>

      {/* Projeksiyon ışığı — geniş */}
      {phase >= 1 && (
        <div style={{
          position: "absolute", top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "200px solid transparent",
          borderRight: "200px solid transparent",
          borderTop: "60vh solid rgba(212,175,55,0.07)",
          animation: "beam 0.8s ease forwards",
          filter: "blur(12px)",
          pointerEvents: "none",
        }} />
      )}
      {/* Projeksiyon ışığı — dar, parlak merkez */}
      {phase >= 1 && (
        <div style={{
          position: "absolute", top: 0, left: "50%",
          transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "60px solid transparent",
          borderRight: "60px solid transparent",
          borderTop: "50vh solid rgba(212,175,55,0.1)",
          animation: "beam 0.5s ease forwards",
          filter: "blur(4px)",
          pointerEvents: "none",
        }} />
      )}

      {/* Scanline */}
      <div style={{
        position: "absolute", left: 0, right: 0, height: 1,
        background: "rgba(212,175,55,0.15)",
        animation: "scan 2.5s linear infinite",
        pointerEvents: "none",
      }} />

      {/* Sol sprocket */}
      <div style={{ position: "absolute", left: 12, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "16px 0" }}>
        {Array(14).fill(0).map((_,i) => <div key={i} style={{ width: 10, height: 14, borderRadius: 3, background: "#181818", border: "1px solid #2a2a2a" }} />)}
      </div>
      {/* Sağ sprocket */}
      <div style={{ position: "absolute", right: 12, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "space-around", padding: "16px 0" }}>
        {Array(14).fill(0).map((_,i) => <div key={i} style={{ width: 10, height: 14, borderRadius: 3, background: "#181818", border: "1px solid #2a2a2a" }} />)}
      </div>

      {/* Logo */}
      {phase >= 2 && (
        <div style={{ textAlign: "center", animation: "logoIn 0.8s cubic-bezier(0.16,1,0.3,1) forwards" }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(64px, 18vw, 108px)",
            letterSpacing: "0.14em",
            background: "linear-gradient(135deg, #D4AF37 0%, #F2D46F 40%, #A8892A 70%, #D4AF37 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "flicker 3s ease 1s infinite",
            lineHeight: 1,
          }}>
            SCRIPTIFY
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center", margin: "14px 0 10px" }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #D4AF37)" }} />
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#D4AF37" }} />
            <div style={{ width: 5, height: 5, transform: "rotate(45deg)", background: "#D4AF37" }} />
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#D4AF37" }} />
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #D4AF37, transparent)" }} />
          </div>

          {phase >= 3 && (
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 11, fontWeight: 600,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#A8A9AD",
              animation: "tagIn 0.7s ease forwards",
            }}>
              AI Senaryo Stüdyosu
            </p>
          )}
        </div>
      )}

      {/* Alt film karesi şeridi */}
      <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 3 }}>
        {Array(10).fill(0).map((_, i) => (
          <div key={i} style={{
            width: 22, height: 15, borderRadius: 2,
            border: "1px solid #2a2a2a",
            background: i === 4 || i === 5 ? "rgba(212,175,55,0.15)" : "#0d0d0d",
          }} />
        ))}
      </div>
    </div>
  );
}

// ── ANA APP ───────────────────────────────────────────────────────────────────
export default function App({ Component, pageProps }) {
  var [splash, setSplash] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      var seen = sessionStorage.getItem("sf_splash");
      if (!seen) { setSplash(true); sessionStorage.setItem("sf_splash", "1"); }
    }
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,800;1,9..40,400&display=swap" rel="stylesheet" />
      </Head>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; }
        body {
          background: #080808;
          color: #F5F0E8;
          font-family: 'DM Sans', system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #A8892A; border-radius: 2px; }
        ::selection { background: rgba(212,175,55,0.2); color: #F2D46F; }
        a { text-decoration: none; color: inherit; }
        button { font-family: 'DM Sans', sans-serif; cursor: pointer; }
        input, textarea { font-family: 'DM Sans', sans-serif; }
        input::placeholder, textarea::placeholder { color: rgba(245,240,232,0.22); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes goldPulse { 0%,100%{box-shadow:0 0 0 0 rgba(212,175,55,0)} 50%{box-shadow:0 0 0 5px rgba(212,175,55,0.12)} }

        .cinema-fade { animation: fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        .gold-text {
          background: linear-gradient(135deg, #D4AF37 0%, #F2D46F 40%, #A8892A 70%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .skeleton {
          background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 8px;
        }
      `}</style>

      {splash && <SplashScreen onDone={() => setSplash(false)} />}
      {!splash && <Component {...pageProps} />}
    </>
  );
}
