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
  var dk = props.dk; var C = props.C; var user = props.user;
  var username = props.username; var avatarUrl = props.avatarUrl;
  var onClose = props.onClose; var onTema = props.onTema;
  return (
    <div>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201, width: 300, background: dk ? "#0d1627" : "#fff", boxShadow: "4px 0 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 4, background: "linear-gradient(90deg," + ACCENT + "," + TEAL + "," + TEAL_L + ")" }} />
        <div style={{ padding: "20px", borderBottom: "1px solid " + C.border }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div onClick={function () { onClose(); window.location.href = "/profil"; }} style={{ cursor: "pointer" }}><AvatarDiv url={avatarUrl} size={54} fs={22} /></div>
            <button onClick={onClose} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 13, cursor: "pointer" }}>✕</button>
          </div>
          {user ? <div><p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{username}</p><p style={{ fontSize: 12, color: C.muted }}>{user.email}</p></div>
            : <button onClick={function () { onClose(); window.location.href = "/"; }} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>}
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
            <a href="/profil" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, marginBottom: 4, textDecoration: "none" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>👤</span><span>Profil & Ayarlar</span>
            </a>
            <button onClick={onTema} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{dk ? "☀️" : "🌙"}</span><span>{dk ? "Açık Tema" : "Koyu Tema"}</span>
            </button>
            {user && <button onClick={function () { supabase.auth.signOut(); onClose(); window.location.href = "/"; }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: ACCENT, fontSize: 15, background: ACCENT + "10", border: "none", width: "100%", textAlign: "left", cursor: "pointer", marginTop: 4 }}>
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

var BILDIRIM_IKONLARI = { begeni: "❤️", yorum: "💬", takip: "👤", senaryo: "🎬" };
var BILDIRIM_RENKLERI = { begeni: ACCENT, yorum: TEAL, takip: "#10b981", senaryo: "#7c3aed" };

export default function Bildirimler() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [bildirimler, setBildirimler] = useState([]);
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil && profil.avatar_url ? profil.avatar_url : null;
  var username = profil && profil.username ? profil.username : user ? user.email.split("@")[0] : "";

  useEffect(function () {
    try { var t = localStorage.getItem("sf_tema") || "light"; setTema(t); } catch (e) {}
    setTimeout(function () { setLoaded(true); }, 80);
    supabase.auth.getSession().then(function (r) {
      if (r.data && r.data.session) { var u = r.data.session.user; setUser(u); loadProfil(u); loadBildirimler(u); }
    });
    supabase.auth.onAuthStateChange(function (_, session) {
      if (session) { setUser(session.user); loadProfil(session.user); loadBildirimler(session.user); }
      else { setUser(null); setProfil(null); }
    });
  }, []);

  function loadProfil(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(function (r) { if (r.data) setProfil(r.data); });
  }

  function loadBildirimler(u) {
    supabase.from("bildirimler").select("*, gonderen:profiles!gonderen_id(username, avatar_url)")
      .eq("user_id", u.id).order("created_at", { ascending: false }).limit(50)
      .then(function (r) {
        if (r.data) {
          setBildirimler(r.data);
          // Hepsini okundu yap
          supabase.from("bildirimler").update({ okundu: true }).eq("user_id", u.id).eq("okundu", false).then(function () {});
        }
      });
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

  // Demo bildirimler (gerçek tablo boşsa)
  var gosterilecek = bildirimler.length > 0 ? bildirimler : [];

  if (!loaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 90 }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
        a{text-decoration:none;color:inherit;}
        button{font-family:inherit;}
        .bk{transition:background 0.15s;}
        .bk:hover{background:${dk ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)"}!important;}
      `}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.93)" : "rgba(238,242,247,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={function () { setDrawer(true); }} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "2px solid " + TEAL + "40" }}>
            {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1 }}>Scriptify</p>
            <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 1 }}>Bildirimler</p>
          </div>
        </button>
        {bildirimler.filter(function (b) { return !b.okundu; }).length > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: ACCENT + "15", color: ACCENT, border: "1px solid " + ACCENT + "20" }}>
            {bildirimler.filter(function (b) { return !b.okundu; }).length} yeni
          </span>
        )}
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {!user ? (
          <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeUp 0.4s ease" }}>
            <p style={{ fontSize: 44, marginBottom: 14 }}>🔔</p>
            <p style={{ fontSize: 15, color: C.muted, marginBottom: 20 }}>Bildirimleri görmek için giriş yap</p>
            <button onClick={function () { window.location.href = "/"; }} style={{ background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>
          </div>
        ) : gosterilecek.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeUp 0.4s ease" }}>
            <p style={{ fontSize: 52, marginBottom: 16 }}>🔔</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>Henüz bildirim yok</p>
            <p style={{ fontSize: 13, color: C.muted }}>Biri seni beğendiğinde veya takip ettiğinde burada görünecek</p>
          </div>
        ) : (
          <div>
            {gosterilecek.map(function (b, i) {
              var tip = b.tip || "begeni";
              var ikon = BILDIRIM_IKONLARI[tip] || "🔔";
              var renk = BILDIRIM_RENKLERI[tip] || TEAL;
              var gAv = b.gonderen && b.gonderen.avatar_url ? b.gonderen.avatar_url : null;
              var gUsername = b.gonderen && b.gonderen.username ? b.gonderen.username : "biri";
              var mesaj = tip === "begeni" ? "gönderini beğendi" :
                         tip === "yorum" ? "gönderine yorum yaptı" :
                         tip === "takip" ? "seni takip etmeye başladı" :
                         tip === "senaryo" ? "senaryonu beğendi" : b.metin || "bir bildirim aldın";
              return (
                <div key={b.id || i} className="bk" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid " + C.border, background: !b.okundu ? (dk ? "rgba(8,145,178,0.05)" : "rgba(8,145,178,0.04)") : "transparent", animation: "fadeUp 0.3s " + Math.min(i * 0.03, 0.2) + "s both ease", cursor: "pointer" }}>
                  <div style={{ position: "relative", flexShrink: 0 }}>
                    <AvatarDiv url={gAv} size={46} fs={18} />
                    <div style={{ position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: "50%", background: renk, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid " + C.bg }}>
                      {ikon}
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700 }}>@{gUsername}</span>
                      {" "}<span style={{ color: C.muted }}>{mesaj}</span>
                    </p>
                    {b.created_at && <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{zaman(b.created_at)}</p>}
                  </div>
                  {!b.okundu && <div style={{ width: 8, height: 8, borderRadius: "50%", background: TEAL, flexShrink: 0 }} />}
                </div>
              );
            })}
          </div>
        )}
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

      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={function () { setDrawer(false); }} onTema={temaToggle} />}
    </div>
  );
}
