import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var TEAL = "#0891b2";
var TEAL_L = "#06b6d4";
var ACCENT = "#e8230a";

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
    shadow: dk ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.08)",
  };
}

export default function Mesajlar() {
  var [user, setUser] = useState(null);
  var [konusmalar, setKonusmalar] = useState([]);
  var [aktifKisi, setAktifKisi] = useState(null);
  var [aktifProfil, setAktifProfil] = useState(null);
  var [mesajlar, setMesajlar] = useState([]);
  var [yeniMesaj, setYeniMesaj] = useState("");
  var [kullanicilar, setKullanicilar] = useState([]);
  var [aramaAcik, setAramaAcik] = useState(false);
  var [aramaMetin, setAramaMetin] = useState("");
  var [tema, setTema] = useState("light");
  var [drawer, setDrawer] = useState(false);
  var [loaded, setLoaded] = useState(false);
  var altRef = useRef(null);

  var dk = tema === "dark";
  var C = getC(dk);

  useEffect(function () {
    var t = localStorage.getItem("sf_tema") || "light";
    setTema(t);
    setTimeout(function () { setLoaded(true); }, 60);
    supabase.auth.getSession().then(function (r) {
      if (r.data && r.data.session) {
        setUser(r.data.session.user);
        yukleKonusmalar(r.data.session.user.id);
      }
    });
  }, []);

  useEffect(function () {
    if (altRef.current) altRef.current.scrollIntoView({ behavior: "smooth" });
  }, [mesajlar]);

  function yukleKonusmalar(uid) {
    supabase.from("mesajlar")
      .select("*, gonderen_profil:profiles!gonderen(username, avatar_url), alan_profil:profiles!alan(username, avatar_url)")
      .or("gonderen.eq." + uid + ",alan.eq." + uid)
      .order("created_at", { ascending: false })
      .then(function (r) {
        if (!r.data) return;
        var gorulmus = {};
        var liste = [];
        r.data.forEach(function (m) {
          var diger = m.gonderen === uid ? m.alan : m.gonderen;
          var digerProfil = m.gonderen === uid ? m.alan_profil : m.gonderen_profil;
          if (!gorulmus[diger]) {
            gorulmus[diger] = true;
            liste.push({ kisiId: diger, profil: digerProfil, sonMesaj: m.icerik, tarih: m.created_at, okunmadi: !m.okundu && m.alan === uid });
          }
        });
        setKonusmalar(liste);
      });
    supabase.from("profiles").select("id, username, avatar_url").neq("id", uid).limit(20)
      .then(function (r) { if (r.data) setKullanicilar(r.data); });
  }

  async function konusmaAc(kisiId, profil) {
    if (!user) return;
    setAktifKisi(kisiId);
    setAktifProfil(profil);
    setAramaAcik(false);
    var r = await supabase.from("mesajlar")
      .select("*")
      .or("and(gonderen.eq." + user.id + ",alan.eq." + kisiId + "),and(gonderen.eq." + kisiId + ",alan.eq." + user.id + ")")
      .order("created_at", { ascending: true });
    if (r.data) setMesajlar(r.data);
    await supabase.from("mesajlar").update({ okundu: true }).eq("alan", user.id).eq("gonderen", kisiId);
  }

  async function mesajGonder() {
    if (!user || !aktifKisi || !yeniMesaj.trim()) return;
    var yeni = { gonderen: user.id, alan: aktifKisi, icerik: yeniMesaj, okundu: false };
    await supabase.from("mesajlar").insert([yeni]);
    setYeniMesaj("");
    konusmaAc(aktifKisi, aktifProfil);
    yukleKonusmalar(user.id);
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60) return d + "s";
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g";
  }

  var filtreli = kullanicilar.filter(function (k) {
    return !aramaMetin || (k.username && k.username.toLowerCase().includes(aramaMetin.toLowerCase()));
  });

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#eef2f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 44, marginBottom: 12 }}>🔐</p>
          <p style={{ fontSize: 16, marginBottom: 20, color: "#666" }}>Mesajlar için giriş yapmalısın</p>
          <button onClick={function () { window.location.href = "/"; }} style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", borderRadius: 12, padding: "11px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif", opacity: loaded ? 1 : 0, transition: "opacity 0.3s ease" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        @keyframes slideIn{from{transform:translateX(-100%);}to{transform:translateX(0);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
        input::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}
        a{text-decoration:none;}
        button{font-family:inherit;cursor:pointer;}
      `}</style>

      {/* NAVBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.92)" : "rgba(238,242,247,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={function () { setDrawer(true); }} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: `0 2px 10px ${TEAL}30`, border: "2px solid " + (dk ? "rgba(255,255,255,0.1)" : "rgba(8,145,178,0.2)") }}>
            {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: "-0.02em", lineHeight: 1 }}>Scriptify</p>
            <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 1 }}>@{username}</p>
          </div>
        </button>
        <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Mesajlar</span>
        <button onClick={function () { setAramaAcik(!aramaAcik); }} style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", borderRadius: 10, padding: "7px 14px", color: "#fff", fontSize: 13, fontWeight: 700, boxShadow: `0 3px 12px ${TEAL}35` }}>+ Yeni</button>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 0 100px" }}>

        {/* Kullanıcı Arama */}
        {aramaAcik && (
          <div style={{ padding: "16px 20px", borderBottom: "1px solid " + C.border, animation: "fadeUp 0.2s ease", background: C.surface }}>
            <input value={aramaMetin} onChange={function (e) { setAramaMetin(e.target.value); }} placeholder="Kullanıcı ara..." autoFocus style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", marginBottom: 12, fontFamily: "inherit" }} />
            <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
              {filtreli.map(function (k) {
                return (
                  <div key={k.id} onClick={function () { konusmaAc(k.id, k); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, background: C.input, cursor: "pointer", border: "1px solid " + C.border, transition: "all 0.15s" }}
                    onMouseEnter={function (e) { e.currentTarget.style.borderColor = TEAL + "40"; }}
                    onMouseLeave={function (e) { e.currentTarget.style.borderColor = C.border; }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                      {k.avatar_url ? <img src={k.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>@{k.username || "kullanici"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Konuşma listesi */}
        {!aktifKisi && (
          <div>
            {konusmalar.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 20px", animation: "fadeUp 0.4s ease" }}>
                <p style={{ fontSize: 44, marginBottom: 14 }}>💬</p>
                <p style={{ fontSize: 15, color: C.muted, marginBottom: 20 }}>Henüz mesajın yok.</p>
                <button onClick={function () { setAramaAcik(true); }} style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700, boxShadow: `0 4px 16px ${TEAL}35` }}>Mesaj Gönder →</button>
              </div>
            ) : konusmalar.map(function (k, i) {
              return (
                <div key={k.kisiId} onClick={function () { konusmaAc(k.kisiId, k.profil); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: "1px solid " + C.border, cursor: "pointer", background: C.surface, transition: "all 0.15s", animation: `fadeUp 0.3s ${i * 0.04}s both ease` }}
                  onMouseEnter={function (e) { e.currentTarget.style.background = C.input; }}
                  onMouseLeave={function (e) { e.currentTarget.style.background = C.surface; }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, position: "relative" }}>
                    {k.profil && k.profil.avatar_url ? <img src={k.profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
                    {k.okunmadi && <div style={{ position: "absolute", top: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: ACCENT, border: "2px solid " + C.bg }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 14, fontWeight: k.okunmadi ? 800 : 600, color: C.text }}>@{k.profil ? k.profil.username || "kullanici" : "kullanici"}</span>
                      <span style={{ fontSize: 11, color: C.muted }}>{zaman(k.tarih)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: k.okunmadi ? C.text : C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: k.okunmadi ? 600 : 400 }}>{k.sonMesaj}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Aktif konuşma */}
        {aktifKisi && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 60px - 80px)", animation: "fadeUp 0.25s ease" }}>
            {/* Konuşma header */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid " + C.border, background: C.surface, backdropFilter: "blur(10px)" }}>
              <button onClick={function () { setAktifKisi(null); setAktifProfil(null); setMesajlar([]); }} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 13, fontWeight: 600 }}>←</button>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                {aktifProfil && aktifProfil.avatar_url ? <img src={aktifProfil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>@{aktifProfil ? aktifProfil.username || "kullanici" : "kullanici"}</span>
            </div>

            {/* Mesaj listesi */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {mesajlar.length === 0 && <p style={{ textAlign: "center", color: C.muted, fontSize: 13, marginTop: 40 }}>Henüz mesaj yok. İlk mesajı gönder! 👋</p>}
              {mesajlar.map(function (m) {
                var benim = m.gonderen === user.id;
                return (
                  <div key={m.id} style={{ display: "flex", justifyContent: benim ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "72%", padding: "10px 14px", borderRadius: benim ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: benim ? `linear-gradient(135deg, ${TEAL}, ${TEAL_L})` : C.surface, color: benim ? "#fff" : C.text, fontSize: 14, lineHeight: 1.5, border: benim ? "none" : "1px solid " + C.border, boxShadow: benim ? `0 4px 14px ${TEAL}35` : C.shadow }}>
                      <p>{m.icerik}</p>
                      <p style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: benim ? "right" : "left" }}>{zaman(m.created_at)}{benim && (m.okundu ? " · ✓✓" : " · ✓")}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={altRef} />
            </div>

            {/* Mesaj yaz */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid " + C.border, background: C.surface, backdropFilter: "blur(10px)", display: "flex", gap: 10 }}>
              <input value={yeniMesaj} onChange={function (e) { setYeniMesaj(e.target.value); }} onKeyDown={function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); mesajGonder(); } }} placeholder="Mesaj yaz..." style={{ flex: 1, background: C.input, border: "1px solid " + C.border, borderRadius: 22, padding: "10px 16px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              <button onClick={mesajGonder} style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, border: "none", borderRadius: "50%", width: 42, height: 42, color: "#fff", fontSize: 16, flexShrink: 0, boxShadow: `0 4px 14px ${TEAL}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>→</button>
            </div>
          </div>
        )}
      </div>

            {/* MOBİL ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around", alignItems: "center", boxShadow: "0 -4px 30px rgba(0,0,0,0.1)" }}>
        {[
          { icon: "🏠", href: "/" },
          { icon: "🔭", href: "/kesfet" },
          { icon: "🎭", href: "/topluluk" },
          { icon: "💬", href: "/mesajlar" },
        ].map(function (item) {
          var isActive = typeof window !== "undefined" && item.href === "/mesajlar";
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 24px", borderRadius: 14, textDecoration: "none", position: "relative", background: isActive ? (dk ? "rgba(8,145,178,0.12)" : "rgba(8,145,178,0.08)") : "transparent", transition: "all 0.2s" }}>
              <span style={{ fontSize: 26, lineHeight: 1, filter: isActive ? "none" : "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
              {isActive && <div style={{ position: "absolute", bottom: 3, width: 20, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>
    </div>

      {/* DRAWER */}
      {drawer && (
        <>
          <div onClick={function () { setDrawer(false); }} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
          <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201, width: 300, background: dk ? "#0d1627" : "#fff", boxShadow: "4px 0 40px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column", animation: "slideIn 0.28s cubic-bezier(0.34,1.2,0.64,1)" }}>
            <div style={{ height: 4, background: `linear-gradient(90deg, ${ACCENT}, ${TEAL}, ${TEAL_L})`, flexShrink: 0 }} />
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid " + C.border, flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `linear-gradient(135deg, ${TEAL}, ${TEAL_L})`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, cursor: "pointer" }} onClick={function () { setDrawer(false); window.location.href="/profil"; }}>
                  {avatarUrl ? <img src={avatarUrl} style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : "👤"}
                </div>
                <button onClick={function () { setDrawer(false); }} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 10px", color: C.muted, fontSize: 14 }}>✕</button>
              </div>
              {user ? <div><p style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{username}</p><p style={{ fontSize: 12, color: C.muted }}>{user.email}</p></div>
                : <button onClick={function () { setDrawer(false); window.location.href="/"; }} style={{ width:"100%", padding:"10px", borderRadius:12, background:`linear-gradient(135deg,${ACCENT},#c5180a)`, border:"none", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>Giriş Yap</button>}
            </div>
            <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {DRAWER_MENU.map(function (item) {
                var isActive = item.href === "/mesajlar";
                return (
                  <a key={item.href} href={item.href} onClick={function () { setDrawer(false); }} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", borderRadius:14, color: isActive ? TEAL : C.text, background: isActive ? TEAL+"12" : "transparent", fontWeight: isActive ? 700 : 500, fontSize:15, marginBottom:4, border:"1px solid "+(isActive ? TEAL+"25" : "transparent"), transition:"all 0.15s", textDecoration:"none" }}>
                    <span style={{ fontSize:22, width:28, textAlign:"center" }}>{item.icon}</span>
                    <span style={{ flex:1 }}>{item.label}</span>
                    {item.badge && <span style={{ fontSize:9, fontWeight:800, padding:"2px 8px", borderRadius:20, background:ACCENT, color:"#fff" }}>{item.badge}</span>}
                  </a>
                );
              })}
              <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid "+C.border }}>
                <p style={{ fontSize:10, fontWeight:700, color:C.muted, letterSpacing:"0.08em", textTransform:"uppercase", paddingLeft:14, marginBottom:8 }}>Hesap</p>
                <a href="/profil" onClick={function(){setDrawer(false);}} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", borderRadius:14, color:C.text, fontSize:15, marginBottom:4, textDecoration:"none", background: "/profil"==="/mesajlar" ? TEAL+"10" : "transparent", fontWeight: "/profil"==="/mesajlar" ? 700 : 500 }}>
                  <span style={{ fontSize:22, width:28, textAlign:"center" }}>👤</span><span>Profil & Ayarlar</span>
                </a>
                <button onClick={function(){ var t=dk?"light":"dark"; setTema(t); localStorage.setItem("sf_tema",t); }} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", borderRadius:14, color:C.text, fontWeight:500, fontSize:15, marginBottom:4, background:"none", border:"none", width:"100%", textAlign:"left", cursor:"pointer" }}>
                  <span style={{ fontSize:22, width:28, textAlign:"center" }}>{dk?"☀️":"🌙"}</span><span>{dk?"Açık Tema":"Koyu Tema"}</span>
                </button>
                {user && <button onClick={function(){supabase.auth.signOut();setDrawer(false);window.location.href="/";}} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 14px", borderRadius:14, color:ACCENT, fontWeight:600, fontSize:15, background:ACCENT+"08", border:"none", width:"100%", textAlign:"left", cursor:"pointer", marginTop:4 }}>
                  <span style={{ fontSize:22, width:28, textAlign:"center" }}>🚪</span><span>Çıkış Yap</span>
                </button>}
              </div>
            </nav>
            <div style={{ padding:"12px 20px 20px", borderTop:"1px solid "+C.border, flexShrink:0, textAlign:"center" }}>
              <p style={{ fontSize:11, color:C.muted }}>© 2025 Scriptify · by Öztürk</p>
            </div>
          </div>
        </>
      )}
  );
}
