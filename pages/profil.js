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
    bg: dk ? "#080f1c" : "#eef2f7",
    surface: dk ? "#0f1829" : "#ffffff",
    border: dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dk ? "#f1f5f9" : "#0f172a",
    muted: dk ? "rgba(241,245,249,0.38)" : "rgba(15,23,42,0.4)",
    input: dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    shadow: dk ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.06)",
  };
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
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) { setUser(session.user); yukle(session.user); }
      else { setUser(null); setProfil(null); }
    });
  }, []);

  async function yukle(u) {
    var { data: p } = await supabase.from("profiles").select("*").eq("id", u.id).single();
    if (p) { setProfil(p); setBioEdit(p.bio || ""); setUsernameEdit(p.username || ""); setWebsiteEdit(p.website || ""); setGizliEdit(p.gizli || false); }

    var [s, g, sa, ga, r, tc, tp, ks] = await Promise.all([
      supabase.from("senaryolar").select("*").eq("user_id", u.id).eq("arsiv", false).order("created_at", { ascending: false }),
      supabase.from("gonderiler").select("*").eq("user_id", u.id).eq("arsiv", false).order("created_at", { ascending: false }),
      supabase.from("senaryolar").select("*").eq("user_id", u.id).eq("arsiv", true).order("created_at", { ascending: false }),
      supabase.from("gonderiler").select("*").eq("user_id", u.id).eq("arsiv", true).order("created_at", { ascending: false }),
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
    setKaydetYukleniyor(true);
    await supabase.from("profiles").update({ bio: bioEdit, username: usernameEdit, website: websiteEdit, gizli: gizliEdit }).eq("id", user.id);
    var { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (p) setProfil(p);
    setDuzenle(false);
    setKaydetYukleniyor(false);
  }

  async function avatarDegistir(e) {
    var file = e.target.files[0]; if (!file) return;
    setAvatarYukleniyor(true);
    try {
      var fd = new FormData(); fd.append("file", file); fd.append("upload_preset", "scriptify_avatars");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var data = await res.json();
      if (data.secure_url) {
        await supabase.from("profiles").update({ avatar_url: data.secure_url }).eq("id", user.id);
        setProfil(p => ({ ...p, avatar_url: data.secure_url }));
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
      var data = await res.json();
      if (data.secure_url) {
        await supabase.from("profiles").update({ banner_url: data.secure_url }).eq("id", user.id);
        setProfil(p => ({ ...p, banner_url: data.secure_url }));
      }
    } catch (e) {}
    setBannerYukleniyor(false);
  }

  async function arsivToggle(tip, id, arsivDurumu) {
    if (tip === "senaryo") {
      await supabase.from("senaryolar").update({ arsiv: !arsivDurumu }).eq("id", id);
      if (arsivDurumu) {
        var item = arsivSenaryolar.find(s => s.id === id);
        setSenaryolar(p => [item, ...p]); setArsivSenaryolar(p => p.filter(s => s.id !== id));
      } else {
        var item2 = senaryolar.find(s => s.id === id);
        setArsivSenaryolar(p => [item2, ...p]); setSenaryolar(p => p.filter(s => s.id !== id));
      }
    } else {
      await supabase.from("gonderiler").update({ arsiv: !arsivDurumu }).eq("id", id);
      if (arsivDurumu) {
        var item3 = arsivGonderiler.find(g => g.id === id);
        setGonderiler(p => [item3, ...p]); setArsivGonderiler(p => p.filter(g => g.id !== id));
      } else {
        var item4 = gonderiler.find(g => g.id === id);
        setArsivGonderiler(p => [item4, ...p]); setGonderiler(p => p.filter(g => g.id !== id));
      }
    }
    setActionSheet(null);
  }

  async function sil(tip, id) {
    if (!confirm("Silinsin mi?")) return;
    if (tip === "senaryo") { await supabase.from("senaryolar").delete().eq("id", id); setSenaryolar(p => p.filter(s => s.id !== id)); }
    else { await supabase.from("gonderiler").delete().eq("id", id); setGonderiler(p => p.filter(g => g.id !== id)); }
    setActionSheet(null);
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g önce";
  }

  if (!loaded) return null;

  if (!user) return (
    <div style={{ minHeight: "100vh", background: dk ? "#080f1c" : "#eef2f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 48 }}>🔐</p>
      <p style={{ color: dk ? "#f1f5f9" : "#0f172a", fontSize: 16 }}>Profili görmek için giriş yap</p>
      <a href="/" style={{ padding: "11px 28px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", color: "#fff", fontWeight: 700, fontSize: 14 }}>Giriş Yap</a>
    </div>
  );

  var TABS = [
    { id: "gonderiler", label: "📝 Gönderiler", count: gonderiler.length },
    { id: "senaryolar", label: "🎬 Senaryolar", count: senaryolar.length },
    { id: "kaydedilenler", label: "🔖 Kaydettiklerim", count: kaydedilenSenaryolar.length },
    { id: "arsiv", label: "🗃️ Arşiv", count: arsivSenaryolar.length + arsivGonderiler.length },
    { id: "rozetler", label: "🏆 Rozetler", count: rozetler.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 80 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}textarea::placeholder,input::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}a{text-decoration:none;color:inherit;}button{font-family:inherit;}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.95)" : "rgba(238,242,247,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
            {profil?.avatar_url ? <img src={profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
          </div>
        </a>
        <p style={{ flex: 1, fontSize: 16, fontWeight: 800, color: C.text }}>@{profil?.username || "Profil"}</p>
        <button onClick={() => setDuzenle(true)} style={{ padding: "7px 16px", borderRadius: 20, border: "1.5px solid " + C.border, background: "none", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Düzenle</button>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.href = "/")} style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT + "15", border: "none", color: ACCENT, fontSize: 14, cursor: "pointer" }}>🚪</button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* BANNER */}
        <div style={{ height: 130, background: profil?.banner_url ? "transparent" : "linear-gradient(135deg," + TEAL + "25," + ACCENT + "12)", overflow: "hidden", position: "relative", cursor: "pointer" }} onClick={() => bannerRef.current?.click()}>
          {profil?.banner_url && <img src={profil.banner_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.2)" }}>
            <span style={{ fontSize: 22, opacity: 0.8 }}>{bannerYukleniyor ? "⏳" : "📷"}</span>
          </div>
          <input ref={bannerRef} type="file" accept="image/*" onChange={bannerDegistir} style={{ display: "none" }} />
        </div>

        <div style={{ padding: "0 20px" }}>
          {/* Avatar + istatistik */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: -45, marginBottom: 14 }}>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => avatarRef.current?.click()}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "4px solid " + C.bg, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                {profil?.avatar_url ? <img src={profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
              </div>
              <div style={{ position: "absolute", bottom: 2, right: 2, width: 26, height: 26, borderRadius: "50%", background: TEAL, border: "2px solid " + C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
                {avatarYukleniyor ? "⏳" : "📷"}
              </div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={avatarDegistir} style={{ display: "none" }} />
            </div>
            <div style={{ flex: 1, display: "flex", justifyContent: "space-around" }}>
              {[{ val: senaryolar.length, label: "Senaryo" }, { val: takipci, label: "Takipçi" }, { val: takip, label: "Takip" }].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{s.val}</p>
                  <p style={{ fontSize: 11, color: C.muted }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{profil?.username}</h1>
          {profil?.bio && <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 6 }}>{profil.bio}</p>}
          {profil?.website && <a href={profil.website} target="_blank" style={{ fontSize: 12, color: TEAL, fontWeight: 600, marginBottom: 6, display: "block" }}>🔗 {profil.website.replace(/https?:\/\//, "")}</a>}
          {profil?.gizli && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: C.input, border: "1px solid " + C.border, color: C.muted }}>🔒 Gizli Profil</span>}
        </div>

        {/* TABS - yatay scroll */}
        <div style={{ display: "flex", borderBottom: "1px solid " + C.border, overflowX: "auto", scrollbarWidth: "none", paddingLeft: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flexShrink: 0, padding: "12px 14px", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid " + TEAL : "2px solid transparent", color: tab === t.id ? TEAL : C.muted, fontSize: 12, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", marginBottom: "-1px", whiteSpace: "nowrap" }}>
              {t.label} <span style={{ opacity: 0.6 }}>({t.count})</span>
            </button>
          ))}
        </div>

        <div style={{ padding: "12px 20px" }}>
          {/* GÖNDERİLER */}
          {tab === "gonderiler" && (
            gonderiler.length === 0
              ? <div style={{ textAlign: "center", padding: "50px 0" }}><p style={{ fontSize: 36 }}>📭</p><p style={{ color: C.muted, marginTop: 10, fontSize: 14 }}>Henüz gönderi yok.</p><a href="/" style={{ display: "inline-block", marginTop: 14, padding: "9px 20px", borderRadius: 12, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", color: "#fff", fontSize: 13, fontWeight: 700 }}>Ana Sayfaya Git</a></div>
              : gonderiler.map((g, i) => (
                <div key={g.id} style={{ borderBottom: "1px solid " + C.border, padding: "14px 0", animation: "fadeUp 0.25s " + (i * 0.04) + "s both ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 11, color: C.muted }}>{zaman(g.created_at)}</p>
                    <button onClick={() => setActionSheet({ tip: "gonderi", id: g.id, arsiv: g.arsiv })} style={{ background: "none", border: "none", color: C.muted, fontSize: 16, cursor: "pointer" }}>···</button>
                  </div>
                  {g.metin && <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, marginTop: 6 }}>{g.metin}</p>}
                  {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", borderRadius: 14, marginTop: 10, maxHeight: 250, objectFit: "cover" }} alt="" />}
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>♥ {g.begeni_sayisi || 0}</p>
                </div>
              ))
          )}

          {/* SENARYOLAR */}
          {tab === "senaryolar" && (
            senaryolar.length === 0
              ? <div style={{ textAlign: "center", padding: "50px 0" }}><p style={{ fontSize: 36 }}>🎬</p><p style={{ color: C.muted, marginTop: 10, fontSize: 14 }}>Henüz senaryo yok.</p><a href="/uret" style={{ display: "inline-block", marginTop: 14, padding: "9px 20px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", color: "#fff", fontSize: 13, fontWeight: 700 }}>🎬 Senaryo Üret</a></div>
              : senaryolar.map((s, i) => (
                <div key={s.id} style={{ borderBottom: "1px solid " + C.border, padding: "14px 0", animation: "fadeUp 0.25s " + (i * 0.04) + "s both ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: TEAL + "15", color: TEAL, fontWeight: 700 }}>{s.tip}</span>
                      <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: ACCENT + "12", color: ACCENT, fontWeight: 700 }}>{s.tur}</span>
                    </div>
                    <button onClick={() => setActionSheet({ tip: "senaryo", id: s.id, arsiv: s.arsiv })} style={{ background: "none", border: "none", color: C.muted, fontSize: 16, cursor: "pointer" }}>···</button>
                  </div>
                  <a href={"/senaryo/" + s.id}>
                    <p style={{ fontSize: 16, fontWeight: 800, color: C.text, marginTop: 8, marginBottom: 3 }}>{s.baslik}</p>
                    {s.tagline && <p style={{ fontSize: 12, fontStyle: "italic", color: TEAL }}>"{s.tagline}"</p>}
                  </a>
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>♥ {s.begeni_sayisi || 0} · 👁 {s.goruntuleme_sayisi || 0} · {zaman(s.created_at)}</p>
                </div>
              ))
          )}

          {/* KAYDEDİLENLER */}
          {tab === "kaydedilenler" && (
            kaydedilenSenaryolar.length === 0
              ? <div style={{ textAlign: "center", padding: "50px 0" }}><p style={{ fontSize: 36 }}>🔖</p><p style={{ color: C.muted, marginTop: 10, fontSize: 14 }}>Henüz kaydettiğin senaryo yok.</p></div>
              : kaydedilenSenaryolar.map((s, i) => (
                <a key={s.id} href={"/senaryo/" + s.id} style={{ display: "block", background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: "14px 16px", marginBottom: 10, animation: "fadeUp 0.25s " + (i * 0.04) + "s both ease" }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: TEAL + "15", color: TEAL, fontWeight: 700 }}>{s.tip}</span>
                    <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, background: ACCENT + "12", color: ACCENT, fontWeight: 700 }}>{s.tur}</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{s.baslik}</p>
                  {s.tagline && <p style={{ fontSize: 12, fontStyle: "italic", color: TEAL, marginTop: 3 }}>"{s.tagline}"</p>}
                </a>
              ))
          )}

          {/* ARŞİV */}
          {tab === "arsiv" && (
            arsivSenaryolar.length === 0 && arsivGonderiler.length === 0
              ? <div style={{ textAlign: "center", padding: "50px 0" }}><p style={{ fontSize: 36 }}>🗃️</p><p style={{ color: C.muted, marginTop: 10, fontSize: 14 }}>Arşivde bir şey yok.</p></div>
              : <>
                {arsivSenaryolar.length > 0 && <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: "uppercase" }}>Senaryolar</p>}
                {arsivSenaryolar.map((s, i) => (
                  <div key={s.id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.muted }}>{s.baslik}</p>
                      <button onClick={() => arsivToggle("senaryo", s.id, true)} style={{ padding: "5px 12px", borderRadius: 10, border: "none", background: TEAL + "15", color: TEAL, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Geri Al</button>
                    </div>
                  </div>
                ))}
                {arsivGonderiler.length > 0 && <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10, marginTop: 16, textTransform: "uppercase" }}>Gönderiler</p>}
                {arsivGonderiler.map((g, i) => (
                  <div key={g.id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 14, padding: "12px 14px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <p style={{ fontSize: 14, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{g.metin || "Görsel gönderi"}</p>
                      <button onClick={() => arsivToggle("gonderi", g.id, true)} style={{ padding: "5px 12px", borderRadius: 10, border: "none", background: TEAL + "15", color: TEAL, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Geri Al</button>
                    </div>
                  </div>
                ))}
              </>
          )}

          {/* ROZETLER */}
          {tab === "rozetler" && (
            <div>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 16, textAlign: "center" }}>Kazandığın rozetler ve hedefler</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {Object.entries(ROZET_BILGI).map(([tip, info]) => {
                  var kazanildi = rozetler.some(r => r.tip === tip);
                  return (
                    <div key={tip} style={{ background: kazanildi ? "linear-gradient(135deg," + TEAL + "15," + ACCENT + "08)" : C.input, border: "1px solid " + (kazanildi ? TEAL + "30" : C.border), borderRadius: 16, padding: "16px 14px", textAlign: "center", opacity: kazanildi ? 1 : 0.5 }}>
                      <p style={{ fontSize: 32, marginBottom: 8 }}>{info.icon}</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4 }}>{info.label}</p>
                      <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{info.desc}</p>
                      {!kazanildi && <p style={{ fontSize: 10, color: C.muted, marginTop: 8 }}>🔒 Kilitli</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ACTION SHEET */}
      {actionSheet && (
        <div>
          <div onClick={() => setActionSheet(null)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301, background: dk ? "#0f1829" : "#fff", borderRadius: "24px 24px 0 0", padding: "10px 20px env(safe-area-inset-bottom,20px)" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", margin: "12px auto 16px" }} />
            <button onClick={() => arsivToggle(actionSheet.tip, actionSheet.id, actionSheet.arsiv)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px", borderRadius: 14, background: "none", border: "none", color: C.text, fontSize: 15, cursor: "pointer", marginBottom: 6 }}>
              {actionSheet.arsiv ? "📤 Arşivden Çıkar" : "🗃️ Arşivle"}
            </button>
            <button onClick={() => sil(actionSheet.tip, actionSheet.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px", borderRadius: 14, background: ACCENT + "10", border: "none", color: ACCENT, fontSize: 15, cursor: "pointer", marginBottom: 6 }}>🗑️ Sil</button>
            <button onClick={() => setActionSheet(null)} style={{ display: "block", width: "100%", padding: "14px 16px", borderRadius: 14, background: "none", border: "none", color: C.muted, fontSize: 15, cursor: "pointer" }}>İptal</button>
          </div>
        </div>
      )}

      {/* DÜZENLE MODAL */}
      {duzenle && (
        <div>
          <div onClick={() => setDuzenle(false)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 401, background: dk ? "#0f1829" : "#fff", borderRadius: "24px 24px 0 0", padding: "10px 20px env(safe-area-inset-bottom,24px)", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", margin: "12px auto 16px" }} />
            <p style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 20 }}>Profili Düzenle</p>
            {[{ label: "Kullanıcı Adı", val: usernameEdit, set: setUsernameEdit, prefix: "@" }, { label: "Website", val: websiteEdit, set: setWebsiteEdit, prefix: "🔗" }].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 600 }}>{f.label}</p>
                <div style={{ display: "flex", alignItems: "center", background: C.input, border: "1px solid " + C.border, borderRadius: 14, padding: "0 14px" }}>
                  <span style={{ fontSize: 14, color: C.muted, marginRight: 6 }}>{f.prefix}</span>
                  <input value={f.val} onChange={e => f.set(e.target.value)} style={{ flex: 1, background: "transparent", border: "none", padding: "12px 0", color: C.text, fontSize: 15, outline: "none", fontFamily: "inherit" }} />
                </div>
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 600 }}>Biyografi</p>
              <textarea value={bioEdit} onChange={e => setBioEdit(e.target.value)} rows={3} placeholder="Kendini tanıt..." style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 14, padding: "12px 14px", color: C.text, fontSize: 15, outline: "none", resize: "none", fontFamily: "inherit" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderTop: "1px solid " + C.border, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>🔒 Gizli Profil</p>
                <p style={{ fontSize: 11, color: C.muted }}>Sadece takipçilerin görsün</p>
              </div>
              <button onClick={() => setGizliEdit(p => !p)} style={{ width: 48, height: 28, borderRadius: 14, background: gizliEdit ? TEAL : (dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"), border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 3, left: gizliEdit ? 22 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
              </button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setDuzenle(false)} style={{ flex: 1, padding: "13px", borderRadius: 14, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 15, cursor: "pointer" }}>İptal</button>
              <button onClick={profilKaydet} disabled={kaydetYukleniyor} style={{ flex: 2, padding: "13px", borderRadius: 14, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>{kaydetYukleniyor ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around" }}>
        {[{ icon: "🏠", href: "/" }, { icon: "🔭", href: "/kesfet" }, { icon: "🎭", href: "/topluluk" }, { icon: "💬", href: "/mesajlar" }].map(item => (
          <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", padding: "6px 24px", borderRadius: 14 }}>
            <span style={{ fontSize: 26, filter: "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
