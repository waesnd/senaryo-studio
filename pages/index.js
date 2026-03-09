import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var FONT = "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

var NAV = [
  { icon: "⬡", label: "Ana Sayfa", href: "/", active: true },
  { icon: "◎", label: "Keşfet", href: "/kesfet" },
  { icon: "✦", label: "Senaryo Üret", href: "/uret", badge: "AI" },
  { icon: "◈", label: "Topluluk", href: "/topluluk" },
  { icon: "◇", label: "Mesajlar", href: "/mesajlar" },
  { icon: "○", label: "Profil", href: "/profil" },
];

export default function Home() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [gonderiler, setGonderiler] = useState([]);
  var [trendler, setTrendler] = useState([]);
  var [onerilenler, setOnerilenler] = useState([]);
  var [tema, setTema] = useState("light");
  var [gonderiMetin, setGonderiMetin] = useState("");
  var [gonderiYukleniyor, setGonderiYukleniyor] = useState(false);
  var [gonderiAcik, setGonderiAcik] = useState(false);
  var [foto, setFoto] = useState(null);
  var [fotoUrl, setFotoUrl] = useState(null);
  var [begeniler, setBegeniler] = useState([]);
  var [kaydedilenler, setKaydedilenler] = useState([]);
  var [yorumId, setYorumId] = useState(null);
  var [yorumMetin, setYorumMetin] = useState("");
  var [yorumlar, setYorumlar] = useState({});
  var [authModal, setAuthModal] = useState(false);
  var [authMode, setAuthMode] = useState("giris");
  var [authEmail, setAuthEmail] = useState("");
  var [authPass, setAuthPass] = useState("");
  var [authYukleniyor, setAuthYukleniyor] = useState(false);
  var [loaded, setLoaded] = useState(false);
  var fileRef = useRef(null);

  var dk = tema === "dark";
  var C = {
    bg: dk ? "#0c0c0c" : "#f4f4f0",
    sidebar: dk ? "#111" : "#fff",
    card: dk ? "#181818" : "#fff",
    border: dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dk ? "#f0f0f0" : "#0d0d0d",
    muted: dk ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)",
    input: dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    hover: dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
  };

  useEffect(function() {
    var t = localStorage.getItem("sf_tema") || "light";
    setTema(t);
    setTimeout(function() { setLoaded(true); }, 60);
    supabase.auth.getSession().then(function(r) {
      if (r.data && r.data.session) {
        var u = r.data.session.user;
        setUser(u);
        yukleProfilVeVeriler(u);
      } else {
        yukleVeriler();
      }
    });
    supabase.auth.onAuthStateChange(function(_, session) {
      if (session) {
        setUser(session.user);
        yukleProfilVeVeriler(session.user);
      } else {
        setUser(null);
        setProfil(null);
      }
    });
  }, []);

  function yukleProfilVeVeriler(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(function(r) {
      if (r.data) setProfil(r.data);
    });
    yukleVeriler();
  }

  function yukleVeriler() {
    supabase.from("gonderiler")
      .select("*, profiles(username, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(function(r) { if (r.data) setGonderiler(r.data); });

    supabase.from("senaryolar")
      .select("baslik, tur, begeni_sayisi, created_at")
      .eq("paylasim_acik", true)
      .order("begeni_sayisi", { ascending: false })
      .limit(6)
      .then(function(r) { if (r.data) setTrendler(r.data); });

    supabase.from("profiles")
      .select("id, username, avatar_url")
      .limit(5)
      .then(function(r) { if (r.data) setOnerilenler(r.data); });
  }

  function temaToggle() {
    var t = dk ? "light" : "dark";
    setTema(t);
    localStorage.setItem("sf_tema", t);
  }

  async function gonderiPaylas() {
    if (!user) { setAuthModal(true); return; }
    if (!gonderiMetin.trim() && !foto) return;
    setGonderiYukleniyor(true);
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
    setGonderiYukleniyor(false);
    yukleVeriler();
  }

  async function begeniToggle(id, sayi) {
    if (!user) { setAuthModal(true); return; }
    if (begeniler.includes(id)) return;
    setBegeniler(function(p) { return [...p, id]; });
    await supabase.from("gonderiler").update({ begeni_sayisi: sayi + 1 }).eq("id", id);
    setGonderiler(function(p) { return p.map(function(g) { return g.id === id ? { ...g, begeni_sayisi: sayi + 1 } : g; }); });
  }

  async function kaydetToggle(id) {
    if (!user) { setAuthModal(true); return; }
    if (kaydedilenler.includes(id)) {
      setKaydedilenler(function(p) { return p.filter(function(k) { return k !== id; }); });
      await supabase.from("kaydedilenler").delete().eq("user_id", user.id).eq("gonderi_id", id);
    } else {
      setKaydedilenler(function(p) { return [...p, id]; });
      await supabase.from("kaydedilenler").insert([{ user_id: user.id, gonderi_id: id }]);
    }
  }

  async function yorumAc(id) {
    if (yorumId === id) { setYorumId(null); return; }
    setYorumId(id);
    if (!yorumlar[id]) {
      var r = await supabase.from("yorumlar").select("*, profiles(username, avatar_url)").eq("gonderi_id", id).order("created_at", { ascending: true });
      if (r.data) setYorumlar(function(p) { return { ...p, [id]: r.data }; });
    }
  }

  async function yorumGonder(id) {
    if (!user) { setAuthModal(true); return; }
    if (!yorumMetin.trim()) return;
    var yeniYorum = { user_id: user.id, gonderi_id: id, metin: yorumMetin };
    await supabase.from("yorumlar").insert([yeniYorum]);
    setYorumMetin("");
    var r = await supabase.from("yorumlar").select("*, profiles(username, avatar_url)").eq("gonderi_id", id).order("created_at", { ascending: true });
    if (r.data) setYorumlar(function(p) { return { ...p, [id]: r.data }; });
  }

  async function gonderiSil(id) {
    await supabase.from("gonderiler").delete().eq("id", id);
    setGonderiler(function(p) { return p.filter(function(g) { return g.id !== id; }); });
  }

  async function authIslem() {
    if (!authEmail || !authPass) return;
    setAuthYukleniyor(true);
    if (authMode === "giris") {
      var r = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
      if (r.error) { alert(r.error.message); setAuthYukleniyor(false); return; }
    } else {
      var r2 = await supabase.auth.signUp({ email: authEmail, password: authPass });
      if (r2.error) { alert(r2.error.message); setAuthYukleniyor(false); return; }
      alert("E-posta adresini onayla!");
    }
    setAuthYukleniyor(false);
    setAuthModal(false);
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
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: FONT, opacity: loaded ? 1 : 0, transition: "opacity 0.35s ease" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${ACCENT}55; border-radius: 2px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .nav-link { transition: all 0.15s ease; }
        .nav-link:hover { background: ${C.hover}; color: ${ACCENT} !important; }
        .gonderi-aksiyon { transition: all 0.15s ease; }
        .gonderi-aksiyon:hover { color: ${ACCENT} !important; background: ${ACCENT}10 !important; }
        .kart:hover { box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
        input::placeholder, textarea::placeholder { color: ${C.muted}; }
        a { text-decoration: none; }
        button { font-family: inherit; }
      `}</style>

      <div style={{ maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "240px minmax(0,1fr) 300px", minHeight: "100vh" }}>

        {/* ═══ SOL SIDEBAR ═══ */}
        <aside style={{ position: "sticky", top: 0, height: "100vh", borderRight: "1px solid " + C.border, background: C.sidebar, display: "flex", flexDirection: "column", padding: "24px 16px 20px", overflowY: "auto" }}>
          
          {/* Logo */}
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 14, marginBottom: 28, color: "inherit" }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: `0 4px 14px ${ACCENT}40`, flexShrink: 0 }}>🎬</div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.03em", color: C.text, lineHeight: 1 }}>Scriptify</p>
              <p style={{ fontSize: 10, color: C.muted, fontWeight: 500, marginTop: 2 }}>Yaratıcı platform</p>
            </div>
          </a>

          {/* Nav */}
          <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(function(item) {
              var isActive = typeof window !== "undefined" && window.location.pathname === item.href;
              return (
                <a key={item.href} href={item.href} className="nav-link" style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 12, color: isActive ? ACCENT : C.text, background: isActive ? ACCENT + "10" : "transparent", fontWeight: isActive ? 700 : 500, fontSize: 14, border: "1px solid " + (isActive ? ACCENT + "20" : "transparent") }}>
                  <span style={{ fontSize: 16, width: 22, textAlign: "center", color: isActive ? ACCENT : C.muted }}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: ACCENT, color: "#fff", letterSpacing: "0.05em" }}>{item.badge}</span>}
                </a>
              );
            })}

            {/* Paylaş butonu */}
            <button onClick={function() { user ? setGonderiAcik(true) : setAuthModal(true); }} style={{ marginTop: 12, width: "100%", padding: "11px", borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em", boxShadow: `0 4px 16px ${ACCENT}35` }}>
              + Paylaş
            </button>
          </nav>

          {/* Alt: kullanıcı & tema */}
          <div style={{ borderTop: "1px solid " + C.border, paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={temaToggle} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 10, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", letterSpacing: "0.01em" }}>
              <span style={{ fontSize: 14 }}>{dk ? "☀️" : "🌙"}</span>
              {dk ? "Açık Tema" : "Koyu Tema"}
            </button>
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: C.input, border: "1px solid " + C.border, cursor: "pointer" }} onClick={function() { window.location.href = "/profil"; }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                  {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{username}</p>
                  <button onClick={function(e) { e.stopPropagation(); supabase.auth.signOut(); }} style={{ fontSize: 10, color: C.muted, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}>Çıkış yap</button>
                </div>
              </div>
            ) : (
              <button onClick={function() { setAuthModal(true); }} style={{ padding: "10px 12px", borderRadius: 12, background: C.input, border: "1px solid " + C.border, color: C.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Giriş Yap
              </button>
            )}
          </div>
        </aside>

        {/* ═══ ORTA FEED ═══ */}
        <main style={{ borderRight: "1px solid " + C.border }}>
          
          {/* Feed başlık */}
          <div style={{ position: "sticky", top: 0, zIndex: 10, background: dk ? "rgba(12,12,12,0.9)" : "rgba(244,244,240,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: C.text }}>Ana Sayfa</h1>
            <button onClick={function() { yukleVeriler(); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: "4px 8px", borderRadius: 8 }}>↻</button>
          </div>

          {/* Gönderi yaz */}
          <div style={{ padding: "16px 24px 0", borderBottom: "1px solid " + C.border, background: C.card }}>
            
            {/* Senaryo Üret banner */}
            <a href="/uret" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, background: dk ? `${ACCENT}10` : `${ACCENT}07`, border: `1px solid ${ACCENT}25`, marginBottom: 16, transition: "all 0.2s" }}
              onMouseEnter={function(e) { e.currentTarget.style.background = dk ? `${ACCENT}18` : `${ACCENT}12`; }}
              onMouseLeave={function(e) { e.currentTarget.style.background = dk ? `${ACCENT}10` : `${ACCENT}07`; }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, boxShadow: `0 3px 12px ${ACCENT}30` }}>🎬</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 2 }}>Senaryo Üret</p>
                <p style={{ fontSize: 11, color: C.muted }}>AI ile film & dizi konusu oluştur</p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, border: `1px solid ${ACCENT}40`, borderRadius: 20, padding: "4px 12px" }}>Üret →</span>
            </a>

            <div style={{ display: "flex", gap: 12, paddingBottom: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, cursor: "pointer", boxShadow: `0 2px 10px ${ACCENT}20` }} onClick={function() { window.location.href = "/profil"; }}>
                {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  value={gonderiMetin}
                  onChange={function(e) { setGonderiMetin(e.target.value); }}
                  onFocus={function() { if (!user) { setAuthModal(true); } else { setGonderiAcik(true); } }}
                  placeholder="Ne düşünüyorsun?"
                  rows={gonderiAcik ? 3 : 1}
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: 15, color: C.text, fontFamily: FONT, lineHeight: 1.55, cursor: user ? "text" : "pointer" }}
                />
                {fotoUrl && (
                  <div style={{ position: "relative", marginTop: 8 }}>
                    <img src={fotoUrl} style={{ width: "100%", borderRadius: 12, maxHeight: 220, objectFit: "cover" }} />
                    <button onClick={function() { setFoto(null); setFotoUrl(null); }} style={{ position: "absolute", top: 7, right: 7, background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "50%", width: 26, height: 26, color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                  </div>
                )}
                {gonderiAcik && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.border }}>
                    <button onClick={function() { fileRef.current && fileRef.current.click(); }} style={{ background: "none", border: "none", color: ACCENT, fontSize: 13, fontWeight: 600, cursor: "pointer", padding: "5px 8px", borderRadius: 8 }}>📷</button>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button onClick={function() { setGonderiAcik(false); setGonderiMetin(""); setFoto(null); setFotoUrl(null); }} style={{ background: "none", border: "1px solid " + C.border, borderRadius: 20, padding: "6px 14px", color: C.muted, fontSize: 12, cursor: "pointer" }}>İptal</button>
                      <button onClick={gonderiPaylas} disabled={gonderiYukleniyor || (!gonderiMetin.trim() && !foto)} style={{ background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", borderRadius: 20, padding: "7px 18px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 3px 12px ${ACCENT}35`, opacity: (!gonderiMetin.trim() && !foto) ? 0.5 : 1 }}>
                        {gonderiYukleniyor ? "..." : "Paylaş"}
                      </button>
                    </div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={function(e) { var f = e.target.files[0]; if (f) { setFoto(f); setFotoUrl(URL.createObjectURL(f)); setGonderiAcik(true); }}} style={{ display: "none" }} />
              </div>
            </div>
          </div>

          {/* Gönderiler listesi */}
          {gonderiler.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeUp 0.4s ease" }}>
              <p style={{ fontSize: 44, marginBottom: 14 }}>📭</p>
              <p style={{ fontSize: 16, color: C.muted, marginBottom: 20 }}>Henüz gönderi yok.</p>
              <button onClick={function() { user ? setGonderiAcik(true) : setAuthModal(true); }} style={{ background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>İlk paylaşımı yap →</button>
            </div>
          ) : gonderiler.map(function(g, i) {
            var yorumAcik = yorumId === g.id;
            var benimMi = user && g.user_id === user.id;
            var begendi = begeniler.includes(g.id);
            var kaydetti = kaydedilenler.includes(g.id);

            return (
              <div key={g.id} className="kart" style={{ borderBottom: "1px solid " + C.border, padding: "16px 24px", background: C.card, transition: "box-shadow 0.2s", animation: `fadeUp 0.35s ${Math.min(i * 0.04, 0.25)}s both ease` }}>
                
                {/* Üst: avatar + isim + zaman */}
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flexShrink: 0, cursor: "pointer" }} onClick={function() { window.location.href = "/profil"; }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, boxShadow: `0 2px 10px ${ACCENT}18` }}>
                      {g.profiles && g.profiles.avatar_url ? <img src={g.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.text, cursor: "pointer" }} onClick={function() { window.location.href = "/profil"; }}>
                          @{g.profiles ? g.profiles.username || "anonim" : "anonim"}
                        </span>
                        <span style={{ fontSize: 13, color: C.muted }}>· {zaman(g.created_at)}</span>
                      </div>
                      {benimMi && (
                        <button onClick={function() { gonderiSil(g.id); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 14, padding: "2px 6px", borderRadius: 6, opacity: 0.6 }} title="Sil">✕</button>
                      )}
                    </div>

                    {/* İçerik */}
                    {g.metin && <p style={{ fontSize: 15, lineHeight: 1.65, color: C.text, marginTop: 6, marginBottom: g.fotograf_url ? 10 : 0, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{g.metin}</p>}
                    {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", borderRadius: 14, maxHeight: 420, objectFit: "cover", marginTop: 4, display: "block" }} />}

                    {/* Aksiyonlar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 2, marginTop: 10 }}>
                      {/* Yorum */}
                      <button className="gonderi-aksiyon" onClick={function() { yorumAc(g.id); }} style={{ display: "flex", alignItems: "center", gap: 5, background: yorumAcik ? "#6366f110" : "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: yorumAcik ? "#6366f1" : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <span style={{ fontSize: 14 }}>💬</span>
                        <span>{(yorumlar[g.id] || []).length || ""}</span>
                      </button>
                      {/* Repost */}
                      <button className="gonderi-aksiyon" style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <span style={{ fontSize: 14 }}>🔁</span>
                      </button>
                      {/* Beğeni */}
                      <button className="gonderi-aksiyon" onClick={function() { begeniToggle(g.id, g.begeni_sayisi || 0); }} style={{ display: "flex", alignItems: "center", gap: 5, background: begendi ? ACCENT + "10" : "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: begendi ? ACCENT : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <span style={{ fontSize: 14 }}>{begendi ? "❤️" : "♡"}</span>
                        <span>{g.begeni_sayisi || ""}</span>
                      </button>
                      {/* Kaydet */}
                      <button className="gonderi-aksiyon" onClick={function() { kaydetToggle(g.id); }} style={{ display: "flex", alignItems: "center", gap: 5, background: kaydetti ? "#f59e0b10" : "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: kaydetti ? "#f59e0b" : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <span style={{ fontSize: 14 }}>{kaydetti ? "🔖" : "🏷️"}</span>
                      </button>
                      {/* Paylaş */}
                      <button className="gonderi-aksiyon" onClick={function() { navigator.clipboard.writeText(g.metin || ""); }} style={{ display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "none", borderRadius: 20, padding: "5px 10px", color: C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", marginLeft: "auto" }}>
                        <span style={{ fontSize: 14 }}>↗</span>
                      </button>
                    </div>

                    {/* Yorumlar */}
                    {yorumAcik && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.border, animation: "fadeUp 0.25s ease" }}>
                        <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                          {!(yorumlar[g.id] && yorumlar[g.id].length) && (
                            <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "8px 0" }}>İlk yorumu sen yap! ✨</p>
                          )}
                          {(yorumlar[g.id] || []).map(function(y) {
                            return (
                              <div key={y.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                                  {y.profiles && y.profiles.avatar_url ? <img src={y.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                                </div>
                                <div style={{ background: C.input, borderRadius: 10, padding: "7px 11px", flex: 1 }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT }}>@{y.profiles ? y.profiles.username || "?" : "?"} </span>
                                  <span style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{y.metin}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            value={yorumMetin}
                            onChange={function(e) { setYorumMetin(e.target.value); }}
                            onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); yorumGonder(g.id); }}}
                            placeholder="Yorum yaz..."
                            style={{ flex: 1, background: C.input, border: "1px solid " + C.border, borderRadius: 20, padding: "8px 14px", color: C.text, fontSize: 13, outline: "none", fontFamily: FONT }}
                          />
                          <button onClick={function() { yorumGonder(g.id); }} style={{ background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", borderRadius: 20, padding: "8px 16px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>→</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {/* ═══ SAĞ PANEL ═══ */}
        <aside style={{ padding: "24px 20px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" }}>

          {/* Arama */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: C.muted, pointerEvents: "none" }}>🔍</span>
            <input placeholder="Scriptify'da ara..." style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 22, padding: "10px 14px 10px 36px", color: C.text, fontSize: 13, outline: "none", fontFamily: FONT }} />
          </div>

          {/* Trend Senaryolar */}
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 18, padding: "18px", marginBottom: 16, boxShadow: dk ? "0 2px 20px rgba(0,0,0,0.25)" : "0 2px 20px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>🔥 Trend Senaryolar</h3>
              <a href="/topluluk" style={{ fontSize: 11, color: ACCENT, fontWeight: 600 }}>Tümü →</a>
            </div>
            {trendler.length === 0 ? (
              <p style={{ fontSize: 12, color: C.muted }}>Henüz trend yok.</p>
            ) : trendler.map(function(k, i) {
              return (
                <a key={i} href="/topluluk" style={{ display: "block", padding: "9px 0", borderBottom: i < trendler.length - 1 ? "1px solid " + C.border : "none", color: "inherit" }}>
                  <p style={{ fontSize: 10, color: C.muted, marginBottom: 3, fontWeight: 600 }}>#{i + 1} · {k.tur}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.3, marginBottom: 2 }}>{k.baslik}</p>
                  <p style={{ fontSize: 11, color: ACCENT, fontWeight: 600 }}>♥ {k.begeni_sayisi || 0}</p>
                </a>
              );
            })}
          </div>

          {/* Önerilen Kullanıcılar */}
          <div style={{ background: C.card, border: "1px solid " + C.border, borderRadius: 18, padding: "18px", boxShadow: dk ? "0 2px 20px rgba(0,0,0,0.25)" : "0 2px 20px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", marginBottom: 14 }}>👥 Önerilen</h3>
            {onerilenler.length === 0 ? (
              <p style={{ fontSize: 12, color: C.muted }}>Henüz kullanıcı yok.</p>
            ) : onerilenler.map(function(u, i) {
              return (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: i < onerilenler.length - 1 ? 12 : 0 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                    {u.avatar_url ? <img src={u.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{u.username || "kullanici"}</p>
                  </div>
                  <button style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 20, padding: "4px 12px", color: C.text, fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}
                    onMouseEnter={function(e) { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = ACCENT; }}
                    onMouseLeave={function(e) { e.currentTarget.style.background = C.input; e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = C.border; }}>
                    Takip
                  </button>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 10, color: C.muted, textAlign: "center", marginTop: 20, lineHeight: 1.6 }}>
            © 2025 Scriptify · by Öztürk<br />
            <span style={{ color: ACCENT }}>Sinema severler için yapıldı ♥</span>
          </p>
        </aside>
      </div>

      {/* ═══ AUTH MODAL ═══ */}
      {authModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={function() { setAuthModal(false); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "relative", zIndex: 1, background: dk ? "#141414" : "#fff", border: "1px solid " + C.border, borderRadius: 24, padding: "32px", maxWidth: 380, width: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.3)", animation: "fadeUp 0.3s ease" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${ACCENT}, #ff5722, transparent)`, borderRadius: "24px 24px 0 0" }} />
            
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `linear-gradient(135deg, ${ACCENT}, #ff5722)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 14px", boxShadow: `0 8px 24px ${ACCENT}35` }}>🎬</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", marginBottom: 6 }}>Scriptify</h2>
              <p style={{ fontSize: 13, color: C.muted }}>Yaratıcı topluluğa katıl</p>
            </div>

            {/* Google butonu */}
            <button onClick={googleGiris} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "11px", borderRadius: 12, background: C.input, border: "1px solid " + C.border, color: C.text, fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 16, transition: "all 0.15s" }}
              onMouseEnter={function(e) { e.currentTarget.style.background = C.hover; }}
              onMouseLeave={function(e) { e.currentTarget.style.background = C.input; }}>
              <span style={{ fontSize: 18 }}>G</span>
              Google ile Devam Et
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>veya</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {/* Tab */}
            <div style={{ display: "flex", gap: 4, marginBottom: 16, background: C.input, borderRadius: 12, padding: 4 }}>
              {["giris", "kayit"].map(function(m) {
                return (
                  <button key={m} onClick={function() { setAuthMode(m); }} style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none", background: authMode === m ? (dk ? "#2a2a2a" : "#fff") : "transparent", color: authMode === m ? C.text : C.muted, fontSize: 13, fontWeight: authMode === m ? 700 : 500, cursor: "pointer", boxShadow: authMode === m ? "0 2px 8px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s", fontFamily: FONT }}>
                    {m === "giris" ? "Giriş Yap" : "Kayıt Ol"}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
              <input value={authEmail} onChange={function(e) { setAuthEmail(e.target.value); }} placeholder="E-posta adresi" type="email" style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: FONT }} />
              <input value={authPass} onChange={function(e) { setAuthPass(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") authIslem(); }} placeholder="Şifre" type="password" style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "11px 14px", color: C.text, fontSize: 14, outline: "none", fontFamily: FONT }} />
            </div>

            <button onClick={authIslem} disabled={authYukleniyor} style={{ width: "100%", padding: "12px", borderRadius: 12, background: `linear-gradient(135deg, ${ACCENT}, #c5180a)`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 18px ${ACCENT}35`, fontFamily: FONT, opacity: authYukleniyor ? 0.7 : 1 }}>
              {authYukleniyor ? "..." : authMode === "giris" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
