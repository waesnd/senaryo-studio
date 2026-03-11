import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";

var ACCENT = "#e8230a";
var TEAL = "#0891b2";
var TEAL_L = "#06b6d4";
var PAGE_SIZE = 15;

function getC(dk) {
  return {
    bg:      dk ? "#080f1c" : "#f4f6fb",
    surface: dk ? "#0f1829" : "#ffffff",
    border:  dk ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
    text:    dk ? "#f1f5f9" : "#0f172a",
    muted:   dk ? "rgba(241,245,249,0.45)" : "rgba(15,23,42,0.42)",
    input:   dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
    shadow:  dk ? "0 4px 24px rgba(0,0,0,0.5)" : "0 4px 24px rgba(0,0,0,0.08)",
  };
}

function getInitialTema() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function Av({ url, size, dk }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {url
        ? <img src={url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
        : <svg width={size * 0.42} height={size * 0.42} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
      }
    </div>
  );
}

function AltNav({ C }) {
  var items = [
    { href: "/",         icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
    { href: "/kesfet",   icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg> },
    { href: "/topluluk", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg> },
    { href: "/mesajlar", icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg> },
    { href: "/profil",   icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: C.surface + "f8", backdropFilter: "blur(24px)", borderTop: "1px solid " + C.border, padding: "8px 0 env(safe-area-inset-bottom,8px)", display: "flex", justifyContent: "space-around" }}>
      {items.map(item => {
        var active = item.href === "/";
        return (
          <a key={item.href} href={item.href} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "5px 14px", position: "relative", color: active ? TEAL : C.muted }}>
            {item.icon}
            {active && <div style={{ position: "absolute", bottom: 1, width: 18, height: 3, borderRadius: 2, background: TEAL }} />}
          </a>
        );
      })}
    </div>
  );
}

