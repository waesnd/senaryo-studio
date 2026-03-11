import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var TEAL = "#0891b2";
var TEAL_L = "#06b6d4";
var PURPLE = "#7c3aed";
var GREEN = "#10b981";
var AMBER = "#f59e0b";

var TURLER = ["Gerilim","Drama","Bilim Kurgu","Komedi","Romantik","Korku","Aksiyon","Fantastik","Suç","Tarihi","Animasyon","Belgesel"];
var TIPLER = [{ val: "Dizi", icon: "📺" }, { val: "Film", icon: "🎬" }];

// Save the Cat - 15 Beat
var BEAT_SHEET = [
  { id: "opening",   no: 1,  label: "Açılış Görüntüsü",    aciklama: "Filmin tonu ve dünyası", act: 1 },
  { id: "theme",     no: 2,  label: "Tema Sunumu",          aciklama: "Hikayenin ana mesajı", act: 1 },
  { id: "setup",     no: 3,  label: "Kurulum",              aciklama: "Karakterler ve statüko", act: 1 },
  { id: "catalyst",  no: 4,  label: "Katalizör",            aciklama: "Her şeyi değiştiren olay", act: 1 },
  { id: "debate",    no: 5,  label: "Tartışma",             aciklama: "Kahraman tereddüt eder", act: 1 },
  { id: "break1",    no: 6,  label: "2. Perde Geçişi",      aciklama: "Yeni dünyaya adım", act: 1 },
  { id: "bstory",    no: 7,  label: "B Hikayesi",           aciklama: "Alt hikaye / romantik", act: 2 },
  { id: "fun",       no: 8,  label: "Eğlence & Oyun",       aciklama: "Yeni dünyanın keşfi", act: 2 },
  { id: "midpoint",  no: 9,  label: "Orta Nokta",           aciklama: "Sahte zafer ya da ölüm", act: 2 },
  { id: "badguys",   no: 10, label: "Kötüler Geri Döner",   aciklama: "Baskı artıyor", act: 2 },
  { id: "alllost",   no: 11, label: "Her Şey Kayıp",        aciklama: "En karanlık an", act: 2 },
  { id: "soul",      no: 12, label: "Ruhun Karanlık Gecesi",aciklama: "Kahraman yıkılır", act: 2 },
  { id: "break2",    no: 13, label: "3. Perde Geçişi",      aciklama: "Yeni karar, yeni güç", act: 3 },
  { id: "finale",    no: 14, label: "Final",                aciklama: "Son çatışma ve çözüm", act: 3 },
  { id: "closing",   no: 15, label: "Kapanış Görüntüsü",   aciklama: "Dönüşüm tamamlandı", act: 3 },
];

var DRAWER_MENU = [
  { icon: "🏠", label: "Ana Sayfa", href: "/" },
  { icon: "🎬", label: "Senaryo Üret", href: "/uret", badge: "AI" },
  { icon: "🔭", label: "Keşfet", href: "/kesfet" },
  { icon: "🎭", label: "Topluluk", href: "/topluluk" },
  { icon: "💬", label: "Mesajlar", href: "/mesajlar" },
];

function getC(dk) {
  return {
    bg:      dk ? "#080f1c" : "#f4f6fb",
    surface: dk ? "#0f1829" : "#ffffff",
    border:  dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text:    dk ? "#f1f5f9" : "#0f172a",
    muted:   dk ? "rgba(241,245,249,0.38)" : "rgba(15,23,42,0.4)",
    input:   dk ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    metalGrad: dk ? "linear-gradient(145deg,#1a2740 0%,#0f1829 60%,#162035 100%)" : "linear-gradient(145deg,#ffffff 0%,#f0f4f8 60%,#e8eef5 100%)",
    shadow:  dk ? "0 8px 32px rgba(0,0,0,0.5)" : "0 8px 32px rgba(0,0,0,0.08)",
  };
}

function Av({ url, size, dk }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {url ? <img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <svg width={size*0.42} height={size*0.42} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
    </div>
  );
}

function Drawer({ dk, C, user, username, avatarUrl, onClose, onTema }) {
  var [cikisOnay, setCikisOnay] = useState(false);
  var SVGS = {
    home:     <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    film:     <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>,
    kesfet:   <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    topluluk: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    mesaj:    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    profil:   <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    gunes:    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    ay:       <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
    cikis:    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };
  var ICON_MAP = { "/": SVGS.home, "/uret": SVGS.film, "/kesfet": SVGS.kesfet, "/topluluk": SVGS.topluluk, "/mesajlar": SVGS.mesaj };
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201, width: 290, background: dk ? "#0d1627" : "#fff", display: "flex", flexDirection: "column", boxShadow: "6px 0 40px rgba(0,0,0,0.25)" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg," + ACCENT + "," + TEAL + "," + TEAL_L + ")" }} />
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid " + C.border }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Av url={avatarUrl} size={52} dk={dk} />
            <button onClick={onClose} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 13 }}>✕</button>
          </div>
          {user ? <><p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{username ? "@" + username : user.email}</p><p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{user.email}</p></> : <button onClick={() => { onClose(); window.location.href = "/"; }} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700 }}>Giriş Yap</button>}
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
          {DRAWER_MENU.map(item => (
            <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: item.href === "/uret" ? TEAL : C.text, background: item.href === "/uret" ? TEAL + "12" : "transparent", fontSize: 15, marginBottom: 2, textDecoration: "none", fontWeight: item.href === "/uret" ? 700 : 500 }}>
              <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center", color: item.href === "/uret" ? TEAL : C.muted }}>{ICON_MAP[item.href]}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
            </a>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.border }}>
            <a href="/profil" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, marginBottom: 2, textDecoration: "none" }}>
              <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>{SVGS.profil}</span>
              <span style={{ fontWeight: 500 }}>Profil & Ayarlar</span>
            </a>
            <button onClick={onTema} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, background: "none", border: "none", width: "100%", textAlign: "left", marginBottom: 2 }}>
              <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center", color: dk ? AMBER : PURPLE }}>{dk ? SVGS.gunes : SVGS.ay}</span>
              <span style={{ fontWeight: 500 }}>{dk ? "Açık Tema" : "Koyu Tema"}</span>
            </button>
            {user && <button onClick={() => setCikisOnay(true)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: ACCENT, fontSize: 15, background: ACCENT + "10", border: "none", width: "100%", textAlign: "left" }}>
              <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}>{SVGS.cikis}</span>
              <span style={{ fontWeight: 600 }}>Çıkış Yap</span>
            </button>}
          </div>
        </nav>
        <div style={{ padding: "14px 20px", borderTop: "1px solid " + C.border }}>
          <p style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>© 2025 Scriptify</p>
        </div>
      </div>
      {cikisOnay && <>
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
        <div style={{ position: "fixed", inset: 0, zIndex: 301, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: dk ? "#0f1829" : "#fff", borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 320, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: ACCENT + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              {SVGS.cikis}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 8 }}>Çıkış Yap</h3>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>Hesabından çıkış yapmak istediğine emin misin?</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setCikisOnay(false)} style={{ flex: 1, padding: "12px", borderRadius: 14, background: C.input, border: "1px solid " + C.border, color: C.text, fontSize: 14, fontWeight: 600 }}>İptal</button>
              <button onClick={() => { supabase.auth.signOut(); onClose(); window.location.href = "/"; }} style={{ flex: 1, padding: "12px", borderRadius: 14, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700 }}>Çıkış Yap</button>
            </div>
          </div>
        </div>
      </>}
    </>
  );
}

