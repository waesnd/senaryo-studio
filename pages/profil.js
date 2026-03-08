import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var FONT = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function Profil() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [hedefProfil, setHedefProfil] = useState(null);
  var [konular, setKonular] = useState([]);
  var [gonderiler, setGonderiler] = useState([]);
  var [favoriler, setFavoriler] = useState([]);
  var [tab, setTab] = useState("gonderiler");
  var [duzenle, setDuzenle] = useState(false);
  var [yeniUsername, setYeniUsername] = useState("");
  var [yeniBio, setYeniBio] = useState("");
  var [yeniLink, setYeniLink] = useState("");
  var [takipci, setTakipci] = useState(0);
  var [takip, setTakip] = useState(0);
  var [avatarYukleniyor, setAvatarYukleniyor] = useState(false);
  var [bannerYukleniyor, setBannerYukleniyor] = useState(false);
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var avatarRef = useRef(null);
  var bannerRef = useRef(null);

  var dk = tema === "dark";
  var C = {
    bg: dk ? "#0c0c0c" : "#f4f4f0",
    card: dk ? "#181818" : "#fff",
    border: dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dk ? "#f0f0f0" : "#0d0d0d",
    muted: dk ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)",
    input: dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
  };

  useEffect(function() {
    var t = localStorage.getItem("sf_tema") || "light";
    setTema(t);
    setTimeout(function() { setLoaded(true); }, 60);
    supabase.auth.getSession().then(function(r) {
      if (r.data && r.data.session) {
        var u = r.data.session.user;
        setUser(u);
        yukleProfilVerileri(u);
      }
    });
    supabase.auth.onAuthStateChange(function(_, session) {
      if (session) {
        setUser(session.user);
        yukleProfilVerileri(session.user);
      }
    });
  }, []);

  function yukleProfilVerileri(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(function(r) {
      if (r.data) {
        setProfil(r.data);
        setHedefProfil(r.data);
        setYeniUsername(r.data.username || "");
        setYeniBio(r.data.bio || "");
        setYeniLink(r.data.website || "");
      }
    });
    supabase.from("senaryolar").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).then(function(r) {
      if (r.data) setKonular(r.data);
    });
    supabase.from("gonderiler").select("*, profiles(username, avatar_url)").eq("user_id", u.id).order("created_at", { ascending: false }).then(function(r) {
      if (r.data) setGonderiler(r.data);
    });
    supabase.from("takipler").select("*", { count: "exact" }).eq("takip_edilen", u.id).then(function(r) {
      setTakipci(r.count || 0);
    });
    supabase.from("takipler").select("*", { count: "exact" }).eq("takip_eden", u.id).then(function(r) {
      setTakip(r.count || 0);
    });
    var saved = localStorage.getItem("gecmis");
    var favIds = localStorage.getItem("favoriler");
    if (saved && favIds) {
      var ids = JSON.parse(favIds);
      setFavoriler(JSON.parse(saved).filter(function(g) { return ids.includes(g.id); }));
    }
  }

  async function avatarYukle(e) {
    var file = e.target.files[0];
    if (!file || !user) return;
    setAvatarYukleniyor(true);
    var fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "scriptify_avatars");
    var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
    var data = await res.json();
    if (data.secure_url) {
      await supabase.from("profiles").upsert({ id: user.id, avatar_url: data.secure_url });
      setProfil(function(p) { return { ...p, avatar_url: data.secure_url }; });
    }
    setAvatarYukleniyor(false);
  }

  async function bannerYukle(e) {
    var file = e.target.files[0];
    if (!file || !user) return;
    setBannerYukleniyor(true);
    var fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "scriptify_avatars");
    var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
    var data = await res.json();
    if (data.secure_url) {
      await supabase.from("profiles").upsert({ id: user.id, banner_url: data.secure_url });
      setProfil(function(p) { return { ...p, banner_url: data.secure_url }; });
    }
    setBannerYukleniyor(false);
  }

  async function profilKaydet() {
    if (!user) return;
    var r = await supabase.from("profiles").upsert({ id: user.id, username: yeniUsername, bio: yeniBio, website: yeniLink });
    if (!r.error) {
      setProfil(function(p) { return { ...p, username: yeniUsername, bio: yeniBio, website: yeniLink }; });
      setDuzenle(false);
    }
  }

  async function konuSil(id) {
    await supabase.from("senaryolar").delete().eq("id", id);
    setKonular(function(p) { return p.filter(function(k) { return k.id !== id; }); });
  }

  async function gonderiSil(id) {
    await supabase.from("gonderiler").delete().eq("id", id);
    setGonderiler(function(p) { return p.filter(function(g) { return g.id !== id; }); });
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60) return d + "s önce";
    if (d < 3600) return Math.floor(d / 60) + "dk önce";
    if (d < 86400) return Math.floor(d / 3600) + "sa önce";
    return Math.floor(d / 86400) + "g önce";
  }

  var username = profil && profil.username ? profil.username : user ? user.email && user.email.split("@")[0] : "kullanici";

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: dk ? "#0c0c0c" : "#f4f4f0", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🔐</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: dk ? "#f0f0f0" : "#0d0d0d", marginBottom: 8 }}>Giriş yapmalısın</p>
          <p style={{ fontSize: 14, color: dk ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", marginBottom: 24 }}>Profilini görmek için giriş yap.</p>
          <button onClick={function() { window.location.href = "/"; }} style={{ background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", borderRadius: 12, padding: "11px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Ana Sayfaya Dön</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT, opacity: loaded ? 1 : 0, transition: "opacity 0.35s ease" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${ACCENT}55; border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: ${C.muted}; }
        a { text-decoration: none; }
        button { font-family: inherit; }
        .konu-kart:hover .sil-btn { opacity: 1 !important; }
        .konu-kart { transition: all 0.2s ease; }
        .konu-kart:hover { box-shadow: 0 4px 24px rgba(232,35,10,0.1) !important; border-color: rgba(232,35,10,0.2) !important; }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(12,12,12,0.92)" : "rgba(244,244,240,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={function() { window.location.href = "/"; }} style={{ display: "flex", alignItems: "center", gap: 8, background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "7px 14px", color: C.muted, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>← Ana Sayfa</button>
        <span style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Profil</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={function() { var t = dk ? "light" : "dark"; setTema(t); localStorage.setItem("sf_tema", t); }} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "7px 10px", color: C.muted, cursor: "pointer", fontSize: 13 }}>{dk ? "☀️" : "🌙"}</button>
          <button onClick={function() { setDuzenle(!duzenle); }} style={{ background: duzenle ? ACCENT : C.input, border: "1px solid " + (duzenle ? ACCENT : C.border), borderRadius: 10, padding: "7px 16px", color: duzenle ? "#fff" : C.muted, cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.2s" }}>
            {duzenle ? "İptal" : "Düzenle"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", paddingBottom: 80 }}>

        {/* ═══ BANNER ═══ */}
        <div style={{ position: "relative", height: 200, background: profil && profil.banner_url ? "transparent" : `linear-gradient(135deg, ${ACCENT}80, #ff572240, ${dk ? "#111" : "#f4f4f0"})`, overflow: "hidden", cursor: "pointer" }}
          onClick={function() { bannerRef.current && bannerRef.current.click(); }}>
          {profil && profil.banner_url && <img src={profil.banner_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
            onMouseEnter={function(e) { e.currentTarget.style.opacity = 1; }}
            onMouseLeave={function(e) { e.currentTarget.style.opacity = 0; }}>
            {bannerYukleniyor ? (
              <div style={{ width: 28, height: 28, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            ) : (
              <div style={{ background: "rgba(0,0,0,0.5)", borderRadius: 10, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 600 }}>📷 Kapak Fotoğrafı Değiştir</div>
            )}
          </div>
          <input ref={bannerRef} type="file" accept="image/*" onChange={bannerYukle} style={{ display: "none" }} />
        </div>

        {/* ═══ PROFIL BİLGİLERİ ═══ */}
        <div style={{ padding: "0 20px" }}>
          
          {/* Avatar + butonlar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: -44, marginBottom: 16 }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={function() { avatarRef.current && avatarRef.current.click(); }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, border: `4px solid ${C.bg}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: `0 4px 20px ${ACCENT}30` }}>
                {avatarYukleniyor ? (
                  <div style={{ width: 26, height: 26, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                ) : profil && profil.avatar_url ? (
                  <img src={profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : "👤"}
              </div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 24, height: 24, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: `2px solid ${C.bg}`, color: "#fff" }}>✏</div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={avatarYukle} style={{ display: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function() { window.location.href = "/mesajlar"; }} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 20, padding: "8px 18px", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>💬 Mesaj</button>
            </div>
          </div>

          {/* İsim + bio */}
          {!duzenle ? (
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: C.text, marginBottom: 2 }}>@{username}</h1>
              {user && <p style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>{user.email}</p>}
              {profil && profil.bio && <p style={{ fontSize: 15, lineHeight: 1.6, color: C.text, marginBottom: 8 }}>{profil.bio}</p>}
              {profil && profil.website && <a href={profil.website} target="_blank" style={{ fontSize: 13, color: ACCENT, fontWeight: 600 }}>🔗 {profil.website.replace(/https?:\/\//, "")}</a>}
            </div>
          ) : (
            <div style={{ marginBottom: 20, animation: "fadeUp 0.25s ease" }}>
              <input value={yeniUsername} onChange={function(e) { setYeniUsername(e.target.value); }} placeholder="kullanici_adi" style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", marginBottom: 10, fontFamily: FONT }} />
              <textarea value={yeniBio} onChange={function(e) { setYeniBio(e.target.value); }} placeholder="Kendini anlat..." rows={3} style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", resize: "none", fontFamily: FONT, marginBottom: 10 }} />
              <input value={yeniLink} onChange={function(e) { setYeniLink(e.target.value); }} placeholder="https://web-siten.com" style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", marginBottom: 14, fontFamily: FONT }} />
              <button onClick={profilKaydet} style={{ width: "100%", padding: "11px", borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 16px ${ACCENT}35` }}>Kaydet</button>
            </div>
          )}

          {/* İstatistikler */}
          <div style={{ display: "flex", gap: 24, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid " + C.border }}>
            {[
              { val: konular.length, label: "Senaryo" },
              { val: gonderiler.length, label: "Gönderi" },
              { val: takipci, label: "Takipçi" },
              { val: takip, label: "Takip" },
            ].map(function(s) {
              return (
                <div key={s.label} style={{ textAlign: "center", cursor: "pointer" }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.03em" }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 1 }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Sekmeler */}
          <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid " + C.border }}>
            {[
              { id: "gonderiler", label: "Gönderiler", count: gonderiler.length },
              { id: "senaryolar", label: "Senaryolar", count: konular.length },
              { id: "favoriler", label: "Favoriler", count: favoriler.length },
            ].map(function(t) {
              var isActive = tab === t.id;
              return (
                <button key={t.id} onClick={function() { setTab(t.id); }} style={{ flex: 1, padding: "12px 8px", background: "none", border: "none", borderBottom: isActive ? `2px solid ${ACCENT}` : "2px solid transparent", color: isActive ? ACCENT : C.muted, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.2s", marginBottom: "-1px" }}>
                  {t.label} <span style={{ fontSize: 11, opacity: 0.7 }}>({t.count})</span>
                </button>
              );
            })}
          </div>

          {/* ═══ GÖNDERILER ═══ */}
          {tab === "gonderiler" && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              {gonderiler.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ fontSize: 44, marginBottom: 12 }}>📭</p>
                  <p style={{ fontSize: 15, color: C.muted }}>Henüz gönderi yok.</p>
                </div>
              ) : gonderiler.map(function(g, i) {
                return (
                  <div key={g.id} style={{ borderBottom: "1px solid " + C.border, padding: "16px 0", animation: `fadeUp 0.3s ${i * 0.04}s both ease` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: C.muted }}>{zaman(g.created_at)}</span>
                      <button onClick={function() { gonderiSil(g.id); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 13, padding: "2px 6px", borderRadius: 6, opacity: 0.5 }}>✕</button>
                    </div>
                    {g.metin && <p style={{ fontSize: 15, lineHeight: 1.65, color: C.text, marginBottom: g.fotograf_url ? 10 : 0, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{g.metin}</p>}
                    {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", borderRadius: 14, maxHeight: 300, objectFit: "cover", marginTop: 4 }} />}
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>♥ {g.begeni_sayisi || 0} beğeni</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ SENARYOLAR ═══ */}
          {tab === "senaryolar" && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              {konular.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ fontSize: 44, marginBottom: 12 }}>🎬</p>
                  <p style={{ fontSize: 15, color: C.muted, marginBottom: 20 }}>Henüz senaryo üretmedin.</p>
                  <button onClick={function() { window.location.href = "/uret"; }} style={{ background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Senaryo Üret →</button>
                </div>
              ) : konular.map(function(k, i) {
                return (
                  <div key={k.id} className="konu-kart" style={{ position: "relative", background: C.card, border: "1px solid " + C.border, borderRadius: 16, padding: "16px 18px", marginBottom: 12, boxShadow: dk ? "0 2px 16px rgba(0,0,0,0.2)" : "0 2px 16px rgba(0,0,0,0.05)", animation: `fadeUp 0.3s ${i * 0.04}s both ease`, overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${ACCENT}, transparent)`, borderRadius: "16px 0 0 16px" }} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: `${ACCENT}12`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>{k.tip}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: C.input, color: C.muted, border: "1px solid " + C.border }}>{k.tur}</span>
                        {k.paylasim_acik && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>🌍 Paylaşık</span>}
                      </div>
                      <button className="sil-btn" onClick={function() { konuSil(k.id); }} style={{ opacity: 0, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", borderRadius: 8, padding: "4px 9px", color: "#ef4444", cursor: "pointer", fontSize: 12, transition: "opacity 0.2s" }}>🗑️</button>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: C.text, marginBottom: 6 }}>{k.baslik}</h3>
                    {k.tagline && <p style={{ fontSize: 12, fontStyle: "italic", color: C.muted, marginBottom: 6 }}>{k.tagline}</p>}
                    {k.ana_fikir && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.55 }}>{k.ana_fikir.slice(0, 130)}{k.ana_fikir.length > 130 ? "..." : ""}</p>}
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>♥ {k.begeni_sayisi || 0} · {zaman(k.created_at)}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ FAVORİLER ═══ */}
          {tab === "favoriler" && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              {favoriler.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ fontSize: 44, marginBottom: 12 }}>⭐</p>
                  <p style={{ fontSize: 15, color: C.muted }}>Henüz favori eklemedin.</p>
                </div>
              ) : favoriler.map(function(f, i) {
                return (
                  <div key={f.id} style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 16, padding: "14px 18px", marginBottom: 10, animation: `fadeUp 0.3s ${i * 0.04}s both ease` }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>⭐ {f.baslik}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 20, background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>{f.tip} · {f.tur}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
