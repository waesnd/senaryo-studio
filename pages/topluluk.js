import { useState, useEffect } from "react";
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

var TURLER = ["Tümü","Gerilim","Drama","Bilim Kurgu","Komedi","Romantik","Korku","Aksiyon","Fantastik","Suç","Tarihi"];

var ROZET_BILGI = {
  ilk_senaryo: { icon: "🎬", label: "İlk Senaryo", renk: TEAL },
  trend: { icon: "🔥", label: "Trend Oldu", renk: "#f59e0b" },
  on_begeni: { icon: "❤️", label: "10 Beğeni", renk: ACCENT },
  elli_begeni: { icon: "💎", label: "50 Beğeni", renk: "#7c3aed" },
  challenge_king: { icon: "🏆", label: "Challenge King", renk: "#10b981" },
};

function getC(dk) {
  return {
    bg: dk ? "#080f1c" : "#f4f6fb",
    surface: dk ? "#0f1829" : "#ffffff",
    border: dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text: dk ? "#f1f5f9" : "#0f172a",
    muted: dk ? "rgba(241,245,249,0.45)" : "rgba(15,23,42,0.42)",
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
            <div onClick={() => { onClose(); window.location.href = "/profil"; }} style={{ cursor: "pointer" }}><Av url={avatarUrl} size={54} fs={22} /></div>
            <button onClick={onClose} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 13, cursor: "pointer" }}>✕</button>
          </div>
          {user ? <div><p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 2 }}>@{username}</p><p style={{ fontSize: 12, color: C.muted }}>{user.email}</p></div>
            : <button onClick={() => { onClose(); window.location.href = "/"; }} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>}
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {DRAWER_MENU.map(item => {
            var isActive = item.href === "/topluluk";
            return (
              <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: isActive ? TEAL : C.text, background: isActive ? TEAL + "12" : "transparent", fontWeight: isActive ? 700 : 500, fontSize: 15, marginBottom: 4, textDecoration: "none", border: "1px solid " + (isActive ? TEAL + "25" : "transparent") }}>
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

// Yorum modalı
function YorumModal({ dk, C, senaryo, yorumlar, yorumYeni, setYorumYeni, onYolla, yukleniyor, onClose, user }) {
  var listRef = null;
  return (
    <div>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301, background: dk ? "#0f1829" : "#fff", borderRadius: "24px 24px 0 0", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", margin: "12px auto 0" }} />
        <div style={{ padding: "12px 20px 10px", borderBottom: "1px solid " + C.border }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.text }}>💬 Yorumlar</p>
          <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{senaryo.baslik}</p>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
          {(!yorumlar || yorumlar.length === 0) ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>💬</p>
              <p style={{ fontSize: 13, color: C.muted }}>İlk yorumu sen yap!</p>
            </div>
          ) : yorumlar.map((y, i) => (
            <div key={y.id || i} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                {y.profiles?.avatar_url ? <img src={y.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
              </div>
              <div style={{ flex: 1, background: dk ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 14, padding: "8px 12px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEAL, marginBottom: 3 }}>@{y.profiles?.username || "anonim"}</p>
                <p style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{y.metin}</p>
              </div>
            </div>
          ))}
        </div>
        {user ? (
          <div style={{ padding: "10px 16px env(safe-area-inset-bottom,16px)", borderTop: "1px solid " + C.border, display: "flex", gap: 8 }}>
            <input value={yorumYeni} onChange={e => setYorumYeni(e.target.value)} onKeyDown={e => e.key === "Enter" && onYolla()} placeholder="Yorumunu yaz..." style={{ flex: 1, background: dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: "1px solid " + C.border, borderRadius: 20, padding: "10px 16px", color: C.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            <button onClick={onYolla} disabled={yukleniyor || !yorumYeni.trim()} style={{ padding: "10px 16px", borderRadius: 20, background: yorumYeni.trim() ? "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")" : C.input, border: "none", color: yorumYeni.trim() ? "#fff" : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              {yukleniyor ? "..." : "Gönder"}
            </button>
          </div>
        ) : (
          <div style={{ padding: "12px 20px env(safe-area-inset-bottom,16px)", textAlign: "center" }}>
            <a href="/" style={{ fontSize: 13, color: TEAL, fontWeight: 700 }}>Yorum yazmak için giriş yap →</a>
          </div>
        )}
      </div>
    </div>
  );
}

// Paylaş kart modalı
function PaylasModal({ dk, C, senaryo, onClose }) {
  var [kopyalandi, setKopyalandi] = useState(false);
  var url = typeof window !== "undefined" ? window.location.origin + "/senaryo/" + senaryo.id : "";

  function kopyala() {
    try { navigator.clipboard.writeText(url); setKopyalandi(true); setTimeout(() => setKopyalandi(false), 2000); } catch (e) {}
  }

  function paylasWhatsapp() { window.open("https://wa.me/?text=" + encodeURIComponent("🎬 " + senaryo.baslik + " — Scriptify'da bak: " + url)); }
  function paylasTwitter() { window.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent("🎬 " + senaryo.baslik + " — " + (senaryo.tagline || "") + " #Scriptify") + "&url=" + encodeURIComponent(url)); }

  return (
    <div>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301, background: dk ? "#0f1829" : "#fff", borderRadius: "24px 24px 0 0", padding: "8px 20px env(safe-area-inset-bottom,24px)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", margin: "12px auto 20px" }} />

        {/* Senaryo kartı önizleme */}
        <div style={{ background: "linear-gradient(135deg," + ACCENT + "15," + TEAL + "10)", border: "1px solid " + TEAL + "25", borderRadius: 18, padding: "16px 18px", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: TEAL + "20", color: TEAL }}>{senaryo.tip}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: ACCENT + "15", color: ACCENT }}>{senaryo.tur}</span>
          </div>
          <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 4 }}>🎬 {senaryo.baslik}</p>
          {senaryo.tagline && <p style={{ fontSize: 13, fontStyle: "italic", color: TEAL }}>"{senaryo.tagline}"</p>}
          <p style={{ fontSize: 11, color: C.muted, marginTop: 8, fontWeight: 600 }}>scriptify.app · AI Senaryo Platformu</p>
        </div>

        {/* Paylaş butonları */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <button onClick={paylasWhatsapp} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 14, background: "#25d366", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>💬</span> WhatsApp
          </button>
          <button onClick={paylasTwitter} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 14, background: "#1da1f2", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>🐦</span> Twitter
          </button>
        </div>
        <button onClick={kopyala} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 14, background: kopyalandi ? "#10b981" : C.input, border: "1px solid " + (kopyalandi ? "#10b981" : C.border), color: kopyalandi ? "#fff" : C.text, fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 10, transition: "all 0.2s" }}>
          {kopyalandi ? "✅ Kopyalandı!" : "🔗 Linki Kopyala"}
        </button>
        <button onClick={onClose} style={{ width: "100%", padding: "12px", borderRadius: 14, background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer" }}>İptal</button>
      </div>
    </div>
  );
}

export default function Topluluk() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [senaryolar, setSenaryolar] = useState([]);
  var [tur, setTur] = useState("Tümü");
  var [siralama, setSiralama] = useState("yeni");
  var [sekme, setSekme] = useState("hepsi"); // hepsi | takip
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);
  var [begeniler, setBegeniler] = useState([]);
  var [takipler, setTakipler] = useState([]);
  var [paylasModal, setPaylasModal] = useState(null);
  var [challengeYapildi, setChallengeYapildi] = useState([]);
  var [yorumModal, setYorumModal] = useState(null); // senaryo objesi
  var [yorumlar, setYorumlar] = useState({}); // { senaryo_id: [...] }
  var [yorumYeni, setYorumYeni] = useState("");
  var [yorumGonder, setYorumGonder] = useState(false);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil?.avatar_url || null;
  var username = profil?.username || user?.email?.split("@")[0] || "";

  useEffect(() => {
    setTema(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    var _mq = window.matchMedia("(prefers-color-scheme: dark)");
    function _onMq(e) { setTema(e.matches ? "dark" : "light"); }
    _mq.addEventListener("change", _onMq);
    supabase.auth.getSession().then(({ data }) => {
      setLoaded(true);
      if (data?.session) { setUser(data.session.user); loadProfil(data.session.user); loadTakipler(data.session.user); }
      loadSenaryolar("yeni", "Tümü");
    });
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) { setUser(session.user); loadProfil(session.user); loadTakipler(session.user); }
      else { setUser(null); setProfil(null); setTakipler([]); }
    });
  }, []);

  function loadProfil(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(({ data }) => { if (data) setProfil(data); });
  }

  function loadTakipler(u) {
    supabase.from("takipler").select("takip_edilen").eq("takip_eden", u.id)
      .then(({ data }) => { if (data) setTakipler(data.map(t => t.takip_edilen)); });
  }

  function loadSenaryolar(s, t) {
    var q = supabase.from("senaryolar").select("*, profiles(id, username, avatar_url)").eq("paylasim_acik", true);
    if (t !== "Tümü") q = q.eq("tur", t);
    q = q.order(s === "yeni" ? "created_at" : "begeni_sayisi", { ascending: false }).limit(40);
    q.then(({ data }) => { if (data) setSenaryolar(data); });
  }

  function temaToggle() {
    setTema(function(prev) { return prev === "dark" ? "light" : "dark"; });
  }

  async function begeni(id, sayi) {
    if (!user) { window.location.href = "/"; return; }
    if (begeniler.includes(id)) return;
    setBegeniler(p => [...p, id]);
    await supabase.from("senaryolar").update({ begeni_sayisi: (sayi || 0) + 1 }).eq("id", id);
    setSenaryolar(p => p.map(s => s.id === id ? { ...s, begeni_sayisi: (sayi || 0) + 1 } : s));
    // Bildirim gönder
    var sn2 = senaryolar.find(function(s) { return s.id === id; });
    if (sn2 && sn2.profiles?.id && sn2.profiles.id !== user.id) {
      supabase.from("bildirimler").insert([{ alici_id: sn2.profiles.id, gonderen_id: user.id, tip: "begeni", senaryo_id: id }]);
    }
    // Rozet kontrolü
    var yeniBegeni = (sayi || 0) + 1;
    var sn = senaryolar.find(s => s.id === id);
    if (sn && yeniBegeni === 10) {
      await supabase.from("rozetler").insert([{ user_id: sn.profiles?.id, tip: "on_begeni" }]).onConflict().ignore();
    }
    if (sn && yeniBegeni === 50) {
      await supabase.from("rozetler").insert([{ user_id: sn.profiles?.id, tip: "elli_begeni" }]).onConflict().ignore();
    }
  }

  async function takipToggle(hedefId) {
    if (!user) { window.location.href = "/"; return; }
    if (takipler.includes(hedefId)) {
      await supabase.from("takipler").delete().eq("takip_eden", user.id).eq("takip_edilen", hedefId);
      setTakipler(p => p.filter(t => t !== hedefId));
    } else {
      await supabase.from("takipler").insert([{ takip_eden: user.id, takip_edilen: hedefId }]);
      setTakipler(p => [...p, hedefId]);
      // Bildirim gönder
      if (hedefId !== user.id) { supabase.from("bildirimler").insert([{ alici_id: hedefId, gonderen_id: user.id, tip: "takip" }]); }
    }
  }

  async function yorumlariYukle(senaryoId) {
    var { data } = await supabase.from("yorumlar")
      .select("*, profiles(username, avatar_url)")
      .eq("senaryo_id", senaryoId)
      .order("created_at", { ascending: true });
    if (data) setYorumlar(p => ({ ...p, [senaryoId]: data }));
  }

  async function yorumYolla(senaryo) {
    if (!user || !yorumYeni.trim()) return;
    setYorumGonder(true);
    var { data: yeni } = await supabase.from("yorumlar")
      .insert([{ user_id: user.id, senaryo_id: senaryo.id, metin: yorumYeni.trim() }])
      .select("*, profiles(username, avatar_url)").single();
    if (yeni) {
      setYorumlar(p => ({ ...p, [senaryo.id]: [...(p[senaryo.id] || []), yeni] }));
      setYorumYeni("");
      // Bildirim gönder
      if (senaryo.profiles?.id && senaryo.profiles.id !== user.id) {
        await supabase.from("bildirimler").insert([{
          alici_id: senaryo.profiles.id, gonderen_id: user.id,
          tip: "yorum", icerik: yorumYeni.trim().slice(0, 80), senaryo_id: senaryo.id
        }]);
      }
    }
    setYorumGonder(false);
  }

  async function challengeYap(senaryo) {
    if (!user) { window.location.href = "/"; return; }
    if (challengeYapildi.includes(senaryo.id)) return;
    setChallengeYapildi(p => [...p, senaryo.id]);
    await supabase.from("challengelar").insert([{ kaynak_senaryo_id: senaryo.id, kullanici_id: user.id }]);
    await supabase.from("senaryolar").update({ challenge_sayisi: (senaryo.challenge_sayisi || 0) + 1 }).eq("id", senaryo.id);
    setSenaryolar(p => p.map(s => s.id === senaryo.id ? { ...s, challenge_sayisi: (s.challenge_sayisi || 0) + 1 } : s));
    // Uret sayfasına yönlendir — konuyu taşı
    var params = new URLSearchParams({ challenge: senaryo.baslik, tur: senaryo.tur, tip: senaryo.tip });
    window.location.href = "/uret?" + params.toString();
  }

  async function goruntulemeArt(id, sayi) {
    await supabase.from("senaryolar").update({ goruntuleme_sayisi: (sayi || 0) + 1 }).eq("id", id);
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g";
  }

  var gosterilen = sekme === "takip"
    ? senaryolar.filter(s => s.profiles && takipler.includes(s.profiles.id))
    : senaryolar;

  if (!loaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 90 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}@keyframes popIn{from{opacity:0;transform:scale(0.9);}to{opacity:1;transform:scale(1);}}a{text-decoration:none;color:inherit;}button{font-family:inherit;}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.93)" : "rgba(238,242,247,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setDrawer(true)} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "2px solid " + TEAL + "40" }}>
            {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1 }}>Scriptify</p>
            <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 1 }}>Topluluk</p>
          </div>
        </button>
        <a href="/uret" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", boxShadow: "0 3px 12px " + ACCENT + "35" }}>
          <span style={{ fontSize: 14 }}>🎬</span><span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Üret</span>
        </a>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 0 16px" }}>

        {/* Sekme: Hepsi / Takip */}
        <div style={{ display: "flex", borderBottom: "1px solid " + C.border, background: C.surface }}>
          {[{ id: "hepsi", label: "🌍 Herkese Açık" }, { id: "takip", label: "👥 Takip Ettiklerim" }].map(s => (
            <button key={s.id} onClick={() => setSekme(s.id)} style={{ flex: 1, padding: "13px 8px", background: "none", border: "none", borderBottom: sekme === s.id ? "2px solid " + TEAL : "2px solid transparent", color: sekme === s.id ? TEAL : C.muted, fontSize: 13, fontWeight: sekme === s.id ? 700 : 500, cursor: "pointer", marginBottom: "-1px" }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ padding: "14px 16px 0" }}>
          {/* Sıralama */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[{ id: "yeni", label: "🕐 En Yeni" }, { id: "trend", label: "🔥 Trend" }].map(s => (
              <button key={s.id} onClick={() => { setSiralama(s.id); loadSenaryolar(s.id, tur); }} style={{ flex: 1, padding: "9px", borderRadius: 12, border: "1.5px solid " + (siralama === s.id ? TEAL : C.border), background: siralama === s.id ? TEAL + "15" : C.input, color: siralama === s.id ? TEAL : C.muted, fontSize: 13, fontWeight: siralama === s.id ? 700 : 500, cursor: "pointer" }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Tür filtresi */}
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
            {TURLER.map(t => (
              <button key={t} onClick={() => { setTur(t); loadSenaryolar(siralama, t); }} style={{ flexShrink: 0, padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (tur === t ? ACCENT : C.border), background: tur === t ? ACCENT + "15" : C.input, color: tur === t ? ACCENT : C.muted, fontSize: 12, fontWeight: tur === t ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap" }}>
                {t}
              </button>
            ))}
          </div>

          {/* Senaryolar */}
          {gosterilen.length === 0 ? (
            <div style={{ textAlign: "center", padding: "70px 0" }}>
              <p style={{ fontSize: 48, marginBottom: 14 }}>{sekme === "takip" ? "👥" : "🎭"}</p>
              <p style={{ fontSize: 15, color: C.muted, marginBottom: 18 }}>
                {sekme === "takip" ? "Takip ettiğin kullanıcıların senaryosu yok." : "Henüz paylaşılan senaryo yok."}
              </p>
              <a href="/uret" style={{ display: "inline-block", padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", color: "#fff", fontSize: 14, fontWeight: 700 }}>Senaryo Üret →</a>
            </div>
          ) : gosterilen.map((s, i) => {
            var av = s.profiles?.avatar_url || null;
            var begendi = begeniler.includes(s.id);
            var takipEdiliyor = s.profiles && takipler.includes(s.profiles.id);
            var challengeYapildiMi = challengeYapildi.includes(s.id);
            var benimMi = user && s.profiles?.id === user.id;

            return (
              <div key={s.id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 20, padding: "18px 20px", marginBottom: 14, boxShadow: C.shadow, animation: "fadeUp 0.3s " + Math.min(i * 0.04, 0.2) + "s both ease" }}
                onMouseEnter={() => goruntulemeArt(s.id, s.goruntuleme_sayisi)}>

                {/* Yazar + takip */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <Av url={av} size={38} fs={15} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>@{s.profiles?.username || "anonim"}</p>
                    <p style={{ fontSize: 11, color: C.muted }}>{zaman(s.created_at)}</p>
                  </div>
                  {!benimMi && (
                    <button onClick={() => takipToggle(s.profiles?.id)} style={{ padding: "6px 14px", borderRadius: 20, border: "1.5px solid " + (takipEdiliyor ? C.border : TEAL), background: takipEdiliyor ? C.input : TEAL + "15", color: takipEdiliyor ? C.muted : TEAL, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                      {takipEdiliyor ? "Takipte ✓" : "+ Takip"}
                    </button>
                  )}
                </div>

                {/* Başlık + türler */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: TEAL + "15", color: TEAL }}>{s.tip}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: ACCENT + "12", color: ACCENT }}>{s.tur}</span>
                  {s.challenge_sayisi > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, background: "#f59e0b15", color: "#f59e0b" }}>🎯 {s.challenge_sayisi} challenge</span>}
                </div>

                <a href={"/senaryo/" + s.id}><h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.02em", cursor: "pointer" }}>{s.baslik} <span style={{ fontSize: 12, color: TEAL }}>→</span></h3></a>
                {s.tagline && <p style={{ fontSize: 13, fontStyle: "italic", color: TEAL, marginBottom: 10 }}>"{s.tagline}"</p>}
                {s.ana_fikir && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 14 }}>{s.ana_fikir.slice(0, 160)}{s.ana_fikir.length > 160 ? "..." : ""}</p>}

                {/* İstatistikler */}
                <div style={{ display: "flex", gap: 14, paddingBottom: 12, borderBottom: "1px solid " + C.border, marginBottom: 12 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>👁 {s.goruntuleme_sayisi || 0}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>♥ {s.begeni_sayisi || 0}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>🔗 {s.paylasim_sayisi || 0}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>🎯 {s.challenge_sayisi || 0}</span>
                </div>

                {/* Aksiyon butonları */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
                  <button onClick={() => begeni(s.id, s.begeni_sayisi)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", borderRadius: 12, border: "1.5px solid " + (begendi ? ACCENT + "40" : C.border), background: begendi ? ACCENT + "10" : C.input, color: begendi ? ACCENT : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                    {begendi ? "❤️" : "♡"} {s.begeni_sayisi || 0}
                  </button>

                  <button onClick={() => challengeYap(s)} disabled={challengeYapildiMi} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", borderRadius: 12, border: "1.5px solid " + (challengeYapildiMi ? "#f59e0b40" : C.border), background: challengeYapildiMi ? "#f59e0b10" : C.input, color: challengeYapildiMi ? "#f59e0b" : C.muted, fontSize: 12, fontWeight: 700, cursor: challengeYapildiMi ? "default" : "pointer", transition: "all 0.15s" }}>
                    🎯 {challengeYapildiMi ? "Katıldın!" : "Challenge"}
                  </button>

                  <button onClick={() => { setPaylasModal(s); supabase.from("senaryolar").update({ paylasim_sayisi: (s.paylasim_sayisi || 0) + 1 }).eq("id", s.id); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", borderRadius: 12, border: "1.5px solid " + C.border, background: C.input, color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    🔗 Paylaş
                  </button>
                  <button onClick={() => { setYorumModal(s); yorumlariYukle(s.id); }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", borderRadius: 12, border: "1.5px solid " + C.border, background: C.input, color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    💬 Yorum
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
          var active = item.href === "/topluluk";
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 14px", borderRadius: 14, position: "relative", opacity: active ? 1 : 0.6 }}>
              {item.svg(active)}
              {active && <div style={{ position: "absolute", bottom: 2, width: 18, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>

      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={() => setDrawer(false)} onTema={temaToggle} />}
      {yorumModal && <YorumModal dk={dk} C={C} senaryo={yorumModal} yorumlar={yorumlar[yorumModal.id]} yorumYeni={yorumYeni} setYorumYeni={setYorumYeni} onYolla={() => yorumYolla(yorumModal)} yukleniyor={yorumGonder} onClose={() => { setYorumModal(null); setYorumYeni(""); }} user={user} />}
      {paylasModal && <PaylasModal dk={dk} C={C} senaryo={paylasModal} onClose={() => setPaylasModal(null)} />}
    </div>
  );
}
