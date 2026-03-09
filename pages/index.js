import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../lib/supabase";

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

export default function KullaniciProfil() {
  var router = useRouter();
  var { username } = router.query;
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [senaryolar, setSenaryolar] = useState([]);
  var [gonderiler, setGonderiler] = useState([]);
  var [tab, setTab] = useState("gonderiler");
  var [takipci, setTakipci] = useState(0);
  var [takip, setTakip] = useState(0);
  var [takipEdiyorum, setTakipEdiyorum] = useState(false);
  var [engelledim, setEngelledim] = useState(false);
  var [yukleniyor, setYukleniyor] = useState(true);
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [menu, setMenu] = useState(false);

  var dk = tema === "dark";
  var C = getC(dk);
  var benimProfil = user && profil && user.id === profil.id;

  useEffect(() => {
    try { setTema(localStorage.getItem("sf_tema") || "light"); } catch (e) {}
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setUser(data.session.user);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!username) return;
    var temizUsername = username.startsWith("@") ? username.slice(1) : username;
    yukle(temizUsername);
  }, [username]);

  async function yukle(un) {
    setYukleniyor(true);
    var { data: p } = await supabase.from("profiles").select("*").eq("username", un).single();
    if (!p) { setYukleniyor(false); return; }
    setProfil(p);
    var [s, g, tc, tp] = await Promise.all([
      supabase.from("senaryolar").select("*").eq("user_id", p.id).eq("paylasim_acik", true).order("created_at", { ascending: false }),
      supabase.from("gonderiler").select("*").eq("user_id", p.id).order("created_at", { ascending: false }),
      supabase.from("takipler").select("*", { count: "exact" }).eq("takip_edilen", p.id),
      supabase.from("takipler").select("*", { count: "exact" }).eq("takip_eden", p.id),
    ]);
    if (s.data) setSenaryolar(s.data);
    if (g.data) setGonderiler(g.data);
    setTakipci(tc.count || 0);
    setTakip(tp.count || 0);
    setYukleniyor(false);
  }

  useEffect(() => {
    if (!user || !profil) return;
    supabase.from("takipler").select("*").eq("takip_eden", user.id).eq("takip_edilen", profil.id).single()
      .then(({ data }) => setTakipEdiyorum(!!data));
    supabase.from("engellemeler").select("*").eq("engelleyen", user.id).eq("engellened", profil.id).single()
      .then(({ data }) => setEngelledim(!!data));
  }, [user, profil]);

  async function takipToggle() {
    if (!user) { window.location.href = "/"; return; }
    if (takipEdiyorum) {
      await supabase.from("takipler").delete().eq("takip_eden", user.id).eq("takip_edilen", profil.id);
      setTakipEdiyorum(false); setTakipci(p => p - 1);
    } else {
      await supabase.from("takipler").insert([{ takip_eden: user.id, takip_edilen: profil.id }]);
      setTakipEdiyorum(true); setTakipci(p => p + 1);
      await supabase.from("bildirimler").insert([{ alici_id: profil.id, gonderen_id: user.id, tip: "takip" }]);
    }
  }

  async function engelToggle() {
    if (!user) return;
    if (engelledim) {
      await supabase.from("engellemeler").delete().eq("engelleyen", user.id).eq("engellened", profil.id);
      setEngelledim(false);
    } else {
      await supabase.from("engellemeler").insert([{ engelleyen: user.id, engellened: profil.id }]);
      setEngelledim(true);
      if (takipEdiyorum) {
        await supabase.from("takipler").delete().eq("takip_eden", user.id).eq("takip_edilen", profil.id);
        setTakipEdiyorum(false); setTakipci(p => p - 1);
      }
    }
    setMenu(false);
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g önce";
  }

  if (!loaded) return null;
  if (yukleniyor) return <div style={{ minHeight: "100vh", background: dk ? "#080f1c" : "#eef2f7", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 28, height: 28, border: "3px solid rgba(8,145,178,0.2)", borderTopColor: TEAL, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style></div>;
  if (!profil) return <div style={{ minHeight: "100vh", background: dk ? "#080f1c" : "#eef2f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif", flexDirection: "column", gap: 16 }}><p style={{ fontSize: 48 }}>😕</p><p style={{ color: dk ? "#f1f5f9" : "#0f172a" }}>Kullanıcı bulunamadı</p><a href="/" style={{ color: TEAL, fontWeight: 700 }}>← Ana Sayfaya Dön</a></div>;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 80 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}@keyframes spin{to{transform:rotate(360deg);}}a{text-decoration:none;color:inherit;}button{font-family:inherit;}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.93)" : "rgba(238,242,247,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer" }}>←</button>
        <p style={{ flex: 1, fontSize: 15, fontWeight: 800, color: C.text }}>@{profil.username}</p>
        {!benimProfil && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setMenu(!menu)} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "7px 12px", color: C.muted, fontSize: 16, cursor: "pointer" }}>⋯</button>
            {menu && (
              <div style={{ position: "absolute", right: 0, top: 44, background: C.surface, border: "1px solid " + C.border, borderRadius: 14, padding: "6px", minWidth: 160, boxShadow: C.shadow, zIndex: 10 }}>
                <button onClick={engelToggle} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: engelledim ? "#10b981" : ACCENT, fontSize: 13, textAlign: "left", cursor: "pointer", borderRadius: 10 }}>
                  {engelledim ? "✓ Engel Kaldır" : "🚫 Engelle"}
                </button>
                <button onClick={() => { setMenu(false); window.location.href = "/"; }} style={{ display: "block", width: "100%", padding: "10px 14px", background: "none", border: "none", color: C.muted, fontSize: 13, textAlign: "left", cursor: "pointer", borderRadius: 10 }}>🚩 Raporla</button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* Banner */}
        <div style={{ height: 120, background: profil.banner_url ? "transparent" : "linear-gradient(135deg," + TEAL + "30," + ACCENT + "15)", overflow: "hidden" }}>
          {profil.banner_url && <img src={profil.banner_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />}
        </div>

        <div style={{ padding: "0 20px" }}>
          {/* Avatar + butonlar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: -40, marginBottom: 14 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "4px solid " + C.bg, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
              {profil.avatar_url ? <img src={profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {benimProfil ? (
                <a href="/profil" style={{ padding: "8px 18px", borderRadius: 20, border: "1.5px solid " + C.border, color: C.text, fontSize: 13, fontWeight: 700 }}>Düzenle</a>
              ) : (
                <>
                  <button onClick={() => window.location.href = "/mesajlar"} style={{ padding: "8px 14px", borderRadius: 20, background: C.input, border: "1.5px solid " + C.border, color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>💬</button>
                  <button onClick={takipToggle} style={{ padding: "8px 18px", borderRadius: 20, background: takipEdiyorum ? C.input : "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "1.5px solid " + (takipEdiyorum ? C.border : "transparent"), color: takipEdiyorum ? C.text : "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {takipEdiyorum ? "Takipte ✓" : "+ Takip Et"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bilgiler */}
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{profil.username}</h1>
          {profil.bio && <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 8 }}>{profil.bio}</p>}
          {profil.website && <a href={profil.website} target="_blank" style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>🔗 {profil.website.replace(/https?:\/\//, "")}</a>}

          {/* İstatistikler */}
          <div style={{ display: "flex", marginTop: 16, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid " + C.border }}>
            {[{ val: senaryolar.length, label: "Senaryo" }, { val: gonderiler.length, label: "Gönderi" }, { val: takipci, label: "Takipçi" }, { val: takip, label: "Takip" }].map((s, i) => (
              <div key={s.label} style={{ flex: 1, textAlign: "center", borderRight: i < 3 ? "1px solid " + C.border : "none" }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{s.val}</p>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Engellendi uyarısı */}
          {engelledim && (
            <div style={{ background: ACCENT + "10", border: "1px solid " + ACCENT + "30", borderRadius: 14, padding: "12px 16px", marginBottom: 16, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: ACCENT, fontWeight: 600 }}>Bu kullanıcıyı engellediniz. İçerikleri gizlendi.</p>
            </div>
          )}

          {/* Tabs */}
          {!engelledim && (
            <>
              <div style={{ display: "flex", marginBottom: 16, borderBottom: "1px solid " + C.border }}>
                {[{ id: "gonderiler", label: "Gönderiler" }, { id: "senaryolar", label: "Senaryolar" }].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "12px 8px", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid " + TEAL : "2px solid transparent", color: tab === t.id ? TEAL : C.muted, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", marginBottom: "-1px" }}>{t.label}</button>
                ))}
              </div>

              {tab === "gonderiler" && (
                gonderiler.length === 0
                  ? <div style={{ textAlign: "center", padding: "50px 0" }}><p style={{ fontSize: 36 }}>📭</p><p style={{ color: C.muted, marginTop: 10, fontSize: 14 }}>Henüz gönderi yok.</p></div>
                  : gonderiler.map((g, i) => (
                    <div key={g.id} style={{ borderBottom: "1px solid " + C.border, padding: "14px 0", animation: "fadeUp 0.25s " + (i * 0.04) + "s both ease" }}>
                      <p style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{zaman(g.created_at)}</p>
                      {g.metin && <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, marginBottom: g.fotograf_url ? 10 : 0 }}>{g.metin}</p>}
                      {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", borderRadius: 14, maxHeight: 300, objectFit: "cover" }} alt="" />}
                      <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>♥ {g.begeni_sayisi || 0}</p>
                    </div>
                  ))
              )}

              {tab === "senaryolar" && (
                senaryolar.length === 0
                  ? <div style={{ textAlign: "center", padding: "50px 0" }}><p style={{ fontSize: 36 }}>🎬</p><p style={{ color: C.muted, marginTop: 10, fontSize: 14 }}>Paylaşılan senaryo yok.</p></div>
                  : senaryolar.map((s, i) => (
                    <a key={s.id} href={"/senaryo/" + s.id} style={{ display: "block", background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: "16px 18px", marginBottom: 10, animation: "fadeUp 0.25s " + (i * 0.04) + "s both ease" }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: TEAL + "15", color: TEAL }}>{s.tip}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: ACCENT + "12", color: ACCENT }}>{s.tur}</span>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 4 }}>{s.baslik}</p>
                      {s.tagline && <p style={{ fontSize: 12, fontStyle: "italic", color: TEAL }}>{s.tagline}</p>}
                      <p style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>♥ {s.begeni_sayisi || 0} · {zaman(s.created_at)}</p>
                    </a>
                  ))
              )}
            </>
          )}
        </div>
      </div>

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
