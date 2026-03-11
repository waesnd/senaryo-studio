import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var TEAL = "#0891b2";
var TEAL_L = "#06b6d4";

var ROZET_BILGI = {
  ilk_senaryo: { icon: "🎬", label: "İlk Senaryo", desc: "İlk senaryonu yayınladın!" },
  trend: { icon: "🔥", label: "Trend", desc: "Senaryoların trend oldu!" },
  on_begeni: { icon: "❤️", label: "10 Beğeni", desc: "10 beğeni aldın!" },
  elli_begeni: { icon: "💯", label: "50 Beğeni", desc: "50 beğeni aldın!" },
  challenge_king: { icon: "👑", label: "Challenge Kralı", desc: "5 challenge tamamladın!" },
};

function getC(dk) {
  return {
    bg: dk ? "#080f1c" : "#f4f6fb",
    surface: dk ? "#0f1829" : "#ffffff",
    border: dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dk ? "#f1f5f9" : "#0f172a",
    muted: dk ? "rgba(241,245,249,0.45)" : "rgba(15,23,42,0.45)",
    input: dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
  };
}

function Yukluyor({ dk }) {
  var C = getC(dk);
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid " + TEAL + "30", borderTopColor: TEAL, animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function Bos({ icon, metin, aksiyon, href }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <p style={{ fontSize: 44, marginBottom: 12 }}>{icon}</p>
      <p style={{ fontSize: 15, color: "rgba(15,23,42,0.4)", marginBottom: 20 }}>{metin}</p>
      {aksiyon && href && (
        <a href={href} style={{ display: "inline-block", padding: "11px 28px", borderRadius: 14, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>{aksiyon}</a>
      )}
    </div>
  );
}

export default function Profil() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [senaryolar, setSenaryolar] = useState([]);
  var [gonderiler, setGonderiler] = useState([]);
  var [arsivSenaryolar, setArsivSenaryolar] = useState([]);
  var [arsivGonderiler, setArsivGonderiler] = useState([]);
  var [kaydedilenSenaryolar, setKaydedilenSenaryolar] = useState([]);
  var [rozetler, setRozetler] = useState([]);
  var [tab, setTab] = useState("gonderiler");
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [duzenle, setDuzenle] = useState(false);
  var [bioEdit, setBioEdit] = useState("");
  var [usernameEdit, setUsernameEdit] = useState("");
  var [websiteEdit, setWebsiteEdit] = useState("");
  var [gizliEdit, setGizliEdit] = useState(false);
  var [kaydetYukleniyor, setKaydetYukleniyor] = useState(false);
  var [avatarYukleniyor, setAvatarYukleniyor] = useState(false);
  var [bannerYukleniyor, setBannerYukleniyor] = useState(false);
  var [actionSheet, setActionSheet] = useState(null);
  var [takipci, setTakipci] = useState(0);
  var [takip, setTakip] = useState(0);
  var avatarRef = useRef(null);
  var bannerRef = useRef(null);

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
    var { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).single();
    if (p) {
      setProfil(p);
      setBioEdit(p.bio || "");
      setUsernameEdit(p.username || "");
      setWebsiteEdit(p.website || "");
      setGizliEdit(p.gizli || false);
      if (!p.username || p.username.trim() === "") setTimeout(() => setDuzenle(true), 600);
    }
    var [s, g, sa, ga, r, tc, tp, ks] = await Promise.all([
      supabase.from("senaryolar").select("*").eq("user_id", u.id).eq("arsiv", false).order("created_at", { ascending: false }),
      supabase.from("gonderiler").select("*").eq("user_id", u.id).eq("arsiv", false).order("created_at", { ascending: false }),
      supabase.from("senaryolar").select("*").eq("user_id", u.id).eq("arsiv", true),
      supabase.from("gonderiler").select("*").eq("user_id", u.id).eq("arsiv", true),
      supabase.from("rozetler").select("*").eq("user_id", u.id),
      supabase.from("takipler").select("*", { count: "exact" }).eq("takip_edilen", u.id),
      supabase.from("takipler").select("*", { count: "exact" }).eq("takip_eden", u.id),
      supabase.from("kaydedilenler").select("senaryo_id, senaryolar(*)").eq("user_id", u.id).not("senaryo_id", "is", null),
    ]);
    if (s.data) setSenaryolar(s.data);
    if (g.data) setGonderiler(g.data);
    if (sa.data) setArsivSenaryolar(sa.data);
    if (ga.data) setArsivGonderiler(ga.data);
    if (r.data) setRozetler(r.data);
    if (tc.count !== null) setTakipci(tc.count);
    if (tp.count !== null) setTakip(tp.count);
    if (ks.data) setKaydedilenSenaryolar(ks.data.map(k => k.senaryolar).filter(Boolean));
  }

  async function profilKaydet() {
    if (!user) return;
    var u = usernameEdit.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!u || u.length < 3) { alert("Kullanıcı adı en az 3 karakter olmalı!"); return; }
    setKaydetYukleniyor(true);
    var { data: mevcutlar } = await supabase.from("profiles").select("id").eq("username", u).neq("id", user.id);
    if (mevcutlar && mevcutlar.length > 0) { alert("@" + u + " zaten alınmış!"); setKaydetYukleniyor(false); return; }
    var { error } = await supabase.from("profiles").update({ bio: bioEdit, username: u, website: websiteEdit, gizli: gizliEdit }).eq("id", user.id);
    if (error) { alert("Hata: " + error.message); setKaydetYukleniyor(false); return; }
    var { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (p) { setProfil(p); setUsernameEdit(p.username || ""); }
    setDuzenle(false);
    setKaydetYukleniyor(false);
  }

  async function cloudinarySil(url) {
    if (!url) return;
    try {
      var match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
      await fetch("/api/medya-sil", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ public_id: match ? match[1] : null, url }) });
    } catch (e) {}
  }

  async function avatarDegistir(e) {
    var file = e.target.files[0]; if (!file) return;
    setAvatarYukleniyor(true);
    try {
      var fd = new FormData(); fd.append("file", file); fd.append("upload_preset", "scriptify_avatars");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var d = await res.json();
      if (d.secure_url) {
        if (profil?.avatar_url) await cloudinarySil(profil.avatar_url);
        await supabase.from("profiles").update({ avatar_url: d.secure_url }).eq("id", user.id);
        setProfil(p => ({ ...p, avatar_url: d.secure_url }));
      }
    } catch (e) {}
    setAvatarYukleniyor(false);
  }

  async function bannerDegistir(e) {
    var file = e.target.files[0]; if (!file) return;
    setBannerYukleniyor(true);
    try {
      var fd = new FormData(); fd.append("file", file); fd.append("upload_preset", "scriptify_posts");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var d = await res.json();
      if (d.secure_url) {
        if (profil?.banner_url) await cloudinarySil(profil.banner_url);
        await supabase.from("profiles").update({ banner_url: d.secure_url }).eq("id", user.id);
        setProfil(p => ({ ...p, banner_url: d.secure_url }));
      }
    } catch (e) {}
    setBannerYukleniyor(false);
  }

  async function avatarSil() {
    if (!profil?.avatar_url || !confirm("Profil fotoğrafı silinsin mi?")) return;
    setAvatarYukleniyor(true);
    await cloudinarySil(profil.avatar_url);
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", user.id);
    setProfil(p => ({ ...p, avatar_url: null }));
    setAvatarYukleniyor(false);
  }

  async function bannerSil() {
    if (!profil?.banner_url || !confirm("Banner silinsin mi?")) return;
    setBannerYukleniyor(true);
    await cloudinarySil(profil.banner_url);
    await supabase.from("profiles").update({ banner_url: null }).eq("id", user.id);
    setProfil(p => ({ ...p, banner_url: null }));
    setBannerYukleniyor(false);
  }

  async function arsivToggle(tip, id, arsivDurumu) {
    await supabase.from(tip === "senaryo" ? "senaryolar" : "gonderiler").update({ arsiv: !arsivDurumu }).eq("id", id);
    if (tip === "senaryo") {
      if (arsivDurumu) { var x = arsivSenaryolar.find(s => s.id === id); setSenaryolar(p => [x, ...p]); setArsivSenaryolar(p => p.filter(s => s.id !== id)); }
      else { var y = senaryolar.find(s => s.id === id); setArsivSenaryolar(p => [y, ...p]); setSenaryolar(p => p.filter(s => s.id !== id)); }
    } else {
      if (arsivDurumu) { var a = arsivGonderiler.find(g => g.id === id); setGonderiler(p => [a, ...p]); setArsivGonderiler(p => p.filter(g => g.id !== id)); }
      else { var b = gonderiler.find(g => g.id === id); setArsivGonderiler(p => [b, ...p]); setGonderiler(p => p.filter(g => g.id !== id)); }
    }
    setActionSheet(null);
  }

  async function sil(tip, id) {
    if (!confirm("Silinsin mi?")) return;
    if (tip === "senaryo") {
      await supabase.from("senaryolar").delete().eq("id", id);
      setSenaryolar(p => p.filter(s => s.id !== id));
    } else {
      var gnd = gonderiler.find(g => g.id === id) || arsivGonderiler.find(g => g.id === id);
      if (gnd?.fotograf_url) await cloudinarySil(gnd.fotograf_url);
      await supabase.from("gonderiler").delete().eq("id", id);
      setGonderiler(p => p.filter(g => g.id !== id));
      setArsivGonderiler(p => p.filter(g => g.id !== id));
    }
    setActionSheet(null);
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g";
  }

  if (!loaded) return <Yukluyor dk={dk} />;

  if (!user) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif", flexDirection: "column", gap: 16 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <p style={{ fontSize: 48 }}>🔐</p>
      <p style={{ color: C.text, fontSize: 16 }}>Profili görmek için giriş yap</p>
      <a href="/" style={{ padding: "12px 32px", borderRadius: 14, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", color: "#fff", fontWeight: 700, fontSize: 15, textDecoration: "none" }}>Giriş Yap</a>
    </div>
  );

  var username = profil?.username || "";
  var TABS = [
    { id: "gonderiler", label: "Gönderiler", count: gonderiler.length },
    { id: "senaryolar", label: "Senaryolar", count: senaryolar.length },
    { id: "kaydedilenler", label: "Kaydedilenler", count: kaydedilenSenaryolar.length },
    { id: "arsiv", label: "Arşiv", count: arsivSenaryolar.length + arsivGonderiler.length },
    { id: "rozetler", label: "Rozetler", count: rozetler.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 90 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{display:none;}@keyframes spin{to{transform:rotate(360deg);}}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}input,textarea{font-family:inherit;}button{font-family:inherit;cursor:pointer;}a{text-decoration:none;color:inherit;}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.96)" : "rgba(244,246,251,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "0 16px", height: 56, display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/" style={{ width: 34, height: 34, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {profil?.avatar_url ? <img src={profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>}
        </a>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{username ? "@" + username : "Profilim"}</p>
          <p style={{ fontSize: 11, color: C.muted }}>{user?.email}</p>
        </div>
        <button onClick={() => setDuzenle(true)} style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid " + C.border, background: "none", color: C.text, fontSize: 13, fontWeight: 600 }}>Düzenle</button>
        <button onClick={() => confirm("Çıkış yapılsın mı?") && supabase.auth.signOut().then(() => window.location.href = "/")} style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid " + ACCENT + "50", background: ACCENT + "10", color: ACCENT, fontSize: 13, fontWeight: 600 }}>Çıkış</button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        {/* BANNER */}
        <div style={{ height: 140, position: "relative", overflow: "hidden", background: "linear-gradient(135deg," + TEAL + "25," + ACCENT + "12)", cursor: "pointer" }} onClick={() => !profil?.banner_url && bannerRef.current?.click()}>
          {profil?.banner_url && <img src={profil.banner_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />}
          {!profil?.banner_url && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <svg width="26" height="26" fill="none" stroke={TEAL} strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.5 }}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></svg>
              <p style={{ fontSize: 12, color: TEAL, opacity: 0.6, fontWeight: 600 }}>Banner eklemek için tıkla</p>
            </div>
          )}
          {profil?.banner_url && <>
            <button onClick={e => { e.stopPropagation(); bannerRef.current?.click(); }} style={{ position: "absolute", top: 10, right: 46, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="3" /></svg>
            </button>
            <button onClick={e => { e.stopPropagation(); bannerSil(); }} style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", color: "#fff", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          </>}
          <input ref={bannerRef} type="file" accept="image/*" onChange={bannerDegistir} style={{ display: "none" }} />
        </div>

        {/* PROFİL KART */}
        <div style={{ background: C.surface, borderBottom: "1px solid " + C.border, padding: "0 20px 20px" }}>
          {/* Avatar + stats */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -44, marginBottom: 16 }}>
            <div style={{ position: "relative" }}>
              <div onClick={() => avatarRef.current?.click()} style={{ width: 88, height: 88, borderRadius: "50%", border: "4px solid " + C.surface, overflow: "hidden", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                {profil?.avatar_url
                  ? <img src={profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                  : <svg width="34" height="34" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                }
              </div>
              <div onClick={() => avatarRef.current?.click()} style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: TEAL, border: "2.5px solid " + C.surface, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                {avatarYukleniyor
                  ? <div style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  : <svg width="12" height="12" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="3" /></svg>
                }
              </div>
              {profil?.avatar_url && (
                <button onClick={avatarSil} style={{ position: "absolute", top: 2, left: 2, width: 22, height: 22, borderRadius: "50%", background: ACCENT, border: "2px solid " + C.surface, color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              )}
              <input ref={avatarRef} type="file" accept="image/*" onChange={avatarDegistir} style={{ display: "none" }} />
            </div>

            <div style={{ display: "flex", gap: 24, paddingBottom: 6 }}>
              {[{ val: senaryolar.length, label: "Senaryo" }, { val: takipci, label: "Takipçi" }, { val: takip, label: "Takip" }].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: C.text, lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* İsim & bilgi */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
            <p style={{ fontSize: 17, fontWeight: 800, color: C.text }}>
              {username ? "@" + username : <span onClick={() => setDuzenle(true)} style={{ color: TEAL, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>+ Kullanıcı adı belirle</span>}
            </p>
            {profil?.dogrulandi && (
              <div title="Doğrulanmış hesap" style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
            )}
          </div>
          {profil?.bio && <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginBottom: 8 }}>{profil.bio}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
            {profil?.website && (
              <a href={profil.website} target="_blank" style={{ fontSize: 13, color: TEAL, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="13" height="13" fill="none" stroke={TEAL} strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
                {profil.website.replace(/https?:\/\//, "")}
              </a>
            )}
            {profil?.gizli && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: C.input, border: "1px solid " + C.border, color: C.muted }}>🔒 Gizli</span>
            )}
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", background: C.surface, borderBottom: "1px solid " + C.border, overflowX: "auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "0 0 auto", padding: "14px 16px", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid " + TEAL : "2px solid transparent", color: tab === t.id ? TEAL : C.muted, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, whiteSpace: "nowrap", marginBottom: -1, display: "flex", alignItems: "center", gap: 5 }}>
              {t.label}
              {t.count > 0 && <span style={{ fontSize: 10, background: tab === t.id ? TEAL + "18" : C.input, color: tab === t.id ? TEAL : C.muted, padding: "1px 6px", borderRadius: 10 }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* İÇERİK */}
        <div style={{ padding: 16 }}>

          {tab === "gonderiler" && (gonderiler.length === 0 ? <Bos icon="✍️" metin="Henüz gönderi yok." aksiyon="Ana Sayfaya Git" href="/" /> :
            gonderiler.map(g => (
              <div key={g.id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 16, marginBottom: 10, overflow: "hidden", animation: "fadeUp 0.2s ease" }}>
                <div style={{ padding: "14px 16px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{zaman(g.created_at)}</span>
                  <button onClick={() => setActionSheet({ tip: "gonderi", id: g.id, arsiv: g.arsiv })} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, padding: "0 4px", lineHeight: 1 }}>⋯</button>
                </div>
                {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", maxHeight: 280, objectFit: "cover", display: "block" }} alt="" />}
                {g.metin && <p style={{ padding: "12px 16px", fontSize: 14, color: C.text, lineHeight: 1.65 }}>{g.metin}</p>}
                <div style={{ padding: "10px 16px 14px", borderTop: "1px solid " + C.border, display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 13, color: C.muted }}>❤️ {g.begeni_sayisi || 0}</span>
                </div>
              </div>
            ))
          )}

          {tab === "senaryolar" && (senaryolar.length === 0 ? <Bos icon="🎬" metin="Henüz senaryo yok." aksiyon="Senaryo Üret" href="/uret" /> :
            senaryolar.map(s => (
              <div key={s.id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: 16, marginBottom: 10, animation: "fadeUp 0.2s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                      {s.tur && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: TEAL + "15", color: TEAL }}>{s.tur}</span>}
                      {s.paylasim_acik && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "#10b98118", color: "#10b981" }}>Herkese Açık</span>}
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.4 }}>{s.baslik}</p>
                  </div>
                  <button onClick={() => setActionSheet({ tip: "senaryo", id: s.id, arsiv: s.arsiv })} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, padding: "0 4px", lineHeight: 1, flexShrink: 0 }}>⋯</button>
                </div>
                {s.tagline && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>{s.tagline}</p>}
                <div style={{ borderTop: "1px solid " + C.border, paddingTop: 10, display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>❤️ {s.begeni_sayisi || 0}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>👁 {s.goruntuleme_sayisi || 0}</span>
                  <span style={{ fontSize: 12, color: C.muted }}>{zaman(s.created_at)}</span>
                </div>
              </div>
            ))
          )}

          {tab === "kaydedilenler" && (kaydedilenSenaryolar.length === 0 ? <Bos icon="🔖" metin="Henüz kaydedilen yok." aksiyon="Keşfet" href="/kesfet" /> :
            kaydedilenSenaryolar.map(s => (
              <a key={s.id} href={"/senaryo/" + s.id} style={{ display: "block", background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: 16, marginBottom: 10 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 4 }}>{s.baslik}</p>
                {s.tagline && <p style={{ fontSize: 13, color: C.muted }}>{s.tagline}</p>}
              </a>
            ))
          )}

          {tab === "arsiv" && (arsivSenaryolar.length === 0 && arsivGonderiler.length === 0 ? <Bos icon="🗃️" metin="Arşiv boş." /> :
            <>
              {arsivSenaryolar.map(s => (
                <div key={s.id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.muted, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.baslik}</p>
                  <button onClick={() => arsivToggle("senaryo", s.id, true)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 10, border: "none", background: TEAL + "15", color: TEAL, fontSize: 12, fontWeight: 700 }}>Geri Al</button>
                </div>
              ))}
              {arsivGonderiler.map(g => (
                <div key={g.id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 14, padding: "14px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <p style={{ fontSize: 14, color: C.muted, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.metin || "Görsel gönderi"}</p>
                  <button onClick={() => arsivToggle("gonderi", g.id, true)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 10, border: "none", background: TEAL + "15", color: TEAL, fontSize: 12, fontWeight: 700 }}>Geri Al</button>
                </div>
              ))}
            </>
          )}

          {tab === "rozetler" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {Object.entries(ROZET_BILGI).map(([tip, info]) => {
                var kazanildi = rozetler.some(r => r.tip === tip);
                return (
                  <div key={tip} style={{ background: kazanildi ? "linear-gradient(135deg," + TEAL + "12," + ACCENT + "06)" : C.surface, border: "1px solid " + (kazanildi ? TEAL + "30" : C.border), borderRadius: 16, padding: "20px 14px", textAlign: "center", opacity: kazanildi ? 1 : 0.45, transition: "opacity 0.2s" }}>
                    <p style={{ fontSize: 36, marginBottom: 8 }}>{info.icon}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>{info.label}</p>
                    <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{info.desc}</p>
                    {!kazanildi && <p style={{ fontSize: 10, color: C.muted, marginTop: 8, fontWeight: 600 }}>🔒 Kilitli</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ACTION SHEET */}
      {actionSheet && (
        <>
          <div onClick={() => setActionSheet(null)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301, background: dk ? "#0f1829" : "#fff", borderRadius: "22px 22px 0 0", padding: "8px 16px env(safe-area-inset-bottom,20px)" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "12px auto 16px" }} />
            <button onClick={() => arsivToggle(actionSheet.tip, actionSheet.id, actionSheet.arsiv)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 12px", borderRadius: 14, background: "none", border: "none", color: C.text, fontSize: 15, marginBottom: 8 }}>
              {actionSheet.arsiv ? "📤  Arşivden Çıkar" : "🗃️  Arşivle"}
            </button>
            <button onClick={() => sil(actionSheet.tip, actionSheet.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 12px", borderRadius: 14, background: ACCENT + "10", border: "none", color: ACCENT, fontSize: 15, marginBottom: 8 }}>
              🗑️  Sil
            </button>
            <button onClick={() => setActionSheet(null)} style={{ display: "block", width: "100%", padding: "14px", borderRadius: 14, background: "none", border: "none", color: C.muted, fontSize: 15 }}>İptal</button>
          </div>
        </>
      )}

      {/* DÜZENLE MODAL */}
      {duzenle && (
        <>
          <div onClick={() => setDuzenle(false)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(10px)" }} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 401, background: dk ? "#0f1829" : "#fff", borderRadius: "22px 22px 0 0", padding: "8px 20px env(safe-area-inset-bottom,24px)", maxHeight: "88vh", overflowY: "auto" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "12px auto 20px" }} />
            <p style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 24 }}>Profili Düzenle</p>

            {[
              { label: "Kullanıcı Adı", val: usernameEdit, set: v => setUsernameEdit(v.toLowerCase().replace(/[^a-z0-9_]/g, "")), prefix: "@", hint: "Sadece harf, rakam ve _", ph: "kullaniciadi" },
              { label: "Website", val: websiteEdit, set: setWebsiteEdit, prefix: "🔗", hint: "", ph: "https://..." },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.6px" }}>{f.label}</p>
                <div style={{ display: "flex", alignItems: "center", background: C.input, border: "1.5px solid " + C.border, borderRadius: 14, padding: "0 14px", gap: 8 }}>
                  <span style={{ fontSize: 14, color: C.muted, flexShrink: 0 }}>{f.prefix}</span>
                  <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={{ flex: 1, background: "transparent", border: "none", padding: "13px 0", color: C.text, fontSize: 15, outline: "none" }} />
                </div>
                {f.hint && <p style={{ fontSize: 11, color: C.muted, marginTop: 5, marginLeft: 2 }}>{f.hint}</p>}
              </div>
            ))}

            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.6px" }}>Biyografi</p>
              <textarea value={bioEdit} onChange={e => setBioEdit(e.target.value)} rows={3} placeholder="Kendini kısaca tanıt..." style={{ width: "100%", background: C.input, border: "1.5px solid " + C.border, borderRadius: 14, padding: "13px 14px", color: C.text, fontSize: 14, outline: "none", resize: "none", lineHeight: 1.6 }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", borderTop: "1px solid " + C.border, borderBottom: "1px solid " + C.border, marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Gizli Profil</p>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Sadece takipçilerin görsün</p>
              </div>
              <button onClick={() => setGizliEdit(p => !p)} style={{ width: 50, height: 28, borderRadius: 14, background: gizliEdit ? TEAL : (dk ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"), border: "none", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: gizliEdit ? 24 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.25s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </button>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDuzenle(false)} style={{ flex: 1, padding: 14, borderRadius: 14, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 15 }}>İptal</button>
              <button onClick={profilKaydet} disabled={kaydetYukleniyor} style={{ flex: 2, padding: 14, borderRadius: 14, background: kaydetYukleniyor ? C.input : "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: kaydetYukleniyor ? C.muted : "#fff", fontSize: 15, fontWeight: 700 }}>
                {kaydetYukleniyor ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(24px)", borderTop: "1px solid " + C.border, padding: "8px 0 env(safe-area-inset-bottom,8px)", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {[
          { href: "/", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
          { href: "/kesfet", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
          { href: "/topluluk", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg> },
          { href: "/mesajlar", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg> },
          { href: "/profil", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
        ].map(item => {
          var active = item.href === "/profil";
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 14px", position: "relative", color: active ? TEAL : C.muted, transition: "opacity 0.2s" }}>
              {item.icon}
              {active && <div style={{ position: "absolute", bottom: 2, width: 18, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>
    </div>
  );
}
