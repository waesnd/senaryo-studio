import { useState, useEffect } from "react";
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
    bg: dk ? "#080f1c" : "#eef2f7", surface: dk ? "#0f1829" : "#ffffff",
    border: dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dk ? "#f1f5f9" : "#0f172a",
    muted: dk ? "rgba(241,245,249,0.38)" : "rgba(15,23,42,0.4)",
    input: dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    metalGrad: dk ? "linear-gradient(145deg,#1a2740,#0f1829,#162035)" : "linear-gradient(145deg,#fff,#f0f4f8,#e8eef5)",
    shadow: dk ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.08)",
  };
}

function Av({ url, size, fs }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs || 14, flexShrink: 0 }}>
      {url ? <img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
    </div>
  );
}

function Drawer({ dk, C, user, username, avatarUrl, onClose, onTema }) {
  return (
    <div>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201, width: 300, background: dk ? "#0d1627" : "#fff", boxShadow: "4px 0 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 4, background: "linear-gradient(90deg," + ACCENT + "," + TEAL + "," + TEAL_L + ")" }} />
        <div style={{ padding: "20px", borderBottom: "1px solid " + C.border }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div onClick={() => { onClose(); window.location.href = "/profil"; }} style={{ cursor: "pointer" }}><Av url={avatarUrl} size={54} fs={22} /></div>
            <button onClick={onClose} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 13, cursor: "pointer" }}>✕</button>
          </div>
          {user ? <div><p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{username}</p><p style={{ fontSize: 12, color: C.muted }}>{user.email}</p></div>
            : <button onClick={() => { onClose(); window.location.href = "/"; }} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>}
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {DRAWER_MENU.map(item => {
            var isActive = item.href === "/topluluk";
            return (
              <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: isActive ? TEAL : C.text, background: isActive ? TEAL + "12" : "transparent", fontWeight: isActive ? 700 : 500, fontSize: 15, marginBottom: 4, textDecoration: "none", border: "1px solid " + (isActive ? TEAL + "25" : "transparent") }}>
                <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
              </a>
            );
          })}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + C.border }}>
            <a href="/profil" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, marginBottom: 4, textDecoration: "none" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>👤</span><span>Profil & Ayarlar</span>
            </a>
            <button onClick={onTema} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{dk ? "☀️" : "🌙"}</span><span>{dk ? "Açık Tema" : "Koyu Tema"}</span>
            </button>
            {user && <button onClick={() => { supabase.auth.signOut(); onClose(); window.location.href = "/"; }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: ACCENT, fontSize: 15, background: ACCENT + "10", border: "none", width: "100%", textAlign: "left", cursor: "pointer", marginTop: 4 }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>🚪</span><span>Çıkış Yap</span>
            </button>}
          </div>
        </nav>
        <div style={{ padding: "12px 20px 20px", borderTop: "1px solid " + C.border, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: C.muted }}>© 2025 Scriptify · by Öztürk</p>
        </div>
      </div>
    </div>
  );
}

var TURLER = ["Tümü", "Gerilim", "Drama", "Bilim Kurgu", "Komedi", "Romantik", "Korku", "Aksiyon", "Fantastik", "Suç", "Tarihi"];

