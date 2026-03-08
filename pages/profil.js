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
  var fileRef = useRef(null);

  useEffect(function() {
    setTimeout(function() { setLoaded(true); }, 100);
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
    if (!konular.length) return null;
    var s = {}; konular.forEach(function(k) { s[k.tur] = (s[k.tur] || 0) + 1; });
    return Object.keys(s).reduce(function(a, b) { return s[a] > s[b] ? a : b; });
  };

  var TUR_EMOJIS = { "Gerilim": "🔪", "Bilim Kurgu": "🚀", "Dram": "🎭", "Korku": "👁️", "Komedi": "😂", "Romantik": "💔", "Macera": "🧭", "Suç": "🕵️", "Fantazi": "🐉", "Psikolojik": "🧠", "Tarihi": "⚔️", "Aksiyon": "💥" };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: "'Georgia', 'Times New Roman', serif", opacity: loaded ? 1 : 0, transition: "opacity 0.6s ease" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #e8230a44; border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .tab-btn:hover { color: #fff !important; }
        .konu-kart:hover { border-color: rgba(232,35,10,0.3) !important; transform: translateY(-1px); }
        .konu-kart { transition: all 0.2s ease; }
        .sil-btn { opacity: 0; transition: opacity 0.2s; }
        .konu-kart:hover .sil-btn { opacity: 1; }
        .nav-btn:hover { background: rgba(255,255,255,0.1) !important; }
      `}</style>

      {/* Ambient background */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "10%", left: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(232,35,10,0.06) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)", filter: "blur(40px)" }} />
      </div>

      {/* Top bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 56, background: "rgba(10,10,10,0.92)", backdropFilter: "blur(24px)", borderBottom: "1px solid rgba(255,255,255,0.06)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <button className="nav-btn" onClick={function() { window.location.href = "/"; }} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em", transition: "all 0.2s" }}>← ANA SAYFA</button>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: "0.3em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>Scriptify</span>
        <button onClick={function() { setDuzenle(!duzenle); }} style={{ background: duzenle ? "rgba(232,35,10,0.2)" : "rgba(255,255,255,0.05)", border: "1px solid " + (duzenle ? "rgba(232,35,10,0.5)" : "rgba(255,255,255,0.08)"), borderRadius: 8, padding: "6px 14px", color: duzenle ? "#e8230a" : "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace", letterSpacing: "0.05em", transition: "all 0.2s" }}>{duzenle ? "✕ İPTAL" : "DÜZENLE"}</button>
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 700, margin: "0 auto", padding: "80px 24px 100px" }}>

        {/* Hero profil alanı */}
        <div style={{ animation: "fadeUp 0.7s ease forwards", marginBottom: 48 }}>

          {/* Avatar + isim */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginBottom: 28 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div onClick={function() { fileRef.current && fileRef.current.click(); }}
                style={{ width: 90, height: 90, borderRadius: "50%", background: profil && profil.avatar_url ? "transparent" : "linear-gradient(135deg, #e8230a 0%, #ff6b35 100%)", border: "2px solid rgba(232,35,10,0.4)", cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: "0 0 40px rgba(232,35,10,0.2)", transition: "all 0.3s" }}>
                {yukleniyor ? <div style={{ width: 24, height: 24, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : profil && profil.avatar_url ? <img src={profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span>👤</span>}
              </div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: "#e8230a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, cursor: "pointer", border: "2px solid #0a0a0a" }} onClick={function() { fileRef.current && fileRef.current.click(); }}>✏</div>
              <input ref={fileRef} type="file" accept="image/*" onChange={avatarYukle} style={{ display: "none" }} />
            </div>

            <div style={{ flex: 1 }}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 38, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 6, background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.7) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {profil && profil.username ? profil.username : "Anonim"}
              </h1>
              <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>{user && user.email ? user.email.replace(/(.{2}).*(@.*)/, "$1***$2") : ""}</p>
            </div>
          </div>

          {/* Bio */}
          {!duzenle && profil && profil.bio && (
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontStyle: "italic", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, marginBottom: 28, paddingLeft: 2 }}>{profil.bio}</p>
          )}

          {/* Düzenleme formu */}
          {duzenle && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px", marginBottom: 28, animation: "fadeUp 0.3s ease" }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 6 }}>KULLANICI ADI</label>
                <input value={yeniUsername} onChange={function(e) { setYeniUsername(e.target.value); }} placeholder="kullanici_adi" style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14, fontFamily: "'Cormorant Garamond', serif", outline: "none", transition: "border-color 0.2s" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 6 }}>BIO</label>
                <textarea value={yeniBio} onChange={function(e) { setYeniBio(e.target.value); }} placeholder="Kendini anlat..." rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 14, fontFamily: "'Cormorant Garamond', serif", outline: "none", resize: "none" }} />
              </div>
              <button onClick={profilKaydet} style={{ width: "100%", background: "linear-gradient(135deg, #e8230a, #c01a08)", border: "none", borderRadius: 12, padding: "12px", color: "#fff", fontSize: 13, fontFamily: "'Space Mono', monospace", letterSpacing: "0.1em", cursor: "pointer" }}>KAYDET</button>
            </div>
          )}

          {/* İstatistikler */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { val: konular.length, label: "KONU" },
              { val: takipci, label: "TAKİPÇİ" },
              { val: takip, label: "TAKİP" },
              { val: enCokTur() ? (TUR_EMOJIS[enCokTur()] || "") : "—", label: "FAVORİ TÜR" }
            ].map(function(stat, i) {
              return (
                <div key={i} style={{ background: "#0f0f0f", padding: "18px 12px", textAlign: "center" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: i < 3 ? 28 : 22, fontWeight: 700, color: i === 0 ? "#e8230a" : i === 1 ? "#facc15" : i === 2 ? "#4ade80" : "#c084fc", marginBottom: 4 }}>{stat.val}</p>
                  <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)" }}>{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sekmeler */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {["konular", "favoriler"].map(function(t) {
            return (
              <button key={t} className="tab-btn" onClick={function() { setTab(t); }} style={{ padding: "12px 24px", background: "none", border: "none", borderBottom: tab === t ? "2px solid #e8230a" : "2px solid transparent", color: tab === t ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "'Space Mono', monospace", letterSpacing: "0.2em", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s", marginBottom: -1 }}>
                {t === "konular" ? "📋 Konularım (" + konular.length + ")" : "⭐ Favoriler (" + favoriler.length + ")"}
              </button>
            );
          })}
        </div>

        {/* İçerik */}
        {tab === "konular" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {konular.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>🎬</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Henüz konu üretmedin.</p>
                <button onClick={function() { window.location.href = "/"; }} style={{ marginTop: 16, background: "rgba(232,35,10,0.15)", border: "1px solid rgba(232,35,10,0.3)", borderRadius: 20, padding: "10px 24px", color: "#e8230a", fontSize: 12, fontFamily: "'Space Mono', monospace", cursor: "pointer", letterSpacing: "0.1em" }}>KONU ÜRET →</button>
              </div>
            ) : konular.map(function(k, i) {
              return (
                <div key={k.id} className="konu-kart" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "20px 22px", marginBottom: 12, position: "relative", overflow: "hidden", animation: "fadeUp 0.4s " + (i * 0.05) + "s both ease" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: "linear-gradient(180deg, #e8230a, transparent)", borderRadius: "16px 0 0 16px" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, marginBottom: 6, lineHeight: 1.2 }}>{k.baslik}</h3>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.15em", padding: "2px 10px", borderRadius: 20, background: "rgba(232,35,10,0.1)", border: "1px solid rgba(232,35,10,0.25)", color: "#e8230a" }}>{k.tip}</span>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: "0.15em", padding: "2px 10px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}>{TUR_EMOJIS[k.tur] || ""} {k.tur}</span>
                        {k.paylasim_acik && <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, padding: "2px 10px", borderRadius: 20, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", color: "#4ade80" }}>🌍 PAYLAŞIK</span>}
                      </div>
                    </div>
                    <button className="sil-btn" onClick={function() { konuSil(k.id); }} style={{ background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.2)", borderRadius: 8, padding: "5px 10px", color: "#ff6b6b", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                  </div>
                  {k.ana_fikir && <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontStyle: "italic", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{k.ana_fikir.slice(0, 140)}{k.ana_fikir.length > 140 ? "..." : ""}</p>}
                </div>
              );
            })}
          </div>
        )}

        {tab === "favoriler" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            {favoriler.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontSize: 48, marginBottom: 12 }}>⭐</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Favori eklemedin henüz.</p>
              </div>
            ) : favoriler.map(function(f, i) {
              return (
                <div key={f.id} style={{ background: "rgba(250,204,21,0.03)", border: "1px solid rgba(250,204,21,0.1)", borderRadius: 16, padding: "18px 22px", marginBottom: 12, position: "relative", animation: "fadeUp 0.4s " + (i * 0.05) + "s both ease" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: "linear-gradient(180deg, #facc15, transparent)", borderRadius: "16px 0 0 16px" }} />
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, fontWeight: 700, marginBottom: 6 }}>⭐ {f.baslik}</h3>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, padding: "2px 10px", borderRadius: 20, background: "rgba(250,204,21,0.08)", border: "1px solid rgba(250,204,21,0.2)", color: "#facc15" }}>{f.tip} · {f.tur}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