function Drawer({ dk, C, user, username, avatarUrl, onClose, onTema }) {
  var [cikisOnay, setCikisOnay] = useState(false);

  var SVGS = {
    home: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
    film: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5"/></svg>,
    kesfet: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
    topluluk: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    mesaj: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    profil: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    gunes: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
    ay: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>,
    cikis: <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  };

  var MENU = [
    { href: "/", icon: SVGS.home, label: "Ana Sayfa" },
    { href: "/uret", icon: SVGS.film, label: "Senaryo Üret", badge: "AI" },
    { href: "/kesfet", icon: SVGS.kesfet, label: "Keşfet" },
    { href: "/topluluk", icon: SVGS.topluluk, label: "Topluluk" },
    { href: "/mesajlar", icon: SVGS.mesaj, label: "Mesajlar" },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 201, width: 290, background: dk ? "#0d1627" : "#fff", display: "flex", flexDirection: "column", boxShadow: "6px 0 40px rgba(0,0,0,0.25)" }}>
        <div style={{ height: 3, background: "linear-gradient(90deg," + ACCENT + "," + TEAL + "," + TEAL_L + ")" }} />
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid " + C.border }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div onClick={() => { onClose(); window.location.href = "/profil"; }} style={{ cursor: "pointer" }}>
              <Av url={avatarUrl} size={52} dk={dk} />
            </div>
            <button onClick={onClose} style={{ background: C.input, border: "1px solid " + C.border, borderRadius: 10, padding: "6px 12px", color: C.muted, fontSize: 13 }}>✕</button>
          </div>
          {user
            ? <><p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{username ? "@" + username : user.email}</p><p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{user.email}</p></>
            : <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: typeof window !== "undefined" ? window.location.origin : "" } })} style={{ width: "100%", padding: "10px", borderRadius: 12, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700 }}>Google ile Giriş</button>
          }
        </div>
        <nav style={{ flex: 1, overflowY: "auto", padding: "10px 12px" }}>
          {MENU.map(item => (
            <a key={item.href} href={item.href} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, marginBottom: 2, textDecoration: "none" }}>
              <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center", color: TEAL, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1, fontWeight: 500 }}>{item.label}</span>
              {item.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: ACCENT, color: "#fff" }}>{item.badge}</span>}
            </a>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + C.border }}>
            <a href="/profil" style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, marginBottom: 2, textDecoration: "none" }}>
              <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center", color: TEAL }}>{SVGS.profil}</span>
              <span style={{ fontWeight: 500 }}>Profil & Ayarlar</span>
            </a>
            <button onClick={onTema} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: C.text, fontSize: 15, background: "none", border: "none", width: "100%", textAlign: "left", marginBottom: 2 }}>
              <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center", color: dk ? "#f59e0b" : "#6366f1" }}>{dk ? SVGS.gunes : SVGS.ay}</span>
              <span style={{ fontWeight: 500 }}>{dk ? "Açık Tema" : "Koyu Tema"}</span>
            </button>
            {user && (
              <button onClick={() => setCikisOnay(true)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 14, color: ACCENT, fontSize: 15, background: ACCENT + "10", border: "none", width: "100%", textAlign: "left" }}>
                <span style={{ width: 24, display: "flex", alignItems: "center", justifyContent: "center", color: ACCENT }}>{SVGS.cikis}</span>
                <span style={{ fontWeight: 600 }}>Çıkış Yap</span>
              </button>
            )}
          </div>
        </nav>
        <div style={{ padding: "14px 20px", borderTop: "1px solid " + C.border }}>
          <p style={{ fontSize: 11, color: C.muted, textAlign: "center" }}>© 2025 Scriptify</p>
        </div>
      </div>

      {/* Çıkış onay modalı */}
      {cikisOnay && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 301, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
            <div style={{ background: dk ? "#0f1829" : "#fff", borderRadius: 24, padding: "28px 24px", width: "100%", maxWidth: 320, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: ACCENT + "15", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="26" height="26" fill="none" stroke={ACCENT} strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 8 }}>Çıkış Yap</h3>
              <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>Hesabından çıkış yapmak istediğine emin misin?</p>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setCikisOnay(false)} style={{ flex: 1, padding: "12px", borderRadius: 14, background: C.input, border: "1px solid " + C.border, color: C.text, fontSize: 14, fontWeight: 600 }}>
                  İptal
                </button>
                <button onClick={() => { supabase.auth.signOut(); onClose(); window.location.href = "/"; }} style={{ flex: 1, padding: "12px", borderRadius: 14, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 14, fontWeight: 700 }}>
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function StoryBar({ dk, C, user, avatarUrl }) {
  var [storyler, setStoryler] = useState([]);
  var [aktif, setAktif] = useState(null);
  var dosyaRef = useRef(null);

  useEffect(() => {
    supabase.from("storyler").select("*, profiles(username,avatar_url)")
      .gt("bitis_at", new Date().toISOString())
      .order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setStoryler(data); });
  }, []);

  async function storyEkle(e) {
    var file = e.target.files[0]; if (!file || !user) return;
    var fd = new FormData(); fd.append("file", file); fd.append("upload_preset", "scriptify_posts");
    var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
    var d = await res.json();
    if (d.secure_url) {
      var bitis = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await supabase.from("storyler").insert([{ user_id: user.id, medya_url: d.secure_url, bitis_at: bitis }]);
      window.location.reload();
    }
  }

  var gruplar = {};
  storyler.forEach(s => { if (!gruplar[s.user_id]) gruplar[s.user_id] = { profil: s.profiles, list: [] }; gruplar[s.user_id].list.push(s); });

  return (
    <div style={{ borderBottom: "1px solid " + C.border, background: C.surface }}>
      <div style={{ display: "flex", gap: 14, padding: "14px 16px", overflowX: "auto" }}>
        <div onClick={() => dosyaRef.current?.click()} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0, cursor: "pointer" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px dashed " + TEAL + "70", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Av url={avatarUrl} size={56} dk={dk} />
            <div style={{ position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: "50%", background: TEAL, border: "2px solid " + C.bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>+</div>
          </div>
          <p style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Ekle</p>
        </div>
        <input ref={dosyaRef} type="file" accept="image/*" onChange={storyEkle} style={{ display: "none" }} />
        {Object.values(gruplar).map((g, i) => (
          <div key={i} onClick={() => setAktif(g)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0, cursor: "pointer" }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", padding: 2, background: "linear-gradient(135deg," + TEAL + "," + ACCENT + ")" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", border: "2px solid " + C.bg, overflow: "hidden" }}>
                <Av url={g.profil?.avatar_url} size={56} dk={dk} />
              </div>
            </div>
            <p style={{ fontSize: 10, color: C.muted, fontWeight: 600, maxWidth: 60, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{g.profil?.username || "?"}</p>
          </div>
        ))}
      </div>
      {aktif && (
        <div onClick={() => setAktif(null)} style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={aktif.list[0]?.medya_url} style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: 16, objectFit: "contain" }} alt="" />
          <button style={{ position: "absolute", top: 24, right: 24, background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 40, height: 40, borderRadius: "50%", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          <p style={{ position: "absolute", top: 24, left: 24, color: "#fff", fontWeight: 700, fontSize: 15 }}>@{aktif.profil?.username}</p>
        </div>
      )}
    </div>
  );
}

/* @ Mention Öneri */
function MentionInput({ value, onChange, C, dk }) {
  var [oneriler, setOneriler] = useState([]);
  var [mentionQuery, setMentionQuery] = useState(null);
  var textareaRef = useRef(null);

  async function handleChange(e) {
    var val = e.target.value;
    onChange(val);
    var cursor = e.target.selectionStart;
    var textUpTo = val.slice(0, cursor);
    var mentionMatch = textUpTo.match(/@([\w]*)$/);
    if (mentionMatch) {
      var q = mentionMatch[1];
      setMentionQuery(q);
      if (q.length >= 1) {
        var { data } = await supabase.from("profiles").select("username,avatar_url").ilike("username", q + "%").limit(5);
        setOneriler(data || []);
      } else setOneriler([]);
    } else {
      setMentionQuery(null);
      setOneriler([]);
    }
  }

  function seç(username) {
    var val = value;
    var cursor = textareaRef.current?.selectionStart || val.length;
    var textUpTo = val.slice(0, cursor);
    var replaced = textUpTo.replace(/@[\w]*$/, "@" + username + " ");
    var newVal = replaced + val.slice(cursor);
    onChange(newVal);
    setOneriler([]);
    setMentionQuery(null);
    textareaRef.current?.focus();
  }

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <textarea ref={textareaRef} value={value} onChange={handleChange} placeholder="Ne düşünüyorsun? #hashtag ya da @mention..." rows={4} style={{ width: "100%", background: "transparent", border: "none", color: dk ? "#f1f5f9" : "#0f172a", fontSize: 15, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.65 }} />
      {oneriler.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: dk ? "#0f1829" : "#fff", border: "1px solid " + C.border, borderRadius: 14, zIndex: 10, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
          {oneriler.map(u => (
            <div key={u.username} onClick={() => seç(u.username)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", cursor: "pointer" }}>
              <Av url={u.avatar_url} size={32} dk={dk} />
              <span style={{ fontSize: 14, fontWeight: 600, color: dk ? "#f1f5f9" : "#0f172a" }}>@{u.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GonderiModal({ dk, C, user, avatarUrl, onClose, onPaylas }) {
  var [metin, setMetin] = useState("");
  var [fotograf, setFotograf] = useState(null);
  var [onizleme, setOnizleme] = useState(null);
  var [yukleniyor, setYukleniyor] = useState(false);
  var dosyaRef = useRef(null);

  async function paylas() {
    if (!metin.trim() && !fotograf) return;
    setYukleniyor(true);
    var fUrl = null;
    if (fotograf) {
      var fd = new FormData(); fd.append("file", fotograf); fd.append("upload_preset", "scriptify_posts");
      var res = await fetch("https://api.cloudinary.com/v1_1/duuebxmro/image/upload", { method: "POST", body: fd });
      var d = await res.json(); fUrl = d.secure_url;
    }
    await onPaylas(metin, fUrl, metin.match(/#[\w\u0080-\uFFFF]+/g) || []);
    setYukleniyor(false); onClose();
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301, background: dk ? "#0f1829" : "#fff", borderRadius: "22px 22px 0 0", padding: "8px 20px env(safe-area-inset-bottom,20px)" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "12px auto 16px" }} />
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <Av url={avatarUrl} size={40} dk={dk} />
          <MentionInput value={metin} onChange={setMetin} C={C} dk={dk} />
        </div>
        {onizleme && (
          <div style={{ position: "relative", marginBottom: 12 }}>
            <img src={onizleme} style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 14 }} alt="" />
            <button onClick={() => { setFotograf(null); setOnizleme(null); }} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", fontSize: 14 }}>✕</button>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid " + C.border }}>
          <button onClick={() => dosyaRef.current?.click()} style={{ background: "none", border: "none", fontSize: 22, padding: "4px", color: C.muted }}>🖼️</button>
          <input ref={dosyaRef} type="file" accept="image/*" onChange={e => { var f = e.target.files[0]; if (f) { setFotograf(f); setOnizleme(URL.createObjectURL(f)); } }} style={{ display: "none" }} />
          <button onClick={paylas} disabled={yukleniyor || (!metin.trim() && !fotograf)} style={{ padding: "10px 24px", borderRadius: 20, background: (metin.trim() || fotograf) ? "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")" : C.input, border: "none", color: (metin.trim() || fotograf) ? "#fff" : C.muted, fontSize: 14, fontWeight: 700 }}>
            {yukleniyor ? "Paylaşılıyor..." : "Paylaş"}
          </button>
        </div>
      </div>
    </>
  );
}

function Onboarding({ onClose, dk }) {
  var [slayt, setSlayt] = useState(0);
  var SLAYTLAR = [
    { emoji: "🎬", baslik: "Scriptify'a Hoş Geldin!", aciklama: "AI ile saniyeler içinde özgün film ve dizi senaryoları üret. Gerilimden komediye, her türde senaryo seni bekliyor." },
    { emoji: "🌍", baslik: "Toplulukla Paylaş", aciklama: "Senaryolarını topluluğa paylaş, diğer yazarları takip et, beğen, yorum yap. Yaratıcılarla bağlantı kur." },
    { emoji: "✨", baslik: "Hemen Başla!", aciklama: "Google hesabınla saniyeler içinde giriş yap. Ücretsiz, reklamsız, sadece yaratıcılık." },
  ];
  var s = SLAYTLAR[slayt];
  var C = getC(dk);

  function bitir() {
    try { localStorage.setItem("sf_onboarded", "1"); } catch (e) {}
    onClose();
  }

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 600, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(12px)" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 601, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 env(safe-area-inset-bottom,0)" }}>
        <div style={{ background: dk ? "#0f1829" : "#fff", borderRadius: "28px 28px 0 0", padding: "32px 28px 40px", width: "100%", maxWidth: 480, textAlign: "center" }}>
          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 32 }}>
            {SLAYTLAR.map((_, i) => (
              <div key={i} onClick={() => setSlayt(i)} style={{ width: i === slayt ? 24 : 8, height: 8, borderRadius: 4, background: i === slayt ? TEAL : C.border, transition: "all 0.3s", cursor: "pointer" }} />
            ))}
          </div>
          <div style={{ fontSize: 72, marginBottom: 20 }}>{s.emoji}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 12, letterSpacing: "-0.02em" }}>{s.baslik}</h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 36 }}>{s.aciklama}</p>
          {slayt < SLAYTLAR.length - 1 ? (
            <button onClick={() => setSlayt(s => s + 1)} style={{ width: "100%", padding: "15px", borderRadius: 16, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 16, fontWeight: 800 }}>
              Devam →
            </button>
          ) : (
            <button onClick={bitir} style={{ width: "100%", padding: "15px", borderRadius: 16, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 16, fontWeight: 800, boxShadow: "0 6px 20px " + ACCENT + "40" }}>
              🚀 Başlayalım!
            </button>
          )}
          <button onClick={bitir} style={{ marginTop: 14, background: "none", border: "none", color: C.muted, fontSize: 13, padding: "8px" }}>Geç</button>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  var [user, setUser] = useState(null);
  var [onboarding, setOnboarding] = useState(false);
  var [profil, setProfil] = useState(null);
  var [gonderiler, setGonderiler] = useState([]);
  var [begeniler, setBegeniler] = useState([]);
  var [kaydedilenler, setKaydedilenler] = useState([]);
  var [yorumlar, setYorumlar] = useState({});
  var [yorumId, setYorumId] = useState(null);
  var [yorumMetin, setYorumMetin] = useState("");
  var [menuId, setMenuId] = useState(null);
  var [duzenleId, setDuzenleId] = useState(null);
  var [duzenleMetin, setDuzenleMetin] = useState("");
  var [feedSekme, setFeedSekme] = useState("son");
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [drawer, setDrawer] = useState(false);
  var [gonderiModal, setGonderiModal] = useState(false);
  var [raporModal, setRaporModal] = useState(null);
  var [authModal, setAuthModal] = useState(false);
  var [bildirimSayisi, setBildirimSayisi] = useState(0);
  // Sonsuz scroll
  var [sayfa, setSayfa] = useState(0);
  var [dahaVar, setDahaVar] = useState(true);
  var [scrollYukleniyor, setScrollYukleniyor] = useState(false);
  var altRef = useRef(null);

  var dk = tema === "dark";
  var C = getC(dk);
  var username = profil?.username || "";
  var avatarUrl = profil?.avatar_url || null;

  useEffect(() => {
    var t = getInitialTema(); setTema(t);
    // Sistem teması değişince güncelle
    function onTemaChange(e) { setTema(e.detail); }
    window.addEventListener("sf_tema_change", onTemaChange);

    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        setUser(data.session.user);
        loadProfil(data.session.user.id);
        loadBegeniler(data.session.user.id);
        loadKaydedilenler(data.session.user.id);
        loadBildirimSayisi(data.session.user.id);
      } else {
        // Giriş yapmamış — ilk kez mi?
        try {
          if (!localStorage.getItem("sf_onboarded")) setOnboarding(true);
        } catch (e) {}
      }
      loadFeed("son", 0, []);
      setLoaded(true);
    });
    supabase.auth.onAuthStateChange((_, session) => {
      if (session) { setUser(session.user); loadProfil(session.user.id); }
      else { setUser(null); setProfil(null); }
    });
    return () => window.removeEventListener("sf_tema_change", onTemaChange);
  }, []);

  // Sonsuz scroll observer
  useEffect(() => {
    if (!altRef.current) return;
    var obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && dahaVar && !scrollYukleniyor) {
        loadDaha();
      }
    }, { threshold: 0.1 });
    obs.observe(altRef.current);
    return () => obs.disconnect();
  }, [dahaVar, scrollYukleniyor, sayfa, feedSekme]);

  async function loadProfil(uid) {
    var { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) setProfil(data);
  }
  async function loadBegeniler(uid) {
    var { data } = await supabase.from("begeniler").select("gonderi_id").eq("user_id", uid);
    if (data) setBegeniler(data.map(b => b.gonderi_id));
  }
  async function loadKaydedilenler(uid) {
    var { data } = await supabase.from("kaydedilenler").select("gonderi_id").eq("user_id", uid).not("gonderi_id", "is", null);
    if (data) setKaydedilenler(data.map(k => k.gonderi_id));
  }
  async function loadBildirimSayisi(uid) {
    var { count } = await supabase.from("bildirimler").select("*", { count: "exact" }).eq("alici_id", uid).eq("okundu", false);
    if (count) setBildirimSayisi(count);
  }

  async function loadFeed(sekme, offset, mevcut) {
    var q = supabase.from("gonderiler").select("*, profiles(id,username,avatar_url)").eq("arsiv", false);
    if (sekme === "trend") q = q.order("begeni_sayisi", { ascending: false });
    else q = q.order("created_at", { ascending: false });
    var { data } = await q.range(offset, offset + PAGE_SIZE - 1);
    if (data) {
      setGonderiler(offset === 0 ? data : [...mevcut, ...data]);
      setDahaVar(data.length === PAGE_SIZE);
    }
  }

  async function loadDaha() {
    if (!dahaVar || scrollYukleniyor) return;
    setScrollYukleniyor(true);
    var yeniSayfa = sayfa + 1;
    setSayfa(yeniSayfa);
    var offset = yeniSayfa * PAGE_SIZE;
    var q = supabase.from("gonderiler").select("*, profiles(id,username,avatar_url)").eq("arsiv", false);
    if (feedSekme === "trend") q = q.order("begeni_sayisi", { ascending: false });
    else q = q.order("created_at", { ascending: false });
    var { data } = await q.range(offset, offset + PAGE_SIZE - 1);
    if (data) {
      setGonderiler(p => [...p, ...data]);
      setDahaVar(data.length === PAGE_SIZE);
    }
    setScrollYukleniyor(false);
  }

  function temaToggle() {
    setTema(function(prev) { return prev === "dark" ? "light" : "dark"; });
  }

  async function gonderiPaylas(metin, fotoUrl, hashtaglar) {
    if (!user) return;
    var { data: yeni } = await supabase.from("gonderiler").insert([{ user_id: user.id, metin, fotograf_url: fotoUrl }]).select("*, profiles(id,username,avatar_url)").single();
    if (yeni) {
      setGonderiler(p => [yeni, ...p]);
      for (var tag of (hashtaglar || [])) {
        var t = tag.slice(1).toLowerCase();
        var { data: ht } = await supabase.from("hashtagler").select("id,kullanim_sayisi").eq("etiket", t).single();
        if (ht) await supabase.from("hashtagler").update({ kullanim_sayisi: ht.kullanim_sayisi + 1 }).eq("id", ht.id);
        else await supabase.from("hashtagler").insert([{ etiket: t }]);
      }
    }
  }

  async function begeniToggle(id, sayi) {
    if (!user) { setAuthModal(true); return; }
    if (begeniler.includes(id)) {
      setBegeniler(p => p.filter(b => b !== id));
      setGonderiler(p => p.map(g => g.id === id ? { ...g, begeni_sayisi: Math.max(0, (sayi || 0) - 1) } : g));
      await supabase.from("gonderiler").update({ begeni_sayisi: Math.max(0, (sayi || 0) - 1) }).eq("id", id);
    } else {
      setBegeniler(p => [...p, id]);
      setGonderiler(p => p.map(g => g.id === id ? { ...g, begeni_sayisi: (sayi || 0) + 1 } : g));
      await supabase.from("gonderiler").update({ begeni_sayisi: (sayi || 0) + 1 }).eq("id", id);
      var gnd = gonderiler.find(g => g.id === id);
      if (gnd?.profiles?.id && gnd.profiles.id !== user.id) {
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
    if (!yorumlar[id]) {
      var { data } = await supabase.from("yorumlar").select("*, profiles(username,avatar_url)").eq("gonderi_id", id).order("created_at");
      if (data) setYorumlar(p => ({ ...p, [id]: data }));
    }
    // Görüntülenme sayacı
    var gnd = gonderiler.find(g => g.id === id);
    if (gnd) {
      var yeni = (gnd.goruntuleme_sayisi || 0) + 1;
      supabase.from("gonderiler").update({ goruntuleme_sayisi: yeni }).eq("id", id);
      setGonderiler(p => p.map(g => g.id === id ? { ...g, goruntuleme_sayisi: yeni } : g));
    }
  }

  async function yorumGonder(id) {
    if (!user || !yorumMetin.trim()) return;
    var { data: yeni } = await supabase.from("yorumlar").insert([{ user_id: user.id, gonderi_id: id, metin: yorumMetin }]).select("*, profiles(username,avatar_url)").single();
    if (yeni) {
      setYorumlar(p => ({ ...p, [id]: [...(p[id] || []), yeni] }));
      setYorumMetin("");
      var gnd = gonderiler.find(g => g.id === id);
      if (gnd?.profiles?.id && gnd.profiles.id !== user.id) {
        supabase.from("bildirimler").insert([{ alici_id: gnd.profiles.id, gonderen_id: user.id, tip: "yorum", icerik: yorumMetin.slice(0, 80) }]);
      }
    }
  }

  async function yorumSil(yid, gid) {
    await supabase.from("yorumlar").delete().eq("id", yid);
    setYorumlar(p => ({ ...p, [gid]: (p[gid] || []).filter(y => y.id !== yid) }));
  }

  async function gonderiDuzenle(id) {
    await supabase.from("gonderiler").update({ metin: duzenleMetin }).eq("id", id);
    setGonderiler(p => p.map(g => g.id === id ? { ...g, metin: duzenleMetin } : g));
    setDuzenleId(null); setMenuId(null);
  }

  async function gonderiSil(id) {
    if (!confirm("Silinsin mi?")) return;
    await supabase.from("gonderiler").delete().eq("id", id);
    setGonderiler(p => p.filter(g => g.id !== id));
    setMenuId(null);
  }

  async function gonderiPaylasDM(gonderi) {
    if (!user) { setAuthModal(true); return; }
    var metin = "📤 Gönderi paylaşıldı: " + (gonderi.metin || "").slice(0, 60);
    var url = window.location.origin + "/?g=" + gonderi.id;
    if (navigator.share) {
      navigator.share({ title: "Scriptify", text: metin, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      alert("Link kopyalandı!");
    }
  }

  function MentionText({ metin }) {
    if (!metin) return null;
    var parcalar = []; var regex = /(#[\w\u0080-\uFFFF]+|@[\w]+)/g; var son = 0; var m;
    while ((m = regex.exec(metin)) !== null) {
      if (m.index > son) parcalar.push({ t: "text", v: metin.slice(son, m.index) });
      parcalar.push({ t: m[0][0] === "#" ? "tag" : "mention", v: m[0] });
      son = m.index + m[0].length;
    }
    if (son < metin.length) parcalar.push({ t: "text", v: metin.slice(son) });
    return (
      <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {parcalar.map((p, i) =>
          p.t === "text" ? <span key={i}>{p.v}</span>
          : p.t === "tag" ? <a key={i} href={"/hashtag/" + p.v.slice(1)} style={{ color: TEAL, fontWeight: 600 }}>{p.v}</a>
          : <a key={i} href={"/@" + p.v.slice(1)} style={{ color: ACCENT, fontWeight: 600 }}>{p.v}</a>
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

  if (!loaded) {
    var skBg = getInitialTema() === "dark" ? "#080f1c" : "#f4f6fb";
    var skSurface = getInitialTema() === "dark" ? "#0f1829" : "#ffffff";
    var skShimmer = getInitialTema() === "dark" ? "#1a2740" : "#e8eef5";
    return (
      <div style={{ minHeight: "100vh", background: skBg, fontFamily: "-apple-system,sans-serif" }}>
        <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}@keyframes spin{to{transform:rotate(360deg)}}.sk{background:linear-gradient(90deg,${skShimmer} 25%,${skSurface} 50%,${skShimmer} 75%);background-size:800px 100%;animation:shimmer 1.2s infinite linear;border-radius:8px;}`}</style>
        {/* Topbar skeleton */}
        <div style={{ height: 56, background: skSurface, borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="sk" style={{ width: 36, height: 36, borderRadius: "50%" }} />
            <div>
              <div className="sk" style={{ width: 80, height: 14, marginBottom: 4 }} />
              <div className="sk" style={{ width: 55, height: 10 }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div className="sk" style={{ width: 36, height: 36, borderRadius: "50%" }} />
            <div className="sk" style={{ width: 68, height: 36, borderRadius: 20 }} />
          </div>
        </div>
        {/* Story bar skeleton */}
        <div style={{ background: skSurface, borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "14px 16px", display: "flex", gap: 14 }}>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <div className="sk" style={{ width: 60, height: 60, borderRadius: "50%" }} />
              <div className="sk" style={{ width: 44, height: 9 }} />
            </div>
          ))}
        </div>
        {/* Feed skeleton */}
        {[0,1,2,3].map(i => (
          <div key={i} style={{ background: skSurface, borderBottom: "1px solid rgba(0,0,0,0.07)", padding: "14px 16px" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div className="sk" style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="sk" style={{ width: "40%", height: 13, marginBottom: 6 }} />
                <div className="sk" style={{ width: "25%", height: 10 }} />
              </div>
            </div>
            <div className="sk" style={{ width: "90%", height: 13, marginBottom: 8 }} />
            <div className="sk" style={{ width: "70%", height: 13, marginBottom: 12 }} />
            {i % 2 === 0 && <div className="sk" style={{ width: "100%", height: 200, borderRadius: 14, marginBottom: 12 }} />}
            <div style={{ display: "flex", gap: 8 }}>
              <div className="sk" style={{ width: 50, height: 28, borderRadius: 20 }} />
              <div className="sk" style={{ width: 50, height: 28, borderRadius: 20 }} />
              <div className="sk" style={{ width: 50, height: 28, borderRadius: 20 }} />
            </div>
          </div>
        ))}
        {/* Alt nav skeleton */}
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 60, background: skSurface, borderTop: "1px solid rgba(0,0,0,0.07)", display: "flex", justifyContent: "space-around", alignItems: "center", padding: "0 8px" }}>
          {[0,1,2,3,4].map(i => <div key={i} className="sk" style={{ width: 28, height: 28, borderRadius: 8 }} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 90 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{display:none;}@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:none;}}@keyframes spin{to{transform:rotate(360deg);}}@keyframes popIn{from{opacity:0;transform:scale(0.85);}to{opacity:1;transform:scale(1);}}input,textarea,button{font-family:inherit;}a{text-decoration:none;color:inherit;}input::placeholder,textarea::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"}}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.96)" : "rgba(244,246,251,0.96)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "0 16px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => setDrawer(true)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", padding: 0 }}>
          <Av url={avatarUrl} size={36} dk={dk} />
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.text, lineHeight: 1 }}>Scriptify</p>
            <p style={{ fontSize: 10, color: TEAL, fontWeight: 600 }}>Ana Sayfa</p>
          </div>
        </button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <a href="/bildirimler" style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", background: C.input, border: "1px solid " + C.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" fill="none" stroke={C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
            {bildirimSayisi > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 17, height: 17, borderRadius: "50%", background: ACCENT, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid " + C.bg }}>{bildirimSayisi}</span>}
          </a>
          <a href="/uret" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 20, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", boxShadow: "0 3px 12px " + ACCENT + "35" }}>
            <span style={{ fontSize: 14 }}>🎬</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Üret</span>
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <StoryBar dk={dk} C={C} user={user} avatarUrl={avatarUrl} />

        {!user && (
          <div style={{ margin: "16px", background: "linear-gradient(135deg," + TEAL + "12," + ACCENT + "08)", border: "1px solid " + TEAL + "20", borderRadius: 20, padding: "22px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 6 }}>Scriptify'a Hoş Geldin! 🎬</p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 18, lineHeight: 1.6 }}>AI ile senaryo üret, topluluğa katıl, yaratıcıları takip et.</p>
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: typeof window !== "undefined" ? window.location.origin : "" } })} style={{ padding: "11px 28px", borderRadius: 14, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 14, fontWeight: 700 }}>Google ile Giriş</button>
          </div>
        )}

        {/* Feed sekmeleri */}
        <div style={{ display: "flex", background: C.surface, borderBottom: "1px solid " + C.border, position: "sticky", top: 56, zIndex: 40 }}>
          {[{ id: "son", label: "En Son" }, { id: "trend", label: "Trend 🔥" }].map(s => (
            <button key={s.id} onClick={() => { setFeedSekme(s.id); setSayfa(0); setDahaVar(true); loadFeed(s.id, 0, []); }} style={{ flex: 1, padding: "14px 8px", background: "none", border: "none", borderBottom: feedSekme === s.id ? "2px solid " + TEAL : "2px solid transparent", color: feedSekme === s.id ? TEAL : C.muted, fontSize: 14, fontWeight: feedSekme === s.id ? 700 : 500, marginBottom: -1 }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Gönderiler */}
        <div>
          {gonderiler.length === 0 ? (
            <div style={{ textAlign: "center", padding: "70px 20px" }}>
              <p style={{ fontSize: 48, marginBottom: 14 }}>✍️</p>
              <p style={{ fontSize: 15, color: C.muted, marginBottom: 20 }}>İlk paylaşımı sen yap!</p>
              {user && <button onClick={() => setGonderiModal(true)} style={{ padding: "11px 28px", borderRadius: 14, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 14, fontWeight: 700 }}>Paylaş</button>}
            </div>
          ) : gonderiler.map((g, i) => (
            <div key={g.id} style={{ borderBottom: "1px solid " + C.border, background: C.surface, animation: i < 5 ? "fadeUp 0.2s " + (i * 0.03) + "s both" : "none" }}>
              {/* Yazar */}
              <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: 10 }}>
                <a href={"/@" + g.profiles?.username}><Av url={g.profiles?.avatar_url} size={40} dk={dk} /></a>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <a href={"/@" + g.profiles?.username} style={{ fontSize: 14, fontWeight: 700, color: C.text }}>@{g.profiles?.username || "anonim"}</a>
                    {g.profiles?.dogrulandi && <span style={{ fontSize: 12, color: TEAL }}>✓</span>}
                  </div>
                  <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{zaman(g.created_at)}</p>
                </div>
                <button onClick={() => setMenuId(menuId === g.id ? null : g.id)} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, padding: "0 4px", lineHeight: 1 }}>⋯</button>
              </div>

              {/* Menü */}
              {menuId === g.id && (
                <div style={{ margin: "0 16px 10px", background: C.input, border: "1px solid " + C.border, borderRadius: 14, overflow: "hidden" }}>
                  {user && g.profiles?.id === user.id ? <>
                    <button onClick={() => { setDuzenleId(g.id); setDuzenleMetin(g.metin || ""); setMenuId(null); }} style={{ display: "block", width: "100%", padding: "12px 16px", background: "none", border: "none", color: C.text, fontSize: 14, textAlign: "left", borderBottom: "1px solid " + C.border }}>✏️  Düzenle</button>
                    <button onClick={() => gonderiSil(g.id)} style={{ display: "block", width: "100%", padding: "12px 16px", background: "none", border: "none", color: ACCENT, fontSize: 14, textAlign: "left" }}>🗑️  Sil</button>
                  </> : (
                    <button onClick={() => { setRaporModal(g.id); setMenuId(null); }} style={{ display: "block", width: "100%", padding: "12px 16px", background: "none", border: "none", color: ACCENT, fontSize: 14, textAlign: "left" }}>🚩  Raporla</button>
                  )}
                </div>
              )}

              {/* İçerik */}
              <div style={{ padding: "0 16px 12px" }}>
                {duzenleId === g.id ? (
                  <div>
                    <textarea value={duzenleMetin} onChange={e => setDuzenleMetin(e.target.value)} rows={3} style={{ width: "100%", background: C.input, border: "1.5px solid " + TEAL, borderRadius: 12, padding: "10px 14px", color: C.text, fontSize: 14, outline: "none", resize: "none", marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => gonderiDuzenle(g.id)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 13, fontWeight: 700 }}>Kaydet</button>
                      <button onClick={() => setDuzenleId(null)} style={{ flex: 1, padding: "10px", borderRadius: 10, background: C.input, border: "1px solid " + C.border, color: C.muted, fontSize: 13 }}>İptal</button>
                    </div>
                  </div>
                ) : <>
                  {g.metin && <MentionText metin={g.metin} />}
                  {g.fotograf_url && <img src={g.fotograf_url} style={{ width: "100%", borderRadius: 14, marginTop: 10, maxHeight: 400, objectFit: "cover", display: "block" }} alt="" />}
                </>}
              </div>

              {/* Aksiyon butonları */}
              <div style={{ display: "flex", borderTop: "1px solid " + C.border }}>
                <button onClick={() => begeniToggle(g.id, g.begeni_sayisi)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "11px 0", background: "none", border: "none", color: begeniler.includes(g.id) ? ACCENT : C.muted, fontSize: 13, fontWeight: begeniler.includes(g.id) ? 700 : 400, borderRight: "1px solid " + C.border }}>
                  <svg width="15" height="15" fill={begeniler.includes(g.id) ? ACCENT : "none"} stroke={begeniler.includes(g.id) ? ACCENT : C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
                  {g.begeni_sayisi || 0}
                </button>
                <button onClick={() => yorumAc(g.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "11px 0", background: "none", border: "none", color: yorumId === g.id ? TEAL : C.muted, fontSize: 13, borderRight: "1px solid " + C.border }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                  {(yorumlar[g.id] || []).length || ""}
                </button>
                {g.goruntuleme_sayisi > 0 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "11px 0", color: C.muted, fontSize: 13, borderRight: "1px solid " + C.border }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    {g.goruntuleme_sayisi}
                  </div>
                )}
                <button onClick={() => gonderiPaylasDM(g)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "11px 0", background: "none", border: "none", color: C.muted, fontSize: 13, borderRight: "1px solid " + C.border }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                </button>
                <button onClick={() => kaydetToggle(g.id)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "11px 0", background: "none", border: "none", color: kaydedilenler.includes(g.id) ? TEAL : C.muted, fontSize: 13 }}>
                  <svg width="15" height="15" fill={kaydedilenler.includes(g.id) ? TEAL : "none"} stroke={kaydedilenler.includes(g.id) ? TEAL : C.muted} strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
                </button>
              </div>

              {/* Yorumlar */}
              {yorumId === g.id && (
                <div style={{ padding: "14px 16px", borderTop: "1px solid " + C.border, background: C.input }}>
                  {(yorumlar[g.id] || []).map((y, yi) => (
                    <div key={y.id || yi} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                      <Av url={y.profiles?.avatar_url} size={30} dk={dk} />
                      <div style={{ flex: 1, background: C.surface, borderRadius: 12, padding: "8px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>@{y.profiles?.username}</span>
                          {user && y.user_id === user.id && <button onClick={() => yorumSil(y.id, g.id)} style={{ background: "none", border: "none", color: ACCENT, fontSize: 11 }}>sil</button>}
                        </div>
                        <p style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{y.metin}</p>
                      </div>
                    </div>
                  ))}
                  {user ? (
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      <Av url={avatarUrl} size={30} dk={dk} />
                      <input value={yorumMetin} onChange={e => setYorumMetin(e.target.value)} onKeyDown={e => e.key === "Enter" && yorumGonder(g.id)} placeholder="Yorum yaz..." style={{ flex: 1, background: C.surface, border: "1px solid " + C.border, borderRadius: 20, padding: "8px 14px", color: C.text, fontSize: 13, outline: "none" }} />
                      <button onClick={() => yorumGonder(g.id)} style={{ padding: "8px 14px", borderRadius: 20, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 12, fontWeight: 700 }}>Gönder</button>
                    </div>
                  ) : <p style={{ fontSize: 12, color: C.muted, textAlign: "center" }}>Yorum için <a href="/" style={{ color: TEAL }}>giriş yap</a></p>}
                </div>
              )}
            </div>
          ))}

          {/* Sonsuz scroll tetikleyici */}
          <div ref={altRef} style={{ padding: "20px 0", textAlign: "center" }}>
            {scrollYukleniyor && <div style={{ width: 28, height: 28, margin: "0 auto", borderRadius: "50%", border: "3px solid " + TEAL + "25", borderTopColor: TEAL, animation: "spin 0.7s linear infinite" }} />}
            {!dahaVar && gonderiler.length > 0 && <p style={{ fontSize: 12, color: C.muted }}>Hepsi bu kadar ✨</p>}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => user ? setGonderiModal(true) : setAuthModal(true)} style={{ position: "fixed", bottom: 84, right: 20, zIndex: 150, width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", boxShadow: "0 6px 24px " + TEAL + "50", display: "flex", alignItems: "center", justifyContent: "center", animation: "popIn 0.3s ease" }}>
        <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
      </button>

      <AltNav C={C} />

      {gonderiModal && <GonderiModal dk={dk} C={C} user={user} avatarUrl={avatarUrl} onClose={() => setGonderiModal(false)} onPaylas={gonderiPaylas} />}
      {drawer && <Drawer dk={dk} C={C} user={user} username={username} avatarUrl={avatarUrl} onClose={() => setDrawer(false)} onTema={temaToggle} />}

      {raporModal && (
        <>
          <div onClick={() => setRaporModal(null)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 401, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: dk ? "#0f1829" : "#fff", borderRadius: 24, padding: 24, maxWidth: 340, width: "100%", animation: "popIn 0.2s ease" }}>
              <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 16 }}>🚩 Neden raporluyorsun?</p>
              {["Uygunsuz içerik", "Spam", "Yanlış bilgi", "Nefret söylemi", "Diğer"].map(sebep => (
                <button key={sebep} onClick={async () => { await supabase.from("raporlar").insert([{ rapor_eden: user.id, gonderi_id: raporModal, sebep }]); setRaporModal(null); alert("Raporun alındı."); }} style={{ display: "block", width: "100%", padding: "12px 16px", marginBottom: 8, borderRadius: 12, border: "1px solid " + C.border, background: C.input, color: C.text, fontSize: 14, textAlign: "left" }}>{sebep}</button>
              ))}
              <button onClick={() => setRaporModal(null)} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "none", border: "none", color: C.muted, fontSize: 14 }}>İptal</button>
            </div>
          </div>
        </>
      )}

      {authModal && (
        <>
          <div onClick={() => setAuthModal(false)} style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 401, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: dk ? "#0f1829" : "#fff", borderRadius: 24, padding: 28, maxWidth: 340, width: "100%", textAlign: "center", animation: "popIn 0.2s ease" }}>
              <p style={{ fontSize: 32, marginBottom: 12 }}>🔐</p>
              <p style={{ fontSize: 17, fontWeight: 800, color: C.text, marginBottom: 8 }}>Giriş Yap</p>
              <p style={{ fontSize: 14, color: C.muted, marginBottom: 20 }}>Bu özelliği kullanmak için giriş yapman gerekiyor.</p>
              <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: typeof window !== "undefined" ? window.location.origin : "" } })} style={{ width: "100%", padding: "13px", borderRadius: 14, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Google ile Giriş</button>
              <button onClick={() => setAuthModal(false)} style={{ width: "100%", padding: "12px", borderRadius: 14, background: "none", border: "none", color: C.muted, fontSize: 14 }}>Vazgeç</button>
            </div>
          </div>
        </>
      )}
      {onboarding && <Onboarding dk={dk} onClose={() => setOnboarding(false)} />}
    </div>
  );
}
