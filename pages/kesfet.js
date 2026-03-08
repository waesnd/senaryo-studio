import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

export default function Kesfet() {
  var s1 = useState(null); var user = s1[0]; var setUser = s1[1];
  var s2 = useState([]); var gonderiler = s2[0]; var setGonderiler = s2[1];
  var s3 = useState(false); var yeniModal = s3[0]; var setYeniModal = s3[1];
  var s4 = useState(""); var metin = s4[0]; var setMetin = s4[1];
  var s5 = useState(null); var foto = s5[0]; var setFoto = s5[1];
  var s6 = useState(null); var fotoUrl = s6[0]; var setFotoUrl = s6[1];
  var s7 = useState(false); var yukleniyor = s7[0]; var setYukleniyor = s7[1];
  var s8 = useState(null); var yorumId = s8[0]; var setYorumId = s8[1];
  var s9 = useState(""); var yorumMetin = s9[0]; var setYorumMetin = s9[1];
  var s10 = useState({}); var yorumlar = s10[0]; var setYorumlar = s10[1];
  var s11 = useState([]); var begeniler = s11[0]; var setBegeniler = s11[1];
  var s12 = useState(false); var loaded = s12[0]; var setLoaded = s12[1];
  var s13 = useState("light"); var tema = s13[0]; var setTema = s13[1];
  var fileRef = useRef(null);

  var isDark = tema === "dark";
  var bg = isDark ? "#0f0f0f" : "#f8f8f6";
  var card = isDark ? "rgba(255,255,255,0.05)" : "#fff";
  var cardBorder = isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)";
  var text = isDark ? "#fff" : "#111";
  var textMuted = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
  var accent = "#e8230a";

  useEffect(function() {
    setTimeout(function() { setLoaded(true); }, 80);
    supabase.auth.getSession().then(function(r) {
      if (r.data && r.data.session) { setUser(r.data.session.user); yukle(); }
      // no redirect
    });
  }, []);

  async function yukle() {
    var r = await supabase.from("gonderiler").select("*, profiles(username, avatar_url)").order("created_at", { ascending: false }).limit(60);
    if (r.data) setGonderiler(r.data);
  }

  async function paylas() {
    if (!metin.trim() && !foto) { alert("Bir şeyler ekle!"); return; }
    setYukleniyor(true);
    var fUrl = null;
    if (foto) {
      var fd = new FormData(); fd.append("file", foto); fd.append("upload_preset", "scriptify_posts");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var d = await res.json(); fUrl = d.secure_url || null;
    }
    await supabase.from("gonderiler").insert([{ user_id: user.id, metin: metin, fotograf_url: fUrl }]);
    setMetin(""); setFoto(null); setFotoUrl(null); setYeniModal(false);
    setYukleniyor(false); yukle();
  }

  async function begeni(id, sayi) {
    if (begeniler.includes(id)) return;
    setBegeniler(function(p) { return p.concat([id]); });
    await supabase.from("gonderiler").update({ begeni_sayisi: sayi + 1 }).eq("id", id);
    setGonderiler(function(p) { return p.map(function(g) { return g.id === id ? { ...g, begeni_sayisi: sayi + 1 } : g; }); });
  }

  async function yorumAc(id) {
    if (yorumId === id) { setYorumId(null); return; }
    setYorumId(id);
    var r = await supabase.from("yorumlar").select("*, profiles(username)").eq("gonderi_id", id).order("created_at", { ascending: true });
    if (r.data) setYorumlar(function(p) { return { ...p, [id]: r.data }; });
  }

  async function yorumGonder(id) {
    if (!yorumMetin.trim()) return;
    await supabase.from("yorumlar").insert([{ user_id: user.id, gonderi_id: id, metin: yorumMetin }]);
    setYorumMetin("");
    var r = await supabase.from("yorumlar").select("*, profiles(username)").eq("gonderi_id", id).order("created_at", { ascending: true });
    if (r.data) setYorumlar(function(p) { return { ...p, [id]: r.data }; });
  }

  async function gonderiSil(id) {
    await supabase.from("gonderiler").delete().eq("id", id);
    setGonderiler(function(p) { return p.filter(function(g) { return g.id !== id; }); });
  }

  function zaman(ts) {
    var diff = Math.floor((new Date() - new Date(ts)) / 1000);
    if (diff < 60) return diff + "s önce";
    if (diff < 3600) return Math.floor(diff / 60) + "dk önce";
    if (diff < 86400) return Math.floor(diff / 3600) + "sa önce";
    return Math.floor(diff / 86400) + "g önce";
  }

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", opacity: loaded ? 1 : 0, transition: "all 0.4s ease" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #e8230a44; border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        textarea::placeholder, input::placeholder { color: rgba(0,0,0,0.3); }
        .btn-ghost:hover { background: rgba(0,0,0,0.06) !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 400, height: 400, background: "radial-gradient(circle, rgba(232,35,10,0.06) 0%, transparent 65%)", filter: "blur(50px)" }} />
      </div>

      {/* Header */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: isDark ? "rgba(15,15,15,0.93)" : "rgba(248,248,246,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + cardBorder, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={function() { window.location.href = "/"; }} style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: "1px solid " + cardBorder, borderRadius: 10, padding: "7px 12px", color: textMuted, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>←</button>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: text, letterSpacing: "-0.02em" }}>Keşfet</h1>
            <p style={{ fontSize: 11, color: textMuted }}>Topluluk akışı</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={function() { setTema(isDark ? "light" : "dark"); }} style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: "1px solid " + cardBorder, borderRadius: 10, padding: "7px 10px", color: textMuted, cursor: "pointer", fontSize: 13 }}>{isDark ? "☀️" : "🌙"}</button>
          <button onClick={function() { setYeniModal(true); }} style={{ background: "linear-gradient(135deg, " + accent + ", #c01a08)", border: "none", borderRadius: 20, padding: "8px 18px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(232,35,10,0.3)" }}>+ Paylaş</button>
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 560, margin: "0 auto", padding: "80px 20px 80px" }}>
        {gonderiler.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>📸</p>
            <p style={{ fontSize: 16, color: textMuted }}>Henüz gönderi yok.</p>
          </div>
        ) : gonderiler.map(function(g, i) {
          var yorumAcik = yorumId === g.id;
          var benimMi = user && g.user_id === user.id;
          return (
            <div key={g.id} style={{ background: card, border: "1px solid " + cardBorder, borderRadius: 20, marginBottom: 20, overflow: "hidden", boxShadow: isDark ? "0 2px 20px rgba(0,0,0,0.3)" : "0 2px 20px rgba(0,0,0,0.07)", animation: "fadeUp 0.4s " + Math.min(i * 0.05, 0.3) + "s both ease" }}>
              {/* Header */}
              <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, " + accent + ", #ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, overflow: "hidden", flexShrink: 0, boxShadow: "0 2px 8px rgba(232,35,10,0.2)" }}>
                    {g.profiles && g.profiles.avatar_url ? <img src={g.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: text }}>@{g.profiles ? g.profiles.username || "anonim" : "anonim"}</p>
                    <p style={{ fontSize: 11, color: textMuted }}>{zaman(g.created_at)}</p>
                  </div>
                </div>
                {benimMi && <button onClick={function() { gonderiSil(g.id); }} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 14, padding: "4px 8px", borderRadius: 8 }}>🗑️</button>}
              </div>

              {/* Fotoğraf */}
              {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", maxHeight: 440, objectFit: "cover", display: "block" }} />}

              {/* Metin */}
              {g.metin && <p style={{ padding: "12px 16px", fontSize: 15, lineHeight: 1.65, color: text }}>{g.metin}</p>}

              {/* Aksiyonlar */}
              <div style={{ padding: "8px 16px 12px", display: "flex", gap: 8, borderTop: "1px solid " + cardBorder }}>
                <button onClick={function() { begeni(g.id, g.begeni_sayisi || 0); }} style={{ display: "flex", alignItems: "center", gap: 5, background: begeniler.includes(g.id) ? accent + "12" : "transparent", border: "1px solid " + (begeniler.includes(g.id) ? accent + "40" : cardBorder), borderRadius: 20, padding: "6px 14px", color: begeniler.includes(g.id) ? accent : textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>♥ {g.begeni_sayisi || 0}</button>
                <button onClick={function() { yorumAc(g.id); }} style={{ display: "flex", alignItems: "center", gap: 5, background: yorumAcik ? "rgba(99,102,241,0.1)" : "transparent", border: "1px solid " + (yorumAcik ? "rgba(99,102,241,0.3)" : cardBorder), borderRadius: 20, padding: "6px 14px", color: yorumAcik ? "#6366f1" : textMuted, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>💬 {(yorumlar[g.id] || []).length}</button>
              </div>

              {/* Yorumlar */}
              {yorumAcik && (
                <div style={{ borderTop: "1px solid " + cardBorder, background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)", padding: "12px 16px" }}>
                  <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 10 }}>
                    {(yorumlar[g.id] || []).length === 0 && <p style={{ fontSize: 13, color: textMuted, textAlign: "center", padding: "8px 0" }}>İlk yorumu yap.</p>}
                    {(yorumlar[g.id] || []).map(function(y) {
                      return (
                        <div key={y.id} style={{ marginBottom: 8, display: "flex", gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: accent, flexShrink: 0 }}>@{y.profiles ? y.profiles.username || "?" : "?"}</span>
                          <span style={{ fontSize: 13, color: text, lineHeight: 1.5 }}>{y.metin}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={yorumMetin} onChange={function(e) { setYorumMetin(e.target.value); }} placeholder="Yorum yaz..." onKeyDown={function(e) { if (e.key === "Enter") yorumGonder(g.id); }} style={{ flex: 1, background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", border: "1px solid " + cardBorder, borderRadius: 20, padding: "8px 14px", color: text, fontSize: 13, outline: "none" }} />
                    <button onClick={function() { yorumGonder(g.id); }} style={{ background: accent, border: "none", borderRadius: 20, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>→</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Yeni gönderi */}
      {yeniModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function() { setYeniModal(false); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }} />
          <div style={{ position: "relative", zIndex: 1, background: isDark ? "#161616" : "#fff", border: "1px solid " + cardBorder, borderRadius: 24, padding: "24px", maxWidth: 460, width: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", animation: "fadeUp 0.3s ease" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, " + accent + ", #ff6b35, transparent)", borderRadius: "24px 24px 0 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, marginTop: 6 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: text, letterSpacing: "-0.02em" }}>Yeni Gönderi</h3>
              <button onClick={function() { setYeniModal(false); }} style={{ background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", border: "1px solid " + cardBorder, borderRadius: 8, width: 30, height: 30, color: textMuted, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <textarea value={metin} onChange={function(e) { setMetin(e.target.value); }} placeholder="Ne düşünüyorsun?" rows={4} style={{ width: "100%", background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: "1px solid " + cardBorder, borderRadius: 14, padding: "12px 14px", color: text, fontSize: 15, outline: "none", resize: "none", fontFamily: "inherit", marginBottom: 12, lineHeight: 1.6 }} />
            {fotoUrl && (
              <div style={{ position: "relative", marginBottom: 12 }}>
                <img src={fotoUrl} style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />
                <button onClick={function() { setFoto(null); setFotoUrl(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.5)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", cursor: "pointer", fontSize: 13 }}>✕</button>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={function() { fileRef.current && fileRef.current.click(); }} style={{ flex: 1, background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: "1px solid " + cardBorder, borderRadius: 12, padding: "11px", color: textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>📷 Fotoğraf</button>
              <button onClick={paylas} disabled={yukleniyor} style={{ flex: 2, background: "linear-gradient(135deg, " + accent + ", #c01a08)", border: "none", borderRadius: 12, padding: "11px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(232,35,10,0.3)" }}>{yukleniyor ? "Yükleniyor..." : "Paylaş"}</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={function(e) { var f = e.target.files[0]; if (f) { setFoto(f); setFotoUrl(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
          </div>
        </div>
      )}
    </div>
  );
}
