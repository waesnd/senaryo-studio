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
  var s8 = useState(null); var yorumGonderiId = s8[0]; var setYorumGonderiId = s8[1];
  var s9 = useState(""); var yorumMetin = s9[0]; var setYorumMetin = s9[1];
  var s10 = useState({}); var yorumlar = s10[0]; var setYorumlar = s10[1];
  var s11 = useState([]); var begeniler = s11[0]; var setBegeniler = s11[1];
  var s12 = useState(false); var loaded = s12[0]; var setLoaded = s12[1];
  var fileRef = useRef(null);

  useEffect(function() {
    setTimeout(function() { setLoaded(true); }, 100);
    supabase.auth.getSession().then(function(r) {
      if (r.data && r.data.session) { setUser(r.data.session.user); yukle(); }
      else window.location.href = "/";
    });
  }, []);

  async function yukle() {
    var r = await supabase.from("gonderiler").select("*, profiles(username, avatar_url)").order("created_at", { ascending: false }).limit(60);
    if (r.data) setGonderiler(r.data);
  }

  function fotoSec(e) {
    var f = e.target.files[0]; if (!f) return;
    setFoto(f); setFotoUrl(URL.createObjectURL(f));
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
    if (yorumGonderiId === id) { setYorumGonderiId(null); return; }
    setYorumGonderiId(id);
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
    var d = new Date(ts); var now = new Date();
    var diff = Math.floor((now - d) / 1000);
    if (diff < 60) return diff + "s";
    if (diff < 3600) return Math.floor(diff / 60) + "dk";
    if (diff < 86400) return Math.floor(diff / 3600) + "sa";
    return Math.floor(diff / 86400) + "g";
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", opacity: loaded ? 1 : 0, transition: "opacity 0.6s ease" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #e8230a44; border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder, input::placeholder { color: rgba(255,255,255,0.2); font-family: 'Cormorant Garamond', serif; font-style: italic; }
        .gonderi-btn:hover { background: rgba(255,255,255,0.08) !important; }
        .nav-btn:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "20%", right: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(232,35,10,0.04) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "30%", left: "5%", width: 350, height: 350, background: "radial-gradient(circle, rgba(96,165,250,0.03) 0%, transparent 70%)", filter: "blur(60px)" }} />
      </div>

      {/* Header */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, background: "rgba(10,10,10,0.95)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="nav-btn" onClick={function() { window.location.href = "/"; }} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 12px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 11, fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}>←</button>
          <div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700 }}>Keşfet</h1>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em" }}>TOPLULUK AKIŞI</p>
          </div>
        </div>
        <button onClick={function() { setYeniModal(true); }} style={{ background: "linear-gradient(135deg, #e8230a, #c01a08)", border: "none", borderRadius: 20, padding: "9px 20px", color: "#fff", fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", cursor: "pointer", boxShadow: "0 4px 20px rgba(232,35,10,0.3)" }}>+ PAYLAŞ</button>
      </div>

      {/* Feed */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 580, margin: "0 auto", padding: "90px 24px 80px" }}>
        {gonderiler.length === 0 ? (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>Henüz gönderi yok.</p>
          </div>
        ) : gonderiler.map(function(g, i) {
          var yorumAcik = yorumGonderiId === g.id;
          var benimMi = user && g.user_id === user.id;
          return (
            <div key={g.id} style={{ marginBottom: 24, animation: "fadeUp 0.4s " + Math.min(i * 0.06, 0.4) + "s both ease" }}>
              <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, overflow: "hidden" }}>
                {/* Gonderi header */}
                <div style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #e8230a, #ff6b35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, overflow: "hidden", flexShrink: 0 }}>
                      {g.profiles && g.profiles.avatar_url ? <img src={g.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em" }}>@{g.profiles ? g.profiles.username || "anonim" : "anonim"}</p>
                      <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{zaman(g.created_at)}</p>
                    </div>
                  </div>
                  {benimMi && <button onClick={function() { gonderiSil(g.id); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 14, padding: "4px" }}>🗑️</button>}
                </div>

                {/* Fotoğraf */}
                {g.fotograf_url && (
                  <div style={{ width: "100%", maxHeight: 480, overflow: "hidden" }}>
                    <img src={g.fotograf_url} style={{ width: "100%", objectFit: "cover", display: "block" }} />
                  </div>
                )}

                {/* Metin */}
                {g.metin && <p style={{ padding: "14px 18px", fontFamily: "'Cormorant Garamond', serif", fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.85)" }}>{g.metin}</p>}

                {/* Aksiyonlar */}
                <div style={{ padding: "10px 18px 14px", display: "flex", gap: 10, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <button className="gonderi-btn" onClick={function() { begeni(g.id, g.begeni_sayisi || 0); }} style={{ display: "flex", alignItems: "center", gap: 6, background: begeniler.includes(g.id) ? "rgba(232,35,10,0.12)" : "rgba(255,255,255,0.04)", border: "1px solid " + (begeniler.includes(g.id) ? "rgba(232,35,10,0.3)" : "rgba(255,255,255,0.08)"), borderRadius: 20, padding: "6px 14px", color: begeniler.includes(g.id) ? "#e8230a" : "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'Space Mono', monospace", cursor: "pointer", transition: "all 0.2s" }}>♥ {g.begeni_sayisi || 0}</button>
                  <button className="gonderi-btn" onClick={function() { yorumAc(g.id); }} style={{ display: "flex", alignItems: "center", gap: 6, background: yorumAcik ? "rgba(96,165,250,0.1)" : "rgba(255,255,255,0.04)", border: "1px solid " + (yorumAcik ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.08)"), borderRadius: 20, padding: "6px 14px", color: yorumAcik ? "#60a5fa" : "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'Space Mono', monospace", cursor: "pointer", transition: "all 0.2s" }}>💬 {(yorumlar[g.id] || []).length}</button>
                </div>

                {/* Yorumlar */}
                {yorumAcik && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.25)" }}>
                    <div style={{ padding: "12px 18px", maxHeight: 200, overflowY: "auto" }}>
                      {(yorumlar[g.id] || []).length === 0 && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.25)", textAlign: "center" }}>İlk yorumu yap.</p>}
                      {(yorumlar[g.id] || []).map(function(y) {
                        return (
                          <div key={y.id} style={{ marginBottom: 10, display: "flex", gap: 8 }}>
                            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#e8230a", flexShrink: 0, marginTop: 2 }}>@{y.profiles ? y.profiles.username || "?" : "?"}</span>
                            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>{y.metin}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ padding: "10px 18px 14px", display: "flex", gap: 8 }}>
                      <input value={yorumMetin} onChange={function(e) { setYorumMetin(e.target.value); }} placeholder="Yorum yaz..." onKeyDown={function(e) { if (e.key === "Enter") yorumGonder(g.id); }} style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "8px 16px", color: "#fff", fontSize: 13, fontFamily: "'Cormorant Garamond', serif", outline: "none" }} />
                      <button onClick={function() { yorumGonder(g.id); }} style={{ background: "#e8230a", border: "none", borderRadius: 20, padding: "8px 16px", color: "#fff", fontSize: 13, cursor: "pointer" }}>→</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Yeni gönderi modal */}
      {yeniModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function() { setYeniModal(false); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "relative", zIndex: 1, background: "#0f0f0f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "28px", maxWidth: 480, width: "100%", animation: "fadeUp 0.3s ease" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, #e8230a, #ff6b35, transparent)", borderRadius: "24px 24px 0 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700 }}>Yeni Gönderi</h3>
              <button onClick={function() { setYeniModal(false); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <textarea value={metin} onChange={function(e) { setMetin(e.target.value); }} placeholder="Ne düşünüyorsun?" rows={5} style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", color: "#fff", fontSize: 16, fontFamily: "'Cormorant Garamond', serif", outline: "none", resize: "none", marginBottom: 12, lineHeight: 1.65 }} />
            {fotoUrl && (
              <div style={{ position: "relative", marginBottom: 12 }}>
                <img src={fotoUrl} style={{ width: "100%", borderRadius: 12, maxHeight: 220, objectFit: "cover" }} />
                <button onClick={function() { setFoto(null); setFotoUrl(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={function() { fileRef.current && fileRef.current.click(); }} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "11px", color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "'Space Mono', monospace", cursor: "pointer", letterSpacing: "0.1em" }}>📷 FOTOĞRAF</button>
              <button onClick={paylas} disabled={yukleniyor} style={{ flex: 2, background: "linear-gradient(135deg, #e8230a, #c01a08)", border: "none", borderRadius: 12, padding: "11px", color: "#fff", fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", cursor: "pointer" }}>{yukleniyor ? "YÜKLENİYOR..." : "PAYLAŞ"}</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={fotoSec} style={{ display: "none" }} />
          </div>
        </div>
      )}
    </div>
  );
}
