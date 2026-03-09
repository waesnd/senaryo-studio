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
    shadow: dk ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.06)",
  };
}

var TIP_BILGI = {
  begeni: { icon: "❤️", renk: ACCENT, label: "senaryonu beğendi" },
  yorum: { icon: "💬", renk: TEAL, label: "yorum yaptı" },
  takip: { icon: "👤", renk: "#10b981", label: "seni takip etmeye başladı" },
  challenge: { icon: "🎯", renk: "#f59e0b", label: "challenge'ına katıldı" },
};

function Av({ url, size, fs }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs || 14, flexShrink: 0 }}>
      {url ? <img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
    </div>
  );
}

export default function Bildirimler() {
  var [user, setUser] = useState(null);
  var [bildirimler, setBildirimler] = useState([]);
  var [yukleniyor, setYukleniyor] = useState(true);
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [sekme, setSekme] = useState("hepsi");

  var dk = tema === "dark";
  var C = getC(dk);

  useEffect(() => {
    try { setTema(localStorage.getItem("sf_tema") || "light"); } catch (e) {}
    supabase.auth.getSession().then(({ data }) => {
      setLoaded(true);
      if (data?.session) { setUser(data.session.user); yukle(data.session.user); }
      else { setYukleniyor(false); }
    });
  }, []);

  async function yukle(u) {
    setYukleniyor(true);
    var { data } = await supabase.from("bildirimler")
      .select("*, gonderen:gonderen_id(username, avatar_url)")
      .eq("alici_id", u.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setBildirimler(data);
    setYukleniyor(false);
    // Hepsini okundu yap
    await supabase.from("bildirimler").update({ okundu: true }).eq("alici_id", u.id).eq("okundu", false);
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60) return d + "s";
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g";
  }

  var okunmayanlar = bildirimler.filter(b => !b.okundu);
  var gosterilen = sekme === "okunmayan" ? okunmayanlar : bildirimler;

  if (!loaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 90 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}@keyframes spin{to{transform:rotate(360deg);}}a{text-decoration:none;color:inherit;}button{font-family:inherit;}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.93)" : "rgba(238,242,247,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/" style={{ fontSize: 20, color: C.muted, lineHeight: 1 }}>←</a>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>Bildirimler</p>
            {okunmayanlar.length > 0 && <p style={{ fontSize: 11, color: ACCENT, fontWeight: 600 }}>{okunmayanlar.length} yeni</p>}
          </div>
        </div>
        <a href="/profil" style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>👤</a>
      </div>

      {/* Sekmeler */}
      <div style={{ display: "flex", borderBottom: "1px solid " + C.border, background: C.surface }}>
        {[{ id: "hepsi", label: "Tümü" }, { id: "okunmayan", label: "Okunmayan " + (okunmayanlar.length > 0 ? "(" + okunmayanlar.length + ")" : "") }].map(s => (
          <button key={s.id} onClick={() => setSekme(s.id)} style={{ flex: 1, padding: "13px 8px", background: "none", border: "none", borderBottom: sekme === s.id ? "2px solid " + TEAL : "2px solid transparent", color: sekme === s.id ? TEAL : C.muted, fontSize: 13, fontWeight: sekme === s.id ? 700 : 500, cursor: "pointer", marginBottom: "-1px" }}>
            {s.label}
          </button>
        ))}
      </div>

      {!user ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <p style={{ fontSize: 44, marginBottom: 14 }}>🔐</p>
          <p style={{ fontSize: 15, color: C.muted }}>Bildirimleri görmek için giriş yap.</p>
          <a href="/" style={{ display: "inline-block", marginTop: 16, padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", color: "#fff", fontSize: 14, fontWeight: 700 }}>Giriş Yap</a>
        </div>
      ) : yukleniyor ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
          <div style={{ width: 28, height: 28, border: "3px solid " + C.border, borderTopColor: TEAL, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : gosterilen.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <p style={{ fontSize: 44, marginBottom: 14 }}>🔔</p>
          <p style={{ fontSize: 15, color: C.muted }}>{sekme === "okunmayan" ? "Okunmayan bildirim yok." : "Henüz bildirim yok."}</p>
        </div>
      ) : (
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {gosterilen.map((b, i) => {
            var bilgi = TIP_BILGI[b.tip] || { icon: "🔔", renk: C.muted, label: b.tip };
            var gonderen = b.gonderen || {};
            return (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 20px", borderBottom: "1px solid " + C.border, background: !b.okundu ? (dk ? "rgba(8,145,178,0.06)" : "rgba(8,145,178,0.04)") : "transparent", animation: "fadeUp 0.25s " + Math.min(i * 0.03, 0.15) + "s both ease" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <Av url={gonderen.avatar_url} size={44} fs={17} />
                  <div style={{ position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: "50%", background: bilgi.renk, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid " + C.bg }}>
                    {bilgi.icon}
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, color: C.text, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700 }}>@{gonderen.username || "biri"}</span>
                    {" "}<span style={{ color: C.muted }}>{bilgi.label}</span>
                  </p>
                  {b.icerik && <p style={{ fontSize: 12, color: C.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.icerik}</p>}
                </div>
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <p style={{ fontSize: 11, color: C.muted }}>{zaman(b.created_at)}</p>
                  {!b.okundu && <div style={{ width: 8, height: 8, borderRadius: "50%", background: TEAL, margin: "4px auto 0" }} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {[{ icon: "🏠", href: "/" }, { icon: "🔭", href: "/kesfet" }, { icon: "🎭", href: "/topluluk" }, { icon: "💬", href: "/mesajlar" }].map(item => (
          <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", padding: "6px 24px", borderRadius: 14 }}>
            <span style={{ fontSize: 26, filter: "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
