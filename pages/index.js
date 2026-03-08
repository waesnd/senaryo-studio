import { useState, useEffect, useRef } from "react";

const TURLER = ["Gerilim", "Bilim Kurgu", "Dram", "Korku", "Komedi", "Romantik", "Macera", "Suc", "Fantazi", "Psikolojik", "Tarihi", "Aksiyon"];
const TIPLER = ["Dizi", "Film"];
const TUR_EMOJIS = { "Gerilim": "🔪", "Bilim Kurgu": "🚀", "Dram": "🎭", "Korku": "👁️", "Komedi": "😂", "Romantik": "💔", "Macera": "🧭", "Suc": "🕵️", "Fantazi": "🐉", "Psikolojik": "🧠", "Tarihi": "⚔️", "Aksiyon": "💥" };
const TUR_LABELS = { "Suc": "Suç" };
const TUR_COLORS = { "Gerilim": "#ff4d4d", "Bilim Kurgu": "#22d3ee", "Dram": "#c084fc", "Korku": "#fb923c", "Komedi": "#facc15", "Romantik": "#f472b6", "Macera": "#4ade80", "Suc": "#94a3b8", "Fantazi": "#a78bfa", "Psikolojik": "#818cf8", "Tarihi": "#fbbf24", "Aksiyon": "#f87171" };

const BOKEH = Array.from({ length: 18 }, function(_, i) {
  return {
    id: i,
    size: 40 + (i * 17) % 100,
    x: (i * 23 + 7) % 100,
    y: (i * 31 + 13) % 100,
    dur: 12 + (i * 3) % 14,
    delay: -(i * 2.3),
    op: 0.04 + (i % 4) * 0.03,
    color: i % 4 === 0 ? "#e8230a" : i % 4 === 1 ? "#ff6b35" : i % 4 === 2 ? "#ffffff" : "#ff4444",
  };
});

