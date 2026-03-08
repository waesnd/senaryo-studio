import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var TURLER = ["Gerilim", "Bilim Kurgu", "Dram", "Korku", "Komedi", "Romantik", "Macera", "Suc", "Fantazi", "Psikolojik", "Tarihi", "Aksiyon"];
var TIPLER = ["Dizi", "Film"];
var TUR_EMOJIS = { "Gerilim": "🔪", "Bilim Kurgu": "🚀", "Dram": "🎭", "Korku": "👁️", "Komedi": "😂", "Romantik": "💔", "Macera": "🧭", "Suc": "🕵️", "Fantazi": "🐉", "Psikolojik": "🧠", "Tarihi": "⚔️", "Aksiyon": "💥" };
var TUR_LABELS = { "Suc": "Suç" };
var TUR_COLORS = { "Gerilim": "#ff4d4d", "Bilim Kurgu": "#22d3ee", "Dram": "#c084fc", "Korku": "#fb923c", "Komedi": "#facc15", "Romantik": "#f472b6", "Macera": "#4ade80", "Suc": "#94a3b8", "Fantazi": "#a78bfa", "Psikolojik": "#818cf8", "Tarihi": "#fbbf24", "Aksiyon": "#f87171" };

var BOKEH = Array.from({ length: 18 }, function(_, i) {
  return {
    id: i,
    size: 40 + (i * 17) % 100,
    x: (i * 23 + 7) % 100,
    y: (i * 31 + 13) % 100,
    dur: 12 + (i * 3) % 14,
    delay: -(i * 2.3),
    op: 0.04 + (i % 4) * 0.03,
    color: i % 4 === 0 ? "#e8230a" : i % 4 === 1 ? "#ff6b35" : i % 4 === 2 ? "#ffffff" : "#ff4444",
  };
});

