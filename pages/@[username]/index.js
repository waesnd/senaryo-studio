import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { Button, Card, Badge } from "../../components/ui";
import SocialLayout, {
  Avatar,
  Notice,
  Empty,
} from "../../components/social/Layout";
import Feed from "../../components/social/Feed";
import { useAuth } from "../../lib/useAuth";
import {
  client,
  errorMessage,
  PROFILE_FIELDS,
  rpc,
  safeUrl,
  unwrap,
} from "../../lib/social-client";
export default function PublicProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null),
    [following, setFollowing] = useState(false),
    [blocked, setBlocked] = useState(false),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const epoch = useRef(0);
  const username =
    typeof router.query.username === "string" ? router.query.username : "";
  useEffect(() => {
    if (!router.isReady) return;
    const token = ++epoch.current;
    setProfile(null);
    setFollowing(false);
    setBlocked(false);
    setLoading(true);
    setError("");
    (async () => {
      const p = unwrap(
        await client()
          .from("profiles")
          .select(PROFILE_FIELDS)
          .eq("username", username)
          .maybeSingle(),
      );
      if (token !== epoch.current) return;
      setProfile(p);
      if (user && p && user.id !== p.id) {
        const results = await Promise.all([
          client()
            .from("takipler")
            .select("id")
            .eq("takip_eden", user.id)
            .eq("takip_edilen", p.id)
            .maybeSingle(),
          client()
            .from("engellemeler")
            .select("id")
            .eq("engelleyen", user.id)
            .eq("engellenen", p.id)
            .maybeSingle(),
        ]);
        const values = results.map(unwrap);
        if (token === epoch.current) {
          setFollowing(!!values[0]);
          setBlocked(!!values[1]);
        }
      }
    })()
      .catch((e) => {
        if (token === epoch.current) setError(errorMessage(e));
      })
      .finally(() => {
        if (token === epoch.current) setLoading(false);
      });
    return () => {
      epoch.current = token + 1;
    };
  }, [username, router.isReady, user]);
  async function relationship(type) {
    if (!user) {
      setError("Bu işlem için giriş yapmalısın.");
      return;
    }
    setBusy(type);
    setError("");
    try {
      if (type === "follow") {
        const result = await rpc("follow_profile", {
          p_profile_id: profile.id,
        });
        setFollowing(!!result.following);
        setProfile((p) => ({
          ...p,
          takipci_sayisi: Math.max(
            0,
            (p.takipci_sayisi || 0) + (result.following ? 1 : -1),
          ),
        }));
      } else {
        const result = await rpc("block_profile", { p_profile_id: profile.id });
        setBlocked(!!result.blocked);
        if (result.blocked) setFollowing(false);
      }
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  const website = safeUrl(profile?.website),
    banner = safeUrl(profile?.banner_url);
  return (
    <SocialLayout
      title={
        profile ? profile.nickname || "@" + profile.username : "Yazar profili"
      }
      subtitle="Hikâyeleri ve onları anlatan yazarı tanı."
    >
      <Notice error={error} />
      {loading ? (
        <p role="status" className="muted">
          Yazar yükleniyor…
        </p>
      ) : !profile ? (
        <Empty
          title="Bu profil bulunamadı."
          description="Kullanıcı adını kontrol edebilir veya yazarları arayabilirsin."
          href="/arama"
          action="Yazar ara"
        />
      ) : (
        <>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="social-profile-cover">
              {banner && <img src={banner} alt="" />}
            </div>
            <div className="social-profile-content">
              <Avatar profile={profile} size={84} />
              <div style={{ flex: 1 }}>
                <div className="cluster">
                  <h2
                    style={{ fontFamily: "var(--font-display)", fontSize: 30 }}
                  >
                    {profile.nickname || profile.username}
                  </h2>
                  {profile.dogrulandi && (
                    <Badge tone="accent">Doğrulanmış</Badge>
                  )}
                </div>
                <p className="muted small">@{profile.username}</p>
                <div className="social-stat">
                  <span>
                    <strong>{profile.senaryo_sayisi || 0}</strong>eser
                  </span>
                  <span>
                    <strong>{profile.takipci_sayisi || 0}</strong>takipçi
                  </span>
                  <span>
                    <strong>{profile.takip_sayisi || 0}</strong>takip
                  </span>
                </div>
                <p className="social-profile-bio">
                  {profile.bio || "Yazar henüz kendini tanıtmadı."}
                </p>
                {website && (
                  <a
                    className="small"
                    style={{ color: "var(--accent)" }}
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Websitesi ↗
                  </a>
                )}
                <div className="cluster" style={{ marginTop: 20 }}>
                  {user?.id === profile.id ? (
                    <a className="btn btn-secondary" href="/profil">
                      Profili düzenle
                    </a>
                  ) : (
                    <>
                      <Button
                        variant={following ? "secondary" : "primary"}
                        loading={busy === "follow"}
                        disabled={blocked || !!busy}
                        onClick={() => relationship("follow")}
                      >
                        {following ? "Takibi bırak" : "Takip et"}
                      </Button>
                      {!blocked && (
                        <a
                          href={`/mesajlar?chat=${profile.id}`}
                          className="btn btn-secondary"
                        >
                          Mesaj gönder
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        loading={busy === "block"}
                        disabled={!!busy}
                        onClick={() => relationship("block")}
                      >
                        {blocked ? "Engeli kaldır" : "Engelle"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
          {blocked ? (
            <Empty
              title="Bu yazarı engelledin."
              description="İçeriklerini görmek ve mesajlaşmak için engeli kaldırabilirsin."
            />
          ) : (
            <>
              <div className="social-section-head">
                <h2>Yayınlanan eserler</h2>
              </div>
              <Feed ownerId={profile.id} />
            </>
          )}
        </>
      )}
    </SocialLayout>
  );
}
