import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

var TURLER = ["Gerilim", "Bilim Kurgu", "Dram", "Korku", "Komedi", "Romantik", "Macera", "Suç", "Fantazi", "Psikolojik", "Tarihi", "Aksiyon"];
var TUR_EMOJIS = { "Gerilim": "🔪", "Bilim Kurgu": "🚀", "Dram": "🎭", "Korku": "👁️", "Komedi": "😂", "Romantik": "💔", "Macera": "🧭", "Suç": "🕵️", "Fantazi": "🐉", "Psikolojik": "🧠", "Tarihi": "⚔️", "Aksiyon": "💥" };
var TUR_RENK = { "Gerilim": "#ef4444", "Bilim Kurgu": "#06b6d4", "Dram": "#a855f7", "Korku": "#f97316", "Komedi": "#eab308", "Romantik": "#ec4899", "Macera": "#22c55e", "Suç": "#64748b", "Fantazi": "#8b5cf6", "Psikolojik": "#6366f1", "Tarihi": "#f59e0b", "Aksiyon": "#f87171" };

export default function Topluluk() {
  var s1 = useState(null); var user = s1[0]; var setUser = s1[1];
  var s2 = useState([]); var konular = s2[0]; var setKonular = s2[1];
  var s3 = useState("yeni"); var siralama = s3[0]; var setSiralama = s3[1];
  var s4 = useState(null); var filtreTur = s4[0]; var setFiltreTur = s4[1];
  var s5 = useState(""); var arama = s5[0]; var setArama = s5[1];
  var s6 = useState(null); var secili = s6[0]; var setSecili = s6[1];
  var s7 = useState(false); var yukleniyor = s7[0]; var setYukleniyor = s7[1];
  var s8 = useState([]); var begeniler = s8[0]; var setBegeniler = s8[1];
  var s9 = useState(false); var loaded = s9[0]; var setLoaded = s9[1];
  var s10 = useState("light"); var tema = s10[0]; var setTema = s10[1];

  var isDark = tema === "dark";
  var bg = isDark ? "#0f0f0f" : "#f8f8f6";
  var card = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.95)";
  var cardBorder = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";
  var text = isDark ? "#fff" : "#111";
  var textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  var accent = "#e8230a";

  useEffect(function() {
    setTimeout(function() { setLoaded(true); }, 80);
    supabase.auth.getSession().then(function(r) {
      if (r.data && r.data.session) setUser(r.data.session.user);
      else window.location.href = "/";
    });
  }, []);

  useEffect(function() { if (user) yukle(); }, [user, siralama, filtreTur, arama]);

  async function yukle() {
    setYukleniyor(true);
    var order = siralama === "begeni" ? "begeni_sayisi" : "created_at";
    var q = supabase.from("senaryolar").select("*, profiles(username, avatar_url)").eq("paylasim_acik", true).order(order, { ascending: false });
    if (filtreTur) q = q.eq("tur", filtreTur);
    if (arama) q = q.ilike("baslik", "%" + arama + "%");
    var r = await q.limit(100);
    if (r.data) setKonular(r.data);
    setYukleniyor(false);
  }

  async function begeni(id, sayi, e) {
    if (e) e.stopPropagation();
    if (!user || begeniler.includes(id)) return;
    setBegeniler(function(p) { return p.concat([id]); });
    await supabase.from("senaryolar").update({ begeni_sayisi: sayi + 1 }).eq("id", id);
    setKonular(function(p) { return p.map(function(k) { return k.id === id ? { ...k, begeni_sayisi: sayi + 1 } : k; }); });
    if (secili && secili.id === id) setSecili(function(s) { return { ...s, begeni_sayisi: sayi + 1 }; });
  }

  async function sil(id) {
    if (!confirm("Topluluktan kaldır?")) return;
    await supabase.from("senaryolar").update({ paylasim_acik: false }).eq("id", id);
    setKonular(function(p) { return p.filter(function(k) { return k.id !== id; }); });
    setSecili(null);
  }

  var sol = konular.filter(function(_, i) { return i % 2 === 0; });
  var sag = konular.filter(function(_, i) { return i % 2 === 1; });

  function Kart(props) {
    var k = props.k;
    var renk = TUR_RENK[k.tur] || accent;
    return (
      <div onClick={function() { setSecili(k); }}
        style={{ background: card, border: "1px solid " + cardBorder, borderRadius: 18, padding: "18px", marginBottom: 14, cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.2s ease", boxShadow: isDark ? "0 2px 16px rgba(0,0,0,0.3)" : "0 2px 16px rgba(0,0,0,0.06)" }}
        onMouseEnter={function(e) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 32px " + renk + "22"; e.currentTarget.style.borderColor = renk + "44"; }}
        onMouseLeave={function(e) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = isDark ? "0 2px 16px rgba(0,0,0,0.3)" : "0 2px 16px rgba(0,0,0,0.06)"; e.currentTarget.style.borderColor = cardBorder; }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, " + renk + ", transparent)", borderRadius: "18px 18px 0 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: renk + "15", border: "1px solid " + renk + "30", color: renk }}>{TUR_EMOJIS[k.tur]} {k.tur}</span>
          <span style={{ fontSize: 10, color: textMuted, fontWeight: 600 }}>{k.tip}</span>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.3, marginBottom: 8, color: text, letterSpacing: "-0.01em" }}>{k.baslik}</h3>
        <p style={{ fontSize: 12, color: textMuted, lineHeight: 1.55, marginBottom: 14 }}>{(k.ana_fikir || "").slice(0, 85)}{(k.ana_fikir || "").length > 85 ? "..." : ""}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: textMuted, fontWeight: 500 }}>@{k.profiles ? k.profiles.username || "anonim" : "anonim"}</span>
          <button onClick={function(e) { begeni(k.id, k.begeni_sayisi || 0, e); }} style={{ background: begeniler.includes(k.id) ? renk + "18" : "transparent", border: "1px solid " + (begeniler.includes(k.id) ? renk + "44" : cardBorder), borderRadius: 20, padding: "4px 12px", color: begeniler.includes(k.id) ? renk : textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>♥ {k.begeni_sayisi || 0}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", opacity: loaded ? 1 : 0, transition: "all 0.4s ease" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #e8230a44; border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(0,0,0,0.3); }
        .filtre:hover { opacity: 1 !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -50, width: 500, height: 500, background: "radial-gradient(circle, rgba(232,35,10,0.07) 0%, transparent 65%)", filter: "blur(50px)" }} />
      </div>

      {/* Header */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: isDark ? "rgba(15,15,15,0.93)" : "rgba(248,248,246,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + cardBorder }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "12px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={function() { window.location.href = "/"; }} style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: "1px solid " + cardBorder, borderRadius: 10, padding: "7px 12px", color: textMuted, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>←</button>
              <div>
                <h1 style={{ fontSize: 18, fontWeight: 800, color: text, letterSpacing: "-0.02em" }}>Topluluk</h1>
                <p style={{ fontSize: 11, color: textMuted }}>{konular.length} senaryo</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {["yeni", "begeni"].map(function(s) {
                return <button key={s} onClick={function() { setSiralama(s); }} style={{ background: siralama === s ? accent : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: "1px solid " + (siralama === s ? accent : cardBorder), borderRadius: 20, padding: "6px 14px", color: siralama === s ? "#fff" : textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: siralama === s ? "0 4px 14px rgba(232,35,10,0.3)" : "none" }}>{s === "yeni" ? "✨ Yeni" : "♥ Popüler"}</button>;
              })}
              <input value={arama} onChange={function(e) { setArama(e.target.value); }} placeholder="🔍 Ara..." style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: "1px solid " + cardBorder, borderRadius: 20, padding: "7px 16px", color: text, fontSize: 12, outline: "none", width: 130 }} />
              <button onClick={function() { setTema(isDark ? "light" : "dark"); }} style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: "1px solid " + cardBorder, borderRadius: 10, padding: "7px 10px", color: textMuted, cursor: "pointer", fontSize: 13 }}>{isDark ? "☀️" : "🌙"}</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            <button className="filtre" onClick={function() { setFiltreTur(null); }} style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid", borderColor: !filtreTur ? "#22c55e" : cardBorder, background: !filtreTur ? "rgba(34,197,94,0.12)" : "transparent", color: !filtreTur ? "#22c55e" : textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>Hepsi</button>
            {TURLER.map(function(t) {
              var r = TUR_RENK[t] || accent;
              return <button key={t} className="filtre" onClick={function() { setFiltreTur(t); }} style={{ padding: "5px 14px", borderRadius: 20, border: "1px solid", borderColor: filtreTur === t ? r : cardBorder, background: filtreTur === t ? r + "15" : "transparent", color: filtreTur === t ? r : textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s" }}>{TUR_EMOJIS[t]} {t}</button>;
            })}
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "160px 20px 80px" }}>
        {yukleniyor ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ width: 32, height: 32, border: "3px solid rgba(232,35,10,0.2)", borderTopColor: accent, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, color: textMuted }}>Yükleniyor...</p>
          </div>
        ) : konular.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>🎬</p>
            <p style={{ fontSize: 16, color: textMuted }}>Henüz paylaşılan konu yok.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>
            <div style={{ animation: "fadeUp 0.4s ease" }}>{sol.map(function(k) { return <Kart key={k.id} k={k} />; })}</div>
            <div style={{ animation: "fadeUp 0.4s 0.08s both ease" }}>{sag.map(function(k) { return <Kart key={k.id} k={k} />; })}</div>
          </div>
        )}
      </div>

      {secili && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function() { setSecili(null); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }} />
          <div style={{ position: "relative", zIndex: 1, background: isDark ? "#161616" : "#fff", border: "1px solid " + cardBorder, borderRadius: 24, padding: "28px", maxWidth: 500, width: "100%", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.3)", animation: "fadeUp 0.3s ease" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, " + (TUR_RENK[secili.tur] || accent) + ", transparent)", borderRadius: "24px 24px 0 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, marginTop: 6 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: accent + "15", color: accent, border: "1px solid " + accent + "30" }}>{secili.tip}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: (TUR_RENK[secili.tur] || accent) + "15", color: TUR_RENK[secili.tur] || accent, border: "1px solid " + (TUR_RENK[secili.tur] || accent) + "30" }}>{TUR_EMOJIS[secili.tur]} {secili.tur}</span>
              </div>
              <button onClick={function() { setSecili(null); }} style={{ background: "none", border: "none", color: textMuted, fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>✕</button>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2, marginBottom: 6, color: text, letterSpacing: "-0.02em" }}>{secili.baslik}</h2>
            <p style={{ fontSize: 14, fontStyle: "italic", color: textMuted, marginBottom: 20 }}>{secili.tagline}</p>
            {[{ l: "Ana Fikir", v: secili.ana_fikir, c: accent }, { l: "Karakter", v: secili.karakter, c: "#8b5cf6" }, { l: "Açılış Sahnesi", v: secili.sahne, c: "#06b6d4" }].map(function(item) {
              return (
                <div key={item.l} style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 14, padding: "14px 16px", marginBottom: 10, borderLeft: "3px solid " + item.c + "55" }}>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: item.c, marginBottom: 6 }}>{item.l}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: text }}>{item.v}</p>
                </div>
              );
            })}
            <div style={{ background: isDark ? "rgba(232,35,10,0.08)" : "rgba(232,35,10,0.05)", border: "1px solid rgba(232,35,10,0.15)", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: textMuted, marginBottom: 6 }}>Büyük Soru</p>
              <p style={{ fontSize: 15, fontStyle: "italic", fontWeight: 600, color: accent }}>"{secili.soru}"</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: textMuted }}>@{secili.profiles ? secili.profiles.username || "anonim" : "anonim"}</span>
              <div style={{ display: "flex", gap: 8 }}>
                {user && secili.user_id === user.id && <button onClick={function() { sil(secili.id); }} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "7px 14px", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>🗑️ Kaldır</button>}
                <button onClick={function() { begeni(secili.id, secili.begeni_sayisi || 0, null); }} style={{ background: begeniler.includes(secili.id) ? accent + "18" : "transparent", border: "1px solid " + (begeniler.includes(secili.id) ? accent : cardBorder), borderRadius: 10, padding: "7px 18px", color: begeniler.includes(secili.id) ? accent : textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>♥ {secili.begeni_sayisi || 0}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
