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

var NAV_ITEMS = [
  { icon: "🏠", href: "/" },
  { icon: "🔭", href: "/kesfet" },
  { icon: "🎭", href: "/topluluk" },
  { icon: "💬", href: "/mesajlar" },
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
    shadow: dk ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.1)",
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
            <div onClick={function () { onClose(); window.location.href = "/profil"; }} style={{ cursor: "pointer" }}>
              <AvatarDiv url={avatarUrl} size={54} fs={22} />
            </div>
            <button onClick={onClose} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 13, cursor: "pointer" }}>✕</button>
          </div>
          {user ? (
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{username}</p>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{user.email}</p>
              <div style={{ display: "flex", gap: 20 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>0</p>
                  <p style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Senaryo</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>0</p>
                  <p style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Takipçi</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>0</p>
                  <p style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Takip</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>Giriş yapılmadı</p>
              <button onClick={function () { onClose(); props.onAuthOpen(); }} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>
            </div>
          )}
        </div>

        <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {DRAWER_MENU.map(function (item) {
            var isActive = item.href === "/";
            return (
              <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: isActive ? TEAL : C.text, background: isActive ? TEAL + "15" : "transparent", fontWeight: isActive ? 700 : 500, fontSize: 15, marginBottom: 4, border: "1px solid " + (isActive ? TEAL + "30" : "transparent"), textDecoration: "none" }}>
                <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
              </a>
            );
          })}

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + C.border }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: 14, marginBottom: 8 }}>Hesap</p>
            <a href="/profil" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontWeight: 500, fontSize: 15, marginBottom: 4, textDecoration: "none" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>👤</span><span>Profil & Ayarlar</span>
            </a>
            <button onClick={onTema} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontWeight: 500, fontSize: 15, marginBottom: 4, background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{dk ? "☀️" : "🌙"}</span>
              <span>{dk ? "Açık Tema" : "Koyu Tema"}</span>
            </button>
            {user && (
              <button onClick={function () { supabase.auth.signOut(); onClose(); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: ACCENT, fontWeight: 600, fontSize: 15, background: ACCENT + "10", border: "none", width: "100%", textAlign: "left", cursor: "pointer", marginTop: 4 }}>
                <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>🚪</span><span>Çıkış Yap</span>
              </button>
            )}
          </div>
        </nav>

        <div style={{ padding: "12px 20px 20px", borderTop: "1px solid " + C.border, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: C.muted }}>© 2025 Scriptify · by Öztürk</p>
          <p style={{ fontSize: 11, color: TEAL, fontWeight: 600, marginTop: 2 }}>Sinema severler için ♥</p>
        </div>
      </div>
    </div>
  );
}

