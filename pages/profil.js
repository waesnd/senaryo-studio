import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var TEAL = "#0891b2";
var TEAL_L = "#06b6d4";

function getC(dk) {
  return {
    bg: dk ? "#080f1c" : "#eef2f7",
    surface: dk ? "#0f1829" : "#ffffff",
    border: dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dk ? "#f1f5f9" : "#0f172a",
    muted: dk ? "rgba(241,245,249,0.38)" : "rgba(15,23,42,0.4)",
    input: dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    metalGrad: dk ? "linear-gradient(145deg,#1a2740 0%,#0f1829 60%,#162035 100%)" : "linear-gradient(145deg,#ffffff 0%,#f0f4f8 60%,#e8eef5 100%)",
    shadow: dk ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.1)",
  };
}

export default function Profil() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [konular, setKonular] = useState([]);
  var [gonderiler, setGonderiler] = useState([]);
  var [tab, setTab] = useState("gonderiler");
  var [duzenle, setDuzenle] = useState(false);
  var [yeniUsername, setYeniUsername] = useState("");
  var [yeniBio, setYeniBio] = useState("");
  var [yeniLink, setYeniLink] = useState("");
  var [takipci, setTakipci] = useState(0);
  var [takip, setTakip] = useState(0);
  var [avatarYuk, setAvatarYuk] = useState(false);
  var [bannerYuk, setBannerYuk] = useState(false);
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var avatarRef = useRef(null);
  var bannerRef = useRef(null);

  var dk = tema === "dark";
  var C = getC(dk);

  useEffect(function () {
    var t = localStorage.getItem("sf_tema") || "light";
    setTema(t);
    setTimeout(function () { setLoaded(true); }, 60);
    supabase.auth.getSession().then(function (r) {
      if (r.data && r.data.session) {
        var u = r.data.session.user;
        setUser(u);
        yukle(u);
      }
    });
    supabase.auth.onAuthStateChange(function (_, session) {
      if (session) { setUser(session.user); yukle(session.user); }
      else { setUser(null); setProfil(null); }
    });
  }, []);

  function yukle(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(function (r) {
      if (r.data) {
        setProfil(r.data);
        setYeniUsername(r.data.username || "");
        setYeniBio(r.data.bio || "");
        setYeniLink(r.data.website || "");
      }
    });
    supabase.from("senaryolar").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).then(function (r) { if (r.data) setKonular(r.data); });
    supabase.from("gonderiler").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).then(function (r) { if (r.data) setGonderiler(r.data); });
    supabase.from("takipler").select("*", { count: "exact" }).eq("takip_edilen", u.id).then(function (r) { setTakipci(r.count || 0); });
    supabase.from("takipler").select("*", { count: "exact" }).eq("takip_eden", u.id).then(function (r) { setTakip(r.count || 0); });
  }

  async function avatarYukle(e) {
    var file = e.target.files[0];
    if (!file || !user) return;
    setAvatarYuk(true);
    var fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "scriptify_avatars");
    var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
    var data = await res.json();
    if (data.secure_url) {
      await supabase.from("profiles").upsert({ id: user.id, avatar_url: data.secure_url });
      setProfil(function (p) { return { ...p, avatar_url: data.secure_url }; });
    }
    setAvatarYuk(false);
  }

  async function bannerYukle(e) {
    var file = e.target.files[0];
    if (!file || !user) return;
    setBannerYuk(true);
    var fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "scriptify_avatars");
    var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
    var data = await res.json();
    if (data.secure_url) {
      await supabase.from("profiles").upsert({ id: user.id, banner_url: data.secure_url });
      setProfil(function (p) { return { ...p, banner_url: data.secure_url }; });
    }
    setBannerYuk(false);
  }

  async function profilKaydet() {
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, username: yeniUsername, bio: yeniBio, website: yeniLink });
    setProfil(function (p) { return { ...p, username: yeniUsername, bio: yeniBio, website: yeniLink }; });
    setDuzenle(false);
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60) return d + "s önce";
    if (d < 3600) return Math.floor(d / 60) + "dk önce";
    if (d < 86400) return Math.floor(d / 3600) + "sa önce";
    return Math.floor(d / 86400) + "g önce";
  }

  var username = profil && profil.username ? profil.username : user ? user.email.split("@")[0] : "kullanici";

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: dk ? "#080f1c" : "#eef2f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🔐</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: dk ? "#f1f5f9" : "#0f172a", marginBottom: 8 }}>Giriş yapmalısın</p>
          <button onClick={function () { window.location.href = "/"; }} style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", borderRadius: 12, padding: "11px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 16px ${TEAL}35` }}>Ana Sayfaya Dön</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease", paddingBottom: 80 }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        input::placeholder,textarea::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}
        a{text-decoration:none;color:inherit;}
        button{font-family:inherit;cursor:pointer;}
        .konu-kart:hover{box-shadow:0 4px 24px rgba(8,145,178,0.12) !important;border-color:rgba(8,145,178,0.2) !important;}
        .konu-kart:hover .sil-btn{opacity:1 !important;}
      `}</style>

      {/* NAVBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.92)" : "rgba(238,242,247,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={function () { window.location.href = "/"; }} style={{ display: "flex", alignItems: "center", gap: 8, background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "7px 14px", color: C.muted, fontSize: 13, fontWeight: 600 }}>← Geri</button>
        <span style={{ fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Profil</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={function () { var t = dk ? "light" : "dark"; setTema(t); localStorage.setItem("sf_tema", t); }} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "7px 10px", color: C.muted, fontSize: 13 }}>{dk ? "☀️" : "🌙"}</button>
          <button onClick={function () { setDuzenle(!duzenle); }} style={{ background: duzenle ? ACCENT : C.input, border: "1px solid " + (duzenle ? ACCENT : C.border), borderRadius: 10, padding: "7px 16px", color: duzenle ? "#fff" : C.muted, fontSize: 13, fontWeight: 700, transition: "all 0.2s" }}>
            {duzenle ? "İptal" : "Düzenle"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* BANNER */}
        <div style={{ position: "relative", height: 190, background: profil && profil.banner_url ? "transparent" : `linear-gradient(135deg, ${TEAL}60, ${ACCENT}30, ${dk ? "#0f1829" : "#eef2f7"})`, overflow: "hidden", cursor: "pointer" }}
          onClick={function () { bannerRef.current && bannerRef.current.click(); }}>
          {profil && profil.banner_url && <img src={profil.banner_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {bannerYuk
              ? <div style={{ width: 28, height: 28, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              : <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: "7px 14px", color: "#fff", fontSize: 12, fontWeight: 600, backdropFilter: "blur(8px)" }}>📷 Kapak Değiştir</div>
            }
          </div>
          <input ref={bannerRef} type="file" accept="image/*" onChange={bannerYukle} style={{ display: "none" }} />
        </div>

        <div style={{ padding: "0 20px" }}>

          {/* Avatar + butonlar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: -46, marginBottom: 14 }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={function () { avatarRef.current && avatarRef.current.click(); }}>
              <div style={{ width: 90, height: 90, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: `4px solid ${C.bg}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, boxShadow: `0 4px 20px ${TEAL}35` }}>
                {avatarYuk
                  ? <div style={{ width: 26, height: 26, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  : profil && profil.avatar_url
                    ? <img src={profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : "👤"}
              </div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: `2px solid ${C.bg}`, color: "#fff" }}>✏</div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={avatarYukle} style={{ display: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { window.location.href = "/mesajlar"; }} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 20, padding: "8px 18px", color: C.text, fontSize: 13, fontWeight: 700, boxShadow: C.shadow }}>💬 Mesaj</button>
              <button onClick={function () { supabase.auth.signOut().then(function () { window.location.href = "/"; }); }} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 20, padding: "8px 14px", color: C.muted, fontSize: 13, fontWeight: 600 }}>Çıkış</button>
            </div>
          </div>

          {/* İsim + bio */}
          {!duzenle ? (
            <div style={{ marginBottom: 18 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", color: C.text, marginBottom: 2 }}>@{username}</h1>
              {user && <p style={{ fontSize: 12, color: C.muted, marginBottom: 7 }}>{user.email}</p>}
              {profil && profil.bio && <p style={{ fontSize: 15, lineHeight: 1.6, color: C.text, marginBottom: 7 }}>{profil.bio}</p>}
              {profil && profil.website && <a href={profil.website} target="_blank" style={{ fontSize: 13, color: TEAL, fontWeight: 600 }}>🔗 {profil.website.replace(/https?:\/\//, "")}</a>}
            </div>
          ) : (
            <div style={{ marginBottom: 18, animation: "fadeUp 0.25s ease" }}>
              <input value={yeniUsername} onChange={function (e) { setYeniUsername(e.target.value); }} placeholder="kullanici_adi" style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", marginBottom: 8, fontFamily: "inherit" }} />
              <textarea value={yeniBio} onChange={function (e) { setYeniBio(e.target.value); }} placeholder="Kendini anlat..." rows={3} style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", marginBottom: 8 }} />
              <input value={yeniLink} onChange={function (e) { setYeniLink(e.target.value); }} placeholder="https://web-siten.com" style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", marginBottom: 12, fontFamily: "inherit" }} />
              <button onClick={profilKaydet} style={{ width: "100%", padding: "11px", borderRadius: 12, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 16px ${TEAL}35` }}>Kaydet</button>
            </div>
          )}

          {/* İstatistikler */}
          <div style={{ display: "flex", gap: 0, marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid " + C.border }}>
            {[{ val: konular.length, label: "Senaryo" }, { val: gonderiler.length, label: "Gönderi" }, { val: takipci, label: "Takipçi" }, { val: takip, label: "Takip" }].map(function (s, i) {
              return (
                <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRight: i < 3 ? "1px solid " + C.border : "none", cursor: "pointer" }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.03em" }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 2 }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Sekmeler */}
          <div style={{ display: "flex", marginBottom: 18, borderBottom: "1px solid " + C.border }}>
            {[{ id: "gonderiler", label: "Gönderiler" }, { id: "senaryolar", label: "Senaryolar" }].map(function (t) {
              var isActive = tab === t.id;
              return (
                <button key={t.id} onClick={function () { setTab(t.id); }} style={{ flex: 1, padding: "12px 8px", background: "none", border: "none", borderBottom: isActive ? `2px solid ${TEAL}` : "2px solid transparent", color: isActive ? TEAL : C.muted, fontSize: 13, fontWeight: isActive ? 700 : 500, transition: "all 0.2s", marginBottom: "-1px" }}>
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Gönderiler */}
          {tab === "gonderiler" && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              {gonderiler.length === 0
                ? <div style={{ textAlign: "center", padding: "60px 20px" }}><p style={{ fontSize: 40, marginBottom: 10 }}>📭</p><p style={{ fontSize: 14, color: C.muted }}>Henüz gönderi yok.</p></div>
                : gonderiler.map(function (g, i) {
                  return (
                    <div key={g.id} style={{ borderBottom: "1px solid " + C.border, padding: "14px 0", animation: `fadeUp 0.3s ${i * 0.04}s both ease` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: C.muted }}>{zaman(g.created_at)}</span>
                      </div>
                      {g.metin && <p style={{ fontSize: 15, lineHeight: 1.65, color: C.text, marginBottom: g.fotograf_url ? 10 : 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{g.metin}</p>}
                      {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", borderRadius: 14, maxHeight: 280, objectFit: "cover" }} />}
                      <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>♥ {g.begeni_sayisi || 0}</p>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Senaryolar */}
          {tab === "senaryolar" && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              {konular.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px" }}>
                  <p style={{ fontSize: 40, marginBottom: 10 }}>🎬</p>
                  <p style={{ fontSize: 14, color: C.muted, marginBottom: 18 }}>Henüz senaryo üretmedin.</p>
                  <button onClick={function () { window.location.href = "/uret"; }} style={{ background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 16px ${ACCENT}35` }}>Senaryo Üret →</button>
                </div>
              ) : konular.map(function (k, i) {
                return (
                  <div key={k.id} className="konu-kart" style={{ position: "relative", background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: "16px 18px", marginBottom: 10, boxShadow: C.shadow, animation: `fadeUp 0.3s ${i * 0.04}s both ease`, overflow: "hidden", transition: "all 0.2s" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${TEAL}, transparent)`, borderRadius: "16px 0 0 16px" }} />
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: TEAL + "15", color: TEAL, border: `1px solid ${TEAL}25` }}>{k.tip}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: C.input, color: C.muted, border: "1px solid " + C.border }}>{k.tur}</span>
                      {k.paylasim_acik && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>🌍 Paylaşık</span>}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.02em", color: C.text, marginBottom: 5 }}>{k.baslik}</h3>
                    {k.tagline && <p style={{ fontSize: 12, fontStyle: "italic", color: C.muted, marginBottom: 5 }}>{k.tagline}</p>}
                    {k.ana_fikir && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{k.ana_fikir.slice(0, 120)}{k.ana_fikir.length > 120 ? "..." : ""}</p>}
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>♥ {k.begeni_sayisi || 0} · {zaman(k.created_at)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

            {/* MOBİL ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around", alignItems: "center", boxShadow: "0 -4px 30px rgba(0,0,0,0.1)" }}>
        {[
          { icon: "🏠", href: "/" },
          { icon: "🔭", href: "/kesfet" },
          { icon: "🎭", href: "/topluluk" },
          { icon: "💬", href: "/mesajlar" },
        ].map(function (item) {
          var isActive = typeof window !== "undefined" && false;
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
