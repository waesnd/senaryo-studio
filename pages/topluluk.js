import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

var TURLER = ["Gerilim", "Bilim Kurgu", "Dram", "Korku", "Komedi", "Romantik", "Macera", "Suç", "Fantazi", "Psikolojik", "Tarihi", "Aksiyon"];
var TUR_EMOJIS = { "Gerilim": "🔪", "Bilim Kurgu": "🚀", "Dram": "🎭", "Korku": "👁️", "Komedi": "😂", "Romantik": "💔", "Macera": "🧭", "Suç": "🕵️", "Fantazi": "🐉", "Psikolojik": "🧠", "Tarihi": "⚔️", "Aksiyon": "💥" };
var TUR_RENK = { "Gerilim": "#ff4d4d", "Bilim Kurgu": "#22d3ee", "Dram": "#c084fc", "Korku": "#fb923c", "Komedi": "#facc15", "Romantik": "#f472b6", "Macera": "#4ade80", "Suç": "#94a3b8", "Fantazi": "#a78bfa", "Psikolojik": "#818cf8", "Tarihi": "#fbbf24", "Aksiyon": "#f87171" };

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

  useEffect(function() {
    setTimeout(function() { setLoaded(true); }, 100);
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
    if (!user) { alert("Giriş yapmalısın!"); return; }
    if (begeniler.includes(id)) return;
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
    var renk = TUR_RENK[k.tur] || "#e8230a";
    return (
      <div onClick={function() { setSecili(k); }}
        style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: "20px", marginBottom: 14, cursor: "pointer", position: "relative", overflow: "hidden", transition: "all 0.2s ease" }}
        onMouseEnter={function(e) { e.currentTarget.style.borderColor = renk + "44"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={function(e) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.transform = "translateY(0)"; }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, " + renk + ", transparent)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.15em", padding: "3px 10px", borderRadius: 20, background: renk + "15", border: "1px solid " + renk + "35", color: renk }}>{TUR_EMOJIS[k.tur]} {k.tur}</span>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>{k.tip}</span>
        </div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, lineHeight: 1.2, marginBottom: 8, color: "#fff" }}>{k.baslik}</h3>
        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 14 }}>{(k.ana_fikir || "").slice(0, 90)}{(k.ana_fikir || "").length > 90 ? "..." : ""}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)" }}>@{k.profiles ? k.profiles.username || "anonim" : "anonim"}</span>
          <button onClick={function(e) { begeni(k.id, k.begeni_sayisi || 0, e); }} style={{ background: begeniler.includes(k.id) ? renk + "22" : "rgba(255,255,255,0.05)", border: "1px solid " + (begeniler.includes(k.id) ? renk + "55" : "rgba(255,255,255,0.1)"), borderRadius: 20, padding: "4px 12px", color: begeniler.includes(k.id) ? renk : "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "'Space Mono', monospace", cursor: "pointer", transition: "all 0.2s" }}>♥ {k.begeni_sayisi || 0}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", opacity: loaded ? 1 : 0, transition: "opacity 0.6s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #e8230a44; border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .filtre-btn:hover { color: #fff !important; }
        .nav-btn:hover { background: rgba(255,255,255,0.1) !important; }
        input::placeholder { color: rgba(255,255,255,0.25); }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "5%", right: "15%", width: 500, height: 500, background: "radial-gradient(circle, rgba(232,35,10,0.05) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 400, height: 400, background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      {/* Header */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "14px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button className="nav-btn" onClick={function() { window.location.href = "/"; }} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", transition: "all 0.2s" }}>←</button>
              <div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: "0.02em" }}>Topluluk</h1>
                <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em" }}>{konular.length} SENARYO</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {["yeni", "begeni"].map(function(s) {
                return <button key={s} onClick={function() { setSiralama(s); }} style={{ background: siralama === s ? "rgba(232,35,10,0.15)" : "rgba(255,255,255,0.04)", border: "1px solid " + (siralama === s ? "rgba(232,35,10,0.4)" : "rgba(255,255,255,0.08)"), borderRadius: 20, padding: "5px 14px", color: siralama === s ? "#e8230a" : "rgba(255,255,255,0.4)", fontSize: 10, fontFamily: "'Space Mono', monospace", cursor: "pointer", letterSpacing: "0.1em", transition: "all 0.2s" }}>{s === "yeni" ? "✨ YENİ" : "♥ POPÜLER"}</button>;
              })}
              <input value={arama} onChange={function(e) { setArama(e.target.value); }} placeholder="Ara..." style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "6px 16px", color: "#fff", fontSize: 11, fontFamily: "'Space Mono', monospace", outline: "none", width: 130 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
            <button className="filtre-btn" onClick={function() { setFiltreTur(null); }} style={{ padding: "4px 14px", borderRadius: 20, border: "1px solid", borderColor: !filtreTur ? "#4ade80" : "rgba(255,255,255,0.08)", background: !filtreTur ? "rgba(74,222,128,0.1)" : "transparent", color: !filtreTur ? "#4ade80" : "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "'Space Mono', monospace", cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.1em", transition: "all 0.2s" }}>TÜM TÜRLER</button>
            {TURLER.map(function(t) {
              var renk = TUR_RENK[t] || "#fff";
              return <button key={t} className="filtre-btn" onClick={function() { setFiltreTur(t); }} style={{ padding: "4px 14px", borderRadius: 20, border: "1px solid", borderColor: filtreTur === t ? renk : "rgba(255,255,255,0.08)", background: filtreTur === t ? renk + "18" : "transparent", color: filtreTur === t ? renk : "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: "'Space Mono', monospace", cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.1em", transition: "all 0.2s" }}>{TUR_EMOJIS[t]} {t}</button>;
            })}
          </div>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "160px 24px 80px" }}>
        {yukleniyor ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <div style={{ width: 36, height: 36, border: "2px solid rgba(232,35,10,0.3)", borderTopColor: "#e8230a", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em" }}>YÜKLENİYOR</p>
          </div>
        ) : konular.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>Henüz hiç konu paylaşılmadı.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>
            <div style={{ animation: "fadeUp 0.5s ease" }}>{sol.map(function(k) { return <Kart key={k.id} k={k} />; })}</div>
            <div style={{ animation: "fadeUp 0.5s 0.1s both ease" }}>{sag.map(function(k) { return <Kart key={k.id} k={k} />; })}</div>
          </div>
        )}
      </div>

      {secili && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function() { setSecili(null); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "relative", zIndex: 1, background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "32px", maxWidth: 520, width: "100%", maxHeight: "88vh", overflowY: "auto", animation: "fadeUp 0.3s ease" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #e8230a, #ff6b35, transparent)", borderRadius: "24px 24px 0 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, padding: "3px 10px", borderRadius: 20, background: "rgba(232,35,10,0.1)", border: "1px solid rgba(232,35,10,0.25)", color: "#e8230a" }}>{secili.tip}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, padding: "3px 10px", borderRadius: 20, background: (TUR_RENK[secili.tur] || "#e8230a") + "15", border: "1px solid " + (TUR_RENK[secili.tur] || "#e8230a") + "35", color: TUR_RENK[secili.tur] || "#e8230a" }}>{TUR_EMOJIS[secili.tur]} {secili.tur}</span>
              </div>
              <button onClick={function() { setSecili(null); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginBottom: 8 }}>{secili.baslik}</h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 15, fontStyle: "italic", color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>{secili.tagline}</p>
            {[{ l: "Ana Fikir", v: secili.ana_fikir }, { l: "Karakter", v: secili.karakter }, { l: "Açılış", v: secili.sahne }].map(function(item) {
              return (
                <div key={item.l} style={{ marginBottom: 14, paddingLeft: 14, borderLeft: "2px solid rgba(255,255,255,0.06)" }}>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.2em", color: "#e8230a", marginBottom: 5, textTransform: "uppercase" }}>{item.l}</p>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.75)" }}>{item.v}</p>
                </div>
              );
            })}
            <div style={{ background: "rgba(232,35,10,0.06)", border: "1px solid rgba(232,35,10,0.15)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>BÜYÜK SORU</p>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontStyle: "italic", color: "#e8230a" }}>"{secili.soru}"</p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>@{secili.profiles ? secili.profiles.username || "anonim" : "anonim"}</span>
              <div style={{ display: "flex", gap: 8 }}>
                {user && secili.user_id === user.id && <button onClick={function() { sil(secili.id); }} style={{ background: "rgba(255,0,0,0.06)", border: "1px solid rgba(255,0,0,0.2)", borderRadius: 10, padding: "7px 14px", color: "#ff6b6b", fontSize: 11, fontFamily: "'Space Mono', monospace", cursor: "pointer" }}>🗑️ KALDIR</button>}
                <button onClick={function() { begeni(secili.id, secili.begeni_sayisi || 0, null); }} style={{ background: begeniler.includes(secili.id) ? "rgba(232,35,10,0.15)" : "rgba(255,255,255,0.05)", border: "1px solid " + (begeniler.includes(secili.id) ? "rgba(232,35,10,0.4)" : "rgba(255,255,255,0.1)"), borderRadius: 10, padding: "7px 18px", color: begeniler.includes(secili.id) ? "#e8230a" : "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "'Space Mono', monospace", cursor: "pointer", transition: "all 0.2s" }}>♥ {secili.begeni_sayisi || 0}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
