import { useState, useEffect } from "react";

const TURLER = ["Gerilim", "Bilim Kurgu", "Dram", "Korku", "Komedi", "Romantik", "Macera", "Suç", "Fantazi", "Psikolojik", "Tarihi", "Aksiyon"];
const TIPLER = ["Dizi", "Film"];
const TUR_EMOJIS = { "Gerilim": "🔪", "Bilim Kurgu": "🚀", "Dram": "🎭", "Korku": "👁️", "Komedi": "😂", "Romantik": "💔", "Macera": "🧭", "Suç": "🕵️", "Fantazi": "🐉", "Psikolojik": "🧠", "Tarihi": "⚔️", "Aksiyon": "💥" };
const TUR_COLORS = { "Gerilim": "#ff4d4d", "Bilim Kurgu": "#22d3ee", "Dram": "#c084fc", "Korku": "#fb923c", "Komedi": "#facc15", "Romantik": "#f472b6", "Macera": "#4ade80", "Suç": "#94a3b8", "Fantazi": "#a78bfa", "Psikolojik": "#818cf8", "Tarihi": "#fbbf24", "Aksiyon": "#f87171" };

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

  const accent = "#e8230a";
  const go = fn => { setAnim(false); setTimeout(() => { fn(); setAnim(true); }, 260); };
  const pickTip = t => { setTip(t); go(() => setStep("tur")); };
  const pickTur = t => { setTur(t); go(() => setStep("loading")); gen(tip, t); };

  const gen = async (tp, tr) => {
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip: tp, tur: tr }),
      });
      const parsed = await res.json();
      setConcept(parsed); setRk(k => k + 1); go(() => setStep("result"));
    } catch {
      setConcept({ baslik: "Hata", tagline: "Tekrar dene.", ana_fikir: "—", karakter: "—", sahne: "—", soru: "—" });
      go(() => setStep("result"));
    }
  };

  const reset = () => go(() => { setStep("tip"); setTip(null); setTur(null); setConcept(null); setCustomTur(""); setShowCustom(false); });
  const regen = () => { go(() => setStep("loading")); gen(tip, tur); };
  const glass = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)" };

  return (
    <div style={{ minHeight: "100vh", background: "#0c0c0c", color: "#fff", fontFamily: "Georgia, serif", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 60% 30% at 50% 0%, ${accent}15 0%, transparent 55%)` }} />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 40, background: "#050505", zIndex: 20 }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 40, background: "#050505", zIndex: 20 }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "52px 32px 0" }}>
        <button onClick={reset} style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 15, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <span>◈</span> Senaryo Stüdyosu
        </button>
        {(step === "tur" || step === "result" || step === "loading") && (
          <div style={{ fontFamily: "Courier New, monospace", display: "flex", gap: 12, alignItems: "center" }}>
            {tip && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{tip}</span>}
            {tur && <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 6, border: `1px solid ${accent}45`, color: accent, background: `${accent}12` }}>{TUR_EMOJIS[tur]} {tur}</span>}
          </div>
        )}
      </div>

      {step === "tip" && (
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", paddingTop: 14 }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 800, fontStyle: "italic", color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em" }}>by Öztürk</span>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", zIndex: 10, opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(14px)", transition: "all 0.26s ease" }}>

        {step === "tip" && (
          <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
            <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 14, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>Adım 1 / 2</p>
            <h1 style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 10, lineHeight: 1 }}>Ne üretelim?</h1>
            <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "Courier New, monospace", marginBottom: 48 }}>Bir format seç, gerisini biz halledelim.</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              {TIPLER.map(t => (
                <button key={t} onClick={() => pickTip(t)}
                  style={{ ...glass, flex: 1, maxWidth: 180, borderRadius: 20, padding: "32px 24px", textAlign: "left", cursor: "pointer", transition: "all 0.25s", position: "relative", overflow: "hidden" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
                  <div style={{ fontSize: 36, marginBottom: 16 }}>{t === "Dizi" ? "📺" : "🎬"}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 6 }}>{t}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", fontFamily: "Courier New, monospace" }}>{t === "Dizi" ? "Bölümlü anlatı" : "Tek seferlik"}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "tur" && (
          <div style={{ textAlign: "center", maxWidth: 560, width: "100%" }}>
            <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 14, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>Adım 2 / 2</p>
            <h1 style={{ fontSize: 56, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 10, lineHeight: 1 }}>Hangi tür?</h1>
            <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", fontFamily: "Courier New, monospace", marginBottom: 28 }}>Bir tür seç, {tip?.toLowerCase()} konunu üretelim.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {TURLER.map(t => {
                const isH = hov === t; const c = TUR_COLORS[t];
                return (
                  <button key={t} onClick={() => pickTur(t)} onMouseEnter={() => setHov(t)} onMouseLeave={() => setHov(null)}
                    style={{ ...glass, borderRadius: 14, padding: "14px 12px", textAlign: "left", cursor: "pointer", transition: "all 0.18s", borderColor: isH ? `${c}55` : "rgba(255,255,255,0.09)", background: isH ? `${c}14` : "rgba(255,255,255,0.03)", transform: isH ? "scale(1.05) translateY(-2px)" : "scale(1)" }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{TUR_EMOJIS[t]}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: isH ? "#fff" : "rgba(255,255,255,0.85)" }}>{t}</div>
                  </button>
                );
              })}
            </div>
            {!showCustom ? (
              <button onClick={() => setShowCustom(true)} style={{ marginTop: 14, width: "100%", padding: "11px", borderRadius: 14, border: "1px dashed rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 800, fontFamily: "Courier New, monospace", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                ✏️ &nbsp;Kendi türünü yaz
              </button>
            ) : (
              <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                <input autoFocus value={customTur} onChange={e => setCustomTur(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && customTur.trim()) pickTur(customTur.trim()); if (e.key === "Escape") { setShowCustom(false); setCustomTur(""); } }}
                  placeholder="örn: distopik romantizm..."
                  style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: `1px solid ${accent}45`, borderRadius: 12, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "Courier New, monospace", outline: "none" }} />
                <button onClick={() => customTur.trim() && pickTur(customTur.trim())} style={{ padding: "10px 16px", borderRadius: 12, background: `linear-gradient(135deg, ${accent}, ${accent}aa)`, border: "none", color: "#fff", fontWeight: 800, cursor: "pointer" }}>→</button>
                <button onClick={() => { setShowCustom(false); setCustomTur(""); }} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>✕</button>
              </div>
            )}
            <button onClick={() => go(() => setStep("tip"))} style={{ marginTop: 20, fontSize: 14, fontWeight: 800, fontFamily: "Courier New, monospace", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}
              onMouseEnter={e => e.target.style.color = "#fff"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.7)"}>
              ← Geri
            </button>
          </div>
        )}

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

        {step === "result" && concept && (
          <div style={{ width: "100%", maxWidth: 560 }} key={rk}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, justifyContent: "center" }}>
              <span style={{ fontSize: 22 }}>{TUR_EMOJIS[tur] || "🎬"}</span>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Courier New, monospace", padding: "3px 12px", borderRadius: 20, border: `1px solid ${accent}45`, color: accent, background: `${accent}12` }}>{tip} · {tur}</span>
            </div>
            <h2 style={{ fontSize: 46, fontWeight: 900, textAlign: "center", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 10, textShadow: `0 0 40px ${accent}35` }}>{concept.baslik}</h2>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <TW text={concept.tagline} speed={28} style={{ fontSize: 15, fontStyle: "italic", fontFamily: "Courier New, monospace", color: "rgba(255,255,255,0.82)", lineHeight: 1.6 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ ...glass, borderRadius: 18, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)" }} />
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: accent, marginBottom: 10 }}>Ana Fikir</p>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.92)" }}>{concept.ana_fikir}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[{ label: "Karakter", val: concept.karakter }, { label: "Açılış Sahnesi", val: concept.sahne }].map(({ label, val }) => (
                  <div key={label} style={{ ...glass, borderRadius: 18, padding: "16px 18px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.1),transparent)" }} />
                    <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{label}</p>
                    <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.88)", fontFamily: "Courier New, monospace" }}>{val}</p>
                  </div>
                ))}
              </div>
              <div style={{ ...glass, borderRadius: 18, padding: "20px", textAlign: "center", borderColor: `${accent}30`, background: `${accent}0e`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${accent}55,transparent)` }} />
                <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: "rgba(255,255,255,0.45)", marginBottom: 10 }}>Büyük Soru</p>
                <TW text={`"${concept.soru}"`} speed={22} style={{ fontSize: 15, fontWeight: 700, fontFamily: "Courier New, monospace", color: accent, lineHeight: 1.6 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}>
              {[{ label: "🔄 Yeni Konu", fn: regen, p: false }, { label: "🎭 Tür Değiştir", fn: () => go(() => setStep("tur")), p: false }, { label: "✦ Baştan Başla", fn: reset, p: true }].map(({ label, fn, p }) => (
                <button key={label} onClick={fn}
                  style={p ? { padding: "10px 20px", borderRadius: 14, background: `linear-gradient(135deg, ${accent}, #c01a08)`, border: `1px solid ${accent}`, boxShadow: `0 4px 20px ${accent}35`, color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", transition: "transform 0.15s" }
                    : { padding: "10px 20px", borderRadius: 14, background: "linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.11)", color: "rgba(255,255,255,0.88)", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "transform 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "center", gap: 8, paddingBottom: 52 }}>
        {["tip", "tur", "result"].map(s => {
          const active = step === s || (step === "loading" && s === "result");
          const passed = ["tip", "tur", "loading", "result"].indexOf(step) > ["tip", "tur", "result"].indexOf(s);
          return <div key={s} style={{ height: 3, borderRadius: 2, transition: "all 0.5s", width: active ? 28 : 8, background: active ? accent : passed ? `${accent}45` : "rgba(255,255,255,0.1)", boxShadow: active ? `0 0 8px ${accent}` : "none" }} />;
        })}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    </div>
  );
}