function useTypewriter(text, speed) {
  var spd = speed || 28;
  var arr = useState("");
  var d = arr[0]; var setD = arr[1];
  useEffect(function() {
    if (!text) return;
    setD("");
    var i = 0;
    var iv = setInterval(function() {
      i++; setD(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, spd);
    return function() { clearInterval(iv); };
  }, [text]);
  return d;
}

function TW(props) {
  var d = useTypewriter(props.text, props.speed || 25);
  return (
    <p style={props.style || {}}>
      {d}<span style={{ animation: "blink 1s step-end infinite" }}>|</span>
    </p>
  );
}

export default function App() {
  var s1 = useState("splash"); var step = s1[0]; var setStep = s1[1];
  var s2 = useState(null); var tip = s2[0]; var setTip = s2[1];
  var s3 = useState(null); var tur = s3[0]; var setTur = s3[1];
  var s4 = useState(null); var concept = s4[0]; var setConcept = s4[1];
  var s5 = useState(true); var anim = s5[0]; var setAnim = s5[1];
  var s6 = useState(null); var hov = s6[0]; var setHov = s6[1];
  var s7 = useState(""); var customTur = s7[0]; var setCustomTur = s7[1];
  var s8 = useState(false); var showCustom = s8[0]; var setShowCustom = s8[1];
  var s9 = useState(0); var rk = s9[0]; var setRk = s9[1];
  var s10 = useState(false); var panel = s10[0]; var setPanel = s10[1];
  var s11 = useState([]); var gecmis = s11[0]; var setGecmis = s11[1];
  var s12 = useState([]); var favoriler = s12[0]; var setFavoriler = s12[1];
  var s13 = useState(true); var musicOn = s13[0]; var setMusicOn = s13[1];
  var s14 = useState(null); var karakter = s14[0]; var setKarakter = s14[1];
  var s15 = useState(false); var karakterStep = s15[0]; var setKarakterStep = s15[1];
  var s16 = useState(false); var karakterLoading = s16[0]; var setKarakterLoading = s16[1];
  var s17 = useState(null); var user = s17[0]; var setUser = s17[1];
  var s18 = useState("gecmis"); var panelTab = s18[0]; var setPanelTab = s18[1];
  var s19 = useState([]); var topluluk = s19[0]; var setTopluluk = s19[1];
  var s20 = useState(""); var topluluKArama = s20[0]; var setToplulukArama = s20[1];
  var s21 = useState(null); var topluluKTur = s21[0]; var setToplulukTur = s21[1];
  var s22 = useState(false); var authPanel = s22[0]; var setAuthPanel = s22[1];
  var s23 = useState("giris"); var authMode = s23[0]; var setAuthMode = s23[1];
  var s24 = useState(""); var authEmail = s24[0]; var setAuthEmail = s24[1];
  var s25 = useState(""); var authPass = s25[0]; var setAuthPass = s25[1];
  var s26 = useState(""); var authUser = s26[0]; var setAuthUser = s26[1];
  var s27 = useState(false); var splashDone = s27[0]; var setSplashDone = s27[1];
  var audioRef = useRef(null);

  var accent = "#e8230a";
  var glass = { background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" };

  useEffect(function() {
    var t = setTimeout(function() { setSplashDone(true); }, 2800);
    return function() { clearTimeout(t); };
  }, []);

  useEffect(function() {
    if (splashDone) { go(function() { setStep("tip"); }); }
  }, [splashDone]);

  useEffect(function() {
    supabase.auth.getSession().then(function(r) {
      if (r.data && r.data.session) setUser(r.data.session.user);
    });
    var sub = supabase.auth.onAuthStateChange(function(_, session) {
      setUser(session ? session.user : null);
    });
    return function() { sub.data.subscription.unsubscribe(); };
  }, []);

  useEffect(function() {
    var saved = localStorage.getItem("gecmis");
    var savedFav = localStorage.getItem("favoriler");
    if (saved) { try { setGecmis(JSON.parse(saved)); } catch(e) {} }
    if (savedFav) { try { setFavoriler(JSON.parse(savedFav)); } catch(e) {} }
  }, []);

  useEffect(function() {
    if (audioRef.current) {
      if (musicOn) { audioRef.current.play().catch(function() {}); }
      else { audioRef.current.pause(); }
    }
  }, [musicOn]);

  function go(fn) {
    setAnim(false);
    setTimeout(function() { fn(); setAnim(true); }, 260);
  }

  function pickTip(t) {
    if (audioRef.current && musicOn) { audioRef.current.play().catch(function() {}); }
    setTip(t); go(function() { setStep("tur"); });
  }

  function pickTur(t) { setTur(t); go(function() { setStep("loading"); }); genConcept(tip, t); }

  function genConcept(tp, tr) {
    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tip: tp, tur: tr }),
    })
    .then(function(res) { return res.json(); })
    .then(function(parsed) {
      setConcept(parsed);
      setRk(function(k) { return k + 1; });
      var yeni = { id: Date.now(), tip: tp, tur: tr, baslik: parsed.baslik, data: parsed };
      setGecmis(function(prev) {
        var updated = [yeni].concat(prev);
        localStorage.setItem("gecmis", JSON.stringify(updated));
        return updated;
      });
      go(function() { setStep("result"); });
    })
    .catch(function() {
      setConcept({ baslik: "Hata", tagline: "Tekrar dene.", ana_fikir: "—", karakter: "—", sahne: "—", soru: "—" });
      go(function() { setStep("result"); });
    });
  }

  function genKarakter() {
    setKarakterLoading(true);
    fetch("/api/karakter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concept: concept, tip: tip, tur: tur }),
    })
    .then(function(res) { return res.json(); })
    .then(function(parsed) {
      setKarakter(parsed); setKarakterStep(true); setKarakterLoading(false);
    })
    .catch(function() {
      setKarakter({ gecmis: "—", motivasyon: "—", guclu: "—", zayif: "—" });
      setKarakterStep(true); setKarakterLoading(false);
    });
  }

  function toggleFavori(id) {
    setFavoriler(function(prev) {
      var updated = prev.includes(id) ? prev.filter(function(f) { return f !== id; }) : prev.concat([id]);
      localStorage.setItem("favoriler", JSON.stringify(updated));
      return updated;
    });
  }

  function gecmisSil(id) {
    setGecmis(function(prev) {
      var updated = prev.filter(function(g) { return g.id !== id; });
      localStorage.setItem("gecmis", JSON.stringify(updated));
      return updated;
    });
    setFavoriler(function(prev) {
      var updated = prev.filter(function(f) { return f !== id; });
      localStorage.setItem("favoriler", JSON.stringify(updated));
      return updated;
    });
  }

  function reset() {
    go(function() {
      setStep("tip"); setTip(null); setTur(null); setConcept(null);
      setCustomTur(""); setShowCustom(false); setKarakter(null); setKarakterStep(false);
    });
  }

  function regen() { go(function() { setStep("loading"); }); genConcept(tip, tur); }

  function paylasMetin() {
    var text = "🎬 " + concept.baslik + "\n\"" + concept.tagline + "\"\n\n📖 " + concept.ana_fikir + "\n\n👤 " + concept.karakter + "\n\n❓ " + concept.soru + "\n\nSenaryo Stüdyosu ile üretildi.";
    navigator.clipboard.writeText(text);
    alert("Kopyalandı!");
  }

  function paylasWhatsapp() {
    var text = encodeURIComponent("🎬 " + concept.baslik + "\n\"" + concept.tagline + "\"\n\n" + concept.ana_fikir);
    window.open("https://wa.me/?text=" + text);
  }

  async function topluluгаPaylас() {
    if (!user) { alert("Paylaşmak için giriş yapmalısın!"); setAuthPanel(true); return; }
    var ins = await supabase.from("senaryolar").insert([{
      user_id: user.id, tip: tip, tur: turLabel(tur),
      baslik: concept.baslik, tagline: concept.tagline,
      ana_fikir: concept.ana_fikir, karakter: concept.karakter,
      sahne: concept.sahne, soru: concept.soru, paylasim_acik: true
    }]);
    if (ins.error) { alert("Hata: " + ins.error.message); }
    else { alert("Toplulukla paylaşıldı! 🎉"); }
  }

  async function toplulukYukle() {
    var query = supabase.from("senaryolar").select("*").eq("paylasim_acik", true).order("begeni_sayisi", { ascending: false });
    if (topluluKTur) query = query.eq("tur", topluluKTur);
    if (topluluKArama) query = query.ilike("baslik", "%" + topluluKArama + "%");
    var res = await query.limit(50);
    if (res.data) setTopluluk(res.data);
  }

  useEffect(function() {
    if (panelTab === "topluluk") toplulukYukle();
  }, [panelTab, topluluKTur, topluluKArama]);

  async function begeni(senaryoId) {
    if (!user) { alert("Beğenmek için giriş yapmalısın!"); return; }
    await supabase.from("begeniler").insert([{ user_id: user.id, senaryo_id: senaryoId }]);
    await supabase.from("senaryolar").update({ begeni_sayisi: supabase.rpc("increment", { row_id: senaryoId }) }).eq("id", senaryoId);
    toplulukYukle();
  }

  async function authGiris() {
    if (authMode === "giris") {
      var r = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
      if (r.error) alert(r.error.message);
      else { setAuthPanel(false); }
    } else if (authMode === "kayit") {
      var r2 = await supabase.auth.signUp({ email: authEmail, password: authPass, options: { data: { username: authUser } } });
      if (r2.error) alert(r2.error.message);
      else { alert("Kayıt başarılı! Email'ini onayla."); setAuthPanel(false); }
    } else {
      var r3 = await supabase.auth.signInWithOAuth({ provider: "google" });
      if (r3.error) alert(r3.error.message);
    }
  }

  async function cikis() {
    await supabase.auth.signOut();
    setUser(null);
  }

  function turLabel(t) { return TUR_LABELS[t] || t; }

  var enCokTur = function() {
    if (gecmis.length === 0) return "—";
    var sayac = {};
    gecmis.forEach(function(g) { sayac[g.tur] = (sayac[g.tur] || 0) + 1; });
    return Object.keys(sayac).reduce(function(a, b) { return sayac[a] > sayac[b] ? a : b; });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#fff", fontFamily: "Georgia, serif", fontWeight: 700, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {BOKEH.map(function(p) {
        return (
          <div key={p.id} style={{ position: "fixed", width: p.size, height: p.size, borderRadius: "50%", left: p.x + "%", top: p.y + "%", background: "radial-gradient(circle, " + p.color + " 0%, transparent 70%)", filter: "blur(12px)", opacity: p.op, animation: "float" + (p.id % 3) + " " + p.dur + "s " + p.delay + "s ease-in-out infinite alternate", pointerEvents: "none", zIndex: 0 }} />
        );
      })}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", pointerEvents: "none", zIndex: 1 }} />
      <audio ref={audioRef} loop src="https://cdn.pixabay.com/audio/2022/10/16/audio_12a71c9a3b.mp3" />
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 40, background: "#030303", zIndex: 30 }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 40, background: "#030303", zIndex: 30 }} />

      {step === "splash" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "#080808", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {BOKEH.map(function(p) {
            return <div key={p.id} style={{ position: "absolute", width: p.size, height: p.size, borderRadius: "50%", left: p.x + "%", top: p.y + "%", background: "radial-gradient(circle, " + p.color + " 0%, transparent 70%)", filter: "blur(12px)", opacity: p.op, animation: "float" + (p.id % 3) + " " + p.dur + "s " + p.delay + "s ease-in-out infinite alternate", pointerEvents: "none" }} />;
          })}
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)" }} />
          <div style={{ position: "relative", zIndex: 2, textAlign: "center", animation: "splashIn 1.2s ease forwards" }}>
            <div style={{ fontSize: 40, marginBottom: 16, animation: "pulse 2s ease-in-out infinite" }}>◈</div>
            <h1 style={{ fontSize: 38, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#fff", marginBottom: 12, textShadow: "0 0 60px rgba(232,35,10,0.6)" }}>Senaryo Stüdyosu</h1>
            <p style={{ fontSize: 13, fontStyle: "italic", color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em" }}>by Öztürk</p>
          </div>
          <div style={{ position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
            {[0,1,2].map(function(i) {
              return <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: accent, opacity: 0.4, animation: "dotPulse 1.2s " + (i * 0.2) + "s ease-in-out infinite" }} />;
            })}
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "52px 20px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={function() { setPanel(!panel); }} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 14 }}>☰</button>
          <button onClick={reset} style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 13, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer" }}>◈ Senaryo Stüdyosu</button>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={function() { setMusicOn(!musicOn); }} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "5px 12px", color: musicOn ? accent : "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 900, cursor: "pointer", fontFamily: "Courier New, monospace" }}>
            {musicOn ? "♪ ON" : "♪ OFF"}
          </button>
          <button onClick={function() { user ? cikis() : setAuthPanel(true); }} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "5px 12px", color: user ? "#4ade80" : "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 900, cursor: "pointer", fontFamily: "Courier New, monospace" }}>
            {user ? "✓ Çıkış" : "Giriş"}
          </button>
        </div>
      </div>

      {step === "tip" && (
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", paddingTop: 10 }}>
          <span style={{ fontFamily: "Georgia, serif", fontSize: 13, fontStyle: "italic", fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>by Öztürk</span>
        </div>
      )}

      {authPanel && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={function() { setAuthPanel(false); }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} />
          <div style={{ position: "relative", zIndex: 1, background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "32px 28px", width: "90%", maxWidth: 360 }}>
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 6, textAlign: "center" }}>
              {authMode === "giris" ? "Giriş Yap" : authMode === "kayit" ? "Kayıt Ol" : "Google ile Giriş"}
            </h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
              {["giris", "kayit", "google"].map(function(m) {
                return <button key={m} onClick={function() { setAuthMode(m); }} style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid", borderColor: authMode === m ? accent : "rgba(255,255,255,0.2)", background: authMode === m ? accent + "22" : "transparent", color: authMode === m ? accent : "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 900, cursor: "pointer", fontFamily: "Courier New, monospace" }}>{m === "giris" ? "E-posta" : m === "kayit" ? "Kayıt" : "Google"}</button>;
              })}
            </div>
            {authMode !== "google" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {authMode === "kayit" && <input value={authUser} onChange={function(e) { setAuthUser(e.target.value); }} placeholder="Kullanıcı adı" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, fontWeight: 700, outline: "none" }} />}
                <input value={authEmail} onChange={function(e) { setAuthEmail(e.target.value); }} placeholder="E-posta" type="email" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, fontWeight: 700, outline: "none" }} />
                <input value={authPass} onChange={function(e) { setAuthPass(e.target.value); }} placeholder="Şifre" type="password" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 10, padding: "10px 14px", color: "#fff", fontSize: 13, fontWeight: 700, outline: "none" }} />
              </div>
            )}
            <button onClick={authGiris} style={{ marginTop: 16, width: "100%", padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, " + accent + ", #c01a08)", border: "none", color: "#fff", fontSize: 14, fontWeight: 900, cursor: "pointer" }}>
              {authMode === "giris" ? "Giriş Yap" : authMode === "kayit" ? "Kayıt Ol" : "Google ile Devam Et"}
            </button>
            <button onClick={function() { setAuthPanel(false); }} style={{ marginTop: 10, width: "100%", padding: "8px", background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>İptal</button>
          </div>
        </div>
      )}

      {panel && (
        <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: 320, background: "rgba(8,8,8,0.97)", backdropFilter: "blur(30px)", borderRight: "1px solid rgba(255,255,255,0.08)", zIndex: 50, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "52px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6 }}>
              {["gecmis", "topluluk", "profil"].map(function(t) {
                return <button key={t} onClick={function() { setPanelTab(t); }} style={{ padding: "5px 10px", borderRadius: 10, border: "1px solid", borderColor: panelTab === t ? accent : "rgba(255,255,255,0.1)", background: panelTab === t ? accent + "22" : "transparent", color: panelTab === t ? accent : "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 900, cursor: "pointer", fontFamily: "Courier New, monospace", textTransform: "uppercase" }}>
                  {t === "gecmis" ? "Geçmiş" : t === "topluluk" ? "Topluluk" : "Profil"}
                </button>;
              })}
            </div>
            <button onClick={function() { setPanel(false); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer" }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 60px" }}>
            {panelTab === "gecmis" && (
              <div>
                <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Geçmiş Konular</p>
                {gecmis.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "Courier New, monospace" }}>Henüz konu üretilmedi.</p>}
                {gecmis.map(function(item) {
                  return (
                    <div key={item.id} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, cursor: "pointer" }} onClick={function() { setConcept(item.data); setTip(item.tip); setTur(item.tur); setRk(function(k) { return k + 1; }); go(function() { setStep("result"); }); setPanel(false); }}>
                        <p style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 2 }}>{item.baslik}</p>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "Courier New, monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>{item.tip} · {turLabel(item.tur)}</p>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={function() { toggleFavori(item.id); }} style={{ background: "none", border: "none", fontSize: 14, cursor: "pointer", color: favoriler.includes(item.id) ? "#facc15" : "rgba(255,255,255,0.2)" }}>⭐</button>
                        <button onClick={function() { gecmisSil(item.id); }} style={{ background: "none", border: "none", fontSize: 14, cursor: "pointer", color: "rgba(255,255,255,0.2)" }}>🗑️</button>
                      </div>
                    </div>
                  );
                })}
                {favoriler.length > 0 && (
                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ color: "#facc15", fontFamily: "Courier New, monospace", fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>⭐ Favoriler</p>
                    {gecmis.filter(function(g) { return favoriler.includes(g.id); }).map(function(item) {
                      return (
                        <div key={item.id} onClick={function() { setConcept(item.data); setTip(item.tip); setTur(item.tur); setRk(function(k) { return k + 1; }); go(function() { setStep("result"); }); setPanel(false); }} style={{ padding: "8px 12px", borderRadius: 10, background: "rgba(250,204,21,0.05)", border: "1px solid rgba(250,204,21,0.15)", marginBottom: 6, cursor: "pointer" }}>
                          <p style={{ fontSize: 12, fontWeight: 900, color: "#fff" }}>{item.baslik}</p>
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "Courier New, monospace", textTransform: "uppercase" }}>{item.tip} · {turLabel(item.tur)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {panelTab === "topluluk" && (
              <div>
                <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 12 }}>Topluluk</p>
                <input value={topluluKArama} onChange={function(e) { setToplulukArama(e.target.value); }} placeholder="🔍 Ara..." style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", color: "#fff", fontSize: 12, fontWeight: 700, outline: "none", marginBottom: 10, boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  <button onClick={function() { setToplulukTur(null); }} style={{ padding: "3px 8px", borderRadius: 8, border: "1px solid", borderColor: !topluluKTur ? accent : "rgba(255,255,255,0.1)", background: !topluluKTur ? accent + "22" : "transparent", color: !topluluKTur ? accent : "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 900, cursor: "pointer" }}>Hepsi</button>
                  {TURLER.map(function(t) {
                    return <button key={t} onClick={function() { setToplulukTur(turLabel(t)); }} style={{ padding: "3px 8px", borderRadius: 8, border: "1px solid", borderColor: topluluKTur === turLabel(t) ? accent : "rgba(255,255,255,0.1)", background: topluluKTur === turLabel(t) ? accent + "22" : "transparent", color: topluluKTur === turLabel(t) ? accent : "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 900, cursor: "pointer" }}>{turLabel(t)}</button>;
                  })}
                </div>
                {topluluk.length === 0 && <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "Courier New, monospace" }}>Henüz paylaşılan konu yok.</p>}
                {topluluk.map(function(item) {
                  return (
                    <div key={item.id} style={{ padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                        <p style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>{item.baslik}</p>
                        <button onClick={function() { begeni(item.id); }} style={{ background: "none", border: "none", color: accent, fontSize: 12, cursor: "pointer", fontWeight: 900 }}>♥ {item.begeni_sayisi || 0}</button>
                      </div>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "Courier New, monospace", marginBottom: 6 }}>{item.tip} · {item.tur}</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{item.ana_fikir}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {panelTab === "profil" && (
              <div>
                <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 11, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 16 }}>Profil</p>
                {!user ? (
                  <div style={{ textAlign: "center", paddingTop: 20 }}>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 16 }}>Profil için giriş yapmalısın.</p>
                    <button onClick={function() { setPanel(false); setAuthPanel(true); }} style={{ padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg, " + accent + ", #c01a08)", border: "none", color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer" }}>Giriş Yap</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ ...glass, borderRadius: 14, padding: "16px", marginBottom: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>👤</div>
                      <p style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{user.email}</p>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div style={{ ...glass, borderRadius: 12, padding: "14px", textAlign: "center" }}>
                        <p style={{ fontSize: 28, fontWeight: 900, color: accent }}>{gecmis.length}</p>
                        <p style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.5)", fontFamily: "Courier New, monospace", textTransform: "uppercase" }}>Konu</p>
                      </div>
                      <div style={{ ...glass, borderRadius: 12, padding: "14px", textAlign: "center" }}>
                        <p style={{ fontSize: 16, fontWeight: 900, color: "#facc15" }}>{enCokTur()}</p>
                        <p style={{ fontSize: 10, fontWeight: 900, color: "rgba(255,255,255,0.5)", fontFamily: "Courier New, monospace", textTransform: "uppercase" }}>Favori Tür</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {panel && <div onClick={function() { setPanel(false); }} style={{ position: "fixed", inset: 0, zIndex: 49, background: "rgba(0,0,0,0.4)" }} />}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", zIndex: 10, opacity: anim ? 1 : 0, transform: anim ? "translateY(0)" : "translateY(14px)", transition: "all 0.26s ease" }}>

        {step === "tip" && (
          <div style={{ textAlign: "center", maxWidth: 480, width: "100%" }}>
            <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 13, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>Adım 1 / 2</p>
            <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 10, lineHeight: 1 }}>Ne üretelim?</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "Courier New, monospace", fontWeight: 700, marginBottom: 48 }}>Bir format seç, gerisini biz halledelim.</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
              {TIPLER.map(function(t) {
                return (
                  <button key={t} onClick={function() { pickTip(t); }}
                    style={{ flex: 1, maxWidth: 180, borderRadius: 20, padding: "28px 20px", textAlign: "left", cursor: "pointer", transition: "all 0.25s", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)", color: "#fff" }}
                    onMouseEnter={function(e) { e.currentTarget.style.transform = "scale(1.04)"; }}
                    onMouseLeave={function(e) { e.currentTarget.style.transform = "scale(1)"; }}>
                    <div style={{ fontSize: 34, marginBottom: 14 }}>{t === "Dizi" ? "📺" : "🎬"}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 4 }}>{t}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", fontFamily: "Courier New, monospace" }}>{t === "Dizi" ? "Bölümlü anlatı" : "Tek seferlik"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === "tur" && (
          <div style={{ textAlign: "center", maxWidth: 560, width: "100%" }}>
            <p style={{ color: accent, fontFamily: "Courier New, monospace", fontSize: 13, fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>Adım 2 / 2</p>
            <h1 style={{ fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 10, lineHeight: 1 }}>Hangi tür?</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "Courier New, monospace", fontWeight: 700, marginBottom: 24 }}>{"Bir tür seç, " + (tip ? tip.toLowerCase() : "") + " konunu üretelim."}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {TURLER.map(function(t) {
                var isH = hov === t;
                var c = TUR_COLORS[t] || "#ffffff";
                return (
                  <button key={t} onClick={function() { pickTur(t); }}
                    onMouseEnter={function() { setHov(t); }}
                    onMouseLeave={function() { setHov(null); }}
                    style={{ borderRadius: 14, padding: "12px 10px", textAlign: "left", cursor: "pointer", transition: "all 0.18s", border: "1px solid " + (isH ? c + "55" : "rgba(255,255,255,0.09)"), background: isH ? c + "14" : "rgba(255,255,255,0.03)", transform: isH ? "scale(1.05) translateY(-2px)" : "scale(1)", backdropFilter: "blur(20px)", color: "#fff" }}>
                    <div style={{ fontSize: 20, marginBottom: 5 }}>{TUR_EMOJIS[t]}</div>
                    <div style={{ fontSize: 12, fontWeight: 900 }}>{turLabel(t)}</div>
                  </button>
                );
              })}
            </div>
            {!showCustom ? (
              <button onClick={function() { setShowCustom(true); }} style={{ marginTop: 12, width: "100%", padding: "10px", borderRadius: 14, border: "1px dashed rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 900, fontFamily: "Courier New, monospace", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
                ✏️ Kendi türünü yaz
              </button>
            ) : (
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <input autoFocus value={customTur} onChange={function(e) { setCustomTur(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter" && customTur.trim()) pickTur(customTur.trim()); if (e.key === "Escape") { setShowCustom(false); setCustomTur(""); } }}
                  placeholder="örn: distopik romantizm..."
                  style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid " + accent + "45", borderRadius: 12, padding: "10px 14px", color: "#fff", fontSize: 13, fontWeight: 700, outline: "none" }} />
                <button onClick={function() { if (customTur.trim()) pickTur(customTur.trim()); }} style={{ padding: "10px 16px", borderRadius: 12, background: "linear-gradient(135deg, " + accent + ", " + accent + "aa)", border: "none", color: "#fff", fontWeight: 900, cursor: "pointer" }}>→</button>
                <button onClick={function() { setShowCustom(false); setCustomTur(""); }} style={{ padding: "10px 12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", cursor: "pointer" }}>✕</button>
              </div>
            )}
            <button onClick={function() { go(function() { setStep("tip"); }); }} style={{ marginTop: 18, fontSize: 13, fontWeight: 900, fontFamily: "Courier New, monospace", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer" }}>← Geri</button>
          </div>
        )}

        {step === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
            <div style={{ position: "relative", width: 80, height: 80 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid transparent", borderTopColor: accent, animation: "spin 1s linear infinite" }} />
              <div style={{ position: "absolute", inset: 10, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", animation: "spin 1.5s linear infinite reverse" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{TUR_EMOJIS[tur] || "🎬"}</div>
            </div>
            <p style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Courier New, monospace", fontWeight: 900, color: accent, animation: "pulse 1.8s ease-in-out infinite" }}>Senaryo yazılıyor...</p>
          </div>
        )}

        {step === "result" && concept && !karakterStep && (
          <div style={{ width: "100%", maxWidth: 560 }} key={rk}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, justifyContent: "center" }}>
              <span style={{ fontSize: 20 }}>{TUR_EMOJIS[tur] || "🎬"}</span>
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "Courier New, monospace", padding: "3px 12px", borderRadius: 20, border: "1px solid " + accent + "45", color: accent, background: accent + "12" }}>{tip} · {turLabel(tur)}</span>
              <button onClick={function() { if (gecmis[0]) toggleFavori(gecmis[0].id); }} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: gecmis[0] && favoriler.includes(gecmis[0].id) ? "#facc15" : "rgba(255,255,255,0.2)" }}>⭐</button>
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 900, textAlign: "center", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 8, textShadow: "0 0 40px " + accent + "35" }}>{concept.baslik}</h2>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <TW text={concept.tagline} speed={28} style={{ fontSize: 14, fontStyle: "italic", fontWeight: 700, fontFamily: "Courier New, monospace", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ ...glass, borderRadius: 16, padding: "16px 18px" }}>
                <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: accent, marginBottom: 8 }}>Ana Fikir</p>
                <p style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.65, color: "rgba(255,255,255,0.9)" }}>{concept.ana_fikir}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[{ label: "Karakter", val: concept.karakter }, { label: "Açılış Sahnesi", val: concept.sahne }].map(function(item) {
                  return (
                    <div key={item.label} style={{ ...glass, borderRadius: 16, padding: "14px 16px" }}>
                      <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{item.label}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.6, color: "rgba(255,255,255,0.85)", fontFamily: "Courier New, monospace" }}>{item.val}</p>
                    </div>
                  );
                })}
              </div>
              <div style={{ ...glass, borderRadius: 16, padding: "16px", textAlign: "center", borderColor: accent + "30", background: accent + "0e" }}>
                <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Büyük Soru</p>
                <TW text={"\"" + concept.soru + "\""} speed={22} style={{ fontSize: 14, fontWeight: 900, fontFamily: "Courier New, monospace", color: accent, lineHeight: 1.6 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={regen} style={{ ...glass, padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: "pointer", color: "rgba(255,255,255,0.85)" }}>🔄 Yeni</button>
              <button onClick={function() { go(function() { setStep("tur"); }); }} style={{ ...glass, padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: "pointer", color: "rgba(255,255,255,0.85)" }}>🎭 Tür</button>
              <button onClick={genKarakter} disabled={karakterLoading} style={{ ...glass, padding: "8px 16px", borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: "pointer", color: "#a78bfa", borderColor: "#a78bfa40" }}>🧠 {karakterLoading ? "Yükleniyor..." : "Karakter"}</button>
              <button onClick={reset} style={{ padding: "8px 16px", borderRadius: 12, background: "linear-gradient(135deg, " + accent + ", #c01a08)", border: "1px solid " + accent, fontSize: 12, fontWeight: 900, cursor: "pointer", color: "#fff" }}>✦ Baştan</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={paylasMetin} style={{ ...glass, padding: "6px 14px", borderRadius: 10, fontSize: 11, fontWeight: 900, cursor: "pointer", color: "rgba(255,255,255,0.6)" }}>📋 Kopyala</button>
              <button onClick={paylasWhatsapp} style={{ ...glass, padding: "6px 14px", borderRadius: 10, fontSize: 11, fontWeight: 900, cursor: "pointer", color: "#4ade80" }}>💬 WhatsApp</button>
              <button onClick={topluluгаPaylас} style={{ ...glass, padding: "6px 14px", borderRadius: 10, fontSize: 11, fontWeight: 900, cursor: "pointer", color: "#60a5fa" }}>🌍 Paylaş</button>
            </div>
          </div>
        )}

        {step === "result" && karakterStep && karakter && (
          <div style={{ width: "100%", maxWidth: 560 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, justifyContent: "center" }}>
              <span style={{ fontSize: 24 }}>🧠</span>
              <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em" }}>Karakter Analizi</h2>
            </div>
            <p style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", fontFamily: "Courier New, monospace", marginBottom: 24 }}>{concept.baslik}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Geçmiş & Kökeni", val: karakter.gecmis, color: "#c084fc" },
                { label: "Motivasyonu", val: karakter.motivasyon, color: accent },
                { label: "Güçlü Yönleri", val: karakter.guclu, color: "#4ade80" },
                { label: "Zayıf Yönleri", val: karakter.zayif, color: "#fb923c" },
              ].map(function(item) {
                return (
                  <div key={item.label} style={{ ...glass, borderRadius: 16, padding: "16px 18px" }}>
                    <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "Courier New, monospace", color: item.color, marginBottom: 8 }}>{item.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.65, color: "rgba(255,255,255,0.88)" }}>{item.val}</p>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
              <button onClick={function() { setKarakterStep(false); }} style={{ ...glass, padding: "8px 18px", borderRadius: 12, fontSize: 12, fontWeight: 900, cursor: "pointer", color: "rgba(255,255,255,0.8)" }}>← Konuya Dön</button>
              <button onClick={reset} style={{ padding: "8px 18px", borderRadius: 12, background: "linear-gradient(135deg, " + accent + ", #c01a08)", border: "none", fontSize: 12, fontWeight: 900, cursor: "pointer", color: "#fff" }}>✦ Baştan Başla</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "center", gap: 8, paddingBottom: 52 }}>
        {["tip", "tur", "result"].map(function(s) {
          var allSteps = ["tip", "tur", "loading", "result"];
          var active = step === s || (step === "loading" && s === "result");
          var passed = allSteps.indexOf(step) > ["tip", "tur", "result"].indexOf(s);
          return <div key={s} style={{ height: 3, borderRadius: 2, transition: "all 0.5s", width: active ? 28 : 8, background: active ? accent : passed ? accent + "45" : "rgba(255,255,255,0.1)", boxShadow: active ? "0 0 8px " + accent : "none" }} />;
        })}
      </div>

      <style>{"\n@keyframes spin{to{transform:rotate(360deg)}}\n@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}\n@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}\n@keyframes float0{0%{transform:translate(0,0) scale(1)}100%{transform:translate(30px,-20px) scale(1.1)}}\n@keyframes float1{0%{transform:translate(0,0) scale(1)}100%{transform:translate(-20px,30px) scale(0.9)}}\n@keyframes float2{0%{transform:translate(0,0) scale(1)}100%{transform:translate(20px,20px) scale(1.05)}}\n@keyframes splashIn{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}\n@keyframes dotPulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:1;transform:scale(1.4)}}\n"}</style>
    </div>
  );
}
