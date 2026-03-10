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
            : <button onClick={() => { onClose(); }} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Giriş Yap</button>}
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {DRAWER_MENU.map(item => (
            <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: item.href === "/" ? TEAL : C.text, background: item.href === "/" ? TEAL + "12" : "transparent", fontWeight: item.href === "/" ? 700 : 500, fontSize: 15, marginBottom: 4, textDecoration: "none" }}>
              <span style={{ fontSize: 22, width: 28, textAlign: "center" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
            </a>
          ))}
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

function GonderiModal({ dk, C, user, avatarUrl, onClose, onPaylas }) {
  var [metin, setMetin] = useState("");
  var [fotograf, setFotograf] = useState(null);
  var [fotografOnizleme, setFotografOnizleme] = useState(null);
  var [yukleniyor, setYukleniyor] = useState(false);
  var dosyaRef = useRef(null);

  async function paylas() {
    if (!metin.trim() && !fotograf) return;
    setYukleniyor(true);
    var fUrl = null;
    if (fotograf) {
      try {
        var fd = new FormData(); fd.append("file", fotograf); fd.append("upload_preset", "scriptify_posts");
        var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
        var data = await res.json();
        fUrl = data.secure_url;
      } catch (e) {}
    }
    // Hashtag parse
    var hashtagMatches = metin.match(/#[\w\u0080-\uFFFF]+/g) || [];
    await onPaylas(metin, fUrl, hashtagMatches);
    setYukleniyor(false);
    onClose();
  }

  return (
    <div>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301, background: dk ? "#0f1829" : "#fff", borderRadius: "24px 24px 0 0", padding: "8px 20px env(safe-area-inset-bottom,20px)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: dk ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", margin: "12px auto 16px" }} />
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <Av url={avatarUrl} size={40} fs={16} />
          <textarea value={metin} onChange={e => setMetin(e.target.value)} placeholder={"Ne düşünüyorsun? #hashtag veya @mention kullanabilirsin"} rows={4} style={{ flex: 1, background: "transparent", border: "none", color: dk ? "#f1f5f9" : "#0f172a", fontSize: 15, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.6 }} />
        </div>
        {fotografOnizleme && (
          <div style={{ position: "relative", marginBottom: 12 }}>
            <img src={fotografOnizleme} style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 14 }} alt="" />
            <button onClick={() => { setFotograf(null); setFotografOnizleme(null); }} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", fontSize: 14, cursor: "pointer" }}>✕</button>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid " + (dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)") }}>
          <button onClick={() => dosyaRef.current?.click()} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}>🖼️</button>
          <input ref={dosyaRef} type="file" accept="image/*" onChange={e => { var f = e.target.files[0]; if (f) { setFotograf(f); setFotografOnizleme(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
          <button onClick={paylas} disabled={yukleniyor || (!metin.trim() && !fotograf)} style={{ padding: "9px 24px", borderRadius: 20, background: (metin.trim() || fotograf) ? "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")" : (dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"), border: "none", color: (metin.trim() || fotograf) ? "#fff" : (dk ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"), fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {yukleniyor ? "Paylaşılıyor..." : "Paylaş"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StoryBar({ dk, C, user, avatarUrl }) {
  var [storyler, setStoryler] = useState([]);
  var [aktifStory, setAktifStory] = useState(null);
  var [storyIndex, setStoryIndex] = useState(0);
  var dosyaRef = useRef(null);

  useEffect(() => {
    supabase.from("storyler").select("*, profiles(username, avatar_url)")
      .gt("bitis_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setStoryler(data); });
  }, []);

  async function storyEkle(e) {
    var file = e.target.files[0]; if (!file || !user) return;
    try {
      var fd = new FormData(); fd.append("file", file); fd.append("upload_preset", "scriptify_posts");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var data = await res.json();
      if (data.secure_url) {
        var bitis = new Date(Date.now() + 24*60*60*1000).toISOString();
        await supabase.from("storyler").insert([{ user_id: user.id, medya_url: data.secure_url, bitis_at: bitis }]);
        window.location.reload();
      }
    } catch (e) {}
  }

  var gruplu = {};
  storyler.forEach(s => {
    var uid = s.user_id;
    if (!gruplu[uid]) gruplu[uid] = { profil: s.profiles, storyler: [] };
    gruplu[uid].storyler.push(s);
  });
  var gruplar = Object.values(gruplu);

  return (
    <div style={{ borderBottom: "1px solid " + C.border }}>
      <div style={{ display: "flex", gap: 14, padding: "14px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
        {/* Kendi story ekle */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0, cursor: "pointer" }} onClick={() => dosyaRef.current?.click()}>
          <div style={{ width: 62, height: 62, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "20," + TEAL_L + "10)", border: "2px dashed " + TEAL + "60", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <span style={{ fontSize: 24 }}>👤</span>}
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%", background: TEAL, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white", fontSize: 12, color: "#fff" }}>+</div>
          </div>
          <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, maxWidth: 62, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Hikayem</p>
        </div>
        <input ref={dosyaRef} type="file" accept="image/*" onChange={storyEkle} style={{ display: "none" }} />

        {/* Diğer storyler */}
        {gruplar.map((g, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0, cursor: "pointer" }} onClick={() => { setAktifStory(g); setStoryIndex(0); }}>
            <div style={{ width: 62, height: 62, borderRadius: "50%", padding: 2, background: "linear-gradient(135deg," + ACCENT + "," + TEAL + ")", flexShrink: 0 }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", border: "2px solid " + C.bg }}>
                {g.profil?.avatar_url ? <img src={g.profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>👤</div>}
              </div>
            </div>
            <p style={{ fontSize: 10, color: C.text, fontWeight: 600, maxWidth: 62, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{g.profil?.username}</p>
          </div>
        ))}
      </div>

      {/* Story Görüntüleyici */}
      {aktifStory && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "#000", display: "flex", flexDirection: "column" }}>
          {/* Progress bar */}
          <div style={{ display: "flex", gap: 4, padding: "12px 12px 0" }}>
            {aktifStory.storyler.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= storyIndex ? "#fff" : "rgba(255,255,255,0.3)" }} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.6)" }}>
              {aktifStory.profil?.avatar_url ? <img src={aktifStory.profil.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : <div style={{ width: "100%", height: "100%", background: TEAL, display: "flex", alignItems: "center", justifyContent: "center" }}>👤</div>}
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>@{aktifStory.profil?.username}</p>
            <button onClick={() => setAktifStory(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ flex: 1, position: "relative" }} onClick={() => {
            if (storyIndex < aktifStory.storyler.length - 1) setStoryIndex(p => p + 1);
            else setAktifStory(null);
          }}>
            {aktifStory.storyler[storyIndex]?.medya_url && <img src={aktifStory.storyler[storyIndex].medya_url} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="" />}
            {aktifStory.storyler[storyIndex]?.metin && <p style={{ position: "absolute", bottom: 40, left: 20, right: 20, textAlign: "center", fontSize: 18, fontWeight: 700, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>{aktifStory.storyler[storyIndex].metin}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  var [user, setUser] = useState(null);
  var [profil, setProfil] = useState(null);
  var [gonderiler, setGonderiler] = useState([]);
  var [feedSekme, setFeedSekme] = useState("son");
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);
  var [gonderiModal, setGonderiModal] = useState(false);
  var [authModal, setAuthModal] = useState(false);
  var [trendler, setTrendler] = useState([]);
  var [bildirimSayisi, setBildirimSayisi] = useState(0);
  var [begeniler, setBegeniler] = useState([]);
  var [kaydedilenler, setKaydedilenler] = useState([]);
  var [yorumId, setYorumId] = useState(null);
  var [yorumMetin, setYorumMetin] = useState("");
  var [yorumlar, setYorumlar] = useState({});
  var [duzenleId, setDuzenleId] = useState(null);
  var [duzenleMetin, setDuzenleMetin] = useState("");
  var [raporModal, setRaporModal] = useState(null);
  var [menuId, setMenuId] = useState(null);

  var dk = tema === "dark";
  var C = getC(dk);
  var avatarUrl = profil?.avatar_url || null;
  var username = profil?.username || user?.email?.split("@")[0] || "";

  useEffect(() => {
    try { setTema(localStorage.getItem("sf_tema") || "light"); } catch (e) {}
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) { setUser(data.session.user); yukle(data.session.user); }
      setLoaded(true);
      loadFeed("son");
    });
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) { setUser(session.user); yukle(session.user); }
      else { setUser(null); setProfil(null); }
    });
  }, []);

  function yukle(u) {
    supabase.from("profiles").select("*").eq("id", u.id).single().then(({ data }) => { if (data) setProfil(data); });
    supabase.from("bildirimler").select("*", { count: "exact" }).eq("alici_id", u.id).eq("okundu", false).then(({ count }) => setBildirimSayisi(count || 0));
    supabase.from("kaydedilenler").select("gonderi_id").eq("user_id", u.id).then(({ data }) => { if (data) setKaydedilenler(data.map(k => k.gonderi_id)); });
  }

  function loadFeed(s) {
    setFeedSekme(s);
    var q = supabase.from("gonderiler").select("*, profiles(id,username,avatar_url)");
    q = q.order(s === "son" ? "created_at" : "begeni_sayisi", { ascending: false }).limit(30);
    q.then(({ data }) => {
      if (data) setGonderiler(data);
      supabase.from("senaryolar").select("baslik,tur,begeni_sayisi").eq("paylasim_acik", true).order("begeni_sayisi", { ascending: false }).limit(5).then(r => { if (r.data) setTrendler(r.data); });
    });
  }

  function temaToggle() {
    var t = dk ? "light" : "dark"; setTema(t);
    try { localStorage.setItem("sf_tema", t); } catch (e) {}
  }

  async function gonderiPaylas(metin, fotoUrl, hashtaglar) {
    if (!user) return;
    var { data: yeni } = await supabase.from("gonderiler")
      .insert([{ user_id: user.id, metin, fotograf_url: fotoUrl }])
      .select("*, profiles(id,username,avatar_url)").single();
    if (yeni) {
      setGonderiler(p => [yeni, ...p]);
      // Hashtag kaydet
      if (hashtaglar && hashtaglar.length > 0) {
        for (var tag of hashtaglar) {
          var temizTag = tag.slice(1).toLowerCase();
          var { data: htag } = await supabase.from("hashtagler").select("id,kullanim_sayisi").eq("etiket", temizTag).single();
          if (htag) { await supabase.from("hashtagler").update({ kullanim_sayisi: htag.kullanim_sayisi + 1 }).eq("id", htag.id); }
          else { await supabase.from("hashtagler").insert([{ etiket: temizTag }]); }
        }
      }
    }
    setTimeout(() => loadFeed(feedSekme), 800);
  }

  async function begeniToggle(id, sayi) {
    if (!user) { setAuthModal(true); return; }
    if (begeniler.includes(id)) {
      setBegeniler(p => p.filter(b => b !== id));
      await supabase.from("gonderiler").update({ begeni_sayisi: Math.max(0, (sayi || 0) - 1) }).eq("id", id);
      setGonderiler(p => p.map(g => g.id === id ? { ...g, begeni_sayisi: Math.max(0, (sayi || 0) - 1) } : g));
    } else {
      setBegeniler(p => [...p, id]);
      await supabase.from("gonderiler").update({ begeni_sayisi: (sayi || 0) + 1 }).eq("id", id);
      setGonderiler(p => p.map(g => g.id === id ? { ...g, begeni_sayisi: (sayi || 0) + 1 } : g));
      var gnd = gonderiler.find(g => g.id === id);
      if (gnd && gnd.profiles?.id && gnd.profiles.id !== user.id) {
        supabase.from("bildirimler").insert([{ alici_id: gnd.profiles.id, gonderen_id: user.id, tip: "begeni" }]);
      }
    }
  }

  async function kaydetToggle(id) {
    if (!user) { setAuthModal(true); return; }
    if (kaydedilenler.includes(id)) {
      setKaydedilenler(p => p.filter(k => k !== id));
      await supabase.from("kaydedilenler").delete().eq("user_id", user.id).eq("gonderi_id", id);
    } else {
      setKaydedilenler(p => [...p, id]);
      await supabase.from("kaydedilenler").insert([{ user_id: user.id, gonderi_id: id }]);
    }
  }

  async function yorumAc(id) {
    if (yorumId === id) { setYorumId(null); return; }
    setYorumId(id);
    var { data } = await supabase.from("yorumlar").select("*, profiles(username,avatar_url)").eq("gonderi_id", id).order("created_at", { ascending: true });
    if (data) setYorumlar(p => ({ ...p, [id]: data }));
  }

  async function yorumGonder(id) {
    if (!user || !yorumMetin.trim()) return;
    var { data: yeni } = await supabase.from("yorumlar").insert([{ user_id: user.id, gonderi_id: id, metin: yorumMetin }]).select("*, profiles(username,avatar_url)").single();
    if (yeni) {
      setYorumlar(p => ({ ...p, [id]: [...(p[id] || []), yeni] }));
      setYorumMetin("");
      var gnd = gonderiler.find(g => g.id === id);
      if (gnd && gnd.profiles?.id && gnd.profiles.id !== user.id) {
        supabase.from("bildirimler").insert([{ alici_id: gnd.profiles.id, gonderen_id: user.id, tip: "yorum", icerik: yorumMetin.slice(0, 80) }]);
      }
    }
  }

  async function yorumSil(yorumId_, gonderiId) {
    await supabase.from("yorumlar").delete().eq("id", yorumId_);
    setYorumlar(p => ({ ...p, [gonderiId]: (p[gonderiId] || []).filter(y => y.id !== yorumId_) }));
  }

  async function gonderiDuzenle(id) {
    await supabase.from("gonderiler").update({ metin: duzenleMetin }).eq("id", id);
    setGonderiler(p => p.map(g => g.id === id ? { ...g, metin: duzenleMetin } : g));
    setDuzenleId(null);
  }

  async function gonderiSil(id) {
    await supabase.from("gonderiler").delete().eq("id", id);
    setGonderiler(p => p.filter(g => g.id !== id));
    setMenuId(null);
  }

  async function raporGonder(gonderiId, sebep) {
    if (!user) return;
    await supabase.from("raporlar").insert([{ rapor_eden: user.id, gonderi_id: gonderiId, sebep }]);
    setRaporModal(null);
    alert("Raporun alındı, inceleyeceğiz. Teşekkürler.");
  }

  function hashtagRenk(metin) {
    if (!metin) return metin;
    return metin.replace(/#[\w\u0080-\uFFFF]+/g, tag => '##TAG##' + tag + '##ENDTAG##')
                .replace(/@[\w]+/g, mention => '##MENTION##' + mention + '##ENDMENTION##');
  }

  function MentionText({ metin }) {
    if (!metin) return null;
    var parcalar = [];
    var regex = /(#[\w\u0080-\uFFFF]+|@[\w]+)/g;
    var son = 0; var m;
    while ((m = regex.exec(metin)) !== null) {
      if (m.index > son) parcalar.push({ tip: "text", icerik: metin.slice(son, m.index) });
      parcalar.push({ tip: m[0][0] === "#" ? "hashtag" : "mention", icerik: m[0] });
      son = m.index + m[0].length;
    }
    if (son < metin.length) parcalar.push({ tip: "text", icerik: metin.slice(son) });
    return (
      <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {parcalar.map((p, i) =>
          p.tip === "text" ? <span key={i}>{p.icerik}</span>
          : p.tip === "hashtag" ? <a key={i} href={"/hashtag/" + p.icerik.slice(1)} style={{ color: TEAL, fontWeight: 600 }}>{p.icerik}</a>
          : <a key={i} href={"/@" + p.icerik.slice(1)} style={{ color: ACCENT, fontWeight: 600 }}>{p.icerik}</a>
        )}
      </p>
    );
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 60) return d + "s";
    if (d < 3600) return Math.floor(d / 60) + "dk";
    if (d < 86400) return Math.floor(d / 3600) + "sa";
    return Math.floor(d / 86400) + "g";
  }

  if (!loaded) return null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 80 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}@keyframes popIn{from{opacity:0;transform:scale(0.85);}to{opacity:1;transform:scale(1);}}@keyframes spin{to{transform:rotate(360deg);}}input::placeholder,textarea::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}a{text-decoration:none;color:inherit;}button{font-family:inherit;}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.95)" : "rgba(238,242,247,0.95)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => setDrawer(true)} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, border: "2px solid " + TEAL + "40" }}>
            {avatarUrl ? <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, color: C.text, lineHeight: 1 }}>Scriptify</p>
            <p style={{ fontSize: 10, color: TEAL, fontWeight: 600, marginTop: 1 }}>Ana Sayfa</p>
          </div>
        </button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="/bildirimler" style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", background: C.input, border: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            🔔
            {bildirimSayisi > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: ACCENT, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid " + C.bg }}>{bildirimSayisi}</span>}
          </a>
          <a href="/uret" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 20, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", boxShadow: "0 3px 12px " + ACCENT + "35" }}>
            <span style={{ fontSize: 14 }}>🎬</span><span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Üret</span>
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        {/* STORY BAR */}
        <StoryBar dk={dk} C={C} user={user} avatarUrl={avatarUrl} />

        {/* AUTH DAVET */}
        {!user && (
          <div style={{ margin: "16px", background: "linear-gradient(135deg," + TEAL + "15," + ACCENT + "08)", border: "1px solid " + TEAL + "25", borderRadius: 20, padding: "20px", textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Scriptify'a Hoş Geldin! 🎬</p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>AI ile senaryo üret, topluluğa katıl, yaratıcıları takip et.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: typeof window !== "undefined" ? window.location.origin : "" } })} style={{ padding: "10px 20px", borderRadius: 12, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Google ile Giriş</button>
            </div>
          </div>
        )}

        {/* FEED SEKMELERİ */}
        <div style={{ display: "flex", borderBottom: "1px solid " + C.border, background: C.surface, position: "sticky", top: 57, zIndex: 40 }}>
          {[{ id: "son", label: "🕐 En Son" }, { id: "trend", label: "🔥 Trend" }].map(s => (
            <button key={s.id} onClick={() => loadFeed(s.id)} style={{ flex: 1, padding: "13px 8px", background: "none", border: "none", borderBottom: feedSekme === s.id ? "2px solid " + TEAL : "2px solid transparent", color: feedSekme === s.id ? TEAL : C.muted, fontSize: 14, fontWeight: feedSekme === s.id ? 700 : 500, cursor: "pointer", marginBottom: "-1px" }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* GÖNDERILER */}
        <div style={{ padding: "8px 0" }}>
          {gonderiler.length === 0 ? (
            <div style={{ textAlign: "center", padding: "70px 20px" }}>
              <p style={{ fontSize: 48, marginBottom: 14 }}>✍️</p>
              <p style={{ fontSize: 15, color: C.muted, marginBottom: 20 }}>Henüz gönderi yok. İlk paylaşımı sen yap!</p>
              {user && <button onClick={() => setGonderiModal(true)} style={{ padding: "10px 24px", borderRadius: 12, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>✍️ Paylaş</button>}
            </div>
          ) : gonderiler.map((g, i) => (
            <div key={g.id} style={{ borderBottom: "1px solid " + C.border, padding: "16px 20px", animation: "fadeUp 0.25s " + Math.min(i * 0.03, 0.15) + "s both ease" }}>
              {/* Yazar */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <a href={"/@" + g.profiles?.username}><Av url={g.profiles?.avatar_url} size={40} fs={16} /></a>
                <div style={{ flex: 1 }}>
                  <a href={"/@" + g.profiles?.username} style={{ fontSize: 14, fontWeight: 700, color: C.text }}>@{g.profiles?.username || "anonim"}</a>
                  <p style={{ fontSize: 11, color: C.muted }}>{zaman(g.created_at)}</p>
                </div>
                <button onClick={() => setMenuId(menuId === g.id ? null : g.id)} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", padding: "0 4px" }}>···</button>
              </div>

              {/* Menü */}
              {menuId === g.id && (
                <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 14, padding: "6px", marginBottom: 10, boxShadow: C.shadow }}>
                  {user && g.profiles?.id === user.id ? (
                    <>
                      <button onClick={() => { setDuzenleId(g.id); setDuzenleMetin(g.metin || ""); setMenuId(null); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: "none", border: "none", color: C.text, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>✏️ Düzenle</button>
                      <button onClick={() => gonderiSil(g.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: "none", border: "none", color: ACCENT, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>🗑️ Sil</button>
                    </>
                  ) : (
                    <button onClick={() => { setRaporModal(g.id); setMenuId(null); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 14px", background: "none", border: "none", color: ACCENT, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>🚩 Raporla</button>
                  )}
                </div>
              )}

              {/* Düzenleme */}
              {duzenleId === g.id ? (
                <div style={{ marginBottom: 10 }}>
                  <textarea value={duzenleMetin} onChange={e => setDuzenleMetin(e.target.value)} rows={3} style={{ width: "100%", background: C.input, border: "1px solid " + TEAL, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", resize: "none", fontFamily: "inherit", marginBottom: 8 }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => gonderiDuzenle(g.id)} style={{ flex: 1, padding: "9px", borderRadius: 10, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Kaydet</button>
                    <button onClick={() => setDuzenleId(null)} style={{ flex: 1, padding: "9px", borderRadius: 10, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 13, cursor: "pointer" }}>İptal</button>
                  </div>
                </div>
              ) : (
                <>
                  {g.metin && <MentionText metin={g.metin} />}
                  {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", borderRadius: 16, marginTop: 10, maxHeight: 400, objectFit: "cover" }} alt="" />}
                </>
              )}

              {/* Aksiyon butonları */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 12 }}>
                <button onClick={() => begeniToggle(g.id, g.begeni_sayisi)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", borderRadius: 12, border: "1.5px solid " + (begeniler.includes(g.id) ? ACCENT + "40" : C.border), background: begeniler.includes(g.id) ? ACCENT + "10" : C.input, color: begeniler.includes(g.id) ? ACCENT : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {begeniler.includes(g.id) ? "❤️" : "♡"} {g.begeni_sayisi || 0}
                </button>
                <button onClick={() => yorumAc(g.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", borderRadius: 12, border: "1.5px solid " + (yorumId === g.id ? TEAL + "40" : C.border), background: yorumId === g.id ? TEAL + "10" : C.input, color: yorumId === g.id ? TEAL : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  💬 {(yorumlar[g.id] || []).length || ""}
                </button>
                <button onClick={() => kaydetToggle(g.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "10px 0", borderRadius: 12, border: "1.5px solid " + (kaydedilenler.includes(g.id) ? TEAL + "40" : C.border), background: kaydedilenler.includes(g.id) ? TEAL + "10" : C.input, color: kaydedilenler.includes(g.id) ? TEAL : C.muted, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  {kaydedilenler.includes(g.id) ? "🔖" : "🔖"} {kaydedilenler.includes(g.id) ? "Kaydedildi" : "Kaydet"}
                </button>
              </div>

              {/* Yorumlar */}
              {yorumId === g.id && (
                <div style={{ marginTop: 14, borderTop: "1px solid " + C.border, paddingTop: 14 }}>
                  {(yorumlar[g.id] || []).map((y, yi) => (
                    <div key={y.id || yi} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <Av url={y.profiles?.avatar_url} size={30} fs={12} />
                      <div style={{ flex: 1, background: C.input, borderRadius: 12, padding: "8px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>@{y.profiles?.username}</span>
                          {user && y.user_id === user.id && <button onClick={() => yorumSil(y.id, g.id)} style={{ background: "none", border: "none", color: ACCENT, fontSize: 11, cursor: "pointer" }}>sil</button>}
                        </div>
                        <p style={{ fontSize: 13, color: C.text, marginTop: 2 }}>{y.metin}</p>
                      </div>
                    </div>
                  ))}
                  {user ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Av url={avatarUrl} size={30} fs={12} />
                      <input value={yorumMetin} onChange={e => setYorumMetin(e.target.value)} onKeyDown={e => e.key === "Enter" && yorumGonder(g.id)} placeholder="Yorum yaz..." style={{ flex: 1, background: C.input, border: "1px solid " + C.border, borderRadius: 20, padding: "8px 14px", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
                      <button onClick={() => yorumGonder(g.id)} style={{ padding: "8px 14px", borderRadius: 20, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Gönder</button>
                    </div>
                  ) : <p style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>Yorum yazmak için <a href="/" style={{ color: TEAL }}>giriş yap</a></p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ALT NAV */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "8px 0 env(safe-area-inset-bottom,8px)", display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {[
          { href: "/", svg: (active) => <svg width="24" height="24" fill={active ? TEAL : "none"} stroke={active ? TEAL : C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
          { href: "/kesfet", svg: (active) => <svg width="24" height="24" fill="none" stroke={active ? TEAL : C.muted} strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
          { href: "/topluluk", svg: (active) => <svg width="24" height="24" fill="none" stroke={active ? TEAL : C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
          { href: "/mesajlar", svg: (active) => <svg width="24" height="24" fill="none" stroke={active ? TEAL : C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
          { href: "/profil", svg: (active) => <svg width="24" height="24" fill="none" stroke={active ? TEAL : C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
        ].map(item => {
          var active = item.href === "/";
          return (
            <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 14px", borderRadius: 14, position: "relative", opacity: active ? 1 : 0.55 }}>
              {item.svg(active)}
              {active && <div style={{ position: "absolute", bottom: 2, width: 18, height: 3, borderRadius: 2, background: TEAL }} />}
            </a>
          );
        })}
      </div>

      {/* FAB */}
      <button onClick={() => user ? setGonderiModal(true) : setAuthModal(true)} style={{ position: "fixed", bottom: 85, right: 20, zIndex: 150, width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", boxShadow: "0 6px 24px " + TEAL + "50", display: "flex", alignItems: "center", justifyContent: "center", animation: "popIn 0.3s ease" }}>✍️</button>

      {/* RAPOR MODAL */}
      {raporModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: dk ? "#0f1829" : "#fff", borderRadius: 24, padding: 24, maxWidth: 340, width: "100%" }}>
            <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 16 }}>🚩 Neden raporluyorsun?</p>
            {["Uygunsuz içerik", "Spam", "Yanlış bilgi", "Nefret söylemi", "Diğer"].map(sebep => (
              <button key={sebep} onClick={() => raporGonder(raporModal, sebep)} style={{ display: "block", width: "100%", padding: "12px 16px", marginBottom: 8, borderRadius: 12, border: "1px solid " + C.border, background: C.input, color: C.text, fontSize: 14, textAlign: "left", cursor: "pointer" }}>{sebep}</button>
            ))}
            <button onClick={() => setRaporModal(null)} style={{ width: "100%", padding: "11px", borderRadius: 12, background: "none", border: "none", color: C.muted, fontSize: 14, cursor: "pointer", marginTop: 4 }}>İptal</button>
          </div>
        </div>
      )}

      {gonderiModal && <GonderiModal dk={dk} C={C} user={user} avatarUrl={avatarUrl} onClose={() => setGonderiModal(false)} onPaylas={gonderiPaylas} />}
      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={() => setDrawer(false)} onTema={temaToggle} />}
    </div>
  );
}
