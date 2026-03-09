// profil.js'e eklenecek rozet bölümü
// Tab listesine "rozetler" ekle ve aşağıdaki bölümü render et

// ROZET_BILGI sabiti (dosyanın başına ekle):
var ROZET_BILGI = {
  ilk_senaryo: { icon: "🎬", label: "İlk Senaryo", renk: "#0891b2", aciklama: "İlk senaryonu ürettin!" },
  trend: { icon: "🔥", label: "Trend Oldu", renk: "#f59e0b", aciklama: "Senaryonun trend'e girdi!" },
  on_begeni: { icon: "❤️", label: "10 Beğeni", renk: "#e8230a", aciklama: "10 beğeni aldın!" },
  elli_begeni: { icon: "💎", label: "50 Beğeni", renk: "#7c3aed", aciklama: "50 beğeni aldın!" },
  challenge_king: { icon: "🏆", label: "Challenge King", renk: "#10b981", aciklama: "5 challenge'a katıldın!" },
};

// yukle() fonksiyonuna ekle:
// supabase.from("rozetler").select("*").eq("user_id", u.id).then(({ data }) => { if (data) setRozetler(data); });

// Tab render (tab === "rozetler"):
/*
{tab === "rozetler" && (
  rozetler.length === 0
    ? <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ fontSize: 44, marginBottom: 12 }}>🏆</p>
        <p style={{ fontSize: 14, color: C.muted }}>Henüz rozet kazanmadın.</p>
        <p style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Senaryo üret, beğeni al, challenge'a katıl!</p>
      </div>
    : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {rozetler.map((r, i) => {
          var bilgi = ROZET_BILGI[r.tip] || { icon: "⭐", label: r.tip, renk: TEAL, aciklama: "" };
          return (
            <div key={r.id} style={{ background: C.surface, border: "2px solid " + bilgi.renk + "30", borderRadius: 18, padding: "20px 16px", textAlign: "center", boxShadow: "0 4px 16px " + bilgi.renk + "15" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{bilgi.icon}</div>
              <p style={{ fontSize: 13, fontWeight: 800, color: bilgi.renk, marginBottom: 4 }}>{bilgi.label}</p>
              <p style={{ fontSize: 11, color: C.muted }}>{bilgi.aciklama}</p>
              <p style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{new Date(r.created_at).toLocaleDateString("tr-TR")}</p>
            </div>
          );
        })}
      </div>
)}
*/
