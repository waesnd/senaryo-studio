import { useState, useEffect, useRef } from "react";
const TURLER = ["Gerilim", "Bilim Kurgu", "Dram", "Korku", "Komedi", "Romantik", "Macera", "Suç", "Fantazi", "Psikolojik", "Tarihi", "Aksiyon"];
const TIPLER = ["Dizi", "Film"];
const TUR_EMOJIS = { "Gerilim": "🔪", "Bilim Kurgu": "🚀", "Dram": "🎭", "Korku": "👁️", "Komedi": "😂", "Romantik": "💔", "Macera": "🧭", "Suç": "🕵️", "Fantazi": "🐉", "Psikolojik": "🧠", "Tarihi": "⚔️", "Aksiyon": "💥" };
const TUR_COLORS = { "Gerilim": "#ff4d4d", "Bilim Kurgu": "#22d3ee", "Dram": "#c084fc", "Korku": "#fb923c", "Komedi": "#facc15", "Romantik": "#f472b6", "Macera": "#4ade80", "Suç": "#94a3b8", "Fantazi": "#a78bfa", "Psikolojik": "#818cf8", "Tarihi": "#fbbf24", "Aksiyon": "#f87171" };
const BOKEH = Array.from({length: 18}, (_, i) => ({
id: i, size: 40 + (i * 17) % 100, x: (i * 23 + 7) % 100, y: (i * 31 + 13) % 100,
dur: 12 + (i * 3) % 14, delay: -(i * 2.3), op: 0.04 + (i % 4) * 0.03,
color: i % 4 === 0 ? '#e8230a' : i % 4 === 1 ? '#ff6b35' : i % 4 === 2 ? '#ffffff' : '#ff4444'
}));
function useTypewriter(text, speed = 28) {
const [d, setD] = useState("");
useEffect(() => {
if (!text) return; setD(""); let i = 0;
const iv = setInterval(() => { i++; setD(text.slice(0, i)); if (i >= text.length) clearInterval(iv); }, speed);
return () => clearInterval(iv);
}, [text]);
return d;
}
function TW({ text, speed = 25, style = {} }) {
const d = useTypewriter(text, speed);
return <p style={style}>{d}<span style={{ animation: "blink 1s step-end infinite" }}>|</span></p>;
}
export default function App() {
const [step, setStep] = useState("tip");
const [tip, setTip] = useState(null);
const [tur, setTur] = useState(null);
const [concept, setConcept] = useState(null);
const [anim, setAnim] = useState(true);
const [hov, setHov] = useState(null);
const [customTur, setCustomTur] = useState("");
const [showCustom, setShowCustom] = useState(false);
const [rk, setRk] = useState(0);
const [panel, setPanel] = useState(false);
const [gecmis, setGecmis] = useState([]);
const [favoriler, setFavoriler] = useState([]);
const [musicOn, setMusicOn] = useState(true);
const [karakter, setKarakter] = useState(null);
const [karakterStep, setKarakterStep] = useState(false);
const [karakterLoading, setKarakterLoading] = useState(false);
const audioRef = useRef(null);
const accent = "#e8230a";
const glass = { background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)" };
useEffect(() => {
const saved = localStorage.getItem("gecmis");
const savedFav = localStorage.getItem("favoriler");
if (saved) setGecmis(JSON.parse(saved));
if (savedFav) setFavoriler(JSON.parse(savedFav));
}, []);
useEffect(() => {
if (audioRef.current) {
musicOn ? audioRef.current.play().catch(() => {}) : audioRef.current.pause();
}
}, [musicOn]);
const go = fn => { setAnim(false); setTimeout(() => { fn(); setAnim(true); }, 260); };
const pickTip = t => { setTip(t); go(() => setStep("tur")); };
const pickTur = t => { setTur(t); go(() => setStep("loading")); gen(tip, t); };
const gen = async (tp, tr) => {
try {
const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tip: tp, tur: tr }) });
const parsed = await res.json();
setConcept(parsed); setRk(k => k + 1);
const yeni = { id: Date.now(), tip: tp, tur: tr, baslik: parsed.baslik, data: parsed };
const updated = [yeni, ...gecmis];
setGecmis(updated);
localStorage.setItem("gecmis", JSON.stringify(updated));
go(() => setStep("result"));
} catch {
setConcept({ baslik: "Hata", tagline: "Tekrar dene.", ana_fikir: "—", karakter: "—", sahne: "—", soru: "—" });
go(() => setStep("result"));
}
};
const genKarakter = async () => {
setKarakterLoading(true);
try {
const res = await fetch("/api/karakter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ concept, tip, tur }) });
const parsed = await res.json();
setKarakter(parsed); setKarakterStep(true);
} catch { setKarakter({ isim: "—", gecmis: "—", motivasyon: "—", guclu: "—", zayif: "—" }); setKarakterStep(true); }
setKarakterLoading(false);
};
const toggleFavori = (id) => {
const updated = favoriler.includes(id) ? favoriler.filter(f => f !== id) : [...favoriler, id];
setFavoriler(updated); localStorage.setItem("favoriler", JSON.stringify(updated));
};
const reset = () => go(() => { setStep("tip"); setTip(null); setTur(null); setConcept(null); setCustomTur(""); setShowCustom(false); setKarakter(null); setKarakterStep(false); });
const regen = () => { go(() => setStep("loading")); gen(tip, tur); };
const paylasMetin = () => {
const text = 🎬 ${concept.baslik}\n"${concept.tagline}"\n\n📖 ${concept.ana_fikir}\n\n👤 ${concept.karakter}\n\n❓ ${concept.soru}\n\nSenaryo Stüdyosu ile üretildi.;
navigator.clipboard.writeText(text);
alert("Kopyalandı!");
};
const paylasWhatsapp = () => {
const text = encodeURIComponent(🎬 ${concept.baslik}\n"${concept.tagline}"\n\n${concept.ana_fikir});
window.open(https://wa.me/?text=${text});
};
return (
<div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "Georgia, serif", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
{/* Bokeh */}
  {BOKEH.map(p => (
    <div key={p.id} style={{ position: "fixed", width: p.size, height: p.size, borderRadius: "50%", left: `${p.x}%`, top: `${p.y}%`, background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`, filter: "blur(12px)", opacity: p.op, animation: `float${p.id % 3} ${p.dur}s ${p.delay}s ease-in-out infinite alternate`, pointerEvents: "none", zIndex: 0 }} />
  ))}
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", pointerEvents: "none", zIndex: 1 }} />

  {/* Müzik */}
  <audio ref={audioRef} loop src="https://cdn.pixabay.com/audio/2022/10/16/audio_12a71c9a3b.mp3" />

  {/* Letterbox */}
  <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 40, background: "#030303", zIndex: 30 }} />
  <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 40, background: "#030303", zIndex: 30 }} />

  {/* Header */}
  <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "52px 20px 0" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button onClick={() => setPanel(!panel)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 14 }}>☰</button>
      <button onClick={reset} style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}>◈ Senaryo Stüdyosu</button>
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {(step === "tur" || step === "result" || step === "loading") && tip && (
        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", fontFamily: "Courier New, monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>{tip}</span>
      )}
      {tur && (step === "result" || step === "loading") && (
        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, border: `1px solid ${accent}45`, color: accent, background: `${accent}12`, fontFamily: "Courier New, monospace" }}>{TUR_EMOJIS[tur]} {tur}</span>
      )}
      <button onClick={() => setMusicOn(!musicOn)} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "5px 12px", color: musicOn ? accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Courier New, monospace" }}>
        {musicOn ? "♪ ON" : "♪ OFF"}
      </button>
    </div>
  </div>

  {/* by Öztürk */}
  {step === "tip" && (
    <div style={{ position: "relative", zIndex: 10, textAlign: "center", paddingTop: 10 }}>
      <span style={{ fontFamily: "Georgia, serif", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>by Öztürk</span>
    </div>
  )}

  {/* Yan Panel */}
  {panel && (
    <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 300, background: "rgba(8,8,8,0.97)", backdropFilter: "blur(30px)", borderRight: "1px solid rgba(255,255,255,0.08)", zIndex: 50, padding: "80px 20px 60px", overflowY: "auto", transition: "transform 0.3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" }}>Geçmiş Konular</p>
        <button onClick={() => setPanel(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
      </div>
      {gecmis.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "Courier New, monospace" }}>Henüz konu üretilmedi.</p>}
      {gecmis.map(item => (
        <div key={item.id} onClick={() => { setConcept(item.data); setTip(item.tip); setTur(item.tur); setRk(k => k+1); go(() => setStep("result")); setPanel(false); }}
          style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{item.baslik}</p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "Courier New, monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>{item.tip} · {item.tur}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); toggleFavori(item.id); }} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: favoriler.includes(item.id) ? "#facc15" : "rgba(255,255,255,0.2)" }}>⭐</button>
        </div>
      ))}
      {favoriler.length > 0 && (
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ color: "#facc15", fontFamily: "Courier New, monospace", fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>⭐ Favoriler</p>
          {gecmis.filter(g => favoriler.includes(g.id)).map(item => (
            <div key={item.id} onClick={() => { setConcept(item.data); setTip(item.tip); setTur(item.tur); setRk(k => k+1); go(() => setStep("result")); setPanel(false); }}
              style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(250,204,21,0.05)", border: "1px solid rgba(250,204,21,0.15)", marginBottom: 6, cursor: "pointer" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{item.baslik}</p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "Courier New, monospace", textTransform: "uppercase" }}>{item.tip} · {item.tur}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )}
  {panel && <div onClick={() => setPanel(false)} style={{ position: "fixed", inset: 0, zIndex: 49, background: "rgba(0,0,0,0.4)" }} />}

  {/* Main */}
  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", zIndex: 10, opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(14px)", transition: "all 0.26s ease" }}>

    {/* TIP */}
    {step === "tip" && (
      <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
        <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 13, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>Adım 1 / 2</p>
        <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 10, lineHeight: 1 }}>Ne üretelim?</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Courier New, monospace", marginBottom: 48 }}>Bir format seç, gerisini biz halledelim.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          {TIPLER.map(t => (
            <button key={t} onClick={() => pickTip(t)} style={{ ...glass, flex: 1, maxWidth: 180, borderRadius: 20, padding: "28px 20px", textAlign: "left", cursor: "pointer", transition: "all 0.25s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
              <div style={{ fontSize: 34, marginBottom: 14 }}>{t === "Dizi" ? "📺" : "🎬"}</div>
              <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{t}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", fontFamily: "Courier New, monospace" }}>{t === "Dizi" ? "Bölümlü anlatı" : "Tek seferlik"}</div>
            </button>
          ))}
        </div>
      </div>
    )}

    {/* TUR */}
    {step === "tur" && (
      <div style={{ textAlign: "center", maxWidth: 560, width: "100%" }}>
        <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 13, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>Adım 2 / 2</p>
        <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 10, lineHeight: 1 }}>Hangi tür?</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Courier New, monospace", marginBottom: 24 }}>Bir tür seç, {tip?.toLowerCase()} konunu üretelim.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {TURLER.map(t => {
            const isH = hov === t; const c = TUR_COLORS[t];
            return (
              <button key={t} onClick={() => pickTur(t)} onMouseEnter={() => setHov(t)} onMouseLeave={() => setHov(null)}
                style={{ ...glass, borderRadius: 14, padding: "12px 10px", textAlign: "left", cursor: "pointer", transition: "all 0.18s", borderColor: isH ? `${c}55` : "rgba(255,255,255,0.09)", background: isH ? `${c}14` : "rgba(255,255,255,0.03)", transform: isH ? "scale(1.05) translateY(-2px)" : "scale(1)" }}>
                <div style={{ fontSize: 20, marginBottom: 5 }}>{TUR_EMOJIS[t]}</div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{t}</div>
              </button>
            );
          })}
        </div>
        {!showCustom ? (
          <button onClick={() => setShowCustom(true)} style={{ marginTop: 12, width: "100%", padding: "10px", borderRadius: 14, border: "1px dashed rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 800, fontFamily: "Courier New, monospace", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
            ✏️ Kendi türünü yaz
          </button>
        ) : (
          <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
            <input autoFocus value={customTur} onChange={e => setCustomTur(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && customTur.trim()) pickTur(customTur.trim()); if (e.key === "Escape") { setShowCustom(false); setCustomTur(""); } }}
              placeholder="örn: distopik romantizm..."
              style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${accent}45`, borderRadius: 12, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "Courier New, monospace", outline: "none" }} />
            <button onClick={() => customTur.trim() && pickTur(customTur.trim())} style={{ padding: "10px 16px", borderRadius: 12, background: `linear-gradient(135deg, ${accent}, ${accent}aa)`, border: "none", color: "#fff", fontWeight: 800, cursor: "pointer" }}>→</button>
            <button onClick={() => { setShowCustom(false); setCustomTur(""); }} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>✕</button>
          </div>
        )}
        <button onClick={() => go(() => setStep("tip"))} style={{ marginTop: 18, fontSize: 13, fontWeight: 800, fontFamily: "Courier New, monospace", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.6)"}>← Geri</button>
      </div>
    )}

    {/* LOADING */}
    {step === "loading" && (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <div style={{ position: "relative", width: 80, height: 80 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px solid transparent`, borderTopColor: accent, animation: "spin 1s linear infinite" }} />
          <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", animation: "spin 1.5s linear infinite reverse" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{TUR_EMOJIS[tur] || "🎬"}</div>
        </div>
        <p style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Courier New, monospace", fontWeight: 800, color: accent, animation: "pulse 1.8s ease-in-out infinite" }}>Senaryo yazılıyor...</p>
      </div>
    )}

    {/* RESULT */}
    {step === "result" && concept && !karakterStep && (
      <div style={{ width: "100%", maxWidth: 560 }} key={rk}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, justifyContent: "center" }}>
          <span style={{ fontSize: 20 }}>{TUR_EMOJIS[tur] || "🎬"}</span>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Courier New, monospace", padding: "3px 12px", borderRadius: 20, border: `1px solid ${accent}45`, color: accent, background: `${accent}12` }}>{tip} · {tur}</span>
          <button onClick={() => toggleFavori(gecmis[0]?.id)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: favoriler.includes(gecmis[0]?.id) ? "#facc15" : "rgba(255,255,255,0.2)" }}>⭐</button>
        </div>
        <h2 style={{ fontSize: 42, fontWeight: 900, textAlign: "center", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 8, textShadow: `0 0 40px ${accent}35` }}>{concept.baslik}</h2>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <TW text={concept.tagline} speed={28} style={{ fontSize: 14, fontStyle: "italic", fontFamily: "Courier New, monospace", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ ...glass, borderRadius: 16, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)" }} />
            <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: accent, marginBottom: 8 }}>Ana F
