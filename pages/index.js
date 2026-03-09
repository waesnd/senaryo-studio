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

var DRAWER_MENU = [
  { icon: "🏠", label: "Ana Sayfa", href: "/" },
  { icon: "🎬", label: "Senaryo Üret", href: "/uret", badge: "AI" },
  { icon: "🔭", label: "Keşfet", href: "/kesfet" },
  { icon: "🎭", label: "Topluluk", href: "/topluluk" },
  { icon: "💬", label: "Mesajlar", href: "/mesajlar" },
];

export default function Home() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [gonderiler, setGonderiler] = useState([]);
  var [trendler, setTrendler] = useState([]);
  var [onerilenler, setOnerilenler] = useState([]);
  var [tema, setTema] = useState("light");
  var [gonderiMetin, setGonderiMetin] = useState("");
  var [gonderiAcik, setGonderiAcik] = useState(false);
  var [foto, setFoto] = useState(null);
  var [fotoUrl, setFotoUrl] = useState(null);
  var [gonderiYuk, setGonderiYuk] = useState(false);
  var [begeniler, setBegeniler] = useState([]);
  var [kaydedilenler, setKaydedilenler] = useState([]);
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
  var fileRef = useRef(null);

  var dk = tema === "dark";
  var C = getC(dk);
  var aktifPath = typeof window !== "undefined" ? window.location.pathname : "/";

  useEffect(function () {
    var t = localStorage.getItem("sf_tema") || "light";
    setTema(t);
    setTimeout(function () { setLoaded(true); }, 60);
    supabase.auth.getSession().then(function (r) {
      if (r.data && r.data.session) {
        var u = r.data.session.user;
        setUser(u);
        yukleProfilVeVeriler(u);
      } else { yukleVeriler(); }
    });
    supabase.auth.onAuthStateChange(function (_, session) {
      if (session) { setUser(session.user); yukleProfilVeVeriler(session.user); }
      else { setUser(null); setProfil(null); }
    });
  }, []);

  function yukleProfilVeVeriler(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(function (r) {
      if (r.data) setProfil(r.data);
    });
    yukleVeriler();
  }

  function yukleVeriler() {
    supabase.from("gonderiler").select("*, profiles(username, avatar_url)")
      .order("created_at", { ascending: false }).limit(40)
      .then(function (r) { if (r.data) setGonderiler(r.data); });
    supabase.from("senaryolar").select("baslik, tur, begeni_sayisi")
      .eq("paylasim_acik", true).order("begeni_sayisi", { ascending: false }).limit(5)
      .then(function (r) { if (r.data) setTrendler(r.data); });
    supabase.from("profiles").select("id, username, avatar_url").limit(4)
      .then(function (r) { if (r.data) setOnerilenler(r.data); });
  }

  function temaToggle() {
    var t = dk ? "light" : "dark";
    setTema(t);
    localStorage.setItem("sf_tema", t);
  }

  async function gonderiPaylas() {
    if (!user) { setAuthModal(true); return; }
    if (!gonderiMetin.trim() && !foto) return;
    setGonderiYuk(true);
    var fUrl = null;
    if (foto) {
      var fd = new FormData();
      fd.append("file", foto);
      fd.append("upload_preset", "scriptify_posts");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var d = await res.json();
      fUrl = d.secure_url || null;
    }
    await supabase.from("gonderiler").insert([{ user_id: user.id, metin: gonderiMetin, fotograf_url: fUrl }]);
    setGonderiMetin(""); setFoto(null); setFotoUrl(null); setGonderiAcik(false);
    setGonderiYuk(false);
    yukleVeriler();
  }

  async function begeniToggle(id, sayi) {
    if (!user) { setAuthModal(true); return; }
    if (begeniler.includes(id)) return;
    setBegeniler(function (p) { return [...p, id]; });
    await supabase.from("gonderiler").update({ begeni_sayisi: sayi + 1 }).eq("id", id);
    setGonderiler(function (p) { return p.map(function (g) { return g.id === id ? { ...g, begeni_sayisi: sayi + 1 } : g; }); });
  }

  async function kaydetToggle(id) {
    if (!user) { setAuthModal(true); return; }
    if (kaydedilenler.includes(id)) {
      setKaydedilenler(function (p) { return p.filter(function (k) { return k !== id; }); });
      await supabase.from("kaydedilenler").delete().eq("user_id", user.id).eq("gonderi_id", id);
    } else {
      setKaydedilenler(function (p) { return [...p, id]; });
      await supabase.from("kaydedilenler").insert([{ user_id: user.id, gonderi_id: id }]);
    }
  }

  async function yorumAc(id) {
    if (yorumId === id) { setYorumId(null); return; }
    setYorumId(id);
    var r = await supabase.from("yorumlar").select("*, profiles(username, avatar_url)")
      .eq("gonderi_id", id).order("created_at", { ascending: true });
    if (r.data) setYorumlar(function (p) { return { ...p, [id]: r.data }; });
  }

  async function yorumGonder(id) {
    if (!user) { setAuthModal(true); return; }
    if (!yorumMetin.trim()) return;
    await supabase.from("yorumlar").insert([{ user_id: user.id, gonderi_id: id, metin: yorumMetin }]);
    setYorumMetin("");
    var r = await supabase.from("yorumlar").select("*, profiles(username, avatar_url)")
      .eq("gonderi_id", id).order("created_at", { ascending: true });
    if (r.data) setYorumlar(function (p) { return { ...p, [id]: r.data }; });
  }

  async function gonderiSil(id) {
    await supabase.from("gonderiler").delete().eq("id", id);
    setGonderiler(function (p) { return p.filter(function (g) { return g.id !== id; }); });
  }

  async function authIslem() {
    if (!authEmail || !authPass) return;
    setAuthYuk(true);
    if (authMode === "giris") {
      var r = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
      if (r.error) { alert(r.error.message); setAuthYuk(false); return; }
    } else {
      var r2 = await supabase.auth.signUp({ email: authEmail, password: authPass });
      if (r2.error) { alert(r2.error.message); setAuthYuk(false); return; }
      alert("E-postanı onayla!");
    }
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

  var avatarUrl = profil && profil.avatar_url;
  var username = profil && profil.username ? profil.username : user ? user.email.split("@")[0] : null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
        @keyframes slideIn{from{transform:translateX(-100%);opacity:0;}to{transform:translateX(0);opacity:1;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        input::placeholder,textarea::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}
        a{text-decoration:none;color:inherit;}
        button{font-family:inherit;cursor:pointer;}
        .feed-kart{transition:box-shadow 0.2s ease;}
        .feed-kart:hover{box-shadow:0 4px 28px rgba(8,145,178,0.1) !important;}
        .aksiyon-btn{transition:all 0.15s ease;}
        .aksiyon-btn:hover{color:${TEAL} !important;background:${TEAL}10 !important;}
        @media(max-width:768px){
          .desktop-sidebar{display:none !important;}
          .desktop-right{display:none !important;}
          .feed-container{padding-bottom:90px !important;}
        }
        @media(min-width:769px){
          .mobile-topbar{display:none !important;}
          .mobile-bottomnav{display:none !important;}
        }
      `}</style>

      {/* ═══ MASAÜSTÜ LAYOUT ═══ */}
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "240px minmax(0,1fr) 300px", minHeight: "100vh" }}>

        {/* Sol sidebar - masaüstü */}
        <aside className="desktop-sidebar" style={{ position: "sticky", top: 0, height: "100vh", borderRight: "1px solid " + C.border, background: C.metalGrad, display: "flex", flexDirection: "column", padding: "20px 14px", overflowY: "auto" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 14, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: `0 4px 16px ${ACCENT}40`, flexShrink: 0 }}>🎬</div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em", color: C.text, lineHeight: 1 }}>Scriptify</p>
              <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 2 }}>Yaratıcı platform</p>
            </div>
          </a>
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            {DRAWER_MENU.map(function (item) {
              var isActive = aktifPath === item.href;
              return (
                <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 13px", borderRadius: 12, color: isActive ? TEAL : C.text, background: isActive ? TEAL + "15" : "transparent", fontWeight: isActive ? 700 : 500, fontSize: 14, border: "1px solid " + (isActive ? TEAL + "30" : "transparent"), transition: "all 0.15s" }}>
                  <span style={{ fontSize: 18, width: 22, textAlign: "center" }}>{item.icon}</span>
                  {item.label}
                  {item.badge && <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
                </a>
              );
            })}
            <button onClick={function () { user ? setGonderiAcik(true) : setAuthModal(true); }} style={{ marginTop: 10, width: "100%", padding: "11px", borderRadius: 12, background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 16px ${TEAL}40` }}>+ Paylaş</button>
          </nav>
          <div style={{ borderTop: "1px solid " + C.border, paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <button onClick={temaToggle} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 12, fontWeight: 600 }}>
              <span>{dk ? "☀️" : "🌙"}</span>{dk ? "Açık Tema" : "Koyu Tema"}
            </button>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: C.input, border: "1px solid " + C.border, cursor: "pointer" }} onClick={function () { window.location.href = "/profil"; }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                  {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{username}</p>
                  <button onClick={function (e) { e.stopPropagation(); supabase.auth.signOut(); }} style={{ fontSize: 10, color: C.muted, background: "none", border: "none", padding: 0 }}>Çıkış yap</button>
                </div>
              </div>
            ) : (
              <button onClick={function () { setAuthModal(true); }} style={{ padding: "10px 12px", borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700 }}>Giriş Yap</button>
            )}
          </div>
        </aside>

        {/* Orta feed */}
        <main style={{ borderRight: "1px solid " + C.border, minHeight: "100vh" }}>

          {/* Mobil topbar */}
          <div className="mobile-topbar" style={{ position: "sticky", top: 0, zIndex: 20, background: dk ? "rgba(8,15,28,0.92)" : "rgba(238,242,247,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* Sol: avatar → drawer */}
            <button onClick={function () { setDrawer(true); }} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: `0 2px 10px ${TEAL}30`, border: "2px solid " + (dk ? "rgba(255,255,255,0.1)" : "rgba(8,145,178,0.2)") }}>
                {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
              </div>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", lineHeight: 1 }}>Scriptify</p>
                {user && <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 1 }}>@{username}</p>}
              </div>
            </button>

            {/* Sağ: tema + giriş/paylaş */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={temaToggle} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "7px 10px", color: C.muted, fontSize: 13 }}>{dk ? "☀️" : "🌙"}</button>
              {user
                ? <button onClick={function () { setGonderiAcik(true); }} style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", borderRadius: 20, padding: "7px 16px", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 3px 12px ${TEAL}35` }}>+ Paylaş</button>
                : <button onClick={function () { setAuthModal(true); }} style={{ background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", borderRadius: 20, padding: "7px 16px", color: "#fff", fontSize: 12, fontWeight: 700, boxShadow: `0 3px 12px ${ACCENT}35` }}>Giriş</button>
              }
            </div>
          </div>

          {/* Masaüstü header */}
          <div className="desktop-sidebar" style={{ position: "sticky", top: 0, zIndex: 10, background: dk ? "rgba(8,15,28,0.9)" : "rgba(238,242,247,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "13px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Ana Sayfa</h1>
            <button onClick={function () { yukleVeriler(); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 14, padding: "4px 8px", borderRadius: 8 }}>↻</button>
          </div>

          <div className="feed-container" style={{ paddingBottom: 20 }}>
            {/* Senaryo Üret kartı */}
            <div style={{ padding: "16px 20px 0" }}>
              <a href="/uret" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 18, background: dk ? `linear-gradient(135deg, ${TEAL}18, ${ACCENT}10)` : `linear-gradient(135deg, ${TEAL}10, ${ACCENT}07)`, border: `1px solid ${TEAL}30`, transition: "all 0.2s", boxShadow: `0 4px 20px ${TEAL}15` }}
                onMouseEnter={function (e) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${TEAL}25`; }}
                onMouseLeave={function (e) { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 20px ${TEAL}15`; }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, boxShadow: `0 4px 16px ${ACCENT}35` }}>🎬</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: ACCENT, marginBottom: 3, letterSpacing: "-0.01em" }}>Senaryo Üret</p>
                  <p style={{ fontSize: 12, color: C.muted }}>AI ile film & dizi konusu oluştur → topluluğa paylaş</p>
                </div>
                <div style={{ background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, borderRadius: 20, padding: "7px 16px", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0, boxShadow: `0 3px 12px ${ACCENT}35` }}>Üret →</div>
              </a>
            </div>

            {/* Gönderi yaz */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid " + C.border, background: C.surface, marginTop: 14, borderTop: "1px solid " + C.border }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, cursor: "pointer" }} onClick={function () { window.location.href = "/profil"; }}>
                  {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                </div>
                <div style={{ flex: 1 }}>
                  <textarea value={gonderiMetin} onChange={function (e) { setGonderiMetin(e.target.value); }} onFocus={function () { if (!user) { setAuthModal(true); } else { setGonderiAcik(true); } }} placeholder="Ne düşünüyorsun?" rows={gonderiAcik ? 3 : 1} style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 15, color: C.text, fontFamily: "inherit", lineHeight: 1.55 }} />
                  {fotoUrl && (
                    <div style={{ position: "relative", marginTop: 8 }}>
                      <img src={fotoUrl} style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />
                      <button onClick={function () { setFoto(null); setFotoUrl(null); }} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 26, height: 26, color: "#fff", fontSize: 12 }}>✕</button>
                    </div>
                  )}
                  {gonderiAcik && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 10, borderTop: "1px solid " + C.border }}>
                      <button onClick={function () { fileRef.current && fileRef.current.click(); }} style={{ background: "none", border: "none", color: TEAL, fontSize: 13, fontWeight: 600, padding: "5px 8px", borderRadius: 8 }}>📷</button>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={function () { setGonderiAcik(false); setGonderiMetin(""); setFoto(null); setFotoUrl(null); }} style={{ background: "none", border: "1px solid " + C.border, borderRadius: 20, padding: "6px 14px", color: C.muted, fontSize: 12 }}>İptal</button>
                        <button onClick={gonderiPaylas} disabled={gonderiYuk || (!gonderiMetin.trim() && !foto)} style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", borderRadius: 20, padding: "7px 18px", color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: `0 3px 12px ${TEAL}35`, opacity: (!gonderiMetin.trim() && !foto) ? 0.5 : 1 }}>
                          {gonderiYuk ? "..." : "Paylaş"}
                        </button>
                      </div>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" onChange={function (e) { var f = e.target.files[0]; if (f) { setFoto(f); setFotoUrl(URL.createObjectURL(f)); setGonderiAcik(true); } }} style={{ display: "none" }} />
                </div>
              </div>
            </div>

            {/* Gönderiler */}
            {gonderiler.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeUp 0.4s ease" }}>
                <p style={{ fontSize: 44, marginBottom: 14 }}>📭</p>
                <p style={{ fontSize: 15, color: C.muted, marginBottom: 20 }}>Henüz gönderi yok.</p>
                <button onClick={function () { user ? setGonderiAcik(true) : setAuthModal(true); }} style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700 }}>İlk paylaşımı yap →</button>
              </div>
            ) : gonderiler.map(function (g, i) {
              var yorumAcik = yorumId === g.id;
              var benimMi = user && g.user_id === user.id;
              var begendi = begeniler.includes(g.id);
              var kaydetti = kaydedilenler.includes(g.id);
              return (
                <div key={g.id} className="feed-kart" style={{ borderBottom: "1px solid " + C.border, padding: "16px 20px", background: C.surface, animation: `fadeUp 0.3s ${Math.min(i * 0.04, 0.25)}s both ease` }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, cursor: "pointer" }} onClick={function () { window.location.href = "/profil"; }}>
                      {g.profiles && g.profiles.avatar_url ? <img src={g.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>@{g.profiles ? g.profiles.username || "anonim" : "anonim"}</span>
                          <span style={{ fontSize: 12, color: C.muted }}>· {zaman(g.created_at)}</span>
                        </div>
                        {benimMi && <button onClick={function () { gonderiSil(g.id); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 13, padding: "2px 6px", borderRadius: 6, opacity: 0.5 }}>✕</button>}
                      </div>
                      {g.metin && <p style={{ fontSize: 15, lineHeight: 1.65, color: C.text, marginBottom: g.fotograf_url ? 10 : 0, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{g.metin}</p>}
                      {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", borderRadius: 14, maxHeight: 420, objectFit: "cover", marginTop: 4, display: "block" }} />}
                      <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 10 }}>
                        <button className="aksiyon-btn" onClick={function () { yorumAc(g.id); }} style={{ display: "flex", alignItems: "center", gap: 5, background: yorumAcik ? TEAL + "10" : "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: yorumAcik ? TEAL : C.muted, fontSize: 12, fontWeight: 600 }}>
                          <span style={{ fontSize: 14 }}>💬</span><span>{(yorumlar[g.id] || []).length || ""}</span>
                        </button>
                        <button className="aksiyon-btn" style={{ background: "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: C.muted, fontSize: 14 }}>🔁</button>
                        <button className="aksiyon-btn" onClick={function () { begeniToggle(g.id, g.begeni_sayisi || 0); }} style={{ display: "flex", alignItems: "center", gap: 5, background: begendi ? ACCENT + "10" : "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: begendi ? ACCENT : C.muted, fontSize: 12 }}>
                          <span style={{ fontSize: 14 }}>{begendi ? "❤️" : "♡"}</span><span>{g.begeni_sayisi || ""}</span>
                        </button>
                        <button className="aksiyon-btn" onClick={function () { kaydetToggle(g.id); }} style={{ background: kaydetti ? TEAL + "10" : "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: kaydetti ? TEAL : C.muted, fontSize: 14 }}>
                          {kaydetti ? "🔖" : "🏷️"}
                        </button>
                        <button className="aksiyon-btn" onClick={function () { navigator.clipboard.writeText(window.location.origin); }} style={{ background: "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: C.muted, fontSize: 14, marginLeft: "auto" }}>↗</button>
                      </div>
                      {yorumAcik && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.border, animation: "fadeUp 0.2s ease" }}>
                          <div style={{ maxHeight: 160, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                            {!(yorumlar[g.id] && yorumlar[g.id].length) && <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "8px 0" }}>İlk yorumu sen yap! ✨</p>}
                            {(yorumlar[g.id] || []).map(function (y) {
                              return (
                                <div key={y.id} style={{ display: "flex", gap: 8 }}>
                                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, overflow: "hidden" }}>
                                    {y.profiles && y.profiles.avatar_url ? <img src={y.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                                  </div>
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
                            <button onClick={function () { yorumGonder(g.id); }} style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", borderRadius: 20, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 700 }}>→</button>
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

        {/* Sağ panel - masaüstü */}
        <aside className="desktop-right" style={{ padding: "22px 18px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: C.muted, pointerEvents: "none" }}>🔍</span>
            <input placeholder="Scriptify'da ara..." style={{ width: "100%", background: C.surface, border: "1px solid " + C.border, borderRadius: 22, padding: "10px 14px 10px 36px", color: C.text, fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ background: C.metalGrad, border: "1px solid " + C.border, borderRadius: 20, padding: "18px", marginBottom: 14, boxShadow: C.shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text }}>🔥 Trend Senaryolar</h3>
              <a href="/topluluk" style={{ fontSize: 11, color: TEAL, fontWeight: 600 }}>Tümü →</a>
            </div>
            {trendler.length === 0 ? <p style={{ fontSize: 12, color: C.muted }}>Henüz trend yok.</p>
              : trendler.map(function (k, i) {
                return (
                  <a key={i} href="/topluluk" style={{ display: "block", padding: "8px 0", borderBottom: i < trendler.length - 1 ? "1px solid " + C.border : "none" }}>
                    <p style={{ fontSize: 10, color: TEAL, marginBottom: 2, fontWeight: 600 }}>#{i + 1} · {k.tur}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{k.baslik}</p>
                    <p style={{ fontSize: 11, color: ACCENT, fontWeight: 600 }}>♥ {k.begeni_sayisi || 0}</p>
                  </a>
                );
              })}
          </div>
          <div style={{ background: C.metalGrad, border: "1px solid " + C.border, borderRadius: 20, padding: "18px", boxShadow: C.shadow }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 14 }}>👥 Önerilen</h3>
            {onerilenler.map(function (u, i) {
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < onerilenler.length - 1 ? 12 : 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                    {u.avatar_url ? <img src={u.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                  </div>
                  <p style={{ flex: 1, fontSize: 13, fontWeight: 700, color: C.text }}>@{u.username || "kullanici"}</p>
                  <button style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 20, padding: "4px 12px", color: C.text, fontSize: 11, fontWeight: 700 }}
                    onMouseEnter={function (e) { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = TEAL; }}
                    onMouseLeave={function (e) { e.currentTarget.style.background = C.input; e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.border; }}>Takip</button>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* ═══ MOBİL ALT NAV ═══ */}
      <div className="mobile-bottomnav" style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around", alignItems: "center", boxShadow: "0 -4px 30px rgba(0,0,0,0.1)" }}>
        {[
          { icon: "🏠", href: "/" },
          { icon: "🔭", href: "/kesfet" },
          { icon: "🎭", href: "/topluluk" },
          { icon: "💬", href: "/mesajlar" },
        ].map(function (item) {
          var isActive = aktifPath === item.href;
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 24px", borderRadius: 14, textDecoration: "none", position: "relative", background: isActive ? (dk ? "rgba(8,145,178,0.14)" : "rgba(8,145,178,0.09)") : "transparent", transition: "all 0.2s" }}>
              <span style={{ fontSize: 26, lineHeight: 1, filter: isActive ? "none" : "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
              {isActive && <div style={{ position: "absolute", bottom: 3, width: 20, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>

      {/* ═══ YAN PANEL (DRAWER) ═══ */}
      {drawer && (
        <>
          {/* Backdrop */}
          <div onClick={function () { setDrawer(false); }} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
          
          {/* Panel */}
          <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201, width: 300, background: dk ? "#0d1627" : "#fff", boxShadow: "4px 0 40px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", animation: "slideIn 0.28s cubic-bezier(0.34,1.2,0.64,1)" }}>
            
            {/* Üst gradient şerit */}
            <div style={{ height: 4, background: `linear-gradient(90deg, ${ACCENT}, ${TEAL}, ${TEAL_L})`, flexShrink: 0 }} />

            {/* Profil alanı */}
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid " + C.border, flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: `0 4px 16px ${TEAL}30`, cursor: "pointer", border: `3px solid ${dk ? "#0d1627" : "#fff"}`, outline: `2px solid ${TEAL}30` }} onClick={function () { setDrawer(false); window.location.href = "/profil"; }}>
                  {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                </div>
                <button onClick={function () { setDrawer(false); }} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 10px", color: C.muted, fontSize: 14 }}>✕</button>
              </div>
              {user ? (
                <div>
                  <p style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", marginBottom: 2 }}>@{username}</p>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>{user.email}</p>
                  <div style={{ display: "flex", gap: 16 }}>
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
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>Giriş yapılmadı</p>
                  <p style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Topluluğa katılmak için giriş yap</p>
                  <button onClick={function () { setDrawer(false); setAuthModal(true); }} style={{ width: "100%", padding: "10px", borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 14px ${ACCENT}35` }}>Giriş Yap / Kayıt Ol</button>
                </div>
              )}
            </div>

            {/* Menü */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "12px 12px" }}>
              {DRAWER_MENU.map(function (item) {
                var isActive = aktifPath === item.href;
                return (
                  <a key={item.href} href={item.href} onClick={function () { setDrawer(false); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: isActive ? TEAL : C.text, background: isActive ? TEAL + "12" : "transparent", fontWeight: isActive ? 700 : 500, fontSize: 15, marginBottom: 4, border: "1px solid " + (isActive ? TEAL + "25" : "transparent"), transition: "all 0.15s" }}>
                    <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
                    {isActive && <span style={{ fontSize: 16, color: TEAL }}>›</span>}
                  </a>
                );
              })}

              {/* Profil Ayarları bölümü */}
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + C.border }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", paddingLeft: 14, marginBottom: 8 }}>Hesap</p>
                <a href="/profil" onClick={function () { setDrawer(false); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontWeight: 500, fontSize: 15, marginBottom: 4, transition: "all 0.15s" }}>
                  <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>👤</span>
                  <span>Profil & Ayarlar</span>
                </a>
                <button onClick={function () { temaToggle(); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontWeight: 500, fontSize: 15, marginBottom: 4, background: "none", border: "none", width: "100%", textAlign: "left" }}>
                  <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{dk ? "☀️" : "🌙"}</span>
                  <span>{dk ? "Açık Tema" : "Koyu Tema"}</span>
                </button>
                {user && (
                  <button onClick={function () { supabase.auth.signOut(); setDrawer(false); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: ACCENT, fontWeight: 600, fontSize: 15, background: ACCENT + "08", border: "none", width: "100%", textAlign: "left", marginTop: 4 }}>
                    <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>🚪</span>
                    <span>Çıkış Yap</span>
                  </button>
                )}
              </div>
            </nav>

            {/* Alt imza */}
            <div style={{ padding: "12px 20px 20px", borderTop: "1px solid " + C.border, flexShrink: 0, textAlign: "center" }}>
              <p style={{ fontSize: 11, color: C.muted }}>© 2025 Scriptify · by Öztürk</p>
              <p style={{ fontSize: 11, color: TEAL, fontWeight: 600, marginTop: 2 }}>Sinema severler için ♥</p>
            </div>
          </div>
        </>
      )}

      {/* ═══ AUTH MODAL ═══ */}
      {authModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function () { setAuthModal(false); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "relative", zIndex: 1, background: dk ? "#0f1829" : "#fff", border: "1px solid " + C.border, borderRadius: 24, padding: "32px", maxWidth: 380, width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.3)", animation: "fadeUp 0.3s ease" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${ACCENT}, ${TEAL}, transparent)`, borderRadius: "24px 24px 0 0" }} />
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 14px", boxShadow: `0 8px 24px ${ACCENT}35` }}>🎬</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", marginBottom: 4 }}>Scriptify</h2>
              <p style={{ fontSize: 13, color: C.muted }}>Yaratıcı topluluğa katıl</p>
            </div>
            <button onClick={googleGiris} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "11px", borderRadius: 12, background: C.input, border: "1px solid " + C.border, color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 14 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "#4285f4" }}>G</span>Google ile Devam Et
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>veya</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 14, background: C.input, borderRadius: 12, padding: 4 }}>
              {["giris", "kayit"].map(function (m) {
                return <button key={m} onClick={function () { setAuthMode(m); }} style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none", background: authMode === m ? (dk ? "#1e293b" : "#fff") : "transparent", color: authMode === m ? C.text : C.muted, fontSize: 13, fontWeight: authMode === m ? 700 : 500, boxShadow: authMode === m ? "0 2px 8px rgba(0,0,0,0.1)" : "none" }}>{m === "giris" ? "Giriş Yap" : "Kayıt Ol"}</button>;
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              <input value={authEmail} onChange={function (e) { setAuthEmail(e.target.value); }} placeholder="E-posta" type="email" style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none" }} />
              <input value={authPass} onChange={function (e) { setAuthPass(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter") authIslem(); }} placeholder="Şifre" type="password" style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none" }} />
            </div>
            <button onClick={authIslem} disabled={authYuk} style={{ width: "100%", padding: "12px", borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 18px ${ACCENT}35`, opacity: authYuk ? 0.7 : 1 }}>
              {authYuk ? "..." : authMode === "giris" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
