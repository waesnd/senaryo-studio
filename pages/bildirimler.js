import { useState, useEffect } from "react";
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
  };
}

var BILDIRIM_IKON = {
  begeni: "❤️", yorum: "💬", takip: "👤", challenge: "🎯", paylasim: "🔗", default: "🔔"
};

export default function Bildirimler() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [bildirimler, setBildirimler] = useState([]);
  var [tab, setTab] = useState("hepsi");
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);

  var dk = tema === "dark";
  var C = getC(dk);

  useEffect(() => {
    try { setTema(localStorage.getItem("sf_tema") || "light"); } catch (e) {}
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) { setUser(data.session.user); yukle(data.session.user); }
      setLoaded(true);
    });
  }, []);

  async function yukle(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(({ data }) => { if (data) setProfil(data); });
    var { data } = await supabase.from("bildirimler")
      .select("*, gonderen:profiles!gonderen_id(username, avatar_url)")
      .eq("alici_id", u.id)
      .order("created_at", { ascending: false })
      .limit(60);
    if (data) setBildirimler(data);

    // Realtime
    supabase.channel("bildirimler_" + u.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bildirimler", filter: "alici_id=eq." + u.id }, (payload) => {
        setBildirimler(p => [payload.new, ...p]);
      }).subscribe();

    // Hepsini okundu yap
    await supabase.from("bildirimler").update({ okundu: true }).eq("alici_id", u.id).eq("okundu", false);
  }

  async function tumunuSil() {
    if (!user) return;
    await supabase.from("bildirimler").delete().eq("alici_id", user.id);
    setBildirimler([]);
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60) return "az önce";
    if (d < 3600) return Math.floor(d / 60) + " dakika önce";
    if (d < 86400) return Math.floor(d / 3600) + " saat önce";
    if (d < 604800) return Math.floor(d / 86400) + " gün önce";
    return new Date(ts).toLocaleDateString("tr-TR");
  }

  var goruntu = tab === "hepsi" ? bildirimler : bildirimler.filter(b => !b.okundu);
  if (!loaded) return null;

  if (!user) return (
    <div style={{ minHeight: "100vh", background: dk ? "#080f1c" : "#eef2f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 48 }}>🔔</p>
      <p style={{ color: dk ? "#f1f5f9" : "#0f172a" }}>Bildirimleri görmek için giriş yap</p>
      <a href="/" style={{ padding: "11px 28px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", color: "#fff", fontWeight: 700, fontSize: 14 }}>Giriş Yap</a>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 80 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}a{text-decoration:none;color:inherit;}button{font-family:inherit;}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.95)" : "rgba(238,242,247,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/" style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
          {profil?.avatar_url ? <img src={profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
        </a>
        <p style={{ flex: 1, fontSize: 16, fontWeight: 800, color: C.text }}>Bildirimler</p>
        {bildirimler.length > 0 && <button onClick={tumunuSil} style={{ padding: "6px 12px", borderRadius: 10, background: ACCENT + "12", border: "none", color: ACCENT, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Temizle</button>}
      </div>

      {/* TABS */}
      <div style={{ display: "flex", borderBottom: "1px solid " + C.border, background: C.surface, maxWidth: 680, margin: "0 auto" }}>
        {[{ id: "hepsi", label: "Hepsi" }, { id: "okunmayan", label: "Okunmayan · " + bildirimler.filter(b => !b.okundu).length }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "13px 8px", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid " + TEAL : "2px solid transparent", color: tab === t.id ? TEAL : C.muted, fontSize: 14, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", marginBottom: "-1px" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {goruntu.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <p style={{ fontSize: 52, marginBottom: 14 }}>🔔</p>
            <p style={{ fontSize: 15, color: C.muted }}>{tab === "okunmayan" ? "Okunmamış bildirim yok." : "Henüz bildirim yok."}</p>
          </div>
        ) : goruntu.map((b, i) => {
          var link = b.senaryo_id ? "/senaryo/" + b.senaryo_id : b.gonderen?.username ? "/@" + b.gonderen.username : "#";
          return (
            <a key={b.id} href={link} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 20px", borderBottom: "1px solid " + C.border, background: !b.okundu ? (dk ? "rgba(8,145,178,0.06)" : "rgba(8,145,178,0.04)") : "transparent", animation: "fadeUp 0.2s " + Math.min(i * 0.03, 0.15) + "s both ease" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "30," + TEAL_L + "20)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {b.gonderen?.avatar_url ? <img src={b.gonderen.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
                </div>
                <div style={{ position: "absolute", bottom: -2, right: -2, width: 22, height: 22, borderRadius: "50%", background: C.surface, border: "2px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                  {BILDIRIM_IKON[b.tip] || BILDIRIM_IKON.default}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>
                  <strong>@{b.gonderen?.username || "Birisi"}</strong>{" "}
                  {b.tip === "begeni" && "gönderini beğendi"}
                  {b.tip === "yorum" && "yorum yaptı"}
                  {b.tip === "takip" && "seni takip etmeye başladı"}
                  {b.tip === "challenge" && "senin senaryona challenge yaptı"}
                  {b.tip === "paylasim" && "senaryonu paylaştı"}
                  {!["begeni","yorum","takip","challenge","paylasim"].includes(b.tip) && (b.mesaj || "bildirim gönderdi")}
                </p>
                {b.icerik && <p style={{ fontSize: 12, color: C.muted, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{b.icerik}"</p>}
                <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{zaman(b.created_at)}</p>
              </div>
              {!b.okundu && <div style={{ width: 8, height: 8, borderRadius: "50%", background: TEAL, flexShrink: 0 }} />}
            </a>
          );
        })}
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
          var active = item.href === "/bildirimler";
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 14px", borderRadius: 14, position: "relative", opacity: active ? 1 : 0.45 }}>
              {item.svg(active)}
              {active && <div style={{ position: "absolute", bottom: 2, width: 18, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>
    </div>
  );
}