// ─── ANA SAYFA ────────────────────────────────────────────────────────────────
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
  var [sekme, setSekme] = useState("senaryo"); // senaryo | beatsheet | karakterler | dramaturg | puan
  // Beat Sheet
  var [beatler, setBeatler] = useState({});
  var [beatYukleniyor, setBeatYukleniyor] = useState(false);
  // Character Bible
  var [karakterBible, setKarakterBible] = useState(null);
  var [bibleYukleniyor, setBibleYukleniyor] = useState(false);
  // AI Dramaturg
  var [dramaturgAnaliz, setDraturagAnaliz] = useState(null);
  var [dramaturgYukleniyor, setDraturagYukleniyor] = useState(false);
  // AI Puan
  var [puan, setPuan] = useState(null);
  var [puanYukleniyor, setPuanYukleniyor] = useState(false);
  // Sequel
  var [sequel, setSequel] = useState(null);
  var [sequelYukleniyor, setSequelYukleniyor] = useState(false);
  // Paylaşım kartı
  var [kartModal, setKartModal] = useState(false);
  var [pdfYukleniyor, setPdfYukleniyor] = useState(false);
  // UI
  var [tema, setTema] = useState("light");
  var [drawer, setDrawer] = useState(false);
  var [loaded, setLoaded] = useState(false);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil?.avatar_url || null;
  var username = profil?.username || (user ? user.email.split("@")[0] : "");

  useEffect(() => {
    setTema(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onMq = e => setTema(e.matches ? "dark" : "light");
    mq.addEventListener("change", onMq);
    try {
      var params = new URLSearchParams(window.location.search);
      var ch = params.get("challenge"), chTur = params.get("tur"), chTip = params.get("tip");
      if (ch) setOzelIstek("Challenge: " + ch);
      if (chTur) setTur(chTur);
      if (chTip) setTip(chTip);
    } catch (e) {}
    setTimeout(() => setLoaded(true), 80);
    supabase.auth.getSession().then(r => { if (r.data?.session) { setUser(r.data.session.user); loadProfil(r.data.session.user); } });
    supabase.auth.onAuthStateChange((_, s) => { if (s) { setUser(s.user); loadProfil(s.user); } else { setUser(null); setProfil(null); } });
    return () => mq.removeEventListener("change", onMq);
  }, []);

  function loadProfil(u) { supabase.from("profiles").select("*").eq("id", u.id).single().then(r => { if (r.data) setProfil(r.data); }); }
  function temaToggle() { setTema(p => p === "dark" ? "light" : "dark"); }

  // ── Senaryo üret ──────────────────────────────────
  async function senaryoUret() {
    setYukleniyor(true);
    setSenaryo(null); setBeatler({}); setKarakterBible(null);
    setDraturagAnaliz(null); setPuan(null); setSequel(null);
    setSekme("senaryo");
    try {
      var res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tip, tur, ozelIstek }) });
      var data = await res.json();
      if (data.senaryo) setSenaryo(data.senaryo);
      else alert("Senaryo oluşturulamadı, tekrar dene.");
    } catch (e) { alert("Hata: " + e.message); }
    setYukleniyor(false);
  }

  // ── Beat Sheet ────────────────────────────────────
  async function beatUret() {
    if (!senaryo) return;
    setBeatYukleniyor(true);
    try {
      var prompt = `Sen profesyonel bir senaryo danışmanısın. Aşağıdaki senaryo için Blake Snyder'ın "Save the Cat" yöntemine göre 15 beat'i Türkçe olarak doldur. Her beat için 2-3 cümle yaz. JSON formatında döndür, anahtarlar: opening, theme, setup, catalyst, debate, break1, bstory, fun, midpoint, badguys, alllost, soul, break2, finale, closing.

Senaryo: ${senaryo.baslik}
Tür: ${tur} ${tip}
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}
Açılış: ${senaryo.acilis_sahnesi}

Sadece JSON döndür, başka hiçbir şey yazma.`;
      var res = await fetch("/api/beatsheet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senaryo, tip, tur }) });
      var parsed = await res.json();
      setBeatler(parsed);
    } catch (e) { alert("Beat Sheet oluşturulamadı."); }
    setBeatYukleniyor(false);
  }

  // ── Character Bible ───────────────────────────────
  async function karakterBibleUret() {
    if (!senaryo) return;
    setBibleYukleniyor(true);
    try {
      var prompt = `Sen bir karakter yazarısın. Aşağıdaki senaryodaki ana karakterler için detaylı Character Bible oluştur. JSON formatında döndür: { "karakterler": [ { "ad": "", "yas": "", "meslek": "", "hedef": "", "korku": "", "sir": "", "guc": "", "zayiflik": "", "arc": "", "diyalog_tonu": "" } ] }

Senaryo: ${senaryo.baslik}
Karakterler: ${senaryo.karakter}
Ana Fikir: ${senaryo.ana_fikir}
Tür: ${tur}

Sadece JSON döndür.`;
      var res = await fetch("/api/karakterbible", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senaryo, tur }) });
      var parsed = await res.json();
      setKarakterBible(parsed);
    } catch (e) { alert("Character Bible oluşturulamadı."); }
    setBibleYukleniyor(false);
  }

  // ── AI Dramaturg ──────────────────────────────────
  async function dramaturgCalistir() {
    if (!senaryo) return;
    setDraturagYukleniyor(true);
    try {
      var prompt = `Sen deneyimli bir dramaturg ve senaryo editörüsün. Aşağıdaki senaryoyu analiz et ve şu başlıklar altında Türkçe geri bildirim ver. JSON formatı: { "genel_puan": 0-100, "guc_noktalari": [], "zayif_noktalar": [], "turk_dizi_uyumu": "", "gerilim_analizi": "", "karakter_motivasyon": "", "oneri_1": "", "oneri_2": "", "oneri_3": "", "sonuc": "" }

Senaryo: ${senaryo.baslik} (${tur} ${tip})
Ana Fikir: ${senaryo.ana_fikir}
Karakterler: ${senaryo.karakter}
Açılış: ${senaryo.acilis_sahnesi}
Büyük Soru: ${senaryo.buyuk_soru}

Türk televizyon sektörüne özel analiz yap. Türk izleyici alışkanlıklarını, dizi formatlarını göz önünde bulundur.
Sadece JSON döndür.`;
      var res = await fetch("/api/dramaturg", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senaryo, tip, tur }) });
      var parsed = await res.json();
      setDraturagAnaliz(parsed);
    } catch (e) { alert("Dramaturg analizi yapılamadı."); }
    setDraturagYukleniyor(false);
  }

  // ── AI Puan ───────────────────────────────────────
  async function puanHesapla() {
    if (!senaryo) return;
    setPuanYukleniyor(true);
    try {
      var prompt = `Sen bir film yapımcısı ve yatırımcısın. Bu senaryoyu değerlendir. JSON formatı: { "toplam": 0-100, "orijinallik": 0-25, "ticari_potansiyel": 0-25, "karakter_derinligi": 0-25, "anlatim": 0-25, "imdb_tahmin": "5.0-9.5", "netflix_uygun_mu": true/false, "hedef_kitle": "", "benzer_yapimlar": [], "yapimci_yorumu": "" }

Senaryo: ${senaryo.baslik} (${tur} ${tip})
Tagline: ${senaryo.tagline}
Ana Fikir: ${senaryo.ana_fikir}

Sadece JSON döndür.`;
      var res = await fetch("/api/puan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ senaryo, tip, tur }) });
      var parsed = await res.json();
      setPuan(parsed);
    } catch (e) { alert("Puanlama yapılamadı."); }
    setPuanYukleniyor(false);
  }

  // ── Sequel ────────────────────────────────────────
  async function sequelUret() {
    if (!senaryo) return;
    setSequelYukleniyor(true); setSequel(null);
    try {
      var res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tip, tur, ozelIstek: `Bu senaryonun devamını yaz: "${senaryo.baslik}". Tagline: ${senaryo.tagline}. Ana fikir: ${senaryo.ana_fikir?.slice(0,200)}` })
      });
      var data = await res.json();
      if (data.senaryo) setSequel(data.senaryo);
    } catch (e) {}
    setSequelYukleniyor(false);
  }

  // ── Kaydet ────────────────────────────────────────
  async function profilKaydet() {
    if (!user || !senaryo) return;
    await supabase.from("senaryolar").insert([{ user_id: user.id, tip, tur, baslik: senaryo.baslik, tagline: senaryo.tagline, ana_fikir: senaryo.ana_fikir, karakter: senaryo.karakter, sahne: senaryo.acilis_sahnesi, soru: senaryo.buyuk_soru, paylasim_acik: paylasimAcik, begeni_sayisi: 0 }]);
    setKaydedildi(true);
  }

  // ── TXT İndir ─────────────────────────────────────
  async function txtIndir() {
    if (!senaryo) return;
    setPdfYukleniyor(true);
    var icerik = `SCRIPTIFY — SENARYO\n${"=".repeat(50)}\n\nBaşlık: ${senaryo.baslik}\nTür: ${tur} | Format: ${tip}\n${senaryo.tagline ? `Tagline: "${senaryo.tagline}"\n` : ""}\n${"─".repeat(40)}\n\n` +
      (senaryo.ana_fikir ? `💡 ANA FİKİR\n${senaryo.ana_fikir}\n\n` : "") +
      (senaryo.karakter ? `👥 KARAKTERLER\n${senaryo.karakter}\n\n` : "") +
      (senaryo.acilis_sahnesi ? `🎭 AÇILIŞ SAHNESİ\n${senaryo.acilis_sahnesi}\n\n` : "") +
      (senaryo.buyuk_soru ? `❓ BÜYÜK SORU\n${senaryo.buyuk_soru}\n\n` : "") +
      (Object.keys(beatler).length > 0 ? `\n${"─".repeat(40)}\n📋 BEAT SHEET (Save the Cat)\n` + BEAT_SHEET.map(b => `\n${b.no}. ${b.label}\n${beatler[b.id] || "-"}`).join("\n") + "\n" : "") +
      `\n${"─".repeat(40)}\nOluşturulma: ${new Date().toLocaleDateString("tr-TR")}\nScriptify — AI Senaryo Platformu\n`;
    var blob = new Blob(["\uFEFF" + icerik], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = (senaryo.baslik || "senaryo").replace(/\s+/g, "_") + ".txt"; a.click(); URL.revokeObjectURL(url);
    setPdfYukleniyor(false);
  }

  // ── Paylaşım kartı ────────────────────────────────
  function KartModal() {
    useEffect(() => {
      var canvas = document.getElementById("paylasim-karti");
      if (!canvas || !senaryo) return;
      var ctx = canvas.getContext("2d");
      var W = 1080, H = 1080;
      canvas.width = W; canvas.height = H;
      var grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, "#080f1c"); grad.addColorStop(0.5, "#0d1a2e"); grad.addColorStop(1, "#080f1c");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      ctx.beginPath(); ctx.arc(W, 0, 400, 0, Math.PI*2); ctx.fillStyle = "rgba(8,145,178,0.08)"; ctx.fill();
      ctx.beginPath(); ctx.arc(0, H, 350, 0, Math.PI*2); ctx.fillStyle = "rgba(232,35,10,0.06)"; ctx.fill();
      var lg = ctx.createLinearGradient(60, 0, W-60, 0);
      lg.addColorStop(0, "#e8230a"); lg.addColorStop(0.5, "#0891b2"); lg.addColorStop(1, "#06b6d4");
      ctx.fillStyle = lg; ctx.fillRect(60, 70, W-120, 5);
      ctx.font = "bold 28px sans-serif"; ctx.fillStyle = "#06b6d4"; ctx.fillText("SCRIPTIFY", 60, 140);
      ctx.fillStyle = "rgba(232,35,10,0.9)"; ctx.beginPath(); ctx.roundRect(270, 110, 60, 30, 15); ctx.fill();
      ctx.font = "bold 13px sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText("AI", 293, 130);
      ctx.fillStyle = "rgba(8,145,178,0.25)"; ctx.beginPath(); ctx.roundRect(60, 170, 140, 36, 18); ctx.fill();
      ctx.fillStyle = "#06b6d4"; ctx.font = "bold 16px sans-serif"; ctx.fillText(tip + " · " + tur, 78, 193);
      if (puan) {
        ctx.fillStyle = AMBER; ctx.font = "bold 20px sans-serif"; ctx.fillText("⭐ " + puan.imdb_tahmin + " · " + puan.toplam + "/100", 60, 240);
      }
      ctx.fillStyle = "#f1f5f9"; ctx.font = "bold 72px sans-serif";
      var words = (senaryo.baslik||"").split(" "); var lines=[]; var line="";
      words.forEach(w => { var t=line+(line?" ":"")+w; if(ctx.measureText(t).width>W-120){lines.push(line);line=w;}else line=t; }); lines.push(line);
      lines.slice(0,3).forEach((l,i) => ctx.fillText(l, 60, (puan?300:320)+i*85));
      if (senaryo.tagline) { ctx.font="italic 32px sans-serif"; ctx.fillStyle="#0891b2"; ctx.fillText('"'+(senaryo.tagline.slice(0,80))+(senaryo.tagline.length>80?"...":"")+'"', 60, 590); }
      if (senaryo.ana_fikir) {
        ctx.font="24px sans-serif"; ctx.fillStyle="rgba(241,245,249,0.65)";
        var af=senaryo.ana_fikir.slice(0,160)+(senaryo.ana_fikir.length>160?"...":"");
        var aw=af.split(" "); var al=""; var ay=670;
        aw.forEach(w => { var t=al+(al?" ":"")+w; if(ctx.measureText(t).width>W-120){ctx.fillText(al,60,ay);ay+=38;al=w;}else al=t; }); ctx.fillText(al,60,ay);
      }
      ctx.fillStyle=lg; ctx.fillRect(60,H-120,W-120,3);
      ctx.font="bold 22px sans-serif"; ctx.fillStyle="rgba(241,245,249,0.4)"; ctx.fillText("scriptify.app",60,H-75);
      if (username) { ctx.font="22px sans-serif"; ctx.fillStyle="rgba(8,145,178,0.8)"; ctx.textAlign="right"; ctx.fillText("@"+username,W-60,H-75); ctx.textAlign="left"; }
    }, []);
    function indir() { var c=document.getElementById("paylasim-karti"); if(!c)return; var a=document.createElement("a"); a.download=(senaryo.baslik||"senaryo").replace(/\s+/g,"_")+"_scriptify.png"; a.href=c.toDataURL("image/png"); a.click(); }
    return (<>
      <div onClick={() => setKartModal(false)} style={{ position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)" }} />
      <div style={{ position:"fixed",inset:0,zIndex:501,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,gap:16 }}>
        <canvas id="paylasim-karti" style={{ maxWidth:"100%",maxHeight:"65vh",borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,0.6)" }} />
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={indir} style={{ padding:"13px 28px",borderRadius:14,background:"linear-gradient(135deg,"+TEAL+","+TEAL_L+")",border:"none",color:"#fff",fontSize:15,fontWeight:700 }}>📥 İndir</button>
          <button onClick={() => { var c=document.getElementById("paylasim-karti"); if(!c)return; c.toBlob(b => { var f=new File([b],"scriptify.png",{type:"image/png"}); if(navigator.share&&navigator.canShare({files:[f]})){navigator.share({files:[f],title:senaryo.baslik,text:"Scriptify'da ürettiğim senaryo 🎬"});}else{alert("Önce indir, sonra paylaş!");} }); }} style={{ padding:"13px 28px",borderRadius:14,background:"linear-gradient(135deg,"+ACCENT+",#c5180a)",border:"none",color:"#fff",fontSize:15,fontWeight:700 }}>📤 Paylaş</button>
          <button onClick={() => setKartModal(false)} style={{ padding:"13px 20px",borderRadius:14,background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontSize:15 }}>✕</button>
        </div>
      </div>
    </>);
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  if (!loaded) return <div style={{ minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center" }}><div style={{ width:36,height:36,borderRadius:"50%",border:"3px solid "+TEAL+"30",borderTopColor:TEAL,animation:"spin 0.8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif",paddingBottom:100 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:none;}}@keyframes spin{to{transform:rotate(360deg);}}textarea::placeholder,input::placeholder{color:${dk?"rgba(241,245,249,0.3)":"rgba(15,23,42,0.3)"}}a{text-decoration:none;color:inherit;}button{font-family:inherit;}`}</style>

      {/* TOPBAR */}
      <div style={{ position:"sticky",top:0,zIndex:50,background:dk?"rgba(8,15,28,0.93)":"rgba(238,242,247,0.93)",backdropFilter:"blur(20px)",borderBottom:"1px solid "+C.border,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <button onClick={() => setDrawer(true)} style={{ display:"flex",alignItems:"center",gap:9,background:"none",border:"none",padding:0,cursor:"pointer" }}>
          <Av url={avatarUrl} size={36} dk={dk} />
          <img src="/logo.png" alt="Scriptify" style={{ height:26,objectFit:"contain",maxWidth:100 }} />
        </button>
        <button onClick={temaToggle} style={{ background:C.input,border:"1px solid "+C.border,borderRadius:10,padding:"7px 10px",color:C.muted,fontSize:13,cursor:"pointer" }}>{dk?"☀️":"🌙"}</button>
      </div>

      <div style={{ maxWidth:680,margin:"0 auto",padding:"20px 16px" }}>

        {/* ── FORM KARTI ──────────────────────────────── */}
        <div style={{ background:C.metalGrad,border:"1px solid "+C.border,borderRadius:24,padding:"24px",marginBottom:20,boxShadow:C.shadow }}>
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20 }}>
            <div style={{ width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,"+ACCENT+",#ff5722)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>🎬</div>
            <div>
              <h1 style={{ fontSize:20,fontWeight:800,color:C.text,letterSpacing:"-0.02em" }}>Senaryo Üret</h1>
              <p style={{ fontSize:12,color:C.muted,marginTop:2 }}>AI Senaryo Stüdyosu · Beat Sheet · Character Bible · Dramaturg</p>
            </div>
          </div>

          <p style={{ fontSize:12,fontWeight:700,color:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10 }}>Format</p>
          <div style={{ display:"flex",gap:10,marginBottom:20 }}>
            {TIPLER.map(t => <button key={t.val} onClick={() => setTip(t.val)} style={{ flex:1,padding:"12px",borderRadius:14,border:"2px solid "+(tip===t.val?TEAL:C.border),background:tip===t.val?TEAL+"15":C.input,color:tip===t.val?TEAL:C.muted,fontSize:14,fontWeight:tip===t.val?800:500,cursor:"pointer",transition:"all 0.15s" }}>{t.icon} {t.val}</button>)}
          </div>

          <p style={{ fontSize:12,fontWeight:700,color:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10 }}>Tür</p>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginBottom:20 }}>
            {TURLER.map(t => <button key={t} onClick={() => setTur(t)} style={{ padding:"7px 14px",borderRadius:20,border:"1.5px solid "+(tur===t?ACCENT:C.border),background:tur===t?ACCENT+"15":C.input,color:tur===t?ACCENT:C.muted,fontSize:13,fontWeight:tur===t?700:500,cursor:"pointer",transition:"all 0.15s" }}>{t}</button>)}
          </div>

          <p style={{ fontSize:12,fontWeight:700,color:C.muted,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10 }}>Özel İstek</p>
          <textarea value={ozelIstek} onChange={e => setOzelIstek(e.target.value)} placeholder="İstanbul'da geçsin, güçlü kadın karakter, karanlık atmosfer..." rows={3} style={{ width:"100%",background:C.input,border:"1px solid "+C.border,borderRadius:14,padding:"12px 16px",color:C.text,fontSize:14,outline:"none",resize:"none",fontFamily:"inherit",lineHeight:1.6,marginBottom:20 }} />

          <button onClick={senaryoUret} disabled={yukleniyor} style={{ width:"100%",padding:"14px",borderRadius:14,background:yukleniyor?C.input:"linear-gradient(135deg,"+ACCENT+",#c5180a)",border:"none",color:yukleniyor?C.muted:"#fff",fontSize:15,fontWeight:800,cursor:yukleniyor?"default":"pointer",transition:"all 0.2s",boxShadow:yukleniyor?"none":"0 4px 20px "+ACCENT+"35" }}>
            {yukleniyor ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10 }}><span style={{ display:"inline-block",width:18,height:18,border:"2px solid "+C.muted,borderTopColor:TEAL,borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />Üretiliyor...</span> : "✨ Senaryo Üret"}
          </button>
        </div>

        {/* ── SONUÇ ───────────────────────────────────── */}
        {senaryo && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>

            {/* Sekme menüsü */}
            <div style={{ display:"flex",gap:6,marginBottom:16,overflowX:"auto",paddingBottom:4 }}>
              {[
                { id:"senaryo",   label:"📝 Senaryo" },
                { id:"beatsheet", label:"📋 Beat Sheet" },
                { id:"karakterler",label:"👥 Karakterler" },
                { id:"dramaturg", label:"🎭 Dramaturg" },
                { id:"puan",      label:"⭐ Puan" },
              ].map(s => (
                <button key={s.id} onClick={() => setSekme(s.id)} style={{ flexShrink:0,padding:"8px 16px",borderRadius:20,border:"1.5px solid "+(sekme===s.id?TEAL:C.border),background:sekme===s.id?TEAL+"15":C.input,color:sekme===s.id?TEAL:C.muted,fontSize:13,fontWeight:sekme===s.id?700:500,cursor:"pointer",whiteSpace:"nowrap" }}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* ── Senaryo sekmesi ── */}
            {sekme === "senaryo" && (
              <div style={{ background:C.metalGrad,border:"1px solid "+C.border,borderRadius:24,padding:"24px",marginBottom:16,boxShadow:C.shadow }}>
                <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
                  <span style={{ fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,background:TEAL+"15",color:TEAL,border:"1px solid "+TEAL+"25" }}>{tip}</span>
                  <span style={{ fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,background:ACCENT+"12",color:ACCENT,border:"1px solid "+ACCENT+"20" }}>{tur}</span>
                </div>
                <h2 style={{ fontSize:24,fontWeight:800,color:C.text,letterSpacing:"-0.03em",marginBottom:6 }}>{senaryo.baslik}</h2>
                {senaryo.tagline && <p style={{ fontSize:14,fontStyle:"italic",color:TEAL,marginBottom:16,lineHeight:1.5 }}>"{senaryo.tagline}"</p>}
                {[
                  { label:"💡 Ana Fikir", val:senaryo.ana_fikir },
                  { label:"👥 Karakterler", val:senaryo.karakter },
                  { label:"🎭 Açılış Sahnesi", val:senaryo.acilis_sahnesi },
                  { label:"❓ Büyük Soru", val:senaryo.buyuk_soru },
                ].map(item => !item.val ? null : (
                  <div key={item.label} style={{ marginBottom:16,paddingBottom:16,borderBottom:"1px solid "+C.border }}>
                    <p style={{ fontSize:12,fontWeight:700,color:C.muted,letterSpacing:"0.05em",textTransform:"uppercase",marginBottom:8 }}>{item.label}</p>
                    <p style={{ fontSize:14,color:C.text,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{item.val}</p>
                  </div>
                ))}

                {/* Sequel */}
                <button onClick={sequelUret} disabled={sequelYukleniyor} style={{ width:"100%",padding:"12px",borderRadius:14,background:sequelYukleniyor?C.input:"linear-gradient(135deg,"+PURPLE+",#9333ea)",border:"none",color:sequelYukleniyor?C.muted:"#fff",fontSize:14,fontWeight:700,cursor:sequelYukleniyor?"default":"pointer",marginBottom:12,boxShadow:sequelYukleniyor?"none":"0 4px 16px rgba(124,58,237,0.3)" }}>
                  {sequelYukleniyor ? <span style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}><span style={{ display:"inline-block",width:16,height:16,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />Devam yazılıyor...</span> : "🔮 Devam Ettir (Sequel)"}
                </button>

                {sequel && (
                  <div style={{ background:PURPLE+"08",border:"1px solid "+PURPLE+"25",borderRadius:18,padding:18,marginBottom:12 }}>
                    <p style={{ fontSize:12,fontWeight:700,color:PURPLE,marginBottom:8 }}>🔮 SEQUEL</p>
                    <p style={{ fontSize:16,fontWeight:800,color:C.text,marginBottom:4 }}>{sequel.baslik}</p>
                    {sequel.tagline && <p style={{ fontSize:13,fontStyle:"italic",color:TEAL,marginBottom:10 }}>"{sequel.tagline}"</p>}
                    {sequel.ana_fikir && <p style={{ fontSize:13,color:C.text,lineHeight:1.6 }}>{sequel.ana_fikir}</p>}
                  </div>
                )}

                {/* Alt butonlar */}
                <div style={{ display:"flex",gap:8,marginBottom:10 }}>
                  <button onClick={txtIndir} disabled={pdfYukleniyor} style={{ flex:1,padding:"11px 8px",borderRadius:12,background:C.input,border:"1px solid "+C.border,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer" }}>📄 İndir</button>
                  <button onClick={() => setKartModal(true)} style={{ flex:1,padding:"11px 8px",borderRadius:12,background:C.input,border:"1px solid "+C.border,color:C.text,fontSize:13,fontWeight:600,cursor:"pointer" }}>📤 Paylaş</button>
                  {!kaydedildi
                    ? <button onClick={profilKaydet} style={{ flex:2,padding:"11px 8px",borderRadius:12,background:"linear-gradient(135deg,"+TEAL+","+TEAL_L+")",border:"none",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>{user?"💾 Kaydet":"🔐 Giriş Yap"}</button>
                    : <div style={{ flex:2,padding:"11px 8px",borderRadius:12,background:GREEN+"15",border:"1px solid "+GREEN+"30",display:"flex",alignItems:"center",justifyContent:"center" }}><span style={{ fontSize:13,color:GREEN,fontWeight:700 }}>✅ Kaydedildi</span></div>
                  }
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",background:C.input,borderRadius:12,border:"1px solid "+C.border }}>
                  <div><p style={{ fontSize:13,fontWeight:600,color:C.text }}>Topluluğa Paylaş</p><p style={{ fontSize:11,color:C.muted,marginTop:1 }}>Herkes görebilsin</p></div>
                  <div onClick={() => setPaylasimAcik(!paylasimAcik)} style={{ width:44,height:24,borderRadius:12,background:paylasimAcik?TEAL:C.border,position:"relative",transition:"background 0.2s",cursor:"pointer",flexShrink:0 }}>
                    <div style={{ position:"absolute",top:3,left:paylasimAcik?23:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s",boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Beat Sheet sekmesi ── */}
            {sekme === "beatsheet" && (
              <div style={{ background:C.metalGrad,border:"1px solid "+C.border,borderRadius:24,padding:"24px",marginBottom:16,boxShadow:C.shadow }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
                  <div>
                    <h3 style={{ fontSize:18,fontWeight:800,color:C.text }}>📋 Beat Sheet</h3>
                    <p style={{ fontSize:12,color:C.muted,marginTop:2 }}>Save the Cat — 15 Adım</p>
                  </div>
                  <button onClick={beatUret} disabled={beatYukleniyor} style={{ padding:"9px 18px",borderRadius:12,background:beatYukleniyor?C.input:"linear-gradient(135deg,"+TEAL+","+TEAL_L+")",border:"none",color:beatYukleniyor?C.muted:"#fff",fontSize:13,fontWeight:700,cursor:beatYukleniyor?"default":"pointer" }}>
                    {beatYukleniyor ? <span style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />Oluşturuluyor</span> : "✨ Oluştur"}
                  </button>
                </div>

                {/* 3 Perde görsel */}
                <div style={{ display:"flex",gap:6,marginBottom:20 }}>
                  {[{label:"1. PERDE",color:TEAL,acts:[1]},{label:"2. PERDE",color:PURPLE,acts:[2]},{label:"3. PERDE",color:ACCENT,acts:[3]}].map(p => (
                    <div key={p.label} style={{ flex:1,padding:"8px 10px",borderRadius:10,background:p.color+"15",border:"1px solid "+p.color+"30",textAlign:"center" }}>
                      <p style={{ fontSize:10,fontWeight:800,color:p.color,letterSpacing:"0.08em" }}>{p.label}</p>
                      <p style={{ fontSize:9,color:C.muted,marginTop:2 }}>{BEAT_SHEET.filter(b=>b.act===p.acts[0]).length} beat</p>
                    </div>
                  ))}
                </div>

                {Object.keys(beatler).length === 0 && !beatYukleniyor && (
                  <div style={{ textAlign:"center",padding:"40px 0",color:C.muted }}>
                    <p style={{ fontSize:32,marginBottom:12 }}>📋</p>
                    <p style={{ fontSize:14 }}>Senaryo için Beat Sheet oluştur</p>
                    <p style={{ fontSize:12,marginTop:4,opacity:0.7 }}>Save the Cat yöntemiyle 15 adım</p>
                  </div>
                )}

                {BEAT_SHEET.map((beat, i) => {
                  var actColors = { 1: TEAL, 2: PURPLE, 3: ACCENT };
                  var col = actColors[beat.act];
                  return (
                    <div key={beat.id} style={{ marginBottom:12,padding:"14px 16px",background:C.input,borderRadius:14,border:"1px solid "+C.border,borderLeft:"3px solid "+col }}>
                      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:beatler[beat.id]?8:0 }}>
                        <span style={{ width:22,height:22,borderRadius:"50%",background:col+"20",color:col,fontSize:10,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{beat.no}</span>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:13,fontWeight:700,color:C.text }}>{beat.label}</p>
                          <p style={{ fontSize:11,color:C.muted }}>{beat.aciklama}</p>
                        </div>
                        {beatler[beat.id] && <span style={{ fontSize:10,padding:"2px 8px",borderRadius:20,background:col+"15",color:col,fontWeight:700 }}>✓</span>}
                      </div>
                      {beatler[beat.id] && <p style={{ fontSize:13,color:C.text,lineHeight:1.65,paddingLeft:30 }}>{beatler[beat.id]}</p>}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Karakterler sekmesi ── */}
            {sekme === "karakterler" && (
              <div style={{ background:C.metalGrad,border:"1px solid "+C.border,borderRadius:24,padding:"24px",marginBottom:16,boxShadow:C.shadow }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
                  <div>
                    <h3 style={{ fontSize:18,fontWeight:800,color:C.text }}>👥 Character Bible</h3>
                    <p style={{ fontSize:12,color:C.muted,marginTop:2 }}>Karakter profilleri & psikoloji</p>
                  </div>
                  <button onClick={karakterBibleUret} disabled={bibleYukleniyor} style={{ padding:"9px 18px",borderRadius:12,background:bibleYukleniyor?C.input:"linear-gradient(135deg,"+PURPLE+",#9333ea)",border:"none",color:bibleYukleniyor?C.muted:"#fff",fontSize:13,fontWeight:700,cursor:bibleYukleniyor?"default":"pointer" }}>
                    {bibleYukleniyor ? <span style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />Oluşturuluyor</span> : "✨ Oluştur"}
                  </button>
                </div>

                {!karakterBible && !bibleYukleniyor && (
                  <div style={{ textAlign:"center",padding:"40px 0",color:C.muted }}>
                    <p style={{ fontSize:32,marginBottom:12 }}>👥</p>
                    <p style={{ fontSize:14 }}>Karakter profilleri oluştur</p>
                    <p style={{ fontSize:12,marginTop:4,opacity:0.7 }}>Hedef, korku, sır, karakter yayı ve daha fazlası</p>
                  </div>
                )}

                {karakterBible?.karakterler?.map((k, i) => (
                  <div key={i} style={{ marginBottom:16,padding:"18px",background:PURPLE+"06",border:"1px solid "+PURPLE+"20",borderRadius:18 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:14 }}>
                      <div style={{ width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,"+PURPLE+",#9333ea)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18,fontWeight:800,flexShrink:0 }}>
                        {(k.ad||"?")[0]}
                      </div>
                      <div>
                        <p style={{ fontSize:16,fontWeight:800,color:C.text }}>{k.ad}</p>
                        <p style={{ fontSize:12,color:C.muted }}>{k.yas} · {k.meslek}</p>
                      </div>
                    </div>
                    {[
                      { icon:"🎯", label:"Hedef", val:k.hedef },
                      { icon:"😨", label:"Korku", val:k.korku },
                      { icon:"🤫", label:"Sır", val:k.sir },
                      { icon:"💪", label:"Güç", val:k.guc },
                      { icon:"⚠️", label:"Zayıflık", val:k.zayiflik },
                      { icon:"🌱", label:"Karakter Yayı", val:k.arc },
                      { icon:"💬", label:"Diyalog Tonu", val:k.diyalog_tonu },
                    ].map(item => !item.val ? null : (
                      <div key={item.label} style={{ display:"flex",gap:10,marginBottom:8,padding:"8px 10px",background:C.input,borderRadius:10 }}>
                        <span style={{ fontSize:14,flexShrink:0 }}>{item.icon}</span>
                        <div>
                          <p style={{ fontSize:10,fontWeight:700,color:PURPLE,textTransform:"uppercase",letterSpacing:"0.06em" }}>{item.label}</p>
                          <p style={{ fontSize:13,color:C.text,lineHeight:1.5,marginTop:1 }}>{item.val}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* ── AI Dramaturg sekmesi ── */}
            {sekme === "dramaturg" && (
              <div style={{ background:C.metalGrad,border:"1px solid "+C.border,borderRadius:24,padding:"24px",marginBottom:16,boxShadow:C.shadow }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
                  <div>
                    <h3 style={{ fontSize:18,fontWeight:800,color:C.text }}>🎭 AI Dramaturg</h3>
                    <p style={{ fontSize:12,color:C.muted,marginTop:2 }}>Türk TV sektörüne özel analiz</p>
                  </div>
                  <button onClick={dramaturgCalistir} disabled={dramaturgYukleniyor} style={{ padding:"9px 18px",borderRadius:12,background:dramaturgYukleniyor?C.input:"linear-gradient(135deg,"+AMBER+",#d97706)",border:"none",color:dramaturgYukleniyor?C.muted:"#fff",fontSize:13,fontWeight:700,cursor:dramaturgYukleniyor?"default":"pointer" }}>
                    {dramaturgYukleniyor ? <span style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />Analiz ediliyor</span> : "✨ Analiz Et"}
                  </button>
                </div>

                {!dramaturgAnaliz && !dramaturgYukleniyor && (
                  <div style={{ textAlign:"center",padding:"40px 0",color:C.muted }}>
                    <p style={{ fontSize:32,marginBottom:12 }}>🎭</p>
                    <p style={{ fontSize:14 }}>Dramaturg analizi başlat</p>
                    <p style={{ fontSize:12,marginTop:4,opacity:0.7 }}>Gerilim, karakter motivasyonu, Türk izleyici uyumu</p>
                  </div>
                )}

                {dramaturgAnaliz && (
                  <div>
                    {/* Genel puan */}
                    <div style={{ textAlign:"center",marginBottom:24,padding:"20px",background:AMBER+"10",borderRadius:18,border:"1px solid "+AMBER+"25" }}>
                      <p style={{ fontSize:48,fontWeight:800,color:AMBER }}>{dramaturgAnaliz.genel_puan}</p>
                      <p style={{ fontSize:13,color:C.muted }}>Genel Dramaturg Puanı</p>
                    </div>

                    {dramaturgAnaliz.turk_dizi_uyumu && (
                      <div style={{ marginBottom:14,padding:"14px 16px",background:TEAL+"08",border:"1px solid "+TEAL+"20",borderRadius:14 }}>
                        <p style={{ fontSize:11,fontWeight:700,color:TEAL,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6 }}>🇹🇷 Türk Dizisi Uyumu</p>
                        <p style={{ fontSize:13,color:C.text,lineHeight:1.6 }}>{dramaturgAnaliz.turk_dizi_uyumu}</p>
                      </div>
                    )}

                    {dramaturgAnaliz.gerilim_analizi && (
                      <div style={{ marginBottom:14,padding:"14px 16px",background:C.input,borderRadius:14,border:"1px solid "+C.border }}>
                        <p style={{ fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6 }}>⚡ Gerilim Analizi</p>
                        <p style={{ fontSize:13,color:C.text,lineHeight:1.6 }}>{dramaturgAnaliz.gerilim_analizi}</p>
                      </div>
                    )}

                    {dramaturgAnaliz.karakter_motivasyon && (
                      <div style={{ marginBottom:14,padding:"14px 16px",background:C.input,borderRadius:14,border:"1px solid "+C.border }}>
                        <p style={{ fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6 }}>🎯 Karakter Motivasyonu</p>
                        <p style={{ fontSize:13,color:C.text,lineHeight:1.6 }}>{dramaturgAnaliz.karakter_motivasyon}</p>
                      </div>
                    )}

                    {dramaturgAnaliz.guc_noktalari?.length > 0 && (
                      <div style={{ marginBottom:14,padding:"14px 16px",background:GREEN+"08",border:"1px solid "+GREEN+"20",borderRadius:14 }}>
                        <p style={{ fontSize:11,fontWeight:700,color:GREEN,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>✅ Güçlü Noktalar</p>
                        {dramaturgAnaliz.guc_noktalari.map((g,i) => <p key={i} style={{ fontSize:13,color:C.text,lineHeight:1.5,marginBottom:4 }}>• {g}</p>)}
                      </div>
                    )}

                    {dramaturgAnaliz.zayif_noktalar?.length > 0 && (
                      <div style={{ marginBottom:14,padding:"14px 16px",background:ACCENT+"08",border:"1px solid "+ACCENT+"20",borderRadius:14 }}>
                        <p style={{ fontSize:11,fontWeight:700,color:ACCENT,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>⚠️ Zayıf Noktalar</p>
                        {dramaturgAnaliz.zayif_noktalar.map((z,i) => <p key={i} style={{ fontSize:13,color:C.text,lineHeight:1.5,marginBottom:4 }}>• {z}</p>)}
                      </div>
                    )}

                    {[dramaturgAnaliz.oneri_1, dramaturgAnaliz.oneri_2, dramaturgAnaliz.oneri_3].filter(Boolean).length > 0 && (
                      <div style={{ padding:"14px 16px",background:PURPLE+"08",border:"1px solid "+PURPLE+"20",borderRadius:14 }}>
                        <p style={{ fontSize:11,fontWeight:700,color:PURPLE,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>💡 Öneriler</p>
                        {[dramaturgAnaliz.oneri_1, dramaturgAnaliz.oneri_2, dramaturgAnaliz.oneri_3].filter(Boolean).map((o,i) => (
                          <p key={i} style={{ fontSize:13,color:C.text,lineHeight:1.5,marginBottom:6 }}>{i+1}. {o}</p>
                        ))}
                      </div>
                    )}

                    {dramaturgAnaliz.sonuc && (
                      <div style={{ marginTop:14,padding:"14px 16px",background:C.input,borderRadius:14,border:"1px solid "+C.border }}>
                        <p style={{ fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6 }}>📝 Genel Değerlendirme</p>
                        <p style={{ fontSize:13,color:C.text,lineHeight:1.7,fontStyle:"italic" }}>{dramaturgAnaliz.sonuc}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Puan sekmesi ── */}
            {sekme === "puan" && (
              <div style={{ background:C.metalGrad,border:"1px solid "+C.border,borderRadius:24,padding:"24px",marginBottom:16,boxShadow:C.shadow }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
                  <div>
                    <h3 style={{ fontSize:18,fontWeight:800,color:C.text }}>⭐ AI Puan</h3>
                    <p style={{ fontSize:12,color:C.muted,marginTop:2 }}>Yapımcı gözüyle değerlendir</p>
                  </div>
                  <button onClick={puanHesapla} disabled={puanYukleniyor} style={{ padding:"9px 18px",borderRadius:12,background:puanYukleniyor?C.input:"linear-gradient(135deg,"+AMBER+",#d97706)",border:"none",color:puanYukleniyor?C.muted:"#fff",fontSize:13,fontWeight:700,cursor:puanYukleniyor?"default":"pointer" }}>
                    {puanYukleniyor ? <span style={{ display:"flex",alignItems:"center",gap:6 }}><span style={{ display:"inline-block",width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />Hesaplanıyor</span> : "⭐ Değerlendir"}
                  </button>
                </div>

                {!puan && !puanYukleniyor && (
                  <div style={{ textAlign:"center",padding:"40px 0",color:C.muted }}>
                    <p style={{ fontSize:32,marginBottom:12 }}>⭐</p>
                    <p style={{ fontSize:14 }}>Senaryonu puanla</p>
                    <p style={{ fontSize:12,marginTop:4,opacity:0.7 }}>IMDb tahmini, ticari potansiyel, Netflix uyumu</p>
                  </div>
                )}

                {puan && (
                  <div>
                    {/* Ana puan */}
                    <div style={{ textAlign:"center",marginBottom:20,padding:"24px",background:"linear-gradient(135deg,"+AMBER+"15,"+ACCENT+"08)",borderRadius:20,border:"1px solid "+AMBER+"30" }}>
                      <p style={{ fontSize:64,fontWeight:800,color:AMBER,lineHeight:1 }}>{puan.toplam}</p>
                      <p style={{ fontSize:14,color:C.muted,marginTop:4 }}>/ 100 Toplam Puan</p>
                      <div style={{ display:"flex",justifyContent:"center",gap:16,marginTop:16 }}>
                        <div style={{ textAlign:"center" }}>
                          <p style={{ fontSize:22,fontWeight:800,color:C.text }}>{puan.imdb_tahmin}</p>
                          <p style={{ fontSize:10,color:C.muted }}>IMDb Tahmini</p>
                        </div>
                        <div style={{ width:1,background:C.border }} />
                        <div style={{ textAlign:"center" }}>
                          <p style={{ fontSize:22,fontWeight:800,color:puan.netflix_uygun_mu?GREEN:ACCENT }}>{puan.netflix_uygun_mu?"✓ Uygun":"✗ Uygun Değil"}</p>
                          <p style={{ fontSize:10,color:C.muted }}>Netflix</p>
                        </div>
                      </div>
                    </div>

                    {/* 4 kategori */}
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16 }}>
                      {[
                        { label:"Orijinallik", val:puan.orijinallik, max:25, color:PURPLE },
                        { label:"Ticari Potansiyel", val:puan.ticari_potansiyel, max:25, color:TEAL },
                        { label:"Karakter Derinliği", val:puan.karakter_derinligi, max:25, color:GREEN },
                        { label:"Anlatım", val:puan.anlatim, max:25, color:AMBER },
                      ].map(k => (
                        <div key={k.label} style={{ padding:"14px",background:C.input,borderRadius:14,border:"1px solid "+C.border }}>
                          <p style={{ fontSize:11,color:C.muted,marginBottom:6 }}>{k.label}</p>
                          <p style={{ fontSize:22,fontWeight:800,color:k.color }}>{k.val}<span style={{ fontSize:12,fontWeight:400,color:C.muted }}>/{k.max}</span></p>
                          <div style={{ height:4,background:C.border,borderRadius:2,marginTop:8,overflow:"hidden" }}>
                            <div style={{ height:"100%",width:(k.val/k.max*100)+"%",background:k.color,borderRadius:2,transition:"width 0.8s ease" }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {puan.hedef_kitle && (
                      <div style={{ marginBottom:10,padding:"12px 14px",background:C.input,borderRadius:12,border:"1px solid "+C.border }}>
                        <p style={{ fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>🎯 Hedef Kitle</p>
                        <p style={{ fontSize:13,color:C.text }}>{puan.hedef_kitle}</p>
                      </div>
                    )}

                    {puan.benzer_yapimlar?.length > 0 && (
                      <div style={{ marginBottom:10,padding:"12px 14px",background:C.input,borderRadius:12,border:"1px solid "+C.border }}>
                        <p style={{ fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>🎬 Benzer Yapımlar</p>
                        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                          {puan.benzer_yapimlar.map((y,i) => <span key={i} style={{ fontSize:12,padding:"4px 12px",borderRadius:20,background:TEAL+"15",color:TEAL,fontWeight:600 }}>{y}</span>)}
                        </div>
                      </div>
                    )}

                    {puan.yapimci_yorumu && (
                      <div style={{ padding:"14px 16px",background:"linear-gradient(135deg,"+AMBER+"08,"+ACCENT+"05)",border:"1px solid "+AMBER+"20",borderRadius:14 }}>
                        <p style={{ fontSize:11,fontWeight:700,color:AMBER,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>💼 Yapımcı Yorumu</p>
                        <p style={{ fontSize:13,color:C.text,lineHeight:1.7,fontStyle:"italic" }}>"{puan.yapimci_yorumu}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ALT NAV */}
      <div style={{ position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:dk?"rgba(8,15,28,0.97)":"rgba(255,255,255,0.97)",backdropFilter:"blur(28px)",borderTop:"1px solid "+C.border,padding:"8px 0 env(safe-area-inset-bottom,8px)",display:"flex",justifyContent:"space-around",alignItems:"center" }}>
        {[
          { href:"/",         svg: a => <svg width="24" height="24" fill="none" stroke={a?TEAL:C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { href:"/kesfet",   svg: a => <svg width="24" height="24" fill="none" stroke={a?TEAL:C.muted} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
          { href:"/topluluk", svg: a => <svg width="24" height="24" fill="none" stroke={a?TEAL:C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
          { href:"/mesajlar", svg: a => <svg width="24" height="24" fill="none" stroke={a?TEAL:C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
          { href:"/profil",   svg: a => <svg width="24" height="24" fill="none" stroke={a?TEAL:C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ].map(item => {
          var active = item.href === "/uret";
          return (
            <a key={item.href} href={item.href} style={{ display:"flex",flexDirection:"column",alignItems:"center",padding:"6px 14px",borderRadius:14,position:"relative",opacity:active?1:0.6 }}>
              {item.svg(active)}
              {active && <div style={{ position:"absolute",bottom:2,width:18,height:3,borderRadius:2,background:TEAL }} />}
            </a>
          );
        })}
      </div>

      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={() => setDrawer(false)} onTema={temaToggle} />}
      {kartModal && <KartModal />}
    </div>
  );
}
