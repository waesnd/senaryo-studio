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

var TURLER = ["Hepsi", "Dram", "Komedi", "Gerilim", "Aksiyon", "Korku", "Romantik", "Bilim Kurgu", "Fantastik"];

export default function Kesfet() {
  var [user, setUser] = useState(null);
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);
  var [profil, setProfil] = useState(null);
  var [senaryolar, setSenaryolar] = useState([]);
  var [gonderiler, setGonderiler] = useState([]);
  var [hashtagler, setHashtagler] = useState([]);
  var [tab, setTab] = useState("senaryolar");
  var [filtre, setFiltre] = useState("Hepsi");
  var [arama, setArama] = useState("");
  var [yukleniyor, setYukleniyor] = useState(false);
  var [begeniler, setBegeniler] = useState([]);
  var [kaydedilenler, setKaydedilenler] = useState([]);

  var dk = tema === "dark";
  var C = getC(dk);

  useEffect(() => {
    try { setTema(localStorage.getItem("sf_tema") || "light"); } catch (e) {}
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) { setUser(data.session.user); yukleKisisel(data.session.user); }
      setLoaded(true);
    });
    yukle();
  }, []);

  function yukleKisisel(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(({ data }) => { if (data) setProfil(data); });
    supabase.from("kaydedilenler").select("senaryo_id").eq("user_id", u.id).then(({ data }) => { if (data) setKaydedilenler(data.map(k => k.senaryo_id)); });
  }

  async function yukle(tur, q) {
    setYukleniyor(true);
    var sq = supabase.from("senaryolar").select("*, profiles(username,avatar_url)").eq("paylasim_acik", true).order("goruntuleme_sayisi", { ascending: false }).limit(40);
    if (tur && tur !== "Hepsi") sq = sq.eq("tur", tur);
    if (q) sq = sq.ilike("baslik", "%" + q + "%");
    var { data: s } = await sq;
    if (s) setSenaryolar(s);

    var gq = supabase.from("gonderiler").select("*, profiles(username,avatar_url)").not("fotograf_url", "is", null).order("begeni_sayisi", { ascending: false }).limit(40);
    if (q) gq = gq.ilike("metin", "%" + q + "%");
    var { data: g } = await gq;
    if (g) setGonderiler(g);

    var { data: h } = await supabase.from("hashtagler").select("*").order("kullanim_sayisi", { ascending: false }).limit(20);
    if (h) setHashtagler(h);

    setYukleniyor(false);
  }

  var aramaTim = null;
  function aramaChange(v) {
    setArama(v);
    clearTimeout(aramaTim);
    aramaTim = setTimeout(() => yukle(filtre, v), 400);
  }

  function filtreChange(f) {
    setFiltre(f);
    yukle(f, arama);
  }

  async function kaydetToggle(id) {
    if (!user) return;
    if (kaydedilenler.includes(id)) {
      setKaydedilenler(p => p.filter(k => k !== id));
      await supabase.from("kaydedilenler").delete().eq("user_id", user.id).eq("senaryo_id", id);
    } else {
      setKaydedilenler(p => [...p, id]);
      await supabase.from("kaydedilenler").insert([{ user_id: user.id, senaryo_id: id }]);
    }
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g";
  }

  if (!loaded) return null;
  var avatarUrl = profil?.avatar_url || null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 80 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}input::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}a{text-decoration:none;color:inherit;}button{font-family:inherit;}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.95)" : "rgba(238,242,247,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
            </div>
          </a>
          <input value={arama} onChange={e => aramaChange(e.target.value)} placeholder="🔭 Senaryo, gönderi, hashtag ara..." style={{ flex: 1, background: C.surface, border: "1px solid " + C.border, borderRadius: 22, padding: "10px 16px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
        </div>

        {/* Tür filtresi */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 2 }}>
          {TURLER.map(t => (
            <button key={t} onClick={() => filtreChange(t)} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, background: filtre === t ? "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")" : C.input, border: "1px solid " + (filtre === t ? "transparent" : C.border), color: filtre === t ? "#fff" : C.muted, fontSize: 12, fontWeight: filtre === t ? 700 : 400, cursor: "pointer" }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* TREND HASHTAGLER */}
        {hashtagler.length > 0 && (
          <div style={{ padding: "14px 16px 0" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>🔥 Trend Hashtagler</p>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 12 }}>
              {hashtagler.map(h => (
                <a key={h.id} href={"/hashtag/" + h.etiket} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, background: TEAL + "15", border: "1px solid " + TEAL + "30", color: TEAL, fontSize: 12, fontWeight: 700 }}>
                  #{h.etiket} <span style={{ opacity: 0.6, fontSize: 10 }}>{h.kullanim_sayisi}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* TABS */}
        <div style={{ display: "flex", borderBottom: "1px solid " + C.border, background: C.surface }}>
          {[{ id: "senaryolar", label: "🎬 Senaryolar" }, { id: "gorseller", label: "🖼️ Görseller" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "13px 8px", background: "none", border: "none", borderBottom: tab === t.id ? "2px solid " + TEAL : "2px solid transparent", color: tab === t.id ? TEAL : C.muted, fontSize: 14, fontWeight: tab === t.id ? 700 : 500, cursor: "pointer", marginBottom: "-1px" }}>{t.label}</button>
          ))}
        </div>

        {yukleniyor && <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><div style={{ width: 28, height: 28, border: "3px solid " + C.border, borderTopColor: TEAL, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /></div>}

        {/* SENARYOLAR - Masonry */}
        {!yukleniyor && tab === "senaryolar" && (
          senaryolar.length === 0
            ? <div style={{ textAlign: "center", padding: "70px 20px" }}><p style={{ fontSize: 48 }}>🎬</p><p style={{ color: C.muted, marginTop: 14, fontSize: 14 }}>Senaryo bulunamadı.</p></div>
            : <div style={{ columns: 2, columnGap: 10, padding: "12px 12px" }}>
              {senaryolar.map((s, i) => (
                <a key={s.id} href={"/senaryo/" + s.id} style={{ display: "block", breakInside: "avoid", marginBottom: 10, background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: "14px", overflow: "hidden", animation: "fadeUp 0.25s " + Math.min(i * 0.04, 0.3) + "s both ease" }}>
                  <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: TEAL + "15", color: TEAL }}>{s.tip}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: ACCENT + "12", color: ACCENT }}>{s.tur}</span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: C.text, lineHeight: 1.4, marginBottom: 4 }}>{s.baslik}</p>
                  {s.tagline && <p style={{ fontSize: 10, fontStyle: "italic", color: TEAL, lineHeight: 1.4, marginBottom: 6 }}>"{s.tagline}"</p>}
                  {s.ana_fikir && <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{s.ana_fikir}</p>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: TEAL + "40", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>
                        {s.profiles?.avatar_url ? <img src={s.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
                      </div>
                      <span style={{ fontSize: 9, color: C.muted }}>@{s.profiles?.username}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={e => { e.preventDefault(); kaydetToggle(s.id); }} style={{ background: "none", border: "none", fontSize: 14, cursor: "pointer", opacity: kaydedilenler.includes(s.id) ? 1 : 0.4 }}>🔖</button>
                      <span style={{ fontSize: 9, color: C.muted }}>♥ {s.begeni_sayisi || 0}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
        )}

        {/* GÖRSELLER - Masonry */}
        {!yukleniyor && tab === "gorseller" && (
          gonderiler.length === 0
            ? <div style={{ textAlign: "center", padding: "70px 20px" }}><p style={{ fontSize: 48 }}>🖼️</p><p style={{ color: C.muted, marginTop: 14, fontSize: 14 }}>Görsel bulunamadı.</p></div>
            : <div style={{ columns: 2, columnGap: 3, padding: "3px" }}>
              {gonderiler.map((g, i) => (
                <a key={g.id} href={"/@" + g.profiles?.username} style={{ display: "block", breakInside: "avoid", marginBottom: 3, position: "relative", overflow: "hidden", borderRadius: 4 }}>
                  <img src={g.fotograf_url} style={{ width: "100%", display: "block", borderRadius: 4 }} alt="" />
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 8px 6px", background: "linear-gradient(transparent,rgba(0,0,0,0.55))" }}>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>@{g.profiles?.username}</p>
                  </div>
                </a>
              ))}
            </div>
        )}
      </div>

      {/* ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around" }}>
        {[{ icon: "🏠", href: "/" }, { icon: "🔭", href: "/kesfet" }, { icon: "🎭", href: "/topluluk" }, { icon: "💬", href: "/mesajlar" }].map(item => (
          <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 24px", borderRadius: 14, background: item.href === "/kesfet" ? (dk ? "rgba(8,145,178,0.14)" : "rgba(8,145,178,0.09)") : "transparent", position: "relative" }}>
            <span style={{ fontSize: 26, filter: item.href === "/kesfet" ? "none" : "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
            {item.href === "/kesfet" && <div style={{ position: "absolute", bottom: 3, width: 20, height: 3, borderRadius: 2, background: TEAL }} />}
          </a>
        ))}
      </div>
    </div>
  );
}
