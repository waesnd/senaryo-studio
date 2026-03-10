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
    shadow: dk ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.06)",
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
          {DRAWER_MENU.map(item => (
            <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontWeight: 500, fontSize: 15, marginBottom: 4, textDecoration: "none" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
            </a>
          ))}
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

var TABS = [
  { id: "hepsi", label: "Tümü" },
  { id: "kullanici", label: "👤 Kullanıcı" },
  { id: "senaryo", label: "🎬 Senaryo" },
  { id: "gonderi", label: "✍️ Gönderi" },
];

export default function Arama() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [ara, setAra] = useState("");
  var [tab, setTab] = useState("hepsi");
  var [sonuclar, setSonuclar] = useState({ kullanici: [], senaryo: [], gonderi: [] });
  var [yukleniyor, setYukleniyor] = useState(false);
  var [aramaYapildi, setAramaYapildi] = useState(false);
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);
  var [populer, setPopuler] = useState([]);
  var inputRef = useRef(null);
  var timerRef = useRef(null);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil?.avatar_url || null;
  var username = profil?.username || user?.email?.split("@")[0] || "";

  useEffect(() => {
    try { setTema(localStorage.getItem("sf_tema") || "light"); } catch (e) {}
    supabase.auth.getSession().then(({ data }) => {
      setLoaded(true);
      setTimeout(() => inputRef.current?.focus(), 50);
      if (data?.session) { setUser(data.session.user); loadProfil(data.session.user); }
    });
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) { setUser(session.user); loadProfil(session.user); }
      else { setUser(null); setProfil(null); }
    });
    // Popüler senaryolar
    supabase.from("senaryolar").select("baslik, tur, begeni_sayisi")
      .eq("paylasim_acik", true).order("begeni_sayisi", { ascending: false }).limit(6)
      .then(({ data }) => { if (data) setPopuler(data); });
  }, []);

  function loadProfil(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(({ data }) => { if (data) setProfil(data); });
  }

  function temaToggle() {
    var t = dk ? "light" : "dark"; setTema(t);
    try { localStorage.setItem("sf_tema", t); } catch (e) {}
  }

  function aramaYap(kelime) {
    if (!kelime.trim()) { setSonuclar({ kullanici: [], senaryo: [], gonderi: [] }); setAramaYapildi(false); return; }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setYukleniyor(true);
      var q = "%" + kelime + "%";
      var [k, s, g] = await Promise.all([
        supabase.from("profiles").select("id, username, bio, avatar_url").ilike("username", q).limit(8),
        supabase.from("senaryolar").select("id, baslik, tagline, tur, tip, begeni_sayisi, profiles(username)").eq("paylasim_acik", true).or("baslik.ilike." + q + ",tur.ilike." + q).limit(10),
        supabase.from("gonderiler").select("id, metin, begeni_sayisi, created_at, profiles(username, avatar_url)").ilike("metin", q).limit(10),
      ]);
      setSonuclar({ kullanici: k.data || [], senaryo: s.data || [], gonderi: g.data || [] });
      setAramaYapildi(true);
      setYukleniyor(false);
    }, 350);
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g";
  }

  var toplamSonuc = sonuclar.kullanici.length + sonuclar.senaryo.length + sonuclar.gonderi.length;

  var gosterKullanici = tab === "hepsi" || tab === "kullanici";
  var gosterSenaryo = tab === "hepsi" || tab === "senaryo";
  var gosterGonderi = tab === "hepsi" || tab === "gonderi";

  if (!loaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 90 }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        input::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}
        a{text-decoration:none;color:inherit;}
        button{font-family:inherit;}
        .rk{transition:background 0.15s;}
        .rk:hover{background:${dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)"}!important;}
      `}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.95)" : "rgba(238,242,247,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setDrawer(true)} style={{ flexShrink: 0, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, border: "2px solid " + TEAL + "40" }}>
            {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
          </div>
        </button>
        <div style={{ flex: 1, position: "relative" }}>
          <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: C.muted, pointerEvents: "none" }}>
            {yukleniyor ? <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid " + C.border, borderTopColor: TEAL, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "🔍"}
          </span>
          <input
            ref={inputRef}
            value={ara}
            onChange={e => { setAra(e.target.value); aramaYap(e.target.value); }}
            placeholder="Kullanıcı, senaryo veya gönderi ara..."
            style={{ width: "100%", background: C.surface, border: "1px solid " + C.border, borderRadius: 22, padding: "10px 40px 10px 40px", color: C.text, fontSize: 14, outline: "none", boxShadow: C.shadow }}
          />
          {ara && (
            <button onClick={() => { setAra(""); setSonuclar({ kullanici: [], senaryo: [], gonderi: [] }); setAramaYapildi(false); }}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.muted, fontSize: 16, cursor: "pointer", lineHeight: 1 }}>✕</button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {!aramaYapildi ? (
          /* KEŞFET — Arama yapılmadıysa popüler göster */
          <div style={{ padding: "20px 16px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>🔥 Popüler Senaryolar</p>
            {populer.length === 0 ? (
              <p style={{ fontSize: 14, color: C.muted, textAlign: "center", padding: "40px 0" }}>Henüz paylaşılan senaryo yok.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {populer.map((s, i) => (
                  <a key={i} href="/topluluk" className="rk" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: C.surface, border: "1px solid " + C.border }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg," + ACCENT + "20," + TEAL + "20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🎬</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.baslik}</p>
                      <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.tur} · ♥ {s.begeni_sayisi || 0}</p>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>#{i + 1}</span>
                  </a>
                ))}
              </div>
            )}

            <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 24, marginBottom: 14 }}>⚡ Hızlı Git</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ href: "/kesfet", icon: "🔭", label: "Keşfet" }, { href: "/topluluk", icon: "🎭", label: "Topluluk" }, { href: "/uret", icon: "🎬", label: "Senaryo Üret" }, { href: "/mesajlar", icon: "💬", label: "Mesajlar" }].map(item => (
                <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, background: C.surface, border: "1px solid " + C.border }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        ) : (
          /* SONUÇLAR */
          <div>
            {/* Tab bar */}
            <div style={{ display: "flex", borderBottom: "1px solid " + C.border, background: C.surface, overflowX: "auto", scrollbarWidth: "none" }}>
              {TABS.map(t => {
                var sayi = t.id === "hepsi" ? toplamSonuc : sonuclar[t.id]?.length || 0;
                var isActive = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{ flexShrink: 0, padding: "12px 16px", background: "none", border: "none", borderBottom: isActive ? "2px solid " + TEAL : "2px solid transparent", color: isActive ? TEAL : C.muted, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", marginBottom: "-1px", display: "flex", alignItems: "center", gap: 5 }}>
                    {t.label}
                    {sayi > 0 && <span style={{ fontSize: 10, fontWeight: 800, padding: "1px 6px", borderRadius: 10, background: isActive ? TEAL + "20" : C.input, color: isActive ? TEAL : C.muted }}>{sayi}</span>}
                  </button>
                );
              })}
            </div>

            {toplamSonuc === 0 ? (
              <div style={{ textAlign: "center", padding: "70px 20px", animation: "fadeUp 0.4s ease" }}>
                <p style={{ fontSize: 44, marginBottom: 14 }}>🔍</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>Sonuç bulunamadı</p>
                <p style={{ fontSize: 13, color: C.muted }}>"{ara}" için eşleşme yok</p>
              </div>
            ) : (
              <div style={{ padding: "8px 0" }}>
                {/* Kullanıcılar */}
                {gosterKullanici && sonuclar.kullanici.length > 0 && (
                  <div>
                    {tab === "hepsi" && <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 20px 6px" }}>Kullanıcılar</p>}
                    {sonuclar.kullanici.map((u, i) => (
                      <a key={u.id} href="/profil" className="rk" style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 20px", borderBottom: "1px solid " + C.border, background: "transparent", animation: "fadeUp 0.25s " + (i * 0.04) + "s both ease" }}>
                        <Av url={u.avatar_url} size={46} fs={18} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>@{u.username}</p>
                          {u.bio && <p style={{ fontSize: 12, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>{u.bio}</p>}
                        </div>
                        <button style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, background: TEAL + "15", border: "1px solid " + TEAL + "30", color: TEAL, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Takip</button>
                      </a>
                    ))}
                  </div>
                )}

                {/* Senaryolar */}
                {gosterSenaryo && sonuclar.senaryo.length > 0 && (
                  <div>
                    {tab === "hepsi" && <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 20px 6px" }}>Senaryolar</p>}
                    {sonuclar.senaryo.map((s, i) => (
                      <a key={s.id} href="/topluluk" className="rk" style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 20px", borderBottom: "1px solid " + C.border, background: "transparent", animation: "fadeUp 0.25s " + (i * 0.04) + "s both ease" }}>
                        <div style={{ width: 46, height: 46, borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + "20," + TEAL + "15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🎬</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.baslik}</p>
                          <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: TEAL + "15", color: TEAL }}>{s.tip}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: ACCENT + "12", color: ACCENT }}>{s.tur}</span>
                            <span style={{ fontSize: 11, color: C.muted }}>· @{s.profiles?.username}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>♥ {s.begeni_sayisi || 0}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Gönderiler */}
                {gosterGonderi && sonuclar.gonderi.length > 0 && (
                  <div>
                    {tab === "hepsi" && <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", padding: "12px 20px 6px" }}>Gönderiler</p>}
                    {sonuclar.gonderi.map((g, i) => (
                      <div key={g.id} className="rk" style={{ display: "flex", gap: 12, padding: "12px 20px", borderBottom: "1px solid " + C.border, animation: "fadeUp 0.25s " + (i * 0.04) + "s both ease" }}>
                        <Av url={g.profiles?.avatar_url} size={38} fs={15} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", gap: 6, marginBottom: 4, alignItems: "center" }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>@{g.profiles?.username || "anonim"}</span>
                            <span style={{ fontSize: 11, color: C.muted }}>· {zaman(g.created_at)}</span>
                          </div>
                          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.55, wordBreak: "break-word" }}>{g.metin?.slice(0, 140)}{g.metin?.length > 140 ? "..." : ""}</p>
                          <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>♥ {g.begeni_sayisi || 0}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "8px 0 env(safe-area-inset-bottom,8px)", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {[
          { href: "/", svg: (a) => <svg width="24" height="24" fill="none" stroke={a?TEAL:C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { href: "/kesfet", svg: (a) => <svg width="24" height="24" fill="none" stroke={a?TEAL:C.muted} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
          { href: "/topluluk", svg: (a) => <svg width="24" height="24" fill="none" stroke={a?TEAL:C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
          { href: "/mesajlar", svg: (a) => <svg width="24" height="24" fill="none" stroke={a?TEAL:C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
          { href: "/profil", svg: (a) => <svg width="24" height="24" fill="none" stroke={a?TEAL:C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ].map(item => {
          var active = item.href === "/arama";
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 14px", borderRadius: 14, position: "relative", opacity: active ? 1 : 0.45 }}>
              {item.svg(active)}
              {active && <div style={{ position: "absolute", bottom: 2, width: 18, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>

      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={() => setDrawer(false)} onTema={temaToggle} />}
    </div>
  );
}
