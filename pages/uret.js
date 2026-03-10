import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var TEAL = "#0891b2";
var TEAL_L = "#06b6d4";

var TURLER = ["Gerilim", "Drama", "Bilim Kurgu", "Komedi", "Romantik", "Korku", "Aksiyon", "Fantastik", "Suç", "Tarihi", "Animasyon", "Belgesel"];
var TIPLER = [{ val: "Dizi", icon: "📺" }, { val: "Film", icon: "🎬" }];

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
    metalGrad: dk ? "linear-gradient(145deg,#1a2740 0%,#0f1829 60%,#162035 100%)" : "linear-gradient(145deg,#ffffff 0%,#f0f4f8 60%,#e8eef5 100%)",
    shadow: dk ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.08)",
  };
}

function AvatarDiv(props) {
  return (
    <div style={{ width: props.size, height: props.size, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: props.fs || 14, flexShrink: 0 }}>
      {props.url ? <img src={props.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
    </div>
  );
}

function Drawer(props) {
  var dk = props.dk;
  var C = props.C;
  var user = props.user;
  var username = props.username;
  var avatarUrl = props.avatarUrl;
  var onClose = props.onClose;
  var onTema = props.onTema;
  return (
    <div>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201, width: 300, background: dk ? "#0d1627" : "#fff", boxShadow: "4px 0 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 4, background: "linear-gradient(90deg," + ACCENT + "," + TEAL + "," + TEAL_L + ")", flexShrink: 0 }} />
        <div style={{ padding: "20px", borderBottom: "1px solid " + C.border, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <AvatarDiv url={avatarUrl} size={54} fs={22} />
            <button onClick={onClose} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 13, cursor: "pointer" }}>✕</button>
          </div>
          {user ? (
            <div>
              <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{username}</p>
              <p style={{ fontSize: 12, color: C.muted }}>{user.email}</p>
            </div>
          ) : (
            <button onClick={function () { onClose(); window.location.href = "/"; }} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>
          )}
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {DRAWER_MENU.map(function (item) {
            var isActive = item.href === "/uret";
            return (
              <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: isActive ? TEAL : C.text, background: isActive ? TEAL + "12" : "transparent", fontWeight: isActive ? 700 : 500, fontSize: 15, marginBottom: 4, textDecoration: "none", border: "1px solid " + (isActive ? TEAL + "25" : "transparent") }}>
                <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
              </a>
            );
          })}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + C.border }}>
            <a href="/profil" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, marginBottom: 4, textDecoration: "none" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>👤</span><span>Profil & Ayarlar</span>
            </a>
            <button onClick={onTema} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{dk ? "☀️" : "🌙"}</span>
              <span>{dk ? "Açık Tema" : "Koyu Tema"}</span>
            </button>
            {user && (
              <button onClick={function () { supabase.auth.signOut(); onClose(); window.location.href = "/"; }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: ACCENT, fontSize: 15, background: ACCENT + "10", border: "none", width: "100%", textAlign: "left", cursor: "pointer", marginTop: 4 }}>
                <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>🚪</span><span>Çıkış Yap</span>
              </button>
            )}
          </div>
        </nav>
        <div style={{ padding: "12px 20px 20px", borderTop: "1px solid " + C.border, textAlign: "center" }}>
          <p style={{ fontSize: 11, color: C.muted }}>© 2025 Scriptify · by Öztürk</p>
        </div>
      </div>
    </div>
  );
}

