import { Badge, Card } from "../components/ui";
import { useAuth } from "../lib/useAuth";
import SocialLayout from "../components/social/Layout";
import Feed from "../components/social/Feed";

export default function Home() {
  const { user, profil, authHazir } = useAuth();
  return (
    <SocialLayout
      title={user ? "Çalışma alanın" : "Hikâyenin bir sonraki sahnesi."}
      subtitle={user ? "Yaz, geliştir, paylaş. Kendi ritminde." : undefined}
      hideSidebar={!user}
      actions={
        user ? (
          <a className="btn btn-primary" href="/uret">
            Yeni senaryo ↗
          </a>
        ) : undefined
      }
    >
      {!user && (
        <>
          <section className="social-hero">
            <div className="social-eyebrow">
              Senaryo Studio / Yazarın masası
            </div>
            <h1>
              Bir fikirden,
              <br />
              <span style={{ color: "var(--accent)" }}>anlatılmaya değer</span>
              <br />
              bir hikâyeye.
            </h1>
            <p>
              Karakterlerini tanı. Sahnelerini kur. Taslaklarını güvenle sakla.
              Yapay zekâdan istediğin yerde destek al; hikâyenin kontrolü sende
              kalsın.
            </p>
            <div className="cluster">
              <a className="btn btn-primary btn-lg" href="/uret">
                İlk sahneni yaz ↗
              </a>
              <a className="btn btn-secondary btn-lg" href="/kesfet">
                Hikâyeleri keşfet
              </a>
            </div>
          </section>
          <div className="social-features">
            {[
              {
                no: "01",
                title: "Düşünmek için alan",
                text: "Karakterler, sahneler ve hikâye yapısı aynı masada. Fikrini kaybetmeden farklı yönleri dene.",
              },
              {
                no: "02",
                title: "Emeğini koruyan araçlar",
                text: "Otomatik taslak, sürüm geçmişi ve kontrollü yayınlama. Her düzenlemede önceki çalışmana dönebil.",
              },
              {
                no: "03",
                title: "Birlikte daha güçlü",
                text: "Yazarları takip et, okumak istediğin eserleri kaydet ve senaryolar üzerine geri bildirim paylaş.",
              },
            ].map((item) => (
              <Card className="social-feature" key={item.no}>
                <Badge tone="accent">{item.no}</Badge>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </Card>
            ))}
          </div>
        </>
      )}
      {user && (
        <Card style={{ marginBottom: 26 }}>
          <div
            className="cluster"
            style={{ justifyContent: "space-between", padding: 8 }}
          >
            <div>
              <p className="social-eyebrow" style={{ marginBottom: 8 }}>
                Hoş geldin, {profil?.nickname || profil?.username || "yazar"}
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 30,
                }}
              >
                Bugün hangi hikâyeyi anlatacaksın?
              </h2>
              <p className="muted small" style={{ marginTop: 10 }}>
                Taslaklarını kitaplığından aç veya yeni bir fikirle başla.
              </p>
            </div>
            <a href="/kaydedilenler" className="btn btn-secondary">
              Kitaplığım →
            </a>
          </div>
        </Card>
      )}
      <div className="social-section-head">
        <h2>{user ? "Okuma akışın" : "Topluluktan hikâyeler"}</h2>
        <a href="/topluluk" className="small muted">
          Yazarlara katıl ↗
        </a>
      </div>
      {authHazir ? (
        <Feed allowFollowing={!!user} />
      ) : (
        <p className="muted" role="status">
          Çalışma alanı hazırlanıyor…
        </p>
      )}
    </SocialLayout>
  );
}
