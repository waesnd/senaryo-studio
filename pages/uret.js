import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var TEAL = "#0891b2";
var TEAL_L = "#06b6d4";

var TURLER = ["Gerilim", "Drama", "Bilim Kurgu", "Komedi", "Romantik", "Korku", "Aksiyon", "Fantastik", "Suç", "Tarihi", "Animasyon", "Belgesel"];
var TIPLER = ["Dizi", "Film"];

function getC(dk) {
  return {
    bg: dk ? "#080f1c" : "#eef2f7",
    surface: dk ? "#0f1829" : "#ffffff",
    border: dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dk ? "#f1f5f9" : "#0f172a",
    muted: dk ? "rgba(241,245,249,0.38)" : "rgba(15,23,42,0.4)",
    input: dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    metalGrad: dk ? "linear-gradient(145deg,#1a2740 0%,#0f1829 60%,#162035 100%)" : "linear-gradient(145deg,#ffffff 0%,#f0f4f8 60%,#e8eef5 100%)",
    shadow: dk ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.08)",
  };
}

export default function Uret() {
  var [user, setUser] = useState(null);
  var [tip, setTip] = useState("Dizi");
  var [tur, setTur] = useState("Gerilim");
  var [ozelIstek, setOzelIstek] = useState("");
  var [yukleniyor, setYukleniyor] = useState(false);
  var [senaryo, setSenaryo] = useState(null);
  var [kaydedildi, setKaydedildi] = useState(false);
  var [paylasimAcik, setPaylasimAcik] = useState(false);
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [adim, setAdim] = useState(1);

  // Karakter analizi
  var [karakterYukleniyor, setKarakterYukleniyor] = useState(false);
  var [karakterAnaliz, setKarakterAnaliz] = useState(null);
  var [karakterAcik, setKarakterAcik] = useState(false);

  var dk = tema === "dark";
  var C = getC(dk);

  useEffect(function () {
    var t = localStorage.getItem("sf_tema") || "light";
    setTema(t);
    setTimeout(function () { setLoaded(true); }, 60);
    supabase.auth.getSession().then(function (r) {
      if (r.data && r.data.session) setUser(r.data.session.user);
    });
    supabase.auth.onAuthStateChange(function (_, session) {
      setUser(session ? session.user : null);
    });
  }, []);

  async function uret() {
    setYukleniyor(true);
    setSenaryo(null);
    setKaydedildi(false);
    setKarakterAnaliz(null);
    setKarakterAcik(false);
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip, tur, ozelIstek }),
      });
      var data = await res.json();
      if (data.senaryo) {
        setSenaryo(data.senaryo);
        setAdim(2);
      } else {
        alert("Senaryo üretilemedi: " + (data.error || "Tekrar dene."));
      }
    } catch (e) {
      alert("Bir hata oluştu: " + e.message);
    }
    setYukleniyor(false);
  }

  async function karakterAnalizEt() {
    if (!senaryo) return;
    setKarakterYukleniyor(true);
    setKarakterAnaliz(null);
    setKarakterAcik(true);
    try {
      var res = await fetch("/api/karakter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept: senaryo, tip, tur }),
      });
      var data = await res.json();
      if (data.analiz) {
        setKarakterAnaliz(data.analiz);
      } else {
        alert("Karakter analizi yapılamadı: " + (data.error || "Tekrar dene."));
        setKarakterAcik(false);
      }
    } catch (e) {
      alert("Hata: " + e.message);
      setKarakterAcik(false);
    }
    setKarakterYukleniyor(false);
  }

  async function kaydet() {
    if (!user) { alert("Kaydetmek için giriş yapmalısın!"); return; }
    if (!senaryo) return;
    var r = await supabase.from("senaryolar").insert([{
      user_id: user.id,
      tip: tip,
      tur: tur,
      baslik: senaryo.baslik,
      tagline: senaryo.tagline,
      ana_fikir: senaryo.ana_fikir,
      karakter: senaryo.karakter,
      sahne: senaryo.sahne,
      soru: senaryo.soru,
      paylasim_acik: paylasimAcik,
    }]);
    if (!r.error) setKaydedildi(true);
    else alert("Kaydedilemedi: " + r.error.message);
  }

  async function toplulugaPaylas() {
    if (!user) { alert("Paylaşmak için giriş yapmalısın!"); return; }
    if (!senaryo) return;
    await supabase.from("senaryolar").insert([{
      user_id: user.id, tip, tur,
      baslik: senaryo.baslik, tagline: senaryo.tagline,
      ana_fikir: senaryo.ana_fikir, karakter: senaryo.karakter,
      sahne: senaryo.sahne, soru: senaryo.soru,
      paylasim_acik: true,
    }]);
    window.location.href = "/topluluk";
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease", paddingBottom: 100 }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
        input::placeholder,textarea::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}
        a{text-decoration:none;color:inherit;}
        button{font-family:inherit;cursor:pointer;}
        .tur-btn{transition:all 0.15s ease;}
        .tip-btn{transition:all 0.2s ease;}
      `}</style>

      {/* NAVBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.92)" : "rgba(238,242,247,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={function () { window.location.href = "/"; }} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "7px 14px", color: C.muted, fontSize: 13, fontWeight: 600 }}>← Geri</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🎬</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Senaryo Üret</span>
        </div>
        <button onClick={function () { var t = dk ? "light" : "dark"; setTema(t); localStorage.setItem("sf_tema", t); }} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "7px 10px", color: C.muted, fontSize: 13 }}>{dk ? "☀️" : "🌙"}</button>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 20px" }}>

        {/* ═══ FORM AŞAMASI ═══ */}
        {adim === 1 && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>
            <div style={{ background: dk ? `linear-gradient(135deg, ${TEAL}18, ${ACCENT}10)` : `linear-gradient(135deg, ${TEAL}10, ${ACCENT}07)`, border: `1px solid ${TEAL}25`, borderRadius: 20, padding: "20px 22px", marginBottom: 24, textAlign: "center" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🎬</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: C.text, marginBottom: 6 }}>AI Senaryo Üretici</h1>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>Saniyeler içinde özgün film veya dizi konusu üret.<br />Yapay zeka senin için senaryo yazsın.</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>Format</p>
              <div style={{ display: "flex", gap: 10 }}>
                {TIPLER.map(function (t) {
                  var isActive = tip === t;
                  return (
                    <button key={t} className="tip-btn" onClick={function () { setTip(t); }} style={{ flex: 1, padding: "14px", borderRadius: 14, border: "2px solid " + (isActive ? TEAL : C.border), background: isActive ? `linear-gradient(135deg, ${TEAL}15, ${TEAL_L}08)` : C.surface, color: isActive ? TEAL : C.muted, fontSize: 15, fontWeight: isActive ? 800 : 500, boxShadow: isActive ? `0 4px 20px ${TEAL}20` : "none" }}>
                      {t === "Dizi" ? "📺 Dizi" : "🎬 Film"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>Tür</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {TURLER.map(function (t) {
                  var isActive = tur === t;
                  return (
                    <button key={t} className="tur-btn" onClick={function () { setTur(t); }} style={{ padding: "8px 16px", borderRadius: 20, border: "1.5px solid " + (isActive ? TEAL : C.border), background: isActive ? `linear-gradient(135deg, ${TEAL}, ${TEAL_L})` : C.surface, color: isActive ? "#fff" : C.muted, fontSize: 13, fontWeight: isActive ? 700 : 500, boxShadow: isActive ? `0 3px 12px ${TEAL}35` : "none" }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10, letterSpacing: "0.06em", textTransform: "uppercase" }}>Özel İstek <span style={{ fontWeight: 400, textTransform: "none", fontSize: 11 }}>(isteğe bağlı)</span></p>
              <textarea value={ozelIstek} onChange={function (e) { setOzelIstek(e.target.value); }} placeholder="Örn: İstanbul'da geçsin, kadın kahraman olsun, sürpriz final..." rows={3} style={{ width: "100%", background: C.surface, border: "1.5px solid " + C.border, borderRadius: 14, padding: "12px 16px", color: C.text, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.6, transition: "border-color 0.2s" }}
                onFocus={function (e) { e.target.style.borderColor = TEAL; }}
                onBlur={function (e) { e.target.style.borderColor = C.border; }} />
            </div>

            <button onClick={uret} disabled={yukleniyor} style={{ width: "100%", padding: "16px", borderRadius: 16, background: yukleniyor ? C.input : `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", color: yukleniyor ? C.muted : "#fff", fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em", boxShadow: yukleniyor ? "none" : `0 6px 24px ${ACCENT}40`, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              {yukleniyor ? (
                <>
                  <div style={{ width: 20, height: 20, border: "2.5px solid rgba(255,255,255,0.2)", borderTopColor: TEAL, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <span style={{ animation: "pulse 1.5s ease infinite" }}>AI senaryo yazıyor...</span>
                </>
              ) : <>🎬 Senaryo Üret</>}
            </button>

            {!user && <p style={{ textAlign: "center", fontSize: 12, color: C.muted, marginTop: 12 }}>Giriş yapmadan da üretebilirsin — kaydetmek için <a href="/" style={{ color: TEAL, fontWeight: 600 }}>giriş yap</a></p>}
          </div>
        )}

        {/* ═══ SONUÇ AŞAMASI ═══ */}
        {adim === 2 && senaryo && (
          <div style={{ animation: "fadeUp 0.35s ease" }}>

            {/* Geri + yeniden üret */}
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <button onClick={function () { setAdim(1); setSenaryo(null); setKaydedildi(false); setKarakterAnaliz(null); setKarakterAcik(false); }} style={{ flex: 1, padding: "11px", borderRadius: 12, background: C.surface, border: "1px solid " + C.border, color: C.muted, fontSize: 14, fontWeight: 600 }}>← Geri</button>
              <button onClick={uret} disabled={yukleniyor} style={{ flex: 2, padding: "11px", borderRadius: 12, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 16px ${TEAL}35`, opacity: yukleniyor ? 0.7 : 1 }}>
                {yukleniyor ? "Üretiliyor..." : "🔄 Yeniden Üret"}
              </button>
            </div>

            {/* Senaryo kartı */}
            <div style={{ background: C.metalGrad, border: "1px solid " + C.border, borderRadius: 20, overflow: "hidden", boxShadow: C.shadow, marginBottom: 14 }}>
              <div style={{ background: `linear-gradient(135deg, ${ACCENT}15, ${TEAL}10)`, borderBottom: "1px solid " + C.border, padding: "20px 22px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, color: "#fff" }}>{tip}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, color: "#fff" }}>{tur}</span>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", color: C.text, marginBottom: 8, lineHeight: 1.2 }}>{senaryo.baslik}</h2>
                {senaryo.tagline && <p style={{ fontSize: 14, fontStyle: "italic", color: C.muted, lineHeight: 1.5 }}>"{senaryo.tagline}"</p>}
              </div>

              <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 18 }}>
                {senaryo.ana_fikir && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: TEAL, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>📖 Ana Fikir</p>
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: C.text }}>{senaryo.ana_fikir}</p>
                  </div>
                )}
                {senaryo.karakter && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: TEAL, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>👥 Karakterler</p>
                    <div style={{ background: C.input, borderRadius: 12, padding: "14px 16px", border: "1px solid " + C.border }}>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: C.text }}>{senaryo.karakter}</p>
                    </div>
                  </div>
                )}
                {senaryo.sahne && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: TEAL, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>🎭 Açılış Sahnesi</p>
                    <div style={{ background: C.input, borderRadius: 12, padding: "14px 16px", border: "1px solid " + C.border, borderLeft: `3px solid ${ACCENT}` }}>
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: C.text, fontStyle: "italic" }}>{senaryo.sahne}</p>
                    </div>
                  </div>
                )}
                {senaryo.soru && (
                  <div style={{ background: dk ? `${ACCENT}10` : `${ACCENT}07`, border: `1px solid ${ACCENT}20`, borderRadius: 14, padding: "14px 18px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>❓ Büyük Soru</p>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.5 }}>{senaryo.soru}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ═══ KARAKTERİ ANALİZ ET ═══ */}
            <button onClick={karakterAnalizEt} disabled={karakterYukleniyor} style={{ width: "100%", padding: "13px", borderRadius: 14, background: karakterAcik ? C.input : `linear-gradient(135deg, #7c3aed, #a855f7)`, border: karakterAcik ? "1px solid " + C.border : "none", color: karakterAcik ? C.muted : "#fff", fontSize: 14, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: karakterAcik ? "none" : "0 4px 18px rgba(124,58,237,0.35)", transition: "all 0.2s" }}>
              {karakterYukleniyor ? (
                <>
                  <div style={{ width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.2)", borderTopColor: "#a855f7", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <span style={{ animation: "pulse 1.5s ease infinite" }}>Karakter analiz ediliyor...</span>
                </>
              ) : <>🧠 {karakterAcik && karakterAnaliz ? "Karakteri Yeniden Analiz Et" : "Karakteri Analiz Et"}</>}
            </button>

            {/* Karakter analizi sonucu */}
            {karakterAcik && karakterAnaliz && (
              <div style={{ background: C.metalGrad, border: "1px solid rgba(124,58,237,0.2)", borderRadius: 20, overflow: "hidden", boxShadow: C.shadow, marginBottom: 14, animation: "fadeUp 0.35s ease" }}>
                <div style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(168,85,247,0.06))", borderBottom: "1px solid rgba(124,58,237,0.15)", padding: "16px 22px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>🧠</span>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Karakter Analizi</h3>
                    <p style={{ fontSize: 12, color: C.muted }}>AI tarafından derinlemesine incelendi</p>
                  </div>
                </div>
                <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
                  {[
                    { key: "gecmis", label: "📜 Geçmiş & Köken", color: "#7c3aed" },
                    { key: "motivasyon", label: "🎯 Motivasyon", color: TEAL },
                    { key: "guclu", label: "💪 Güçlü Yönler", color: "#10b981" },
                    { key: "zayif", label: "⚠️ Zayıf Yönler", color: ACCENT },
                    { key: "arc", label: "🌱 Karakter Yayı", color: "#f59e0b" },
                  ].map(function (item) {
                    if (!karakterAnaliz[item.key]) return null;
                    return (
                      <div key={item.key}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 7 }}>{item.label}</p>
                        <div style={{ background: C.input, borderRadius: 12, padding: "12px 16px", border: "1px solid " + C.border, borderLeft: "3px solid " + item.color }}>
                          <p style={{ fontSize: 14, lineHeight: 1.7, color: C.text }}>{karakterAnaliz[item.key]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══ KAYDET / PAYLAŞ ═══ */}
            {!kaydedildi ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: C.surface, border: "1px solid " + C.border, borderRadius: 14, cursor: "pointer" }}>
                  <input type="checkbox" checked={paylasimAcik} onChange={function (e) { setPaylasimAcik(e.target.checked); }} style={{ width: 17, height: 17, accentColor: TEAL }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Topluluğa paylaş</p>
                    <p style={{ fontSize: 12, color: C.muted }}>Topluluk sayfasında görünür olsun</p>
                  </div>
                </label>
                <button onClick={kaydet} style={{ width: "100%", padding: "14px", borderRadius: 14, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, boxShadow: `0 5px 20px ${TEAL}40` }}>
                  💾 Profime Kaydet
                </button>
                <button onClick={toplulugaPaylas} style={{ width: "100%", padding: "14px", borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, boxShadow: `0 5px 20px ${ACCENT}40` }}>
                  🌍 Topluluğa Paylaş
                </button>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "24px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 16, animation: "fadeUp 0.3s ease" }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>✅</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#10b981", marginBottom: 4 }}>Kaydedildi!</p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Senaryon profilinde görünüyor.</p>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <button onClick={function () { window.location.href = "/profil"; }} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 10, padding: "8px 18px", color: C.text, fontSize: 13, fontWeight: 600 }}>Profilimi Gör</button>
                  <button onClick={function () { setAdim(1); setSenaryo(null); setKaydedildi(false); setKarakterAnaliz(null); setKarakterAcik(false); }} style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", borderRadius: 10, padding: "8px 18px", color: "#fff", fontSize: 13, fontWeight: 700 }}>Yeni Üret</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

            {/* MOBİL ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around", alignItems: "center", boxShadow: "0 -4px 30px rgba(0,0,0,0.1)" }}>
        {[
          { icon: "🏠", href: "/" },
          { icon: "🔭", href: "/kesfet" },
          { icon: "🎭", href: "/topluluk" },
          { icon: "💬", href: "/mesajlar" },
        ].map(function (item) {
          var isActive = typeof window !== "undefined" && window.location.pathname === item.href;
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 24px", borderRadius: 14, textDecoration: "none", position: "relative", background: isActive ? (dk ? "rgba(8,145,178,0.12)" : "rgba(8,145,178,0.08)") : "transparent", transition: "all 0.2s" }}>
              <span style={{ fontSize: 26, lineHeight: 1, filter: isActive ? "none" : "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
              {isActive && <div style={{ position: "absolute", bottom: 3, width: 20, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>
    </div>
  );
}
