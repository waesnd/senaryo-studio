import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var TEAL = "#0891b2";
var TEAL_L = "#06b6d4";

function getC(dk) {
  return {
    bg:      dk ? "#080f1c" : "#f4f6fb",
    surface: dk ? "#0f1829" : "#ffffff",
    border:  dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text:    dk ? "#f1f5f9" : "#0f172a",
    muted:   dk ? "rgba(241,245,249,0.45)" : "rgba(15,23,42,0.42)",
    input:   dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
  };
}

function getInitialTema() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
} catch (e) {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

var BILDIRIM = {
  begeni:    { ikon: "❤️", metin: "gönderini beğendi",           renk: ACCENT },
  yorum:     { ikon: "💬", metin: "yorum yaptı",                 renk: TEAL },
  takip:     { ikon: "👤", metin: "seni takip etmeye başladı",   renk: "#8b5cf6" },
  challenge: { ikon: "🎯", metin: "senaryona challenge yaptı",   renk: "#f59e0b" },
  paylasim:  { ikon: "🔗", metin: "senaryonu paylaştı",          renk: "#10b981" },
  default:   { ikon: "🔔", metin: "bildirim gönderdi",           renk: TEAL },
};

export default function Bildirimler() {
  var [user, setUser]         = useState(null);
  var [profil, setProfil]     = useState(null);
  var [bildirimler, setBildirimler] = useState([]);
  var [tab, setTab]           = useState("hepsi");
  var [tema, setTema]         = useState("light");
  var [loaded, setLoaded]     = useState(false);

  var dk = tema === "dark";
  var C  = getC(dk);

  useEffect(() => {
    var t = getInitialTema(); setTema(t);
    function onTema(e) { setTema(e.detail); }
    window.addEventListener("sf_tema_change", onTema);

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) { setUser(data.session.user); yukle(data.session.user); }
      setLoaded(true);
    });
    return () => window.removeEventListener("sf_tema_change", onTema);
  }, []);

  async function yukle(u) {
    var { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).single();
    if (p) setProfil(p);

    var { data } = await supabase
      .from("bildirimler")
      .select("*, gonderen:profiles!gonderen_id(username,avatar_url,dogrulandi)")
      .eq("alici_id", u.id)
      .order("created_at", { ascending: false })
      .limit(80);
    if (data) setBildirimler(data);

    // Realtime
    supabase.channel("bildirimleri_" + u.id)
      .on("postgres_changes", {
        event: "INSERT", schema: "public",
        table: "bildirimler", filter: "alici_id=eq." + u.id,
      }, payload => setBildirimler(prev => [payload.new, ...prev]))
      .subscribe();

    // Okundu yap
    await supabase.from("bildirimler").update({ okundu: true }).eq("alici_id", u.id).eq("okundu", false);
  }

  async function tumunuSil() {
    if (!confirm("Tüm bildirimler silinsin mi?")) return;
    await supabase.from("bildirimler").delete().eq("alici_id", user.id);
    setBildirimler([]);
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60)     return "az önce";
    if (d < 3600)   return Math.floor(d / 60) + "dk önce";
    if (d < 86400)  return Math.floor(d / 3600) + "sa önce";
    if (d < 604800) return Math.floor(d / 86400) + "g önce";
    return new Date(ts).toLocaleDateString("tr-TR");
  }

  var okunmayanSayi = bildirimler.filter(b => !b.okundu).length;
  var goruntu = tab === "hepsi" ? bildirimler : bildirimler.filter(b => !b.okundu);

  if (!loaded) return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid " + TEAL + "30", borderTopColor: TEAL, animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: "100vh", background: dk ? "#080f1c" : "#f4f6fb", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif", flexDirection: "column", gap: 16 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <p style={{ fontSize: 48 }}>🔔</p>
      <p style={{ color: dk ? "#f1f5f9" : "#0f172a", fontSize: 15 }}>Bildirimleri görmek için giriş yap</p>
      <a href="/" style={{ padding: "11px 28px", borderRadius: 14, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Giriş Yap</a>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 90 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{display:none;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}@keyframes spin{to{transform:rotate(360deg);}}a{text-decoration:none;color:inherit;}button{font-family:inherit;cursor:pointer;}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.96)" : "rgba(244,246,251,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/" style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {profil?.avatar_url ? <img src={profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>}
        </a>
        <p style={{ flex: 1, fontSize: 16, fontWeight: 800, color: C.text }}>Bildirimler</p>
        {bildirimler.length > 0 && (
          <button onClick={tumunuSil} style={{ padding: "6px 14px", borderRadius: 20, background: ACCENT + "12", border: "1px solid " + ACCENT + "25", color: ACCENT, fontSize: 12, fontWeight: 700 }}>Temizle</button>
        )}
      </div>

      {/* TABS */}
      <div style={{ display: "flex", background: C.surface, borderBottom: "1px solid " + C.border, maxWidth: 680, margin: "0 auto" }}>
        {[
          { id: "hepsi", label: "Hepsi", count: bildirimler.length },
          { id: "okunmayan", label: "Okunmayan", count: okunmayanSayi },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "14px 8px", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid " + TEAL : "2px solid transparent", color: tab === t.id ? TEAL : C.muted, fontSize: 14, fontWeight: tab === t.id ? 700 : 500, marginBottom: -1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {t.label}
            {t.count > 0 && <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 10, background: tab === t.id ? TEAL + "18" : C.input, color: tab === t.id ? TEAL : C.muted }}>{t.count}</span>}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {goruntu.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <p style={{ fontSize: 52, marginBottom: 14 }}>🔔</p>
            <p style={{ fontSize: 15, color: C.muted }}>{tab === "okunmayan" ? "Okunmamış bildirim yok." : "Henüz bildirim yok."}</p>
          </div>
        ) : goruntu.map((b, i) => {
          var info = BILDIRIM[b.tip] || BILDIRIM.default;
          var link = b.senaryo_id ? "/senaryo/" + b.senaryo_id : b.gonderen?.username ? "/@" + b.gonderen.username : "#";
          return (
            <a key={b.id} href={link} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 20px", borderBottom: "1px solid " + C.border, background: !b.okundu ? (dk ? info.renk + "08" : info.renk + "05") : "transparent", animation: i < 10 ? "fadeUp 0.2s " + (i * 0.02) + "s both" : "none" }}>

              {/* Avatar + ikon */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", overflow: "hidden", background: "linear-gradient(135deg," + TEAL + "30," + TEAL_L + "20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {b.gonderen?.avatar_url
                    ? <img src={b.gonderen.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : <svg width="20" height="20" fill="none" stroke={C.muted} strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  }
                </div>
                <div style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: "50%", background: C.surface, border: "2px solid " + C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  {info.ikon}
                </div>
              </div>

              {/* İçerik */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>
                  <strong style={{ color: C.text }}>@{b.gonderen?.username || "Birisi"}</strong>
                  {b.gonderen?.dogrulandi && <span style={{ marginLeft: 3, color: TEAL, fontSize: 12 }}>✓</span>}
                  {" "}<span style={{ color: C.muted }}>{info.metin}</span>
                </p>
                {b.icerik && <p style={{ fontSize: 12, color: C.muted, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{b.icerik}"</p>}
                <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{zaman(b.created_at)}</p>
              </div>

              {/* Okunmamış nokta */}
              {!b.okundu && <div style={{ width: 8, height: 8, borderRadius: "50%", background: info.renk, flexShrink: 0 }} />}
            </a>
          );
        })}
      </div>

      {/* ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: C.surface + "f8", backdropFilter: "blur(24px)", borderTop: "1px solid " + C.border, padding: "8px 0 env(safe-area-inset-bottom,8px)", display: "flex", justifyContent: "space-around" }}>
        {[
          { href: "/",         icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
          { href: "/kesfet",   icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
          { href: "/topluluk", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg> },
          { href: "/mesajlar", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg> },
          { href: "/profil",   icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
        ].map(item => (
          <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5px 14px", position: "relative", color: C.muted }}>
            {item.icon}
          </a>
        ))}
      </div>
    </div>
  );
}