export default function Topluluk() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [senaryolar, setSenaryolar] = useState([]);
  var [tur, setTur] = useState("Tümü");
  var [siralama, setSiralama] = useState("yeni");
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);
  var [begeniler, setBegeniler] = useState([]);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil?.avatar_url || null;
  var username = profil?.username || user?.email?.split("@")[0] || "";

  useEffect(() => {
    try { setTema(localStorage.getItem("sf_tema") || "light"); } catch (e) {}
    setTimeout(() => setLoaded(true), 80);
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) { setUser(data.session.user); loadProfil(data.session.user); }
      loadSenaryolar("yeni", "Tümü");
    });
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) { setUser(session.user); loadProfil(session.user); }
      else { setUser(null); setProfil(null); }
    });
  }, []);

  function loadProfil(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(({ data }) => { if (data) setProfil(data); });
  }

  function loadSenaryolar(s, t) {
    var q = supabase.from("senaryolar").select("*, profiles(username, avatar_url)").eq("paylasim_acik", true);
    if (t !== "Tümü") q = q.eq("tur", t);
    q = q.order(s === "yeni" ? "created_at" : "begeni_sayisi", { ascending: false }).limit(40);
    q.then(({ data }) => { if (data) setSenaryolar(data); });
  }

  function temaToggle() {
    var t = dk ? "light" : "dark"; setTema(t);
    try { localStorage.setItem("sf_tema", t); } catch (e) {}
  }

  async function begeni(id, sayi) {
    if (!user) return;
    if (begeniler.includes(id)) return;
    setBegeniler(p => [...p, id]);
    await supabase.from("senaryolar").update({ begeni_sayisi: (sayi || 0) + 1 }).eq("id", id);
    setSenaryolar(p => p.map(s => s.id === id ? { ...s, begeni_sayisi: (sayi || 0) + 1 } : s));
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g";
  }

  if (!loaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 90 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}a{text-decoration:none;color:inherit;}button{font-family:inherit;}.sk{transition:transform 0.2s;}.sk:hover{transform:translateY(-2px);}`}</style>

      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.93)" : "rgba(238,242,247,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setDrawer(true)} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "2px solid " + TEAL + "40" }}>
            {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1 }}>Scriptify</p>
            <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 1 }}>Topluluk</p>
          </div>
        </button>
        <a href="/uret" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", boxShadow: "0 3px 12px " + ACCENT + "35" }}>
          <span style={{ fontSize: 14 }}>🎬</span><span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Üret</span>
        </a>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px" }}>
        {/* Sıralama */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[{ id: "yeni", label: "🕐 En Yeni" }, { id: "trend", label: "🔥 En Çok Beğeni" }].map(s => (
            <button key={s.id} onClick={() => { setSiralama(s.id); loadSenaryolar(s.id, tur); }} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "1.5px solid " + (siralama === s.id ? TEAL : C.border), background: siralama === s.id ? TEAL + "15" : C.input, color: siralama === s.id ? TEAL : C.muted, fontSize: 13, fontWeight: siralama === s.id ? 700 : 500, cursor: "pointer" }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Tür filtreleri */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 18, scrollbarWidth: "none" }}>
          {TURLER.map(t => (
            <button key={t} onClick={() => { setTur(t); loadSenaryolar(siralama, t); }} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (tur === t ? ACCENT : C.border), background: tur === t ? ACCENT + "15" : C.input, color: tur === t ? ACCENT : C.muted, fontSize: 12, fontWeight: tur === t ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Senaryolar */}
        {senaryolar.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 0", animation: "fadeUp 0.4s ease" }}>
            <p style={{ fontSize: 48, marginBottom: 14 }}>🎭</p>
            <p style={{ fontSize: 15, color: C.muted, marginBottom: 18 }}>Henüz paylaşılan senaryo yok.</p>
            <a href="/uret" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", color: "#fff", fontSize: 14, fontWeight: 700 }}>Senaryo Üret →</a>
          </div>
        ) : senaryolar.map((s, i) => {
          var av = s.profiles?.avatar_url || null;
          var begendi = begeniler.includes(s.id);
          return (
            <div key={s.id} className="sk" style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 20, padding: "18px 20px", marginBottom: 12, boxShadow: C.shadow, animation: "fadeUp 0.3s " + Math.min(i * 0.04, 0.2) + "s both ease" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Av url={av} size={36} fs={14} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>@{s.profiles?.username || "anonim"}</p>
                  <p style={{ fontSize: 11, color: C.muted }}>{zaman(s.created_at)}</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: TEAL + "15", color: TEAL }}>{s.tip}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: ACCENT + "12", color: ACCENT }}>{s.tur}</span>
                </div>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.02em" }}>{s.baslik}</h3>
              {s.tagline && <p style={{ fontSize: 13, fontStyle: "italic", color: TEAL, marginBottom: 8 }}>"{s.tagline}"</p>}
              {s.ana_fikir && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 12 }}>{s.ana_fikir.slice(0, 150)}{s.ana_fikir.length > 150 ? "..." : ""}</p>}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid " + C.border }}>
                <button onClick={() => begeni(s.id, s.begeni_sayisi)} style={{ display: "flex", alignItems: "center", gap: 6, background: begendi ? ACCENT + "10" : "transparent", border: "none", borderRadius: 20, padding: "6px 12px", color: begendi ? ACCENT : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  {begendi ? "❤️" : "♡"} {s.begeni_sayisi || 0}
                </button>
                <a href="/uret" style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>Benzerini Üret →</a>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {[{ icon: "🏠", href: "/" }, { icon: "🔭", href: "/kesfet" }, { icon: "🎭", href: "/topluluk" }, { icon: "💬", href: "/mesajlar" }].map(item => {
          var isActive = item.href === "/topluluk";
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 24px", borderRadius: 14, position: "relative", background: isActive ? (dk ? "rgba(8,145,178,0.14)" : "rgba(8,145,178,0.09)") : "transparent" }}>
              <span style={{ fontSize: 26, filter: isActive ? "none" : "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
              {isActive && <div style={{ position: "absolute", bottom: 3, width: 20, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>

      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={() => setDrawer(false)} onTema={temaToggle} />}
    </div>
  );
}