function useTypewriter(text, speed) {
  var spd = speed || 28;
  var arr = useState("");
  var d = arr[0];
  var setD = arr[1];
  useEffect(function() {
    if (!text) return;
    setD("");
    var i = 0;
    var iv = setInterval(function() {
      i++;
      setD(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, spd);
    return function() { clearInterval(iv); };
  }, [text]);
  return d;
}

function TW(props) {
  var d = useTypewriter(props.text, props.speed || 25);
  return (
    <p style={props.style || {}}>
      {d}
      <span style={{ animation: "blink 1s step-end infinite" }}>|</span>
    </p>
  );
}

export default function App() {
  var s1 = useState("tip"); var step = s1[0]; var setStep = s1[1];
  var s2 = useState(null); var tip = s2[0]; var setTip = s2[1];
  var s3 = useState(null); var tur = s3[0]; var setTur = s3[1];
  var s4 = useState(null); var concept = s4[0]; var setConcept = s4[1];
  var s5 = useState(true); var anim = s5[0]; var setAnim = s5[1];
  var s6 = useState(null); var hov = s6[0]; var setHov = s6[1];
  var s7 = useState(""); var customTur = s7[0]; var setCustomTur = s7[1];
  var s8 = useState(false); var showCustom = s8[0]; var setShowCustom = s8[1];
  var s9 = useState(0); var rk = s9[0]; var setRk = s9[1];
  var s10 = useState(false); var panel = s10[0]; var setPanel = s10[1];
  var s11 = useState([]); var gecmis = s11[0]; var setGecmis = s11[1];
  var s12 = useState([]); var favoriler = s12[0]; var setFavoriler = s12[1];
  var s13 = useState(true); var musicOn = s13[0]; var setMusicOn = s13[1];
  var s14 = useState(null); var karakter = s14[0]; var setKarakter = s14[1];
  var s15 = useState(false); var karakterStep = s15[0]; var setKarakterStep = s15[1];
  var s16 = useState(false); var karakterLoading = s16[0]; var setKarakterLoading = s16[1];
  var audioRef = useRef(null);

  var accent = "#e8230a";
  var glass = {
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
  };

  useEffect(function() {
    var saved = localStorage.getItem("gecmis");
    var savedFav = localStorage.getItem("favoriler");
    if (saved) { try { setGecmis(JSON.parse(saved)); } catch(e) {} }
    if (savedFav) { try { setFavoriler(JSON.parse(savedFav)); } catch(e) {} }
  }, []);

  useEffect(function() {
    if (audioRef.current) {
      if (musicOn) { audioRef.current.play().catch(function() {}); }
      else { audioRef.current.pause(); }
    }
  }, [musicOn]);

  function go(fn) {
    setAnim(false);
    setTimeout(function() { fn(); setAnim(true); }, 260);
  }

  function pickTip(t) { setTip(t); go(function() { setStep("tur"); }); }
  function pickTur(t) { setTur(t); go(function() { setStep("loading"); }); genConcept(tip, t); }

  function genConcept(tp, tr) {
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tip: tp, tur: tr }),
    })
    .then(function(res) { return res.json(); })
    .then(function(parsed) {
      setConcept(parsed);
      setRk(function(k) { return k + 1; });
      var yeni = { id: Date.now(), tip: tp, tur: tr, baslik: parsed.baslik, data: parsed };
      setGecmis(function(prev) {
        var updated = [yeni].concat(prev);
        localStorage.setItem("gecmis", JSON.stringify(updated));
        return updated;
      });
      go(function() { setStep("result"); });
    })
    .catch(function() {
      setConcept({ baslik: "Hata", tagline: "Tekrar dene.", ana_fikir: "—", karakter: "—", sahne: "—", soru: "—" });
      go(function() { setStep("result"); });
    });
  }

  function genKarakter() {
    setKarakterLoading(true);
    fetch("/api/karakter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept: concept, tip: tip, tur: tur }),
    })
    .then(function(res) { return res.json(); })
    .then(function(parsed) {
      setKarakter(parsed);
      setKarakterStep(true);
      setKarakterLoading(false);
    })
    .catch(function() {
      setKarakter({ gecmis: "—", motivasyon: "—", guclu: "—", zayif: "—" });
      setKarakterStep(true);
      setKarakterLoading(false);
    });
  }

  function toggleFavori(id) {
    setFavoriler(function(prev) {
      var updated = prev.includes(id) ? prev.filter(function(f) { return f !== id; }) : prev.concat([id]);
      localStorage.setItem("favoriler", JSON.stringify(updated));
      return updated;
    });
  }

  function reset() {
    go(function() {
      setStep("tip"); setTip(null); setTur(null); setConcept(null);
      setCustomTur(""); setShowCustom(false); setKarakter(null); setKarakterStep(false);
    });
  }

  function regen() { go(function() { setStep("loading"); }); genConcept(tip, tur); }

  function paylasMetin() {
    var text = "🎬 " + concept.baslik + "\n\"" + concept.tagline + "\"\n\n📖 " + concept.ana_fikir + "\n\n👤 " + concept.karakter + "\n\n❓ " + concept.soru + "\n\nSenaryo Stüdyosu ile üretildi.";
    navigator.clipboard.writeText(text);
    alert("Kopyalandı!");
  }

  function paylasWhatsapp() {
    var text = encodeURIComponent("🎬 " + concept.baslik + "\n\"" + concept.tagline + "\"\n\n" + concept.ana_fikir);
    window.open("https://wa.me/?text=" + text);
  }

  function turLabel(t) { return TUR_LABELS[t] || t; }

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "Georgia, serif", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {BOKEH.map(function(p) {
        return (
          <div key={p.id} style={{
            position: "fixed", width: p.size, height: p.size, borderRadius: "50%",
            left: p.x + "%", top: p.y + "%",
            background: "radial-gradient(circle, " + p.color + " 0%, transparent 70%)",
            filter: "blur(12px)", opacity: p.op,
            animation: "float" + (p.id % 3) + " " + p.dur + "s " + p.delay + "s ease-in-out infinite alternate",
            pointerEvents: "none", zIndex: 0,
          }} />
        );
      })}

      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", pointerEvents: "none", zIndex: 1 }} />
      <audio ref={audioRef} loop src="https://cdn.pixabay.com/audio/2022/10/16/audio_12a71c9a3b.mp3" />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 40, background: "#030303", zIndex: 30 }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 40, background: "#030303", zIndex: 30 }} />

      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "52px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={function() { setPanel(!panel); }} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 14 }}>☰</button>
          <button onClick={reset} style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}>◈ Senaryo Stüdyosu</button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {(step === "tur" || step === "result" || step === "loading") && tip && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.45)", fontFamily: "Courier New, monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}>{tip}</span>
          )}
          {tur && (step === "result" || step === "loading") && (
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6, border: "1px solid " + accent + "45", color: accent, background: accent + "12", fontFamily: "Courier New, monospace" }}>{TUR_EMOJIS[tur]} {turLabel(tur)}</span>
          )}
          <button onClick={function() { setMusicOn(!musicOn); }} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "5px 12px", color: musicOn ? accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Courier New, monospace" }}>
            {musicOn ? "♪ ON" : "♪ OFF"}
          </button>
        </div>
      </div>

      {step === "tip" && (
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", paddingTop: 10 }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>by Öztürk</span>
        </div>
      )}

      {panel && (
        <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 300, background: "rgba(8,8,8,0.97)", backdropFilter: "blur(30px)", borderRight: "1px solid rgba(255,255,255,0.08)", zIndex: 50, padding: "80px 20px 60px", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase" }}>Geçmiş Konular</p>
            <button onClick={function() { setPanel(false); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>
          {gecmis.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "Courier New, monospace" }}>Henüz konu üretilmedi.</p>}
          {gecmis.map(function(item) {
            return (
              <div key={item.id}
                onClick={function() { setConcept(item.data); setTip(item.tip); setTur(item.tur); setRk(function(k) { return k + 1; }); go(function() { setStep("result"); }); setPanel(false); }}
                style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{item.baslik}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "Courier New, monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>{item.tip} · {turLabel(item.tur)}</p>
                </div>
                <button onClick={function(e) { e.stopPropagation(); toggleFavori(item.id); }} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", color: favoriler.includes(item.id) ? "#facc15" : "rgba(255,255,255,0.2)" }}>⭐</button>
              </div>
            );
          })}
          {favoriler.length > 0 && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ color: "#facc15", fontFamily: "Courier New, monospace", fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>⭐ Favoriler</p>
              {gecmis.filter(function(g) { return favoriler.includes(g.id); }).map(function(item) {
                return (
                  <div key={item.id}
                    onClick={function() { setConcept(item.data); setTip(item.tip); setTur(item.tur); setRk(function(k) { return k + 1; }); go(function() { setStep("result"); }); setPanel(false); }}
                    style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(250,204,21,0.05)", border: "1px solid rgba(250,204,21,0.15)", marginBottom: 6, cursor: "pointer" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{item.baslik}</p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "Courier New, monospace", textTransform: "uppercase" }}>{item.tip} · {turLabel(item.tur)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {panel && <div onClick={function() { setPanel(false); }} style={{ position: "fixed", inset: 0, zIndex: 49, background: "rgba(0,0,0,0.4)" }} />}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", zIndex: 10, opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(14px)", transition: "all 0.26s ease" }}>

        {step === "tip" && (
          <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
            <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 13, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>Adım 1 / 2</p>
            <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 10, lineHeight: 1 }}>Ne üretelim?</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Courier New, monospace", marginBottom: 48 }}>Bir format seç, gerisini biz halledelim.</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              {TIPLER.map(function(t) {
                return (
                  <button key={t} onClick={function() { pickTip(t); }}
                    style={{ flex: 1, maxWidth: 180, borderRadius: 20, padding: "28px 20px", textAlign: "left", cursor: "pointer", transition: "all 0.25s", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", color: "#fff" }}
                    onMouseEnter={function(e) { e.currentTarget.style.transform = "scale(1.04)"; }}
                    onMouseLeave={function(e) { e.currentTarget.style.transform = "scale(1)"; }}>
                    <div style={{ fontSize: 34, marginBottom: 14 }}>{t === "Dizi" ? "📺" : "🎬"}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{t}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", fontFamily: "Courier New, monospace" }}>{t === "Dizi" ? "Bölümlü anlatı" : "Tek seferlik"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "tur" && (
          <div style={{ textAlign: "center", maxWidth: 560, width: "100%" }}>
            <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 13, fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>Adım 2 / 2</p>
            <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 10, lineHeight: 1 }}>Hangi tür?</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Courier New, monospace", marginBottom: 24 }}>{"Bir tür seç, " + (tip ? tip.toLowerCase() : "") + " konunu üretelim."}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {TURLER.map(function(t) {
                var isH = hov === t;
                var c = TUR_COLORS[t] || "#ffffff";
                return (
                  <button key={t} onClick={function() { pickTur(t); }}
                    onMouseEnter={function() { setHov(t); }}
                    onMouseLeave={function() { setHov(null); }}
                    style={{ borderRadius: 14, padding: "12px 10px", textAlign: "left", cursor: "pointer", transition: "all 0.18s", border: "1px solid " + (isH ? c + "55" : "rgba(255,255,255,0.09)"), background: isH ? c + "14" : "rgba(255,255,255,0.03)", transform: isH ? "scale(1.05) translateY(-2px)" : "scale(1)", backdropFilter: "blur(20px)", color: "#fff" }}>
                    <div style={{ fontSize: 20, marginBottom: 5 }}>{TUR_EMOJIS[t]}</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{turLabel(t)}</div>
                  </button>
                );
              })}
            </div>
            {!showCustom ? (
              <button onClick={function() { setShowCustom(true); }} style={{ marginTop: 12, width: "100%", padding: "10px", borderRadius: 14, border: "1px dashed rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 800, fontFamily: "Courier New, monospace", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                ✏️ Kendi türünü yaz
              </button>
            ) : (
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <input autoFocus value={customTur} onChange={function(e) { setCustomTur(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter" && customTur.trim()) pickTur(customTur.trim()); if (e.key === "Escape") { setShowCustom(false); setCustomTur(""); } }}
                  placeholder="örn: distopik romantizm..."
                  style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid " + accent + "45", borderRadius: 12, padding: "10px 14px", color: "#fff", fontSize: 13, fontFamily: "Courier New, monospace", outline: "none" }} />
                <button onClick={function() { if (customTur.trim()) pickTur(customTur.trim()); }} style={{ padding: "10px 16px", borderRadius: 12, background: "linear-gradient(135deg, " + accent + ", " + accent + "aa)", border: "none", color: "#fff", fontWeight: 800, cursor: "pointer" }}>→</button>
                <button onClick={function() { setShowCustom(false); setCustomTur(""); }} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>✕</button>
              </div>
            )}
            <button onClick={function() { go(function() { setStep("tip"); }); }} style={{ marginTop: 18, fontSize: 13, fontWeight: 800, fontFamily: "Courier New, monospace", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer" }}>← Geri</button>
          </div>
        )}

        {step === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: accent, animation: "spin 1s linear infinite" }} />
              <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", animation: "spin 1.5s linear infinite reverse" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{TUR_EMOJIS[tur] || "🎬"}</div>
            </div>
            <p style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Courier New, monospace", fontWeight: 800, color: accent, animation: "pulse 1.8s ease-in-out infinite" }}>Senaryo yazılıyor...</p>
          </div>
        )}

        {step === "result" && concept && !karakterStep && (
          <div style={{ width: "100%", maxWidth: 560 }} key={rk}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, justifyContent: "center" }}>
              <span style={{ fontSize: 20 }}>{TUR_EMOJIS[tur] || "🎬"}</span>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Courier New, monospace", padding: "3px 12px", borderRadius: 20, border: "1px solid " + accent + "45", color: accent, background: accent + "12" }}>{tip} · {turLabel(tur)}</span>
              <button onClick={function() { if (gecmis[0]) toggleFavori(gecmis[0].id); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: gecmis[0] && favoriler.includes(gecmis[0].id) ? "#facc15" : "rgba(255,255,255,0.2)" }}>⭐</button>
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 900, textAlign: "center", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 8, textShadow: "0 0 40px " + accent + "35" }}>{concept.baslik}</h2>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <TW text={concept.tagline} speed={28} style={{ fontSize: 14, fontStyle: "italic", fontFamily: "Courier New, monospace", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ ...glass, borderRadius: 16, padding: "16px 18px" }}>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: accent, marginBottom: 8 }}>Ana Fikir</p>
                <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.9)" }}>{concept.ana_fikir}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[{ label: "Karakter", val: concept.karakter }, { label: "Açılış Sahnesi", val: concept.sahne }].map(function(item) {
                  return (
                    <div key={item.label} style={{ ...glass, borderRadius: 16, padding: "14px 16px" }}>
                      <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{item.label}</p>
                      <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.85)", fontFamily: "Courier New, monospace" }}>{item.val}</p>
                    </div>
                  );
                })}
              </div>
              <div style={{ ...glass, borderRadius: 16, padding: "16px", textAlign: "center", borderColor: accent + "30", background: accent + "0e" }}>
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Büyük Soru</p>
                <TW text={"\"" + concept.soru + "\""} speed={22} style={{ fontSize: 14, fontWeight: 700, fontFamily: "Courier New, monospace", color: accent, lineHeight: 1.6 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={regen} style={{ ...glass, padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "rgba(255,255,255,0.85)" }}>🔄 Yeni</button>
              <button onClick={function() { go(function() { setStep("tur"); }); }} style={{ ...glass, padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "rgba(255,255,255,0.85)" }}>🎭 Tür</button>
              <button onClick={genKarakter} disabled={karakterLoading} style={{ ...glass, padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "#a78bfa", borderColor: "#a78bfa40" }}>🧠 {karakterLoading ? "Yükleniyor..." : "Karakter Analizi"}</button>
              <button onClick={reset} style={{ padding: "8px 16px", borderRadius: 12, background: "linear-gradient(135deg, " + accent + ", #c01a08)", border: "1px solid " + accent, fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#fff" }}>✦ Baştan</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center" }}>
              <button onClick={paylasMetin} style={{ ...glass, padding: "6px 14px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer", color: "rgba(255,255,255,0.6)" }}>📋 Kopyala</button>
              <button onClick={paylasWhatsapp} style={{ ...glass, padding: "6px 14px", borderRadius: 10, fontSize: 11, fontWeight: 700, cursor: "pointer", color: "#4ade80" }}>💬 WhatsApp</button>
            </div>
          </div>
        )}

        {step === "result" && karakterStep && karakter && (
          <div style={{ width: "100%", maxWidth: 560 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, justifyContent: "center" }}>
              <span style={{ fontSize: 24 }}>🧠</span>
              <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>Karakter Analizi</h2>
            </div>
            <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Courier New, monospace", marginBottom: 24 }}>{concept.baslik}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Geçmiş & Kökeni", val: karakter.gecmis, color: "#c084fc" },
                { label: "Motivasyonu", val: karakter.motivasyon, color: accent },
                { label: "Güçlü Yönleri", val: karakter.guclu, color: "#4ade80" },
                { label: "Zayıf Yönleri", val: karakter.zayif, color: "#fb923c" },
              ].map(function(item) {
                return (
                  <div key={item.label} style={{ ...glass, borderRadius: 16, padding: "16px 18px" }}>
                    <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: item.color, marginBottom: 8 }}>{item.label}</p>
                    <p style={{ fontSize: 13, lineHeight: 1.65, color: "rgba(255,255,255,0.88)" }}>{item.val}</p>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
              <button onClick={function() { setKarakterStep(false); }} style={{ ...glass, padding: "8px 18px", borderRadius: 12, fontSize: 12, fontWeight: 700, cursor: "pointer", color: "rgba(255,255,255,0.8)" }}>← Konuya Dön</button>
              <button onClick={reset} style={{ padding: "8px 18px", borderRadius: 12, background: "linear-gradient(135deg, " + accent + ", #c01a08)", border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", color: "#fff" }}>✦ Baştan Başla</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "center", gap: 8, paddingBottom: 52 }}>
        {["tip", "tur", "result"].map(function(s) {
          var allSteps = ["tip", "tur", "loading", "result"];
          var active = step === s || (step === "loading" && s === "result");
          var passed = allSteps.indexOf(step) > ["tip", "tur", "result"].indexOf(s);
          return (
            <div key={s} style={{ height: 3, borderRadius: 2, transition: "all 0.5s", width: active ? 28 : 8, background: active ? accent : passed ? accent + "45" : "rgba(255,255,255,0.1)", boxShadow: active ? "0 0 8px " + accent : "none" }} />
          );
        })}
      </div>

      <style>{"\n@keyframes spin{to{transform:rotate(360deg)}}\n@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}\n@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}\n@keyframes float0{0%{transform:translate(0,0) scale(1)}100%{transform:translate(30px,-20px) scale(1.1)}}\n@keyframes float1{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-20px,30px) scale(0.9)}}\n@keyframes float2{0%{transform:translate(0,0) scale(1)}100%{transform:translate(20px,20px) scale(1.05)}}\n"}</style>
    </div>
  );
}
