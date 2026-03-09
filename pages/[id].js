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

export default function SenaryoDetay() {
  var router = useRouter();
  var { id } = router.query;
  var [user, setUser] = useState(null);
  var [senaryo, setSenaryo] = useState(null);
  var [yorumlar, setYorumlar] = useState([]);
  var [yorumYeni, setYorumYeni] = useState("");
  var [begendi, setBegendi] = useState(false);
  var [tema, setTema] = useState("light");
  var [loaded, setLoaded] = useState(false);
  var [yukleniyor, setYukleniyor] = useState(true);
  var [yorumGonder, setYorumGonder] = useState(false);
  var [kopyalandi, setKopyalandi] = useState(false);
  var [ortakDavet, setOrtakDavet] = useState(false);
  var [davetEmail, setDavetEmail] = useState("");

  var dk = tema === "dark";
  var C = getC(dk);

  useEffect(() => {
    try { setTema(localStorage.getItem("sf_tema") || "light"); } catch (e) {}
    setTimeout(() => setLoaded(true), 80);
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setUser(data.session.user);
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    yukle();
  }, [id]);

  async function yukle() {
    setYukleniyor(true);
    var { data: s } = await supabase.from("senaryolar")
      .select("*, profiles(id, username, avatar_url, bio)")
      .eq("id", id).single();
    if (s) {
      setSenaryo(s);
      // Görüntüleme artır
      supabase.from("senaryolar").update({ goruntuleme_sayisi: (s.goruntuleme_sayisi || 0) + 1 }).eq("id", id);
    }
    var { data: y } = await supabase.from("yorumlar")
      .select("*, profiles(username, avatar_url)")
      .eq("senaryo_id", id).order("created_at", { ascending: true });
    if (y) setYorumlar(y);
    setYukleniyor(false);
  }

  async function begeniToggle() {
    if (!user || !senaryo) return;
    if (begendi) return;
    setBegendi(true);
    await supabase.from("senaryolar").update({ begeni_sayisi: (senaryo.begeni_sayisi || 0) + 1 }).eq("id", id);
    setSenaryo(s => ({ ...s, begeni_sayisi: (s.begeni_sayisi || 0) + 1 }));
    if (senaryo.profiles?.id && senaryo.profiles.id !== user.id) {
      supabase.from("bildirimler").insert([{ alici_id: senaryo.profiles.id, gonderen_id: user.id, tip: "begeni", senaryo_id: senaryo.id }]);
    }
  }

  async function yorumYolla() {
    if (!user || !yorumYeni.trim()) return;
    setYorumGonder(true);
    var { data: yeni } = await supabase.from("yorumlar")
      .insert([{ user_id: user.id, senaryo_id: senaryo.id, metin: yorumYeni.trim() }])
      .select("*, profiles(username, avatar_url)").single();
    if (yeni) {
      setYorumlar(p => [...p, yeni]);
      setYorumYeni("");
      if (senaryo.profiles?.id && senaryo.profiles.id !== user.id) {
        supabase.from("bildirimler").insert([{ alici_id: senaryo.profiles.id, gonderen_id: user.id, tip: "yorum", icerik: yorumYeni.trim().slice(0, 80), senaryo_id: senaryo.id }]);
      }
    }
    setYorumGonder(false);
  }

  function linkKopyala() {
    try {
      navigator.clipboard.writeText(window.location.href);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch (e) {}
  }

  function zaman(ts) {
    var d = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (d < 3600) return Math.floor(d / 60) + "dk önce";
    if (d < 86400) return Math.floor(d / 3600) + "sa önce";
    return Math.floor(d / 86400) + "g önce";
  }

  if (!loaded) return null;
  if (yukleniyor) return (
    <div style={{ minHeight: "100vh", background: dk ? "#080f1c" : "#eef2f7", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(8,145,178,0.2)", borderTopColor: TEAL, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
  if (!senaryo) return (
    <div style={{ minHeight: "100vh", background: dk ? "#080f1c" : "#eef2f7", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "-apple-system,sans-serif" }}>
      <div style={{ textAlign: "center" }}><p style={{ fontSize: 44 }}>😕</p><p style={{ color: dk ? "#f1f5f9" : "#0f172a", marginTop: 12 }}>Senaryo bulunamadı.</p><a href="/topluluk" style={{ color: TEAL, display: "block", marginTop: 12, fontWeight: 700 }}>← Topluluğa dön</a></div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif", paddingBottom: 100 }}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}@keyframes spin{to{transform:rotate(360deg);}}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:${TEAL}44;border-radius:2px;}input::placeholder,textarea::placeholder{color:${dk ? "rgba(241,245,249,0.3)" : "rgba(15,23,42,0.3)"};}a{text-decoration:none;color:inherit;}button{font-family:inherit;}`}</style>

      {/* TOPBAR */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: dk ? "rgba(8,15,28,0.93)" : "rgba(238,242,247,0.93)", backdropFilter: "blur(20px)", borderBottom: "1px solid " + C.border, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>←</button>
        <p style={{ flex: 1, fontSize: 15, fontWeight: 800, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{senaryo.baslik}</p>
        <button onClick={linkKopyala} style={{ padding: "7px 14px", borderRadius: 20, background: kopyalandi ? "#10b981" : C.input, border: "1px solid " + (kopyalandi ? "#10b981" : C.border), color: kopyalandi ? "#fff" : C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
          {kopyalandi ? "✅" : "🔗"}
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>
        {/* Yazar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 46, height: 46, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
            {senaryo.profiles?.avatar_url ? <img src={senaryo.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>@{senaryo.profiles?.username || "anonim"}</p>
            <p style={{ fontSize: 11, color: C.muted }}>{zaman(senaryo.created_at)}</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: TEAL + "15", color: TEAL }}>{senaryo.tip}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: ACCENT + "12", color: ACCENT }}>{senaryo.tur}</span>
          </div>
        </div>

        {/* Başlık */}
        <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, marginBottom: 6, letterSpacing: "-0.03em", lineHeight: 1.2 }}>{senaryo.baslik}</h1>
        {senaryo.tagline && <p style={{ fontSize: 15, fontStyle: "italic", color: TEAL, marginBottom: 20, lineHeight: 1.5 }}>"{senaryo.tagline}"</p>}

        {/* İstatistikler */}
        <div style={{ display: "flex", gap: 16, padding: "12px 0", borderTop: "1px solid " + C.border, borderBottom: "1px solid " + C.border, marginBottom: 24 }}>
          {[["👁", senaryo.goruntuleme_sayisi || 0, "görüntülenme"], ["❤️", senaryo.begeni_sayisi || 0, "beğeni"], ["💬", yorumlar.length, "yorum"], ["🎯", senaryo.challenge_sayisi || 0, "challenge"]].map(([ic, n, lb]) => (
            <div key={lb} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{ic} {n}</p>
              <p style={{ fontSize: 10, color: C.muted }}>{lb}</p>
            </div>
          ))}
        </div>

        {/* Ana fikir */}
        {senaryo.ana_fikir && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>📖 Ana Fikir</p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: C.text }}>{senaryo.ana_fikir}</p>
          </div>
        )}

        {/* Karakterler */}
        {senaryo.karakter && (
          <div style={{ marginBottom: 20, background: C.surface, borderRadius: 16, padding: "16px 18px", border: "1px solid " + C.border }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>🎭 Karakterler</p>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: C.text, whiteSpace: "pre-wrap" }}>{senaryo.karakter}</p>
          </div>
        )}

        {/* Sahneler */}
        {senaryo.sahne && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>🎬 Sahneler</p>
            <div style={{ background: C.surface, borderRadius: 16, padding: "16px 18px", border: "1px solid " + C.border }}>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: C.text, whiteSpace: "pre-wrap" }}>{senaryo.sahne}</p>
            </div>
          </div>
        )}

        {/* Ortak yazarlık daveti */}
        <div style={{ background: "linear-gradient(135deg," + TEAL + "12," + TEAL_L + "08)", border: "1px solid " + TEAL + "25", borderRadius: 16, padding: "16px 18px", marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ortakDavet ? 12 : 0 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>🤝 Ortak Yazarlık</p>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Bu senaryoyu birlikte geliştir</p>
            </div>
            {user && user.id === senaryo.profiles?.id && (
              <button onClick={() => setOrtakDavet(!ortakDavet)} style={{ padding: "7px 14px", borderRadius: 20, background: ortakDavet ? C.input : "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: ortakDavet ? C.muted : "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {ortakDavet ? "İptal" : "+ Davet Et"}
              </button>
            )}
            {user && user.id !== senaryo.profiles?.id && (
              <button onClick={() => router.push("/uret?challenge=" + encodeURIComponent(senaryo.baslik) + "&tur=" + senaryo.tur + "&tip=" + senaryo.tip)} style={{ padding: "7px 14px", borderRadius: 20, background: "linear-gradient(135deg," + ACCENT + ",#c5180a)", border: "none", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                🎯 Challenge'ı Al
              </button>
            )}
          </div>
          {ortakDavet && (
            <div style={{ display: "flex", gap: 8 }}>
              <input value={davetEmail} onChange={e => setDavetEmail(e.target.value)} placeholder="@kullaniciadi veya e-posta" style={{ flex: 1, background: dk ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", border: "1px solid " + C.border, borderRadius: 12, padding: "9px 14px", color: C.text, fontSize: 13, outline: "none", fontFamily: "inherit" }} />
              <button onClick={() => { alert("Davet gönderildi! (yakında aktif)"); setOrtakDavet(false); setDavetEmail(""); }} style={{ padding: "9px 16px", borderRadius: 12, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Davet</button>
            </div>
          )}
        </div>

        {/* Yorumlar */}
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 14 }}>💬 Yorumlar ({yorumlar.length})</p>
          {yorumlar.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", background: C.surface, borderRadius: 16, marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.muted }}>İlk yorumu sen yap!</p>
            </div>
          ) : yorumlar.map((y, i) => (
            <div key={y.id || i} style={{ display: "flex", gap: 10, marginBottom: 12, animation: "fadeUp 0.25s " + (i * 0.04) + "s both ease" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                {y.profiles?.avatar_url ? <img src={y.profiles.avatar_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : "👤"}
              </div>
              <div style={{ flex: 1, background: C.surface, border: "1px solid " + C.border, borderRadius: 16, padding: "10px 14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: TEAL }}>@{y.profiles?.username || "anonim"}</span>
                  <span style={{ fontSize: 11, color: C.muted }}>{zaman(y.created_at)}</span>
                </div>
                <p style={{ fontSize: 14, color: C.text, lineHeight: 1.55 }}>{y.metin}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sabit alt bar - beğeni + yorum yaz */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: dk ? "rgba(8,15,28,0.97)" : "rgba(255,255,255,0.97)", backdropFilter: "blur(28px)", borderTop: "1px solid " + C.border, padding: "10px 16px env(safe-area-inset-bottom,10px)" }}>
        <div style={{ display: "flex", gap: 8, maxWidth: 680, margin: "0 auto" }}>
          <button onClick={begeniToggle} style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 14, border: "1.5px solid " + (begendi ? ACCENT + "40" : C.border), background: begendi ? ACCENT + "15" : C.input, color: begendi ? ACCENT : C.muted, fontSize: 18, cursor: "pointer" }}>
            {begendi ? "❤️" : "♡"}
          </button>
          {user ? (
            <>
              <input value={yorumYeni} onChange={e => setYorumYeni(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && yorumYolla()} placeholder="Yorumunu yaz..." style={{ flex: 1, background: C.surface, border: "1px solid " + C.border, borderRadius: 14, padding: "0 16px", color: C.text, fontSize: 14, outline: "none", height: 46, fontFamily: "inherit" }} />
              <button onClick={yorumYolla} disabled={yorumGonder || !yorumYeni.trim()} style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 14, background: yorumYeni.trim() ? "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")" : C.input, border: "none", color: yorumYeni.trim() ? "#fff" : C.muted, fontSize: 16, cursor: "pointer" }}>
                {yorumGonder ? "⏳" : "➤"}
              </button>
            </>
          ) : (
            <a href="/" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", height: 46, borderRadius: 14, background: "linear-gradient(135deg," + TEAL + "," + TEAL_L + ")", color: "#fff", fontSize: 13, fontWeight: 700 }}>Giriş yap → yorum yaz</a>
          )}
        </div>
      </div>
    </div>
  );
}
