import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var TEAL = "#0891b2";
var TEAL_L = "#06b6d4";

var ROZET_BILGI = {
  ilk_senaryo: { icon: "🎬", label: "İlk Senaryo", renk: "#0891b2", aciklama: "İlk senaryonu ürettin!" },
  trend: { icon: "🔥", label: "Trend Oldu", renk: "#f59e0b", aciklama: "Senaryonun trend'e girdi!" },
  on_begeni: { icon: "❤️", label: "10 Beğeni", renk: "#e8230a", aciklama: "10 beğeni aldın!" },
  elli_begeni: { icon: "💎", label: "50 Beğeni", renk: "#7c3aed", aciklama: "50 beğeni aldın!" },
  challenge_king: { icon: "🏆", label: "Challenge King", renk: "#10b981", aciklama: "5 challenge'a katıldın!" },
};

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
            <Av url={avatarUrl} size={54} fs={22} />
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
            <a href="/profil" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: TEAL, fontWeight: 700, fontSize: 15, marginBottom: 4, textDecoration: "none", background: TEAL + "12" }}>
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

// İçerik aksiyonları için bottom sheet
function AksiSheet({ dk, C, tip, item, onClose, onSil, onArsiv }) {
  return (
    <div>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301, background: dk ? "#0f1829" : "#fff", borderRadius: "24px 24px 0 0", padding: "8px 0 env(safe-area-inset-bottom,24px)", boxShadow: "0 -20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", margin: "12px auto 20px" }} />
        <div style={{ padding: "0 6px 8px" }}>
          {/* Başlık */}
          <div style={{ padding: "8px 20px 16px", borderBottom: "1px solid " + C.border, marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{tip === "senaryo" ? "🎬 Senaryo" : "✍️ Gönderi"}</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {tip === "senaryo" ? item.baslik : (item.metin?.slice(0, 60) + (item.metin?.length > 60 ? "..." : ""))}
            </p>
          </div>

          {[
            { icon: "📤", label: "Paylaşımı Aç/Kapat", color: TEAL, action: () => { onArsiv("toggle_paylasim"); } },
            { icon: "🗃️", label: "Arşive Kaldır", color: C.muted, action: () => { onArsiv("arsiv"); } },
            { icon: "🗑️", label: "Sil", color: ACCENT, action: () => { onSil(); }, confirm: true },
          ].map((btn, i) => (
            <button key={i} onClick={btn.action} style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", padding: "15px 20px", background: "none", border: "none", borderRadius: 14, cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: 22, width: 32, textAlign: "center" }}>{btn.icon}</span>
              <span style={{ fontSize: 15, fontWeight: 600, color: btn.color }}>{btn.label}</span>
            </button>
          ))}

          <button onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", padding: "14px", marginTop: 4, background: dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", border: "none", borderRadius: 14, color: C.muted, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Profil() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [konular, setKonular] = useState([]);
  var [gonderiler, setGonderiler] = useState([]);
  var [tab, setTab] = useState("gonderiler");
  var [duzenle, setDuzenle] = useState(false);
  var [yeniUsername, setYeniUsername] = useState("");
  var [yeniBio, setYeniBio] = useState("");
  var [yeniLink, setYeniLink] = useState("");
  var [takipci, setTakipci] = useState(0);
  var [takip, setTakip] = useState(0);
  var [avatarYuk, setAvatarYuk] = useState(false);
  var [rozetler, setRozetler] = useState([]);
  var [arsivSenaryolar, setArsivSenaryolar] = useState([]);
  var [arsivGonderiler, setArsivGonderiler] = useState([]);
  var [arsivSekme, setArsivSekme] = useState("senaryolar");
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);
  var [aksiSheet, setAksiSheet] = useState(null); // { tip, item }
  var [silOnay, setSilOnay] = useState(false);
  var avatarRef = useRef(null);
  var bannerRef = useRef(null);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil?.avatar_url || null;
  var username = profil?.username || user?.email?.split("@")[0] || "";

  useEffect(() => {
    try { setTema(localStorage.getItem("sf_tema") || "light"); } catch (e) {}
    setTimeout(() => setLoaded(true), 80);
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) { setUser(data.session.user); yukle(data.session.user); }
    });
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) { setUser(session.user); yukle(session.user); }
      else { setUser(null); setProfil(null); }
    });
  }, []);

  function yukle(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(({ data }) => {
      if (data) { setProfil(data); setYeniUsername(data.username || ""); setYeniBio(data.bio || ""); setYeniLink(data.website || ""); }
    });
    supabase.from("senaryolar").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).then(({ data }) => { if (data) setKonular(data); });
    supabase.from("gonderiler").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).then(({ data }) => { if (data) setGonderiler(data); });
    supabase.from("takipler").select("*", { count: "exact" }).eq("takip_edilen", u.id).then(({ count }) => setTakipci(count || 0));
    supabase.from("takipler").select("*", { count: "exact" }).eq("takip_eden", u.id).then(({ count }) => setTakip(count || 0));
    supabase.from("senaryolar").select("*").eq("user_id", u.id).eq("arsiv", true).order("created_at", { ascending: false }).then(({ data }) => { if (data) setArsivSenaryolar(data); });
    supabase.from("gonderiler").select("*").eq("user_id", u.id).eq("arsiv", true).order("created_at", { ascending: false }).then(({ data }) => { if (data) setArsivGonderiler(data); });
    supabase.from("rozetler").select("*").eq("user_id", u.id).order("created_at", { ascending: false }).then(({ data }) => { if (data) setRozetler(data); });
  }

  async function avatarYukle(e) {
    var file = e.target.files[0]; if (!file || !user) return;
    setAvatarYuk(true);
    try {
      var fd = new FormData(); fd.append("file", file); fd.append("upload_preset", "scriptify_avatars");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var data = await res.json();
      if (data.secure_url) { await supabase.from("profiles").upsert({ id: user.id, avatar_url: data.secure_url }); setProfil(p => ({ ...p, avatar_url: data.secure_url })); }
    } catch (e) {}
    setAvatarYuk(false);
  }

  async function bannerYukle(e) {
    var file = e.target.files[0]; if (!file || !user) return;
    try {
      var fd = new FormData(); fd.append("file", file); fd.append("upload_preset", "scriptify_avatars");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var data = await res.json();
      if (data.secure_url) { await supabase.from("profiles").upsert({ id: user.id, banner_url: data.secure_url }); setProfil(p => ({ ...p, banner_url: data.secure_url })); }
    } catch (e) {}
  }

  async function profilKaydet() {
    if (!user) return;
    await supabase.from("profiles").upsert({ id: user.id, username: yeniUsername, bio: yeniBio, website: yeniLink });
    setProfil(p => ({ ...p, username: yeniUsername, bio: yeniBio, website: yeniLink }));
    setDuzenle(false);
  }

  async function arsivdenCikar(tip, item) {
    if (tip === "senaryo") {
      await supabase.from("senaryolar").update({ arsiv: false }).eq("id", item.id);
      setArsivSenaryolar(p => p.filter(k => k.id !== item.id));
      setKonular(p => [{ ...item, arsiv: false }, ...p]);
    } else {
      await supabase.from("gonderiler").update({ arsiv: false }).eq("id", item.id);
      setArsivGonderiler(p => p.filter(g => g.id !== item.id));
      setGonderiler(p => [{ ...item, arsiv: false }, ...p]);
    }
  }

  async function icerikSil() {
    if (!aksiSheet) return;
    var { tip, item } = aksiSheet;
    if (tip === "senaryo") {
      await supabase.from("senaryolar").delete().eq("id", item.id);
      setKonular(p => p.filter(k => k.id !== item.id));
    } else {
      await supabase.from("gonderiler").delete().eq("id", item.id);
      setGonderiler(p => p.filter(g => g.id !== item.id));
    }
    setAksiSheet(null); setSilOnay(false);
  }

  async function icerikArsiv(aksiyon) {
    if (!aksiSheet) return;
    var { tip, item } = aksiSheet;
    if (aksiyon === "arsiv") {
      if (tip === "senaryo") {
        await supabase.from("senaryolar").update({ arsiv: true }).eq("id", item.id);
        setKonular(p => p.filter(k => k.id !== item.id));
      } else {
        await supabase.from("gonderiler").update({ arsiv: true }).eq("id", item.id);
        setGonderiler(p => p.filter(g => g.id !== item.id));
      }
    } else if (aksiyon === "toggle_paylasim" && tip === "senaryo") {
      var yeni = !item.paylasim_acik;
      await supabase.from("senaryolar").update({ paylasim_acik: yeni }).eq("id", item.id);
      setKonular(p => p.map(k => k.id === item.id ? { ...k, paylasim_acik: yeni } : k));
    }
    setAksiSheet(null);
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

  if (!loaded) return null;
  if (!user) return (
    <div style={{ minHeight: "100vh", background: dk ? "#080f1c" : "#eef2f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🔐</p>
        <p style={{ fontSize: 18, fontWeight: 700, color: dk ? "#f1f5f9" : "#0f172a", marginBottom: 16 }}>Giriş yapmalısın</p>
        <button onClick={() => window.location.href = "/"} style={{ background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", borderRadius: 12, padding: "11px 28px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Ana Sayfaya Dön</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 90 }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        input::placeholder,textarea::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}
        a{text-decoration:none;color:inherit;}
        button{font-family:inherit;}
      `}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.93)" : "rgba(238,242,247,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setDrawer(true)} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "2px solid " + TEAL + "40" }}>
            {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1 }}>Scriptify</p>
            <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 1 }}>@{username}</p>
          </div>
        </button>
        <button onClick={() => setDuzenle(!duzenle)} style={{ padding: "8px 18px", borderRadius: 20, border: "1.5px solid " + (duzenle ? ACCENT : C.border), background: duzenle ? ACCENT : "transparent", color: duzenle ? "#fff" : C.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          {duzenle ? "İptal" : "Düzenle"}
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Banner */}
        <div style={{ position: "relative", height: 140, background: profil?.banner_url ? "transparent" : "linear-gradient(135deg," + TEAL + "30," + ACCENT + "15)", overflow: "hidden", cursor: "pointer" }} onClick={() => bannerRef.current?.click()}>
          {profil?.banner_url && <img src={profil.banner_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "rgba(0,0,0,0.28)", borderRadius: 10, padding: "6px 14px", color: "#fff", fontSize: 12, fontWeight: 600 }}>📷 Kapak</div>
          </div>
          <input ref={bannerRef} type="file" accept="image/*" onChange={bannerYukle} style={{ display: "none" }} />
        </div>

        <div style={{ padding: "0 20px" }}>
          {/* Avatar + butonlar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: -44, marginBottom: 14 }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => avatarRef.current?.click()}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "4px solid " + C.bg, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>
                {avatarYuk ? <div style={{ width: 26, height: 26, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  : avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
              </div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: "2px solid " + C.bg, color: "#fff" }}>✏</div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={avatarYukle} style={{ display: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => window.location.href = "/mesajlar"} style={{ padding: "9px 18px", borderRadius: 20, background: C.surface, border: "1.5px solid " + C.border, color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>💬 Mesaj</button>
              <button onClick={() => supabase.auth.signOut().then(() => window.location.href = "/")} style={{ padding: "9px 14px", borderRadius: 20, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 13, cursor: "pointer" }}>Çıkış</button>
            </div>
          </div>

          {/* Profil bilgisi / düzenleme */}
          {!duzenle ? (
            <div style={{ marginBottom: 18 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{username}</h1>
              {user && <p style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{user.email}</p>}
              {profil?.bio && <p style={{ fontSize: 15, lineHeight: 1.6, color: C.text, marginBottom: 6 }}>{profil.bio}</p>}
              {profil?.website && <a href={profil.website} target="_blank" style={{ fontSize: 13, color: TEAL, fontWeight: 600 }}>🔗 {profil.website.replace(/https?:\/\//, "")}</a>}
            </div>
          ) : (
            <div style={{ marginBottom: 18 }}>
              <input value={yeniUsername} onChange={e => setYeniUsername(e.target.value)} placeholder="kullanici_adi" style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", marginBottom: 8, fontFamily: "inherit" }} />
              <textarea value={yeniBio} onChange={e => setYeniBio(e.target.value)} placeholder="Kendini anlat..." rows={3} style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", marginBottom: 8 }} />
              <input value={yeniLink} onChange={e => setYeniLink(e.target.value)} placeholder="https://web-siten.com" style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", marginBottom: 12, fontFamily: "inherit" }} />
              <button onClick={profilKaydet} style={{ width: "100%", padding: "11px", borderRadius: 12, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Kaydet</button>
            </div>
          )}

          {/* İstatistikler */}
          <div style={{ display: "flex", marginBottom: 18, paddingBottom: 18, borderBottom: "1px solid " + C.border }}>
            {[{ val: konular.length, label: "Senaryo" }, { val: gonderiler.length, label: "Gönderi" }, { val: takipci, label: "Takipçi" }, { val: takip, label: "Takip" }].map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRight: i < 3 ? "1px solid " + C.border : "none" }}>
                <p style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{s.val}</p>
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", marginBottom: 18, borderBottom: "1px solid " + C.border }}>
            {[{ id: "gonderiler", label: "Gönderiler" }, { id: "senaryolar", label: "Senaryolar" }, { id: "rozetler", label: "🏆 Rozetler" }, { id: "arsiv", label: "🗃️ Arşiv" }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 8px", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid " + TEAL : "2px solid transparent", color: tab === t.id ? TEAL : C.muted, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", marginBottom: "-1px" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Gönderiler */}
          {tab === "gonderiler" && (
            gonderiler.length === 0
              ? <div style={{ textAlign: "center", padding: "60px 0" }}><p style={{ fontSize: 40 }}>📭</p><p style={{ fontSize: 14, color: C.muted, marginTop: 10 }}>Henüz gönderi yok.</p></div>
              : gonderiler.map(g => (
                <div key={g.id} style={{ borderBottom: "1px solid " + C.border, padding: "14px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: C.muted }}>{zaman(g.created_at)}</span>
                    <button onClick={() => setAksiSheet({ tip: "gonderi", item: g })} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>···</button>
                  </div>
                  {g.metin && <p style={{ fontSize: 15, lineHeight: 1.65, color: C.text, marginBottom: g.fotograf_url ? 10 : 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{g.metin}</p>}
                  {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", borderRadius: 14, maxHeight: 280, objectFit: "cover" }} alt="" />}

                  {/* Beğeni / Yorum / Kaydet butonları */}
                  <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                    <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      ♡ <span>{g.begeni_sayisi || 0}</span>
                    </button>
                    <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      💬 <span>Yorum</span>
                    </button>
                    <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      🔖 <span>Kaydet</span>
                    </button>
                  </div>
                </div>
              ))
          )}

          {/* Senaryolar */}
          {tab === "senaryolar" && (
            konular.length === 0
              ? <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontSize: 40, marginBottom: 10 }}>🎬</p>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 18 }}>Henüz senaryo üretmedin.</p>
                <button onClick={() => window.location.href = "/uret"} style={{ background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", borderRadius: 12, padding: "10px 24px", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Senaryo Üret →</button>
              </div>
              : konular.map(k => (
                <div key={k.id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: "16px 18px", marginBottom: 10, boxShadow: C.shadow }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", flex: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: TEAL + "15", color: TEAL }}>{k.tip}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: C.input, color: C.muted }}>{k.tur}</span>
                      {k.paylasim_acik && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>🌍 Paylaşık</span>}
                      {k.arsiv && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "rgba(0,0,0,0.06)", color: C.muted }}>🗃️ Arşiv</span>}
                    </div>
                    <button onClick={() => setAksiSheet({ tip: "senaryo", item: k })} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", padding: "0 4px", lineHeight: 1, flexShrink: 0 }}>···</button>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 4 }}>{k.baslik}</h3>
                  {k.tagline && <p style={{ fontSize: 12, fontStyle: "italic", color: C.muted, marginBottom: 4 }}>{k.tagline}</p>}
                  {k.ana_fikir && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{k.ana_fikir.slice(0, 120)}{k.ana_fikir.length > 120 ? "..." : ""}</p>}

                  {/* Beğeni / Yorum / Kaydet */}
                  <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                    <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      ♡ <span>{k.begeni_sayisi || 0}</span>
                    </button>
                    <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      💬 <span>Yorum</span>
                    </button>
                    <button style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 12, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      🔖 <span>Kaydet</span>
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 10 }}>♥ {k.begeni_sayisi || 0} · {zaman(k.created_at)}</p>
                </div>
              ))
          )}
        </div>
      </div>

      {/* ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {[{ icon: "🏠", href: "/" }, { icon: "🔭", href: "/kesfet" }, { icon: "🎭", href: "/topluluk" }, { icon: "💬", href: "/mesajlar" }].map(item => (
          <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", padding: "6px 24px", borderRadius: 14 }}>
            <span style={{ fontSize: 26, filter: "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
          </a>
        ))}
      </div>

      {tab === "rozetler" && (
        rozetler.length === 0
          ? <div style={{ textAlign: "center", padding: "60px 0" }}>
              <p style={{ fontSize: 44, marginBottom: 12 }}>🏆</p>
              <p style={{ fontSize: 14, color: C.muted }}>Henüz rozet kazanmadın.</p>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Senaryo üret, beğeni al, challenge'a katıl!</p>
            </div>
          : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, paddingBottom: 20 }}>
              {rozetler.map((r, i) => {
                var bilgi = ROZET_BILGI[r.tip] || { icon: "⭐", label: r.tip, renk: TEAL, aciklama: "" };
                return (
                  <div key={r.id || i} style={{ background: C.surface, border: "2px solid " + bilgi.renk + "30", borderRadius: 18, padding: "20px 16px", textAlign: "center", boxShadow: "0 4px 16px " + bilgi.renk + "15", animation: "fadeUp 0.3s " + (i * 0.05) + "s both ease" }}>
                    <div style={{ fontSize: 38, marginBottom: 10 }}>{bilgi.icon}</div>
                    <p style={{ fontSize: 13, fontWeight: 800, color: bilgi.renk, marginBottom: 4 }}>{bilgi.label}</p>
                    <p style={{ fontSize: 11, color: C.muted }}>{bilgi.aciklama}</p>
                    <p style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{new Date(r.created_at).toLocaleDateString("tr-TR")}</p>
                  </div>
                );
              })}
            </div>
      )}

      {tab === "arsiv" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {[{ id: "senaryolar", label: "🎬 Senaryolar (" + arsivSenaryolar.length + ")" }, { id: "gonderiler", label: "✍️ Gönderiler (" + arsivGonderiler.length + ")" }].map(s => (
              <button key={s.id} onClick={() => setArsivSekme(s.id)} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "1.5px solid " + (arsivSekme === s.id ? TEAL : C.border), background: arsivSekme === s.id ? TEAL + "15" : C.input, color: arsivSekme === s.id ? TEAL : C.muted, fontSize: 12, fontWeight: arsivSekme === s.id ? 700 : 500, cursor: "pointer" }}>{s.label}</button>
            ))}
          </div>

          {arsivSekme === "senaryolar" && (
            arsivSenaryolar.length === 0
              ? <div style={{ textAlign: "center", padding: "50px 0" }}><p style={{ fontSize: 36 }}>🗃️</p><p style={{ fontSize: 14, color: C.muted, marginTop: 10 }}>Arşivde senaryo yok.</p></div>
              : arsivSenaryolar.map(k => (
                <div key={k.id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: "14px 16px", marginBottom: 10, opacity: 0.8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: TEAL + "15", color: TEAL }}>{k.tip}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: C.input, color: C.muted }}>{k.tur}</span>
                    </div>
                    <button onClick={() => arsivdenCikar("senaryo", k)} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 10, background: TEAL + "15", border: "none", color: TEAL, cursor: "pointer" }}>Geri Al</button>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{k.baslik}</p>
                  {k.tagline && <p style={{ fontSize: 12, fontStyle: "italic", color: C.muted, marginTop: 3 }}>{k.tagline}</p>}
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{zaman(k.created_at)}</p>
                </div>
              ))
          )}

          {arsivSekme === "gonderiler" && (
            arsivGonderiler.length === 0
              ? <div style={{ textAlign: "center", padding: "50px 0" }}><p style={{ fontSize: 36 }}>🗃️</p><p style={{ fontSize: 14, color: C.muted, marginTop: 10 }}>Arşivde gönderi yok.</p></div>
              : arsivGonderiler.map(g => (
                <div key={g.id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: "14px 16px", marginBottom: 10, opacity: 0.8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: C.muted }}>{zaman(g.created_at)}</span>
                    <button onClick={() => arsivdenCikar("gonderi", g)} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 10, background: TEAL + "15", border: "none", color: TEAL, cursor: "pointer" }}>Geri Al</button>
                  </div>
                  <p style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>{g.metin?.slice(0, 100)}{g.metin?.length > 100 ? "..." : ""}</p>
                </div>
              ))
          )}
        </div>
      )}

      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={() => setDrawer(false)} onTema={temaToggle} />}

      {/* Aksiyon Bottom Sheet */}
      {aksiSheet && !silOnay && (
        <AksiSheet dk={dk} C={C} tip={aksiSheet.tip} item={aksiSheet.item}
          onClose={() => setAksiSheet(null)}
          onSil={() => setSilOnay(true)}
          onArsiv={icerikArsiv}
        />
      )}

      {/* Silme Onay Modalı */}
      {silOnay && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={() => { setSilOnay(false); setAksiSheet(null); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "relative", zIndex: 1, background: dk ? "#0f1829" : "#fff", borderRadius: 24, padding: "28px 24px", maxWidth: 340, width: "100%", textAlign: "center" }}>
            <p style={{ fontSize: 40, marginBottom: 14 }}>🗑️</p>
            <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 8 }}>Silmek istediğine emin misin?</p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Bu işlem geri alınamaz.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setSilOnay(false); setAksiSheet(null); }} style={{ flex: 1, padding: "12px", borderRadius: 12, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>İptal</button>
              <button onClick={icerikSil} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
