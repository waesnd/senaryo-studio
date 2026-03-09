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
            var isActive = item.href === "/mesajlar";
            return (
              <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: isActive ? TEAL : C.text, background: isActive ? TEAL + "12" : "transparent", fontWeight: isActive ? 700 : 500, fontSize: 15, marginBottom: 4, textDecoration: "none" }}>
                <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
              </a>
            );
          })}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + C.border }}>
            <a href="/profil" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, marginBottom: 4, textDecoration: "none" }}>
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

export default function Mesajlar() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [konusmalar, setKonusmalar] = useState([]);
  var [aktifKonusma, setAktifKonusma] = useState(null);
  var [mesajlar, setMesajlar] = useState([]);
  var [yeniMesaj, setYeniMesaj] = useState("");
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);
  var mesajRef = useRef(null);
  var altRef = useRef(null);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil && profil.avatar_url ? profil.avatar_url : null;
  var username = profil && profil.username ? profil.username : user ? user.email.split("@")[0] : "";

  useEffect(function () {
    try { var t = localStorage.getItem("sf_tema") || "light"; setTema(t); } catch (e) {}
    setTimeout(function () { setLoaded(true); }, 80);
    supabase.auth.getSession().then(function (r) {
      if (r.data && r.data.session) { var u = r.data.session.user; setUser(u); loadProfil(u); loadKonusmalar(u); }
    });
    supabase.auth.onAuthStateChange(function (_, session) {
      if (session) { setUser(session.user); loadProfil(session.user); loadKonusmalar(session.user); }
      else { setUser(null); setProfil(null); }
    });
  }, []);

  function loadProfil(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(function (r) { if (r.data) setProfil(r.data); });
  }

  function loadKonusmalar(u) {
    supabase.from("mesajlar").select("*, gonderen:profiles!gonderen_id(username, avatar_url), alici:profiles!alici_id(username, avatar_url)")
      .or("gonderen_id.eq." + u.id + ",alici_id.eq." + u.id)
      .order("created_at", { ascending: false }).limit(30)
      .then(function (r) { if (r.data) setKonusmalar(r.data); });
  }

  function loadMesajlar(konusmaId) {
    supabase.from("mesajlar").select("*, gonderen:profiles!gonderen_id(username, avatar_url)")
      .eq("konusma_id", konusmaId).order("created_at", { ascending: true })
      .then(function (r) {
        if (r.data) {
          setMesajlar(r.data);
          setTimeout(function () { altRef.current && altRef.current.scrollIntoView(); }, 100);
        }
      });
  }

  async function mesajGonder() {
    if (!user || !yeniMesaj.trim() || !aktifKonusma) return;
    await supabase.from("mesajlar").insert([{ gonderen_id: user.id, alici_id: aktifKonusma.diger_id, metin: yeniMesaj, konusma_id: aktifKonusma.id }]);
    setYeniMesaj("");
    loadMesajlar(aktifKonusma.id);
  }

  function temaToggle() {
    var t = dk ? "light" : "dark"; setTema(t);
    try { localStorage.setItem("sf_tema", t); } catch (e) {}
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60) return d + "s";
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g";
  }

  if (!loaded) return null;

  return (
    <div style={{ height: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}
        input::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}
        a{text-decoration:none;color:inherit;}
        button{font-family:inherit;}
      `}</style>

      {/* TOPBAR */}
      <div style={{ flexShrink: 0, background: dk ? "rgba(8,15,28,0.93)" : "rgba(238,242,247,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={function () { setDrawer(true); }} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "2px solid " + TEAL + "40" }}>
            {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1 }}>Scriptify</p>
            <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 1 }}>Mesajlar</p>
          </div>
        </button>
        <button onClick={temaToggle} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "7px 10px", color: C.muted, fontSize: 13, cursor: "pointer" }}>{dk ? "☀️" : "🌙"}</button>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Konuşma listesi */}
        <div style={{ width: aktifKonusma ? "0" : "100%", maxWidth: 360, borderRight: "1px solid " + C.border, overflowY: "auto", flexShrink: 0, display: aktifKonusma ? "none" : "block" }}>
          {!user ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🔐</p>
              <p style={{ fontSize: 14, color: C.muted, marginBottom: 16 }}>Mesajları görmek için giriş yap</p>
              <button onClick={function () { window.location.href = "/"; }} style={{ background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>
            </div>
          ) : konusmalar.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>💬</p>
              <p style={{ fontSize: 14, color: C.muted }}>Henüz mesaj yok.</p>
            </div>
          ) : konusmalar.map(function (k) {
            var diger = k.gonderen_id === (user && user.id) ? k.alici : k.gonderen;
            var digerAv = diger && diger.avatar_url ? diger.avatar_url : null;
            return (
              <div key={k.id} onClick={function () { setAktifKonusma({ ...k, diger_id: diger && diger.id }); loadMesajlar(k.id); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid " + C.border, cursor: "pointer", background: C.surface }}>
                <AvatarDiv url={digerAv} size={44} fs={18} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>@{diger && diger.username || "kullanici"}</p>
                    <p style={{ fontSize: 11, color: C.muted }}>{zaman(k.created_at)}</p>
                  </div>
                  <p style={{ fontSize: 13, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.metin}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Aktif konuşma */}
        {aktifKonusma && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flexShrink: 0, padding: "12px 16px", borderBottom: "1px solid " + C.border, display: "flex", alignItems: "center", gap: 12, background: C.surface }}>
              <button onClick={function () { setAktifKonusma(null); }} style={{ background: "none", border: "none", color: TEAL, fontSize: 18, cursor: "pointer" }}>←</button>
              <AvatarDiv url={null} size={36} fs={14} />
              <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Konuşma</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {mesajlar.map(function (m) {
                var benim = m.gonderen_id === (user && user.id);
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: benim ? "flex-end" : "flex-start", marginBottom: 10 }}>
                    <div style={{ maxWidth: "70%", background: benim ? "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")" : C.surface, border: benim ? "none" : "1px solid " + C.border, borderRadius: benim ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px" }}>
                      <p style={{ fontSize: 14, color: benim ? "#fff" : C.text, lineHeight: 1.55 }}>{m.metin}</p>
                      <p style={{ fontSize: 10, color: benim ? "rgba(255,255,255,0.6)" : C.muted, marginTop: 4, textAlign: "right" }}>{zaman(m.created_at)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={altRef} />
            </div>
            <div style={{ flexShrink: 0, padding: "12px 16px", borderTop: "1px solid " + C.border, display: "flex", gap: 10, background: C.surface }}>
              <input ref={mesajRef} value={yeniMesaj} onChange={function (e) { setYeniMesaj(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); mesajGonder(); } }} placeholder="Mesaj yaz..." style={{ flex: 1, background: C.input, border: "1px solid " + C.border, borderRadius: 22, padding: "10px 16px", color: C.text, fontSize: 14, outline: "none" }} />
              <button onClick={mesajGonder} style={{ background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", borderRadius: 22, padding: "10px 20px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>→</button>
            </div>
          </div>
        )}
      </div>

      {/* ALT NAV */}
      <div style={{ flexShrink: 0, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {[{ icon: "🏠", href: "/" }, { icon: "🔭", href: "/kesfet" }, { icon: "🎭", href: "/topluluk" }, { icon: "💬", href: "/mesajlar" }].map(function (item) {
          var isActive = item.href === "/mesajlar";
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", padding: "6px 24px", borderRadius: 14, textDecoration: "none", position: "relative", background: isActive ? (dk ? "rgba(8,145,178,0.14)" : "rgba(8,145,178,0.09)") : "transparent" }}>
              <span style={{ fontSize: 26, filter: isActive ? "none" : "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
              {isActive && <div style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)", width: 20, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>

      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={function () { setDrawer(false); }} onTema={temaToggle} />}
    </div>
  );
}
