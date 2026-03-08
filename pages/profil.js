import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export default function Profil() {
  var s1 = useState(null); var user = s1[0]; var setUser = s1[1];
  var s2 = useState(null); var profil = s2[0]; var setProfil = s2[1];
  var s3 = useState("konular"); var tab = s3[0]; var setTab = s3[1];
  var s4 = useState([]); var konular = s4[0]; var setKonular = s4[1];
  var s5 = useState([]); var favoriler = s5[0]; var setFavoriler = s5[1];
  var s6 = useState(false); var duzenle = s6[0]; var setDuzenle = s6[1];
  var s7 = useState(""); var yeniUsername = s7[0]; var setYeniUsername = s7[1];
  var s8 = useState(""); var yeniBio = s8[0]; var setYeniBio = s8[1];
  var s9 = useState(false); var yukleniyor = s9[0]; var setYukleniyor = s9[1];
  var s10 = useState(0); var takipci = s10[0]; var setTakipci = s10[1];
  var s11 = useState(0); var takip = s11[0]; var setTakip = s11[1];
  var s12 = useState(false); var loaded = s12[0]; var setLoaded = s12[1];
  var s13 = useState("light"); var tema = s13[0]; var setTema = s13[1];
  var fileRef = useRef(null);

  var isDark = tema === "dark";
  var bg = isDark ? "#0f0f0f" : "#f8f8f6";
  var card = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";
  var cardBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  var text = isDark ? "#fff" : "#111";
  var textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  var accent = "#e8230a";

  useEffect(function() {
    setTimeout(function() { setLoaded(true); }, 80);
    supabase.auth.getSession().then(function(r) {
      if (r.data && r.data.session) {
        var u = r.data.session.user;
        setUser(u);
        supabase.from("profiles").select("*").eq("id", u.id).single().then(function(pr) {
          if (pr.data) { setProfil(pr.data); setYeniUsername(pr.data.username || ""); setYeniBio(pr.data.bio || ""); }
        });
        supabase.from("senaryolar").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).then(function(kr) { if (kr.data) setKonular(kr.data); });
        supabase.from("takipler").select("*").eq("takip_edilen", u.id).then(function(r2) { if (r2.data) setTakipci(r2.data.length); });
        supabase.from("takipler").select("*").eq("takip_eden", u.id).then(function(r3) { if (r3.data) setTakip(r3.data.length); });
        var saved = localStorage.getItem("gecmis");
        var favIds = localStorage.getItem("favoriler");
        if (saved && favIds) {
          var ids = JSON.parse(favIds);
          setFavoriler(JSON.parse(saved).filter(function(g) { return ids.includes(g.id); }));
        }
      } else { window.location.href = "/"; }
    });
  }, []);

  async function avatarYukle(e) {
    var file = e.target.files[0]; if (!file) return;
    setYukleniyor(true);
    var fd = new FormData();
    fd.append("file", file); fd.append("upload_preset", "scriptify_avatars");
    var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
    var data = await res.json();
    if (data.secure_url) { await supabase.from("profiles").upsert({ id: user.id, avatar_url: data.secure_url }); setProfil(function(p) { return { ...p, avatar_url: data.secure_url }; }); }
    setYukleniyor(false);
  }

  async function profilKaydet() {
    var r = await supabase.from("profiles").upsert({ id: user.id, username: yeniUsername, bio: yeniBio });
    if (!r.error) { setProfil(function(p) { return { ...p, username: yeniUsername, bio: yeniBio }; }); setDuzenle(false); }
  }

  async function konuSil(id) {
    await supabase.from("senaryolar").delete().eq("id", id);
    setKonular(function(p) { return p.filter(function(k) { return k.id !== id; }); });
  }

  var enCokTur = function() {
    if (!konular.length) return "—";
    var s = {}; konular.forEach(function(k) { s[k.tur] = (s[k.tur] || 0) + 1; });
    return Object.keys(s).reduce(function(a, b) { return s[a] > s[b] ? a : b; });
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", opacity: loaded ? 1 : 0, transition: "all 0.4s ease" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e8230a44; border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hover-card:hover { box-shadow: 0 8px 40px rgba(232,35,10,0.12) !important; transform: translateY(-2px); border-color: rgba(232,35,10,0.2) !important; }
        .hover-card { transition: all 0.2s ease; }
        .sil-btn { opacity: 0; transition: opacity 0.2s; }
        .hover-card:hover .sil-btn { opacity: 1; }
      `}</style>

      {/* Ambient */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, background: "radial-gradient(circle, rgba(232,35,10,0.08) 0%, transparent 65%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, background: isDark ? "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 65%)" : "radial-gradient(circle, rgba(232,35,10,0.05) 0%, transparent 65%)", filter: "blur(40px)" }} />
      </div>

      {/* Navbar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 60, background: isDark ? "rgba(15,15,15,0.92)" : "rgba(248,248,246,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + cardBorder, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
        <button onClick={function() { window.location.href = "/"; }} style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: "1px solid " + cardBorder, borderRadius: 10, padding: "7px 14px", color: textMuted, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Ana Sayfa</button>
        <span style={{ fontSize: 15, fontWeight: 700, color: accent, letterSpacing: "0.02em" }}>Scriptify</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={function() { setTema(isDark ? "light" : "dark"); }} style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: "1px solid " + cardBorder, borderRadius: 10, padding: "7px 12px", color: textMuted, cursor: "pointer", fontSize: 13 }}>{isDark ? "☀️" : "🌙"}</button>
          <button onClick={function() { setDuzenle(!duzenle); }} style={{ background: duzenle ? accent : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: "1px solid " + (duzenle ? accent : cardBorder), borderRadius: 10, padding: "7px 14px", color: duzenle ? "#fff" : textMuted, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>{duzenle ? "İptal" : "Düzenle"}</button>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 680, margin: "0 auto", padding: "80px 20px 100px" }}>

        {/* Profil kartı */}
        <div style={{ background: card, border: "1px solid " + cardBorder, borderRadius: 24, padding: "28px", marginBottom: 20, boxShadow: isDark ? "0 4px 40px rgba(0,0,0,0.4)" : "0 4px 40px rgba(0,0,0,0.08)", animation: "fadeUp 0.5s ease" }}>
          
          {/* Avatar + isim */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div onClick={function() { fileRef.current && fileRef.current.click(); }} style={{ width: 80, height: 80, borderRadius: "50%", background: profil && profil.avatar_url ? "transparent" : "linear-gradient(135deg, " + accent + ", #ff6b35)", border: "3px solid " + (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"), cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 0 0 4px " + (isDark ? "rgba(232,35,10,0.15)" : "rgba(232,35,10,0.1)") }}>
                {yukleniyor ? <div style={{ width: 22, height: 22, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : profil && profil.avatar_url ? <img src={profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
              </div>
              <div onClick={function() { fileRef.current && fileRef.current.click(); }} style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, cursor: "pointer", border: "2px solid " + bg, color: "#fff" }}>✏</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={avatarYukle} style={{ display: "none" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4, color: text, letterSpacing: "-0.02em" }}>{profil && profil.username ? "@" + profil.username : "Kullanıcı"}</h1>
              <p style={{ fontSize: 13, color: textMuted }}>{user && user.email ? user.email.replace(/(.{2}).*(@.*)/, "$1•••$2") : ""}</p>
            </div>
          </div>

          {/* Bio */}
          {!duzenle && profil && profil.bio && <p style={{ fontSize: 15, color: textMuted, lineHeight: 1.6, marginBottom: 20, paddingTop: 4 }}>{profil.bio}</p>}

          {/* Düzenleme */}
          {duzenle && (
            <div style={{ marginBottom: 20, animation: "fadeUp 0.3s ease" }}>
              <input value={yeniUsername} onChange={function(e) { setYeniUsername(e.target.value); }} placeholder="kullanici_adi" style={{ width: "100%", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: "1px solid " + cardBorder, borderRadius: 12, padding: "11px 14px", color: text, fontSize: 14, outline: "none", marginBottom: 10 }} />
              <textarea value={yeniBio} onChange={function(e) { setYeniBio(e.target.value); }} placeholder="Kendini anlat..." rows={3} style={{ width: "100%", background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: "1px solid " + cardBorder, borderRadius: 12, padding: "11px 14px", color: text, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", marginBottom: 10 }} />
              <button onClick={profilKaydet} style={{ width: "100%", background: "linear-gradient(135deg, " + accent + ", #c01a08)", border: "none", borderRadius: 12, padding: "12px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(232,35,10,0.3)" }}>Kaydet</button>
            </div>
          )}

          {/* İstatistikler */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { val: konular.length, label: "Konu", color: accent },
              { val: takipci, label: "Takipçi", color: "#f59e0b" },
              { val: takip, label: "Takip", color: "#10b981" },
              { val: enCokTur(), label: "Favori Tür", color: "#8b5cf6" }
            ].map(function(s, i) {
              return (
                <div key={i} style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 14, padding: "14px 10px", textAlign: "center", border: "1px solid " + cardBorder }}>
                  <p style={{ fontSize: i < 3 ? 24 : 16, fontWeight: 800, color: s.color, marginBottom: 4, letterSpacing: "-0.02em" }}>{s.val}</p>
                  <p style={{ fontSize: 10, color: textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sekmeler */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[{ id: "konular", label: "Konularım", count: konular.length }, { id: "favoriler", label: "Favoriler", count: favoriler.length }].map(function(t) {
            return (
              <button key={t.id} onClick={function() { setTab(t.id); }} style={{ padding: "9px 18px", borderRadius: 12, border: "1px solid " + (tab === t.id ? accent : cardBorder), background: tab === t.id ? accent : card, color: tab === t.id ? "#fff" : textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: tab === t.id ? "0 4px 16px rgba(232,35,10,0.25)" : "none" }}>
                {t.label} <span style={{ opacity: 0.7, fontSize: 11 }}>({t.count})</span>
              </button>
            );
          })}
        </div>

        {/* Konular */}
        {tab === "konular" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {konular.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: card, border: "1px solid " + cardBorder, borderRadius: 20 }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>🎬</p>
                <p style={{ fontSize: 16, color: textMuted, marginBottom: 16 }}>Henüz konu üretmedin.</p>
                <button onClick={function() { window.location.href = "/"; }} style={{ background: accent, border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Konu Üret →</button>
              </div>
            ) : konular.map(function(k, i) {
              return (
                <div key={k.id} className="hover-card" style={{ background: card, border: "1px solid " + cardBorder, borderRadius: 18, padding: "18px 20px", marginBottom: 12, position: "relative", boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 20px rgba(0,0,0,0.06)", animation: "fadeUp 0.4s " + (i * 0.04) + "s both ease" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: "linear-gradient(180deg, " + accent + ", transparent)", borderRadius: "18px 0 0 18px" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: text, letterSpacing: "-0.01em" }}>{k.baslik}</h3>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: isDark ? "rgba(232,35,10,0.15)" : "rgba(232,35,10,0.08)", color: accent, border: "1px solid rgba(232,35,10,0.2)" }}>{k.tip}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", color: textMuted, border: "1px solid " + cardBorder }}>{k.tur}</span>
                        {k.paylasim_acik && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>🌍 Paylaşık</span>}
                      </div>
                    </div>
                    <button className="sil-btn" onClick={function() { konuSil(k.id); }} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "5px 10px", color: "#ef4444", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                  </div>
                  {k.ana_fikir && <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.6 }}>{k.ana_fikir.slice(0, 120)}{k.ana_fikir.length > 120 ? "..." : ""}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Favoriler */}
        {tab === "favoriler" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {favoriler.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", background: card, border: "1px solid " + cardBorder, borderRadius: 20 }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>⭐</p>
                <p style={{ fontSize: 16, color: textMuted }}>Henüz favori eklemedin.</p>
              </div>
            ) : favoriler.map(function(f, i) {
              return (
                <div key={f.id} className="hover-card" style={{ background: card, border: "1px solid " + cardBorder, borderRadius: 18, padding: "16px 20px", marginBottom: 12, boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 20px rgba(0,0,0,0.06)", animation: "fadeUp 0.4s " + (i * 0.04) + "s both ease" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: "linear-gradient(180deg, #f59e0b, transparent)", borderRadius: "18px 0 0 18px" }} />
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: text }}>⭐ {f.baslik}</h3>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20, background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>{f.tip} · {f.tur}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