export default function Uret() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [tip, setTip] = useState("Dizi");
  var [tur, setTur] = useState("Gerilim");
  var [ozelIstek, setOzelIstek] = useState("");
  var [yukleniyor, setYukleniyor] = useState(false);
  var [senaryo, setSenaryo] = useState(null);
  var [kaydedildi, setKaydedildi] = useState(false);
  var [paylasimAcik, setPaylasimAcik] = useState(false);
  var [tema, setTema] = useState("light");
  var [drawer, setDrawer] = useState(false);
  var [loaded, setLoaded] = useState(false);
  var [karakterYukleniyor, setKarakterYukleniyor] = useState(false);
  var [karakterAnaliz, setKarakterAnaliz] = useState(null);
  var [karakterAcik, setKarakterAcik] = useState(false);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil && profil.avatar_url ? profil.avatar_url : null;
  var username = profil && profil.username ? profil.username : user ? user.email.split("@")[0] : "";

  useEffect(function () {
    try { var t = localStorage.getItem("sf_tema") || "light"; setTema(t); } catch (e) {}
    // Challenge parametresi
    try {
      if (typeof window !== "undefined") {
        var params = new URLSearchParams(window.location.search);
        var ch = params.get("challenge");
        var chTur = params.get("tur");
        var chTip = params.get("tip");
        if (ch) { setOzelIstek("Challenge: " + ch + " konusuna senin yorumunu getir"); }
        if (chTur) setTur(chTur);
        if (chTip) setTip(chTip);
      }
    } catch (e) {}
    setTimeout(function () { setLoaded(true); }, 80);
    supabase.auth.getSession().then(function (r) {
      if (r.data && r.data.session) { var u = r.data.session.user; setUser(u); loadProfil(u); }
    });
    supabase.auth.onAuthStateChange(function (_, session) {
      if (session) { setUser(session.user); loadProfil(session.user); }
      else { setUser(null); setProfil(null); }
    });
  }, []);

  function loadProfil(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(function (r) { if (r.data) setProfil(r.data); });
  }

  function temaToggle() {
    var t = dk ? "light" : "dark"; setTema(t);
    try { localStorage.setItem("sf_tema", t); } catch (e) {}
  }

  async function senaryoUret() {
    setYukleniyor(true);
    setSenaryo(null);
    setKarakterAnaliz(null);
    setKarakterAcik(false);
    try {
      var res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip: tip, tur: tur, ozelIstek: ozelIstek }),
      });
      var data = await res.json();
      if (data.senaryo) setSenaryo(data.senaryo);
      else alert("Senaryo oluşturulamadı, tekrar dene.");
    } catch (e) { alert("Hata oluştu: " + e.message); }
    setYukleniyor(false);
  }

  async function karakterAnaliz_yap() {
    if (!senaryo) return;
    setKarakterYukleniyor(true);
    setKarakterAcik(true);
    try {
      var res = await fetch("/api/karakter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senaryo: senaryo }),
      });
      var data = await res.json();
      if (data.analiz) setKarakterAnaliz(data.analiz);
    } catch (e) {}
    setKarakterYukleniyor(false);
  }

  async function profilKaydet() {
    if (!user || !senaryo) return;
    await supabase.from("senaryolar").insert([{
      user_id: user.id, tip: tip, tur: tur,
      baslik: senaryo.baslik, tagline: senaryo.tagline,
      ana_fikir: senaryo.ana_fikir, karakter: senaryo.karakter,
      sahne: senaryo.acilis_sahnesi, soru: senaryo.buyuk_soru,
      paylasim_acik: paylasimAcik, begeni_sayisi: 0,
    }]);
    setKaydedildi(true);
  }

  if (!loaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 100 }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
        textarea::placeholder,input::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}
        a{text-decoration:none;color:inherit;}
        button{font-family:inherit;}
      `}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.93)" : "rgba(238,242,247,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={function () { setDrawer(true); }} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "2px solid " + TEAL + "40" }}>
            {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1 }}>Scriptify</p>
            <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 1 }}>Senaryo Üret</p>
          </div>
        </button>
        <button onClick={temaToggle} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "7px 10px", color: C.muted, fontSize: 13, cursor: "pointer" }}>{dk ? "☀️" : "🌙"}</button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>

        {/* FORM KARTI */}
        <div style={{ background: C.metalGrad, border: "1px solid " + C.border, borderRadius: 24, padding: "24px", marginBottom: 20, boxShadow: C.shadow }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg," + ACCENT + ",#ff5722)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎬</div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>Senaryo Üret</h1>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>AI ile özgün film & dizi fikirleri oluştur</p>
            </div>
          </div>

          {/* Format seçimi */}
          <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Format</p>
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            {TIPLER.map(function (t) {
              var isActive = tip === t.val;
              return (
                <button key={t.val} onClick={function () { setTip(t.val); }} style={{ flex: 1, padding: "12px", borderRadius: 14, border: "2px solid " + (isActive ? TEAL : C.border), background: isActive ? TEAL + "15" : C.input, color: isActive ? TEAL : C.muted, fontSize: 14, fontWeight: isActive ? 800 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                  {t.icon} {t.val}
                </button>
              );
            })}
          </div>

          {/* Tür seçimi */}
          <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Tür</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {TURLER.map(function (t) {
              var isActive = tur === t;
              return (
                <button key={t} onClick={function () { setTur(t); }} style={{ padding: "7px 14px", borderRadius: 20, border: "1.5px solid " + (isActive ? ACCENT : C.border), background: isActive ? ACCENT + "15" : C.input, color: isActive ? ACCENT : C.muted, fontSize: 13, fontWeight: isActive ? 700 : 500, cursor: "pointer", transition: "all 0.15s" }}>
                  {t}
                </button>
              );
            })}
          </div>

          {/* Özel istek */}
          <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Özel İstek (isteğe bağlı)</p>
          <textarea value={ozelIstek} onChange={function (e) { setOzelIstek(e.target.value); }} placeholder="Örn: İstanbul'da geçsin, ana karakter kadın olsun, karanlık atmosfer..." rows={3} style={{ width: "100%", background: C.input, border: "1px solid " + C.border, borderRadius: 14, padding: "12px 16px", color: C.text, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.6, marginBottom: 20 }} />

          <button onClick={senaryoUret} disabled={yukleniyor} style={{ width: "100%", padding: "14px", borderRadius: 14, background: yukleniyor ? C.input : "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: yukleniyor ? C.muted : "#fff", fontSize: 15, fontWeight: 800, cursor: yukleniyor ? "default" : "pointer", transition: "all 0.2s", boxShadow: yukleniyor ? "none" : "0 4px 20px " + ACCENT + "35" }}>
            {yukleniyor ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <span style={{ display: "inline-block", width: 18, height: 18, border: "2px solid " + C.muted, borderTopColor: TEAL, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Üretiliyor...
              </span>
            ) : "✨ Senaryo Üret"}
          </button>
        </div>

        {/* SENARYO SONUCU */}
        {senaryo && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ background: C.metalGrad, border: "1px solid " + C.border, borderRadius: 24, padding: "24px", marginBottom: 16, boxShadow: C.shadow }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: TEAL + "15", color: TEAL, border: "1px solid " + TEAL + "25" }}>{tip}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: ACCENT + "12", color: ACCENT, border: "1px solid " + ACCENT + "20" }}>{tur}</span>
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: "-0.03em", marginBottom: 6 }}>{senaryo.baslik}</h2>
              {senaryo.tagline && <p style={{ fontSize: 14, fontStyle: "italic", color: TEAL, marginBottom: 16, lineHeight: 1.5 }}>"{senaryo.tagline}"</p>}

              {[
                { label: "💡 Ana Fikir", val: senaryo.ana_fikir },
                { label: "👥 Karakterler", val: senaryo.karakter },
                { label: "🎭 Açılış Sahnesi", val: senaryo.acilis_sahnesi },
                { label: "❓ Büyük Soru", val: senaryo.buyuk_soru },
              ].map(function (item) {
                if (!item.val) return null;
                return (
                  <div key={item.label} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid " + C.border }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{item.label}</p>
                    <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{item.val}</p>
                  </div>
                );
              })}

              {/* Karakter analizi butonu */}
              <button onClick={karakterAnaliz_yap} disabled={karakterYukleniyor} style={{ width: "100%", padding: "12px", borderRadius: 14, background: karakterYukleniyor ? C.input : "linear-gradient(135deg,#7c3aed,#9333ea)", border: "none", color: karakterYukleniyor ? C.muted : "#fff", fontSize: 14, fontWeight: 700, cursor: karakterYukleniyor ? "default" : "pointer", marginBottom: 12, boxShadow: karakterYukleniyor ? "none" : "0 4px 16px rgba(124,58,237,0.3)" }}>
                {karakterYukleniyor ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid " + C.muted, borderTopColor: "#9333ea", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Analiz ediliyor...
                  </span>
                ) : "🧠 Karakteri Analiz Et"}
              </button>

              {/* Kaydet & paylaş */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: kaydedildi ? 0 : 4 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flex: 1 }}>
                  <div onClick={function () { setPaylasimAcik(!paylasimAcik); }} style={{ width: 40, height: 22, borderRadius: 11, background: paylasimAcik ? TEAL : C.border, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 3, left: paylasimAcik ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                  </div>
                  <span style={{ fontSize: 13, color: C.muted }}>Topluluğa paylaş</span>
                </label>
                {!kaydedildi ? (
                  <button onClick={profilKaydet} style={{ padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    {user ? "💾 Kaydet" : "Giriş Yap"}
                  </button>
                ) : (
                  <span style={{ fontSize: 13, color: "#10b981", fontWeight: 700 }}>✅ Kaydedildi!</span>
                )}
              </div>
            </div>

            {/* KARAKTERİ ANALİZ ET SONUCU */}
            {karakterAcik && (
              <div style={{ background: C.metalGrad, border: "1px solid rgba(124,58,237,0.3)", borderRadius: 24, padding: "24px", marginBottom: 16, boxShadow: "0 8px 32px rgba(124,58,237,0.1)", animation: "fadeUp 0.35s ease" }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  🧠 Karakter Analizi
                  <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: "rgba(124,58,237,0.12)", color: "#9333ea", fontWeight: 700 }}>AI</span>
                </h3>
                {karakterYukleniyor ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 12 }}>
                    <span style={{ display: "inline-block", width: 24, height: 24, border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#9333ea", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    <span style={{ fontSize: 14, color: C.muted }}>Karakterler inceleniyor...</span>
                  </div>
                ) : karakterAnaliz ? (
                  <div>
                    {[
                      { label: "📜 Geçmiş & Köken", val: karakterAnaliz.gecmis },
                      { label: "🎯 Motivasyon", val: karakterAnaliz.motivasyon },
                      { label: "💪 Güçlü Yönler", val: karakterAnaliz.guclu },
                      { label: "⚠️ Zayıf Yönler", val: karakterAnaliz.zayif },
                      { label: "🌱 Karakter Yayı", val: karakterAnaliz.arc },
                    ].map(function (item) {
                      if (!item.val) return null;
                      return (
                        <div key={item.label} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid rgba(124,58,237,0.12)" }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#9333ea", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>{item.label}</p>
                          <p style={{ fontSize: 14, color: C.text, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{item.val}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
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
          var active = item.href === "/uret";
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 14px", borderRadius: 14, position: "relative", opacity: active ? 1 : 0.6 }}>
              {item.svg(active)}
              {active && <div style={{ position: "absolute", bottom: 2, width: 18, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>

      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={function () { setDrawer(false); }} onTema={temaToggle} />}
    </div>
  );
}
