import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var TEAL = "#0891b2";
var TEAL_L = "#06b6d4";

var DRAWER_MENU = [
  { icon: "🏠", label: "Ana Sayfa", href: "/" },
  { icon: "🎬", label: "Senaryo Üret", href: "/uret", badge: "AI" },
  { icon: "🔭", label: "Keşfet", href: "/kesfet" },
  { icon: "🎭", label: "Topluluk", href: "/topluluk" },
  { icon: "💬", label: "Mesajlar", href: "/mesajlar" },
];

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

function AvatarDiv(props) {
  return (
    <div style={{ width: props.size, height: props.size, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: props.fs || 14, flexShrink: 0 }}>
      {props.url ? <img src={props.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
    </div>
  );
}

function Drawer(props) {
  var dk = props.dk;
  var C = props.C;
  var user = props.user;
  var username = props.username;
  var avatarUrl = props.avatarUrl;
  var onClose = props.onClose;
  var onTema = props.onTema;

  return (
    <div>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201, width: 300, background: dk ? "#0d1627" : "#fff", boxShadow: "4px 0 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 4, background: "linear-gradient(90deg," + ACCENT + "," + TEAL + "," + TEAL_L + ")", flexShrink: 0 }} />
        <div style={{ padding: "20px", borderBottom: "1px solid " + C.border, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <AvatarDiv url={avatarUrl} size={54} fs={22} />
            <button onClick={onClose} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 13, cursor: "pointer" }}>✕</button>
          </div>
          {user ? (
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{username}</p>
              <p style={{ fontSize: 12, color: C.muted }}>{user.email}</p>
            </div>
          ) : (
            <button onClick={function () { onClose(); window.location.href = "/"; }} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>
          )}
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {DRAWER_MENU.map(function (item) {
            return (
              <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontWeight: 500, fontSize: 15, marginBottom: 4, textDecoration: "none" }}>
                <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
              </a>
            );
          })}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + C.border }}>
            <a href="/profil" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: TEAL, fontWeight: 700, fontSize: 15, marginBottom: 4, textDecoration: "none", background: TEAL + "12" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>👤</span><span>Profil & Ayarlar</span>
            </a>
            <button onClick={onTema} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{dk ? "☀️" : "🌙"}</span>
              <span>{dk ? "Açık Tema" : "Koyu Tema"}</span>
            </button>
            {user && (
              <button onClick={function () { supabase.auth.signOut(); onClose(); window.location.href = "/"; }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: ACCENT, fontSize: 15, background: ACCENT + "10", border: "none", width: "100%", textAlign: "left", cursor: "pointer", marginTop: 4 }}>
                <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>🚪</span><span>Çıkış Yap</span>
              </button>
            )}
          </div>
        </nav>
        <div style={{ padding: "12px 20px 20px", borderTop: "1px solid " + C.border, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: C.muted }}>© 2025 Scriptify · by Öztürk</p>
        </div>
      </div>
    </div>
  );
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
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);
  var avatarRef = useRef(null);
  var bannerRef = useRef(null);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil && profil.avatar_url ? profil.avatar_url : null;
  var username = profil && profil.username ? profil.username : user ? user.email.split("@")[0] : "";

  useEffect(function () {
    try { var t = localStorage.getItem("sf_tema") || "light"; setTema(t); } catch (e) {}
    setTimeout(function () { setLoaded(true); }, 80);
    supabase.auth.getSession().then(function (r) {
      if (r.data && r.data.session) { var u = r.data.session.user; setUser(u); yukle(u); }
    });
    supabase.auth.onAuthStateChange(function (_, session) {
      if (session) { setUser(session.user); yukle(session.user); }
      else { setUser(null); setProfil(null); }
    });
  }, []);

  function yukle(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(function (r) {
      if (r.data) { setProfil(r.data); setYeniUsername(r.data.username || ""); setYeniBio(r.data.bio || ""); setYeniLink(r.data.website || ""); }
    });
    supabase.from("senaryolar").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).then(function (r) { if (r.data) setKonular(r.data); });
    supabase.from("gonderiler").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).then(function (r) { if (r.data) setGonderiler(r.data); });
    supabase.from("takipler").select("*", { count: "exact" }).eq("takip_edilen", u.id).then(function (r) { setTakipci(r.count || 0); });
    supabase.from("takipler").select("*", { count: "exact" }).eq("takip_eden", u.id).then(function (r) { setTakip(r.count || 0); });
  }

  async function avatarYukle(e) {
    var file = e.target.files[0]; if (!file || !user) return;
    setAvatarYuk(true);
    try {
      var fd = new FormData(); fd.append("file", file); fd.append("upload_preset", "scriptify_avatars");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var data = await res.json();
      if (data.secure_url) { await supabase.from("profiles").upsert({ id: user.id, avatar_url: data.secure_url }); setProfil(function (p) { return { ...p, avatar_url: data.secure_url }; }); }
    } catch (e) {}
    setAvatarYuk(false);
  }

  async function bannerYukle(e) {
    var file = e.target.files[0]; if (!file || !user) return;
    try {
      var fd = new FormData(); fd.append("file", file); fd.append("upload_preset", "scriptify_avatars");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var data = await res.json();
      if (data.secure_url) { await supabase.from("profiles").upsert({ id: user.id, banner_url: data.secure_url }); setProfil(function (p) { return { ...p, banner_url: data.secure_url }; }); }
    } catch (e) {}
  }

  async function profilKaydet() {
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, username: yeniUsername, bio: yeniBio, website: yeniLink });
    setProfil(function (p) { return { ...p, username: yeniUsername, bio: yeniBio, website: yeniLink }; });
    setDuzenle(false);
  }

  function temaToggle() {
    var t = dk ? "light" : "dark"; setTema(t);
    try { localStorage.setItem("sf_tema", t); } catch (e) {}
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60) return d + "s önce";
    if (d < 3600) return Math.floor(d / 60) + "dk önce";
    if (d < 86400) return Math.floor(d / 3600) + "sa önce";
    return Math.floor(d / 86400) + "g önce";
  }

  if (!loaded) return null;

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: dk ? "#080f1c" : "#eef2f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>🔐</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: dk ? "#f1f5f9" : "#0f172a", marginBottom: 16 }}>Giriş yapmalısın</p>
          <button onClick={function () { window.location.href = "/"; }} style={{ background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", borderRadius: 12, padding: "11px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Ana Sayfaya Dön</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", opacity: loaded ? 1 : 0, transition: "opacity 0.3s", paddingBottom: 90 }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        input::placeholder,textarea::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}
        a{text-decoration:none;color:inherit;}
        button{font-family:inherit;}
      `}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.93)" : "rgba(238,242,247,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={function () { setDrawer(true); }} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "2px solid " + TEAL + "40" }}>
            {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1 }}>Scriptify</p>
            <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 1 }}>@{username}</p>
          </div>
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={function () { setDuzenle(!duzenle); }} style={{ background: duzenle ? ACCENT : C.input, border: "1px solid " + (duzenle ? ACCENT : C.border), borderRadius: 10, padding: "7px 16px", color: duzenle ? "#fff" : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>{duzenle ? "İptal" : "Düzenle"}</button>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Banner */}
        <div style={{ position: "relative", height: 160, background: profil && profil.banner_url ? "transparent" : "linear-gradient(135deg," + TEAL + "40," + ACCENT + "20)", overflow: "hidden", cursor: "pointer" }} onClick={function () { bannerRef.current && bannerRef.current.click(); }}>
          {profil && profil.banner_url && <img src={profil.banner_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {avatarYuk
              ? <div style={{ width: 28, height: 28, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              : <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 10, padding: "7px 14px", color: "#fff", fontSize: 12, fontWeight: 600 }}>📷 Kapak Değiştir</div>}
          </div>
          <input ref={bannerRef} type="file" accept="image/*" onChange={bannerYukle} style={{ display: "none" }} />
        </div>

        <div style={{ padding: "0 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: -44, marginBottom: 14 }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={function () { avatarRef.current && avatarRef.current.click(); }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "4px solid " + C.bg, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>
                {avatarYuk
                  ? <div style={{ width: 26, height: 26, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  : avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
              </div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: "2px solid " + C.bg, color: "#fff" }}>✏</div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={avatarYukle} style={{ display: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={function () { window.location.href = "/mesajlar"; }} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 20, padding: "8px 18px", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>💬 Mesaj</button>
              <button onClick={function () { supabase.auth.signOut().then(function () { window.location.href = "/"; }); }} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 20, padding: "8px 14px", color: C.muted, fontSize: 13, cursor: "pointer" }}>Çıkış</button>
            </div>
          </div>

          {!duzenle ? (
            <div style={{ marginBottom: 18 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{username}</h1>
              {user && <p style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{user.email}</p>}
              {profil && profil.bio && <p style={{ fontSize: 15, lineHeight: 1.6, color: C.text, marginBottom: 6 }}>{profil.bio}</p>}
              {profil && profil.website && <a href={profil.website} target="_blank" style={{ fontSize: 13, color: TEAL, fontWeight: 600 }}>🔗 {profil.website.replace(/https?:\/\//, "")}</a>}
            </div>
          ) : (
            <div style={{ marginBottom: 18 }}>
              <input value={yeniUsername} onChange={function (e) { setYeniUsername(e.target.value); }} placeholder="kullanici_adi" style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", marginBottom: 8, fontFamily: "inherit" }} />
              <textarea value={yeniBio} onChange={function (e) { setYeniBio(e.target.value); }} placeholder="Kendini anlat..." rows={3} style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", marginBottom: 8 }} />
              <input value={yeniLink} onChange={function (e) { setYeniLink(e.target.value); }} placeholder="https://web-siten.com" style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", marginBottom: 12, fontFamily: "inherit" }} />
              <button onClick={profilKaydet} style={{ width: "100%", padding: "11px", borderRadius: 12, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Kaydet</button>
            </div>
          )}

          {/* İstatistikler */}
          <div style={{ display: "flex", marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid " + C.border }}>
            {[{ val: konular.length, label: "Senaryo" }, { val: gonderiler.length, label: "Gönderi" }, { val: takipci, label: "Takipçi" }, { val: takip, label: "Takip" }].map(function (s, i) {
              return (
                <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRight: i < 3 ? "1px solid " + C.border : "none" }}>
                  <p style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 2 }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", marginBottom: 18, borderBottom: "1px solid " + C.border }}>
            {[{ id: "gonderiler", label: "Gönderiler" }, { id: "senaryolar", label: "Senaryolar" }].map(function (t) {
              var isActive = tab === t.id;
              return (
                <button key={t.id} onClick={function () { setTab(t.id); }} style={{ flex: 1, padding: "12px 8px", background: "none", border: "none", borderBottom: isActive ? "2px solid " + TEAL : "2px solid transparent", color: isActive ? TEAL : C.muted, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", marginBottom: "-1px" }}>{t.label}</button>
              );
            })}
          </div>

          {tab === "gonderiler" && (
            <div>
              {gonderiler.length === 0
                ? <div style={{ textAlign: "center", padding: "60px 0" }}><p style={{ fontSize: 40 }}>📭</p><p style={{ fontSize: 14, color: C.muted, marginTop: 10 }}>Henüz gönderi yok.</p></div>
                : gonderiler.map(function (g) {
                  return (
                    <div key={g.id} style={{ borderBottom: "1px solid " + C.border, padding: "14px 0" }}>
                      <span style={{ fontSize: 11, color: C.muted }}>{zaman(g.created_at)}</span>
                      {g.metin && <p style={{ fontSize: 15, lineHeight: 1.65, color: C.text, margin: "6px 0", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{g.metin}</p>}
                      {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", borderRadius: 14, maxHeight: 280, objectFit: "cover" }} alt="" />}
                      <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>♥ {g.begeni_sayisi || 0}</p>
                    </div>
                  );
                })}
            </div>
          )}

          {tab === "senaryolar" && (
            <div>
              {konular.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <p style={{ fontSize: 40, marginBottom: 10 }}>🎬</p>
                  <p style={{ fontSize: 14, color: C.muted, marginBottom: 18 }}>Henüz senaryo üretmedin.</p>
                  <button onClick={function () { window.location.href = "/uret"; }} style={{ background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Senaryo Üret →</button>
                </div>
              ) : konular.map(function (k) {
                return (
                  <div key={k.id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: "16px 18px", marginBottom: 10, boxShadow: C.shadow }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: TEAL + "15", color: TEAL }}>{k.tip}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: C.input, color: C.muted }}>{k.tur}</span>
                      {k.paylasim_acik && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>🌍 Paylaşık</span>}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 4 }}>{k.baslik}</h3>
                    {k.tagline && <p style={{ fontSize: 12, fontStyle: "italic", color: C.muted, marginBottom: 4 }}>{k.tagline}</p>}
                    {k.ana_fikir && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{k.ana_fikir.slice(0, 120)}{k.ana_fikir.length > 120 ? "..." : ""}</p>}
                    <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>♥ {k.begeni_sayisi || 0} · {zaman(k.created_at)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {[{ icon: "🏠", href: "/" }, { icon: "🔭", href: "/kesfet" }, { icon: "🎭", href: "/topluluk" }, { icon: "💬", href: "/mesajlar" }].map(function (item) {
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", padding: "6px 24px", borderRadius: 14, textDecoration: "none" }}>
              <span style={{ fontSize: 26, filter: "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
            </a>
          );
        })}
      </div>

      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={function () { setDrawer(false); }} onTema={function () { var t = dk ? "light" : "dark"; setTema(t); try { localStorage.setItem("sf_tema", t); } catch (e) {} }} />}
    </div>
  );
}