function GonderiModal(props) {
  var dk = props.dk;
  var C = props.C;
  var user = props.user;
  var avatarUrl = props.avatarUrl;
  var onClose = props.onClose;
  var onPaylas = props.onPaylas;
  var [metin, setMetin] = useState("");
  var [foto, setFoto] = useState(null);
  var [fotoUrl, setFotoUrl] = useState(null);
  var [yukleniyor, setYukleniyor] = useState(false);
  var fileRef = useRef(null);

  async function gonder() {
    if (!metin.trim() && !foto) return;
    setYukleniyor(true);
    var fUrl = null;
    if (foto) {
      try {
        var fd = new FormData(); fd.append("file", foto); fd.append("upload_preset", "scriptify_posts");
        var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
        var d = await res.json(); fUrl = d.secure_url || null;
      } catch (e) {}
    }
    await onPaylas(metin, fUrl);
    setMetin(""); setFoto(null); setFotoUrl(null); setYukleniyor(false); onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "relative", zIndex: 1, background: dk ? "#0f1829" : "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px 36px", width: "100%", maxWidth: 600, boxShadow: "0 -20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "0 auto 20px" }} />
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <AvatarDiv url={avatarUrl} size={40} fs={16} />
          <textarea value={metin} onChange={function (e) { setMetin(e.target.value); }} placeholder="Ne düşünüyorsun?" autoFocus rows={4} style={{ flex: 1, background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 16, color: C.text, fontFamily: "inherit", lineHeight: 1.6 }} />
        </div>
        {fotoUrl && (
          <div style={{ position: "relative", marginBottom: 12 }}>
            <img src={fotoUrl} style={{ width: "100%", borderRadius: 14, maxHeight: 200, objectFit: "cover" }} alt="" />
            <button onClick={function () { setFoto(null); setFotoUrl(null); }} style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 28, height: 28, color: "#fff", fontSize: 13, cursor: "pointer" }}>✕</button>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid " + C.border }}>
          <button onClick={function () { fileRef.current && fileRef.current.click(); }} style={{ background: "none", border: "none", color: TEAL, fontSize: 22, cursor: "pointer", padding: "4px 8px" }}>📷</button>
          <input ref={fileRef} type="file" accept="image/*" onChange={function (e) { var f = e.target.files[0]; if (f) { setFoto(f); setFotoUrl(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
          <button onClick={gonder} disabled={yukleniyor || (!metin.trim() && !foto)} style={{ background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", borderRadius: 22, padding: "10px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: (!metin.trim() && !foto) ? 0.5 : 1, boxShadow: "0 4px 16px " + TEAL + "40" }}>
            {yukleniyor ? "..." : "Paylaş"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [gonderiler, setGonderiler] = useState([]);
  var [trendler, setTrendler] = useState([]);
  var [onerilenler, setOnerilenler] = useState([]);
  var [tema, setTema] = useState("light");
  var [feedSekme, setFeedSekme] = useState("son");
  var [bildirimSayisi, setBildirimSayisi] = useState(0);
  var [begeniler, setBegeniler] = useState([]);
  var [yorumId, setYorumId] = useState(null);
  var [yorumMetin, setYorumMetin] = useState("");
  var [yorumlar, setYorumlar] = useState({});
  var [authModal, setAuthModal] = useState(false);
  var [authMode, setAuthMode] = useState("giris");
  var [authEmail, setAuthEmail] = useState("");
  var [authPass, setAuthPass] = useState("");
  var [authYuk, setAuthYuk] = useState(false);
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);
  var [gonderiModal, setGonderiModal] = useState(false);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil && profil.avatar_url ? profil.avatar_url : null;
  var username = profil && profil.username ? profil.username : user ? user.email.split("@")[0] : "";

  useEffect(function () {
    try { var t = localStorage.getItem("sf_tema") || "light"; setTema(t); } catch (e) {}
    setTimeout(function () { setLoaded(true); }, 80);
    supabase.auth.getSession().then(function (r) {
      if (r.data && r.data.session) { var u = r.data.session.user; setUser(u); loadProfil(u); loadBildirim(u); }
      loadFeed("son");
    });
    supabase.auth.onAuthStateChange(function (_, session) {
      if (session) { setUser(session.user); loadProfil(session.user); loadBildirim(session.user); }
      else { setUser(null); setProfil(null); setBildirimSayisi(0); }
    });
  }, []);

  function loadProfil(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(function (r) { if (r.data) setProfil(r.data); });
  }

  function loadBildirim(u) {
    supabase.from("bildirimler").select("*", { count: "exact" }).eq("user_id", u.id).eq("okundu", false)
      .then(function (r) { setBildirimSayisi(r.count || 0); });
  }

  function loadFeed(sekme) {
    var query = supabase.from("gonderiler").select("*, profiles(username, avatar_url)").limit(40);
    if (sekme === "son") query = query.order("created_at", { ascending: false });
    else query = query.order("begeni_sayisi", { ascending: false });
    query.then(function (r) { if (r.data) setGonderiler(r.data); });
    supabase.from("senaryolar").select("baslik, tur, begeni_sayisi").eq("paylasim_acik", true).order("begeni_sayisi", { ascending: false }).limit(5).then(function (r) { if (r.data) setTrendler(r.data); });
    supabase.from("profiles").select("id, username, avatar_url").limit(4).then(function (r) { if (r.data) setOnerilenler(r.data); });
  }

  function sekmeChange(s) {
    setFeedSekme(s);
    loadFeed(s);
  }

  function temaToggle() {
    var t = dk ? "light" : "dark"; setTema(t);
    try { localStorage.setItem("sf_tema", t); } catch (e) {}
  }

  async function gonderiPaylas(metin, fotoUrl) {
    if (!user) return;
    await supabase.from("gonderiler").insert([{ user_id: user.id, metin: metin, fotograf_url: fotoUrl }]);
    loadFeed(feedSekme);
  }

  async function begeniToggle(id, sayi) {
    if (!user) { setAuthModal(true); return; }
    if (begeniler.includes(id)) return;
    setBegeniler(function (p) { return [...p, id]; });
    await supabase.from("gonderiler").update({ begeni_sayisi: (sayi || 0) + 1 }).eq("id", id);
    setGonderiler(function (p) { return p.map(function (g) { return g.id === id ? { ...g, begeni_sayisi: (sayi || 0) + 1 } : g; }); });
  }

  async function yorumAc(id) {
    if (yorumId === id) { setYorumId(null); return; }
    setYorumId(id);
    var r = await supabase.from("yorumlar").select("*, profiles(username, avatar_url)").eq("gonderi_id", id).order("created_at", { ascending: true });
    if (r.data) setYorumlar(function (p) { return { ...p, [id]: r.data }; });
  }

  async function yorumGonder(id) {
    if (!user) { setAuthModal(true); return; }
    if (!yorumMetin.trim()) return;
    await supabase.from("yorumlar").insert([{ user_id: user.id, gonderi_id: id, metin: yorumMetin }]);
    setYorumMetin("");
    var r = await supabase.from("yorumlar").select("*, profiles(username, avatar_url)").eq("gonderi_id", id).order("created_at", { ascending: true });
    if (r.data) setYorumlar(function (p) { return { ...p, [id]: r.data }; });
  }

  async function gonderiSil(id) {
    await supabase.from("gonderiler").delete().eq("id", id);
    setGonderiler(function (p) { return p.filter(function (g) { return g.id !== id; }); });
  }

  async function authIslem() {
    if (!authEmail || !authPass) return;
    setAuthYuk(true);
    var r = authMode === "giris"
      ? await supabase.auth.signInWithPassword({ email: authEmail, password: authPass })
      : await supabase.auth.signUp({ email: authEmail, password: authPass });
    if (r.error) { alert(r.error.message); setAuthYuk(false); return; }
    if (authMode === "kayit") alert("E-postanı onayla!");
    setAuthYuk(false); setAuthModal(false);
  }

  async function googleGiris() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } });
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60) return d + "s";
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g";
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes popIn{from{opacity:0;transform:scale(0.85);}to{opacity:1;transform:scale(1);}}
        input::placeholder,textarea::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}
        a{text-decoration:none;color:inherit;}
        button{font-family:inherit;}
        .fk:hover{box-shadow:0 2px 20px rgba(8,145,178,0.08)!important;}
        @media(max-width:768px){.dsb{display:none!important;}.drg{display:none!important;}.fc{padding-bottom:100px!important;}}
        @media(min-width:769px){.mtb{display:none!important;}.mbn{display:none!important;}.fab{display:none!important;}}
      `}</style>

      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "240px minmax(0,1fr) 300px", minHeight: "100vh" }}>

        {/* MASAÜSTÜ SOL */}
        <aside className="dsb" style={{ position: "sticky", top: 0, height: "100vh", borderRight: "1px solid " + C.border, background: C.metalGrad, display: "flex", flexDirection: "column", padding: "20px 14px", overflowY: "auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 14, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#ff5722)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>🎬</div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, color: C.text, lineHeight: 1 }}>Scriptify</p>
              <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 2 }}>Yaratıcı platform</p>
            </div>
          </a>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            {DRAWER_MENU.map(function (item) {
              var isActive = item.href === "/";
              return (
                <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", borderRadius: 12, color: isActive ? TEAL : C.text, background: isActive ? TEAL + "15" : "transparent", fontWeight: isActive ? 700 : 500, fontSize: 14, border: "1px solid " + (isActive ? TEAL + "30" : "transparent") }}>
                  <span style={{ fontSize: 18, width: 22, textAlign: "center" }}>{item.icon}</span>
                  {item.label}
                  {item.badge && <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
                </a>
              );
            })}
            <button onClick={function () { user ? setGonderiModal(true) : setAuthModal(true); }} style={{ marginTop: 10, width: "100%", padding: "12px", borderRadius: 12, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px " + TEAL + "35" }}>✍️ Paylaş</button>
          </nav>
          <div style={{ borderTop: "1px solid " + C.border, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={temaToggle} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{dk ? "☀️" : "🌙"} {dk ? "Açık Tema" : "Koyu Tema"}</button>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: C.input, border: "1px solid " + C.border, cursor: "pointer" }} onClick={function () { window.location.href = "/profil"; }}>
                <AvatarDiv url={avatarUrl} size={32} fs={14} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{username}</p>
                  <button onClick={function (e) { e.stopPropagation(); supabase.auth.signOut(); }} style={{ fontSize: 10, color: C.muted, background: "none", border: "none", padding: 0, cursor: "pointer" }}>Çıkış yap</button>
                </div>
              </div>
            ) : (
              <button onClick={function () { setAuthModal(true); }} style={{ padding: "10px 12px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>
            )}
          </div>
        </aside>

        {/* ORTA FEED */}
        <main style={{ borderRight: "1px solid " + C.border, minHeight: "100vh" }}>

          {/* MOBİL TOPBAR */}
          <div className="mtb" style={{ position: "sticky", top: 0, zIndex: 20, background: dk ? "rgba(8,15,28,0.93)" : "rgba(238,242,247,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* Sol: avatar → drawer */}
            <button onClick={function () { setDrawer(true); }} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "2px solid " + TEAL + "40" }}>
                {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1, letterSpacing: "-0.02em" }}>Scriptify</p>
                {user && <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 1 }}>@{username}</p>}
              </div>
            </button>

            {/* Sağ: bildirim + senaryo üret */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {user && (
                <a href="/bildirimler" style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: "50%", background: C.input, border: "1px solid " + C.border, textDecoration: "none", fontSize: 16 }}>
                  🔔
                  {bildirimSayisi > 0 && (
                    <span style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: ACCENT, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid " + C.bg }}>{bildirimSayisi}</span>
                  )}
                </a>
              )}
              <a href="/uret" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", textDecoration: "none", boxShadow: "0 3px 12px " + ACCENT + "35" }}>
                <span style={{ fontSize: 14 }}>🎬</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Üret</span>
              </a>
            </div>
          </div>

          {/* MASAÜSTÜ HEADER */}
          <div className="dsb" style={{ position: "sticky", top: 0, zIndex: 10, background: dk ? "rgba(8,15,28,0.9)" : "rgba(238,242,247,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "13px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Ana Sayfa</h1>
          </div>

          {/* FEED SEKMELERİ */}
          <div style={{ display: "flex", borderBottom: "1px solid " + C.border, background: C.surface }}>
            {[{ id: "son", label: "🕐 En Son" }, { id: "trend", label: "🔥 Trend" }].map(function (s) {
              var isActive = feedSekme === s.id;
              return (
                <button key={s.id} onClick={function () { sekmeChange(s.id); }} style={{ flex: 1, padding: "13px 8px", background: "none", border: "none", borderBottom: isActive ? "2px solid " + TEAL : "2px solid transparent", color: isActive ? TEAL : C.muted, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", marginBottom: "-1px", transition: "all 0.15s" }}>
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="fc" style={{ paddingBottom: 20 }}>
            {/* Gönderiler */}
            {gonderiler.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeUp 0.4s ease" }}>
                <p style={{ fontSize: 44, marginBottom: 14 }}>📭</p>
                <p style={{ fontSize: 15, color: C.muted, marginBottom: 20 }}>Henüz gönderi yok.</p>
                <button onClick={function () { user ? setGonderiModal(true) : setAuthModal(true); }} style={{ background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>İlk paylaşımı yap →</button>
              </div>
            ) : gonderiler.map(function (g, i) {
              var yorumAcik = yorumId === g.id;
              var benimMi = user && g.user_id === user.id;
              var begendi = begeniler.includes(g.id);
              var gAv = g.profiles && g.profiles.avatar_url ? g.profiles.avatar_url : null;
              return (
                <div key={g.id} className="fk" style={{ borderBottom: "1px solid " + C.border, padding: "16px 20px", background: C.surface, animation: "fadeUp 0.3s " + Math.min(i * 0.04, 0.2) + "s both ease" }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <a href="/profil" style={{ flexShrink: 0 }}>
                      <AvatarDiv url={gAv} size={40} fs={15} />
                    </a>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>@{g.profiles ? g.profiles.username || "anonim" : "anonim"}</span>
                          <span style={{ fontSize: 12, color: C.muted }}>· {zaman(g.created_at)}</span>
                        </div>
                        {benimMi && <button onClick={function () { gonderiSil(g.id); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", opacity: 0.5 }}>✕</button>}
                      </div>
                      {g.metin && <p style={{ fontSize: 15, lineHeight: 1.65, color: C.text, marginBottom: g.fotograf_url ? 10 : 0, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{g.metin}</p>}
                      {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", borderRadius: 14, maxHeight: 420, objectFit: "cover", marginTop: 4 }} alt="" />}
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10 }}>
                        <button onClick={function () { yorumAc(g.id); }} style={{ display: "flex", alignItems: "center", gap: 5, background: yorumAcik ? TEAL + "10" : "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: yorumAcik ? TEAL : C.muted, fontSize: 12, cursor: "pointer" }}>
                          💬 {(yorumlar[g.id] || []).length || ""}
                        </button>
                        <button onClick={function () { begeniToggle(g.id, g.begeni_sayisi || 0); }} style={{ display: "flex", alignItems: "center", gap: 5, background: begendi ? ACCENT + "10" : "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: begendi ? ACCENT : C.muted, fontSize: 12, cursor: "pointer" }}>
                          {begendi ? "❤️" : "♡"} {g.begeni_sayisi || ""}
                        </button>
                        <button onClick={function () { try { navigator.clipboard.writeText(window.location.href); } catch (e) {} }} style={{ background: "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: C.muted, fontSize: 14, cursor: "pointer", marginLeft: "auto" }}>↗</button>
                      </div>
                      {yorumAcik && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.border }}>
                          <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                            {!(yorumlar[g.id] && yorumlar[g.id].length) && <p style={{ fontSize: 13, color: C.muted, textAlign: "center" }}>İlk yorumu sen yap! ✨</p>}
                            {(yorumlar[g.id] || []).map(function (y) {
                              var yAv = y.profiles && y.profiles.avatar_url ? y.profiles.avatar_url : null;
                              return (
                                <div key={y.id} style={{ display: "flex", gap: 8 }}>
                                  <AvatarDiv url={yAv} size={26} fs={11} />
                                  <div style={{ background: C.input, borderRadius: 10, padding: "7px 11px", flex: 1 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: TEAL }}>@{y.profiles ? y.profiles.username || "?" : "?"} </span>
                                    <span style={{ fontSize: 13, color: C.text }}>{y.metin}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <input value={yorumMetin} onChange={function (e) { setYorumMetin(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); yorumGonder(g.id); } }} placeholder="Yorum yaz..." style={{ flex: 1, background: C.input, border: "1px solid " + C.border, borderRadius: 20, padding: "8px 14px", color: C.text, fontSize: 13, outline: "none" }} />
                            <button onClick={function () { yorumGonder(g.id); }} style={{ background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", borderRadius: 20, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>→</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>

        {/* MASAÜSTÜ SAĞ */}
        <aside className="drg" style={{ padding: "22px 18px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          <input placeholder="🔍 Ara..." style={{ width: "100%", background: C.surface, border: "1px solid " + C.border, borderRadius: 22, padding: "10px 16px", color: C.text, fontSize: 13, outline: "none", marginBottom: 16 }} />
          <div style={{ background: C.metalGrad, border: "1px solid " + C.border, borderRadius: 20, padding: "18px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text }}>🔥 Trend</h3>
              <a href="/topluluk" style={{ fontSize: 11, color: TEAL, fontWeight: 600 }}>Tümü →</a>
            </div>
            {trendler.length === 0 ? <p style={{ fontSize: 12, color: C.muted }}>Henüz yok.</p> : trendler.map(function (k, i) {
              return (
                <a key={i} href="/topluluk" style={{ display: "block", padding: "8px 0", borderBottom: i < trendler.length - 1 ? "1px solid " + C.border : "none" }}>
                  <p style={{ fontSize: 10, color: TEAL, marginBottom: 2, fontWeight: 600 }}>#{i + 1} · {k.tur}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{k.baslik}</p>
                  <p style={{ fontSize: 11, color: ACCENT, fontWeight: 600 }}>♥ {k.begeni_sayisi || 0}</p>
                </a>
              );
            })}
          </div>
          <div style={{ background: C.metalGrad, border: "1px solid " + C.border, borderRadius: 20, padding: "18px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 14 }}>👥 Önerilen</h3>
            {onerilenler.map(function (u, i) {
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < onerilenler.length - 1 ? 12 : 0 }}>
                  <AvatarDiv url={u.avatar_url} size={34} fs={13} />
                  <p style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.text }}>@{u.username || "kullanici"}</p>
                  <button style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 20, padding: "4px 12px", color: C.text, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Takip</button>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* MOBİL ALT NAV */}
      <div className="mbn" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "none", justifyContent: "space-around", alignItems: "center" }}>
        {NAV_ITEMS.map(function (item) {
          var isActive = item.href === "/";
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 24px", borderRadius: 14, textDecoration: "none", position: "relative", background: isActive ? (dk ? "rgba(8,145,178,0.14)" : "rgba(8,145,178,0.09)") : "transparent" }}>
              <span style={{ fontSize: 26, lineHeight: 1, filter: isActive ? "none" : "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
              {isActive && <div style={{ position: "absolute", bottom: 3, width: 20, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>

      {/* FAB - MOBİL PAYLAŞ BUTONU */}
      <button className="fab" onClick={function () { user ? setGonderiModal(true) : setAuthModal(true); }} style={{ position: "fixed", bottom: 85, right: 20, zIndex: 150, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", boxShadow: "0 6px 24px " + TEAL + "50, 0 2px 8px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", animation: "popIn 0.3s ease" }}>
        ✍️
      </button>

      {/* DRAWER */}
      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={function () { setDrawer(false); }} onTema={temaToggle} onAuthOpen={function () { setAuthModal(true); }} />}

      {/* GONDERİ MODAL */}
      {gonderiModal && <GonderiModal dk={dk} C={C} user={user} avatarUrl={avatarUrl} onClose={function () { setGonderiModal(false); }} onPaylas={gonderiPaylas} />}

      {/* AUTH MODAL */}
      {authModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function () { setAuthModal(false); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "relative", zIndex: 1, background: dk ? "#0f1829" : "#fff", border: "1px solid " + C.border, borderRadius: 24, padding: "32px", maxWidth: 380, width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.3)", animation: "popIn 0.3s ease" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg," + ACCENT + "," + TEAL + ",transparent)", borderRadius: "24px 24px 0 0" }} />
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg," + ACCENT + ",#ff5722)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 14px" }}>🎬</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4 }}>Scriptify</h2>
              <p style={{ fontSize: 13, color: C.muted }}>Yaratıcı topluluğa katıl</p>
            </div>
            <button onClick={googleGiris} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "11px", borderRadius: 12, background: C.input, border: "1px solid " + C.border, color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 14, cursor: "pointer" }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#4285f4" }}>G</span>Google ile Devam Et
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} /><span style={{ fontSize: 11, color: C.muted }}>veya</span><div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 14, background: C.input, borderRadius: 12, padding: 4 }}>
              {["giris", "kayit"].map(function (m) {
                return <button key={m} onClick={function () { setAuthMode(m); }} style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none", background: authMode === m ? (dk ? "#1e293b" : "#fff") : "transparent", color: authMode === m ? C.text : C.muted, fontSize: 13, fontWeight: authMode === m ? 700 : 500, cursor: "pointer" }}>{m === "giris" ? "Giriş Yap" : "Kayıt Ol"}</button>;
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              <input value={authEmail} onChange={function (e) { setAuthEmail(e.target.value); }} placeholder="E-posta" type="email" style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none" }} />
              <input value={authPass} onChange={function (e) { setAuthPass(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") authIslem(); }} placeholder="Şifre" type="password" style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none" }} />
            </div>
            <button onClick={authIslem} disabled={authYuk} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: authYuk ? 0.7 : 1 }}>
              {authYuk ? "..." : authMode === "giris" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
