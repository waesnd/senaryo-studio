import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var TEAL = "#0891b2";
var TEAL_L = "#06b6d4";

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

function Av({ url, size, fs, online }) {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: fs || 14 }}>
        {url ? <img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
      </div>
      {online && <div style={{ position: "absolute", bottom: 1, right: 1, width: size / 4, height: size / 4, borderRadius: "50%", background: "#10b981", border: "2px solid white" }} />}
    </div>
  );
}

function Drawer({ dk, C, user, username, avatarUrl, aktifSayfa, onClose, onTema }) {
  return (
    <div>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201, width: 300, background: dk ? "#0d1627" : "#fff", boxShadow: "4px 0 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>
        <div style={{ height: 4, background: "linear-gradient(90deg," + ACCENT + "," + TEAL + "," + TEAL_L + ")" }} />
        <div style={{ padding: "20px", borderBottom: "1px solid " + C.border }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <a href="/profil" onClick={onClose}><Av url={avatarUrl} size={54} fs={22} /></a>
            <button onClick={onClose} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 13, cursor: "pointer" }}>✕</button>
          </div>
          {user
            ? <a href="/profil" onClick={onClose} style={{ textDecoration: "none" }}>
                <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{username}</p>
                <p style={{ fontSize: 12, color: C.muted }}>{user.email}</p>
              </a>
            : <button onClick={() => window.location.href = "/"} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>}
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {DRAWER_MENU.map(item => {
            var isActive = item.href === aktifSayfa;
            return (
              <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: isActive ? TEAL : C.text, background: isActive ? TEAL + "12" : "transparent", fontWeight: isActive ? 700 : 500, fontSize: 15, marginBottom: 4, textDecoration: "none" }}>
                <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
              </a>
            );
          })}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + C.border }}>
            <a href="/profil" onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, marginBottom: 4, textDecoration: "none" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>👤</span><span>Profil & Ayarlar</span>
            </a>
            <button onClick={onTema} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{dk ? "☀️" : "🌙"}</span><span>{dk ? "Açık Tema" : "Koyu Tema"}</span>
            </button>
            {user && <button onClick={() => { if(confirm("Çıkış yapılsın mı?")) supabase.auth.signOut().then(() => window.location.href = "/"); }} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: ACCENT, fontSize: 15, background: ACCENT + "10", border: "none", width: "100%", textAlign: "left", cursor: "pointer", marginTop: 4 }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>🚪</span><span>Çıkış Yap</span>
            </button>}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default function Mesajlar() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [konusmalar, setKonusmalar] = useState([]);
  var [aktif, setAktif] = useState(null);
  var [mesajlar, setMesajlar] = useState([]);
  var [yeniMesaj, setYeniMesaj] = useState("");
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);
  var [yeniSohbet, setYeniSohbet] = useState(false);
  var [aramaKullanici, setAramaKullanici] = useState("");
  var [kullaniciSonuc, setKullaniciSonuc] = useState([]);
  var [yazıyor, setYaziyor] = useState(false);
  var [yaziyorTimer, setYaziyorTimer] = useState(null);
  var [gorselYukleniyor, setGorselYukleniyor] = useState(false);
  var [sesKayd, setSesKayd] = useState(false);
  var [mediaRec, setMediaRec] = useState(null);
  var [notAcik, setNotAcik] = useState(false);
  var [notMetin, setNotMetin] = useState("");
  var [notKaydedildi, setNotKaydedildi] = useState(false);
  var mesajSonuRef = useRef(null);
  var dosyaRef = useRef(null);
  var yaziyorKanalRef = useRef(null);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil?.avatar_url || null;
  var username = profil?.username || user?.email?.split("@")[0] || "";

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

  useEffect(() => {
    if (mesajSonuRef.current) mesajSonuRef.current.scrollIntoView({ behavior: "smooth" });
  }, [mesajlar]);

  useEffect(() => {
    if (!aktif || !user) return;
    var kanal = supabase.channel("mesajlar_" + aktif.id)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mesajlar", filter: "konusma_id=eq." + aktif.id }, (payload) => {
        if (payload.new.gonderen_id !== user.id) {
          setMesajlar(p => [...p, payload.new]);
          supabase.from("mesajlar").update({ okundu: true }).eq("id", payload.new.id);
        }
      }).subscribe();
    return () => supabase.removeChannel(kanal);
  }, [aktif, user]);

  function yukle(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(({ data }) => { if (data) setProfil(data); });
    supabase.from("mesajlar")
      .select("*, gonderen:profiles!gonderen_id(id,username,avatar_url), alici:profiles!alici_id(id,username,avatar_url)")
      .or("gonderen_id.eq." + u.id + ",alici_id.eq." + u.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        var grup = {};
        data.forEach(m => {
          var digerId = m.gonderen_id === u.id ? m.alici_id : m.gonderen_id;
          var diger = m.gonderen_id === u.id ? m.alici : m.gonderen;
          if (!grup[digerId]) grup[digerId] = { id: digerId, diger, mesajlar: [], okunmayan: 0 };
          grup[digerId].mesajlar.push(m);
          if (!m.okundu && m.alici_id === u.id) grup[digerId].okunmayan++;
        });
        setKonusmalar(Object.values(grup));
      });
  }

  async function sohbetAc(k) {
    setAktif(k);
    setYeniSohbet(false);
    // Notu yükle
    try {
      var kayitliNot = localStorage.getItem("sf_not_" + k.id);
      setNotMetin(kayitliNot || "");
    } catch (e) { setNotMetin(""); }
    setNotAcik(false);
    var { data } = await supabase.from("mesajlar")
      .select("*")
      .or("gonderen_id.eq." + user.id + ",alici_id.eq." + user.id)
      .or("gonderen_id.eq." + k.id + ",alici_id.eq." + k.id)
      .order("created_at", { ascending: true });
    if (data) setMesajlar(data.filter(m =>
      (m.gonderen_id === user.id && m.alici_id === k.id) ||
      (m.gonderen_id === k.id && m.alici_id === user.id)
    ));
    await supabase.from("mesajlar").update({ okundu: true }).eq("alici_id", user.id).eq("gonderen_id", k.id);
    setKonusmalar(p => p.map(kn => kn.id === k.id ? { ...kn, okunmayan: 0 } : kn));
  }

  async function mesajGonder(medyaUrl, medyaTip, sesUrl) {
    if (!user || !aktif) return;
    if (!yeniMesaj.trim() && !medyaUrl && !sesUrl) return;
    var yeni = { gonderen_id: user.id, alici_id: aktif.id, metin: yeniMesaj.trim() || null, medya_url: medyaUrl || null, medya_tip: medyaTip || null, ses_url: sesUrl || null, okundu: false };
    var { data } = await supabase.from("mesajlar").insert([yeni]).select().single();
    if (data) setMesajlar(p => [...p, data]);
    setYeniMesaj("");
    // Konuşmalar listesini güncelle
    setKonusmalar(p => {
      var var_ = p.find(k => k.id === aktif.id);
      if (var_) return [{ ...var_, mesajlar: [...var_.mesajlar, data] }, ...p.filter(k => k.id !== aktif.id)];
      return p;
    });
  }

  async function gorselGonder(e) {
    var file = e.target.files[0]; if (!file) return;
    setGorselYukleniyor(true);
    try {
      var fd = new FormData(); fd.append("file", file); fd.append("upload_preset", "scriptify_posts");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var data = await res.json();
      if (data.secure_url) await mesajGonder(data.secure_url, "gorsel", null);
    } catch (e) {}
    setGorselYukleniyor(false);
  }

  async function sesBaslat() {
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      var rec = new MediaRecorder(stream);
      var chunks = [];
      rec.ondataavailable = e => chunks.push(e.data);
      rec.onstop = async () => {
        var blob = new Blob(chunks, { type: "audio/webm" });
        var fd = new FormData(); fd.append("file", blob, "ses.webm"); fd.append("upload_preset", "scriptify_posts");
        var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/video/upload", { method: "POST", body: fd });
        var data = await res.json();
        if (data.secure_url) await mesajGonder(null, null, data.secure_url);
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      setMediaRec(rec);
      setSesKayd(true);
    } catch (e) { alert("Mikrofon izni gerekli"); }
  }

  function sesDur() {
    if (mediaRec) { mediaRec.stop(); setMediaRec(null); setSesKayd(false); }
  }

  async function kullaniciAra(q) {
    setAramaKullanici(q);
    if (!q.trim()) { setKullaniciSonuc([]); return; }
    var { data } = await supabase.from("profiles").select("id,username,avatar_url").ilike("username", "%" + q + "%").neq("id", user.id).limit(8);
    if (data) setKullaniciSonuc(data);
  }

  function yaziyor() {
    clearTimeout(yaziyorTimer);
    setYaziyorTimer(setTimeout(() => setYaziyor(false), 2000));
  }

  function temaToggle() {
    var t = dk ? "light" : "dark"; setTema(t);
    try { localStorage.setItem("sf_tema", t); } catch (e) {}
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60) return "az önce";
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g";
  }

  if (!loaded) return null;

  if (!user) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🔐</p>
        <p style={{ fontSize: 16, color: C.text, marginBottom: 16 }}>Mesajları görmek için giriş yap</p>
        <a href="/" style={{ padding: "11px 28px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", color: "#fff", fontWeight: 700, fontSize: 14 }}>Giriş Yap</a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", display: "flex", flexDirection: "column" }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}@keyframes spin{to{transform:rotate(360deg);}}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}input::placeholder,textarea::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}a{text-decoration:none;color:inherit;}button{font-family:inherit;}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.95)" : "rgba(238,242,247,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        {aktif ? (
          <>
            <button onClick={() => { setAktif(null); setMesajlar([]); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer" }}>←</button>
            <Av url={aktif.diger?.avatar_url} size={36} fs={14} online={true} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>@{aktif.diger?.username}</p>
              <p style={{ fontSize: 11, color: "#10b981", fontWeight: 600 }}>çevrimiçi</p>
            </div>
            <button onClick={() => setNotAcik(p => !p)} style={{ width: 36, height: 36, borderRadius: "50%", background: notMetin ? "rgba(251,191,36,0.18)" : C.input, border: "1px solid " + (notMetin ? "rgba(251,191,36,0.5)" : C.border), color: notMetin ? "#fbbf24" : C.muted, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              📌
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setDrawer(true)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
              <Av url={avatarUrl} size={36} fs={14} />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Mesajlar</p>
              {konusmalar.reduce((a, k) => a + k.okunmayan, 0) > 0 && <p style={{ fontSize: 11, color: ACCENT, fontWeight: 600 }}>{konusmalar.reduce((a, k) => a + k.okunmayan, 0)} okunmamış</p>}
            </div>
            <button onClick={() => setYeniSohbet(true)} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
          </>
        )}
      </div>

      {/* YENİ SOHBET MODAL */}
      {yeniSohbet && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", background: dk ? "#0f1829" : "#fff", borderRadius: "24px 24px 0 0", padding: "20px 20px env(safe-area-inset-bottom,20px)", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 17, fontWeight: 800, color: C.text }}>Yeni Mesaj</p>
              <button onClick={() => { setYeniSohbet(false); setAramaKullanici(""); setKullaniciSonuc([]); }} style={{ background: C.input, border: "none", borderRadius: 10, padding: "6px 12px", color: C.muted, cursor: "pointer" }}>✕</button>
            </div>
            <input value={aramaKullanici} onChange={e => kullaniciAra(e.target.value)} placeholder="🔍 Kullanıcı ara..." autoFocus style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 14, padding: "11px 16px", color: C.text, fontSize: 14, outline: "none", marginBottom: 14, fontFamily: "inherit" }} />
            <div style={{ overflowY: "auto", flex: 1 }}>
              {kullaniciSonuc.length === 0 && aramaKullanici && <p style={{ textAlign: "center", color: C.muted, padding: "20px", fontSize: 13 }}>Kullanıcı bulunamadı</p>}
              {kullaniciSonuc.map(u => (
                <button key={u.id} onClick={() => { sohbetAc({ id: u.id, diger: u }); setYeniSohbet(false); setAramaKullanici(""); setKullaniciSonuc([]); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px", borderRadius: 14, background: "none", border: "none", cursor: "pointer", textAlign: "left", marginBottom: 4 }}>
                  <Av url={u.avatar_url} size={44} fs={18} />
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KONUŞMALAR LİSTESİ */}
      {!aktif && (
        <div style={{ flex: 1, maxWidth: 680, width: "100%", margin: "0 auto", paddingBottom: 80 }}>
          {konusmalar.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <p style={{ fontSize: 48, marginBottom: 14 }}>💬</p>
              <p style={{ fontSize: 15, color: C.muted, marginBottom: 20 }}>Henüz mesaj yok.</p>
              <button onClick={() => setYeniSohbet(true)} style={{ padding: "11px 28px", borderRadius: 14, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>✏️ Yeni Mesaj Başlat</button>
            </div>
          ) : konusmalar.map((k, i) => {
            var sonMesaj = k.mesajlar[k.mesajlar.length - 1];
            return (
              <button key={k.id} onClick={() => sohbetAc(k)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 13, padding: "14px 20px", borderBottom: "1px solid " + C.border, background: k.okunmayan > 0 ? (dk ? "rgba(8,145,178,0.06)" : "rgba(8,145,178,0.04)") : "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                <Av url={k.diger?.avatar_url} size={50} fs={20} online={i < 2} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <p style={{ fontSize: 15, fontWeight: k.okunmayan > 0 ? 800 : 600, color: C.text }}>@{k.diger?.username}</p>
                    <p style={{ fontSize: 11, color: C.muted }}>{sonMesaj ? zaman(sonMesaj.created_at) : ""}</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <p style={{ fontSize: 13, color: k.okunmayan > 0 ? C.text : C.muted, fontWeight: k.okunmayan > 0 ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "80%" }}>
                      {sonMesaj?.ses_url ? "🎤 Sesli mesaj" : sonMesaj?.medya_url ? "🖼️ Görsel" : sonMesaj?.metin || ""}
                    </p>
                    {k.okunmayan > 0 && <span style={{ width: 20, height: 20, borderRadius: "50%", background: TEAL, color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{k.okunmayan}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* SOHBET EKRANI */}
      {aktif && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: 680, width: "100%", margin: "0 auto" }}>

          {/* SABİT NOT ALANI */}
          {notAcik && (
            <div style={{ background: dk ? "rgba(251,191,36,0.08)" : "rgba(251,191,36,0.10)", borderBottom: "1px solid rgba(251,191,36,0.25)", padding: "10px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.5px" }}>📌 Özel Notun — sadece sen görürsün</p>
                <button onClick={() => setNotAcik(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer" }}>✕</button>
              </div>
              <textarea
                value={notMetin}
                onChange={e => setNotMetin(e.target.value)}
                placeholder={"Bu sohbet hakkında not al... Hatırlatıcılar, önemli bilgiler, yapılacaklar."}
                rows={3}
                autoFocus
                style={{ width: "100%", background: "transparent", border: "none", color: C.text, fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.6, marginBottom: 6 }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button onClick={() => {
                  try { localStorage.removeItem("sf_not_" + aktif.id); } catch(e) {}
                  setNotMetin(""); setNotKaydedildi(false);
                }} style={{ padding: "5px 12px", borderRadius: 10, background: "none", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24", fontSize: 11, cursor: "pointer" }}>Temizle</button>
                <button onClick={() => {
                  try { localStorage.setItem("sf_not_" + aktif.id, notMetin); } catch(e) {}
                  setNotKaydedildi(true);
                  setTimeout(() => setNotKaydedildi(false), 1500);
                  setNotAcik(false);
                }} style={{ padding: "5px 14px", borderRadius: 10, background: "rgba(251,191,36,0.85)", border: "none", color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                  {notKaydedildi ? "✓ Kaydedildi" : "Kaydet"}
                </button>
              </div>
            </div>
          )}

          {/* Not özeti - kapalıyken küçük göster */}
          {!notAcik && notMetin && (
            <div onClick={() => setNotAcik(true)} style={{ background: dk ? "rgba(251,191,36,0.06)" : "rgba(251,191,36,0.08)", borderBottom: "1px solid rgba(251,191,36,0.2)", padding: "7px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12 }}>📌</span>
              <p style={{ fontSize: 12, color: "#fbbf24", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{notMetin}</p>
              <span style={{ fontSize: 10, color: C.muted }}>düzenle</span>
            </div>
          )}

          <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 100px" }}>
            {mesajlar.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: C.muted, fontSize: 13 }}>Konuşmayı sen başlat 👋</div>}
            {mesajlar.map((m, i) => {
              var benim = m.gonderen_id === user.id;
              var oncekiBenim = i > 0 && mesajlar[i-1].gonderen_id === m.gonderen_id;
              return (
                <div key={m.id || i} style={{ display: "flex", flexDirection: benim ? "row-reverse" : "row", gap: 8, marginBottom: oncekiBenim ? 4 : 12, animation: "fadeUp 0.2s ease" }}>
                  {!benim && !oncekiBenim && <Av url={aktif.diger?.avatar_url} size={28} fs={11} />}
                  {!benim && oncekiBenim && <div style={{ width: 28 }} />}
                  <div style={{ maxWidth: "72%" }}>
                    {m.ses_url ? (
                      <div style={{ background: benim ? "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")" : C.surface, border: "1px solid " + C.border, borderRadius: benim ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px" }}>
                        <audio controls src={m.ses_url} style={{ height: 32, maxWidth: 200 }} />
                      </div>
                    ) : m.medya_url ? (
                      <img src={m.medya_url} style={{ maxWidth: 220, borderRadius: 14, display: "block" }} alt="" />
                    ) : (
                      <div style={{ background: benim ? "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")" : C.surface, border: benim ? "none" : "1px solid " + C.border, borderRadius: benim ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px" }}>
                        <p style={{ fontSize: 14, color: benim ? "#fff" : C.text, lineHeight: 1.5 }}>{m.metin}</p>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: benim ? "flex-end" : "flex-start", gap: 4, marginTop: 3 }}>
                      <p style={{ fontSize: 10, color: C.muted }}>{zaman(m.created_at)}</p>
                      {benim && <p style={{ fontSize: 10, color: m.okundu ? TEAL : C.muted }}>{m.okundu ? "✓✓" : "✓"}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
            {yazıyor && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <Av url={aktif.diger?.avatar_url} size={28} fs={11} />
                <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: "18px 18px 18px 4px", padding: "10px 14px" }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, animation: "pulse 1.2s " + (i*0.2) + "s infinite" }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={mesajSonuRef} />
          </div>

          {/* MESAJ YAZMA ALANI */}
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 12px env(safe-area-inset-bottom,10px)" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", maxWidth: 680, margin: "0 auto" }}>
              <button onClick={() => dosyaRef.current?.click()} style={{ width: 40, height: 40, borderRadius: "50%", background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {gorselYukleniyor ? <div style={{ width: 16, height: 16, border: "2px solid " + C.border, borderTopColor: TEAL, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : "🖼️"}
              </button>
              <input ref={dosyaRef} type="file" accept="image/*" onChange={gorselGonder} style={{ display: "none" }} />
              <input value={yeniMesaj} onChange={e => { setYeniMesaj(e.target.value); yaziyor(); }} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); mesajGonder(); } }} placeholder="Mesaj yaz..." style={{ flex: 1, background: C.surface, border: "1px solid " + C.border, borderRadius: 22, padding: "10px 16px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              {yeniMesaj.trim() ? (
                <button onClick={() => mesajGonder()} style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>➤</button>
              ) : (
                <button onClick={sesKayd ? sesDur : sesBaslat} style={{ width: 40, height: 40, borderRadius: "50%", background: sesKayd ? "linear-gradient(135deg," + ACCENT + ",#c5180a)" : C.input, border: "1px solid " + (sesKayd ? ACCENT : C.border), color: sesKayd ? "#fff" : C.muted, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: sesKayd ? "pulse 1s infinite" : "none" }}>
                  {sesKayd ? "⏹" : "🎤"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ALT NAV - sadece liste görünümünde */}
      {!aktif && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90, background: dk ? "rgba(8,15,28,0.96)" : "rgba(255,255,255,0.96)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 0 env(safe-area-inset-bottom,10px)", display: "flex", justifyContent: "space-around" }}>
          {[{ icon: "🏠", href: "/" }, { icon: "🔭", href: "/kesfet" }, { icon: "🎭", href: "/topluluk" }, { icon: "💬", href: "/mesajlar" }].map(item => (
            <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", padding: "6px 24px", borderRadius: 14, background: item.href === "/mesajlar" ? (dk ? "rgba(8,145,178,0.14)" : "rgba(8,145,178,0.09)") : "transparent" }}>
              <span style={{ fontSize: 26, filter: item.href === "/mesajlar" ? "none" : "grayscale(50%) opacity(0.45)" }}>{item.icon}</span>
            </a>
          ))}
        </div>
      )}

      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} aktifSayfa="/mesajlar" onClose={() => setDrawer(false)} onTema={temaToggle} />}
    </div>
  );
}
