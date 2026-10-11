import { useEffect, useRef, useState } from "react";
import { Button, Card, Field, Input, Textarea } from "../components/ui";
import SocialLayout, {
  AuthRequired,
  Avatar,
  Notice,
} from "../components/social/Layout";
import Feed from "../components/social/Feed";
import { useAuth } from "../lib/useAuth";
import {
  client,
  errorMessage,
  safeUrl,
  unwrap,
  uploadMedia,
} from "../lib/social-client";
export default function Profile() {
  const { user, profil, profilYenile } = useAuth();
  const avatarInput = useRef(null),
    bannerInput = useRef(null);
  const [form, setForm] = useState({
      username: "",
      nickname: "",
      bio: "",
      website: "",
    }),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  useEffect(() => {
    setForm({
      username: profil?.username || "",
      nickname: profil?.nickname || "",
      bio: profil?.bio || "",
      website: profil?.website || "",
    });
    setError("");
    setSuccess("");
  }, [
    profil?.id,
    profil?.username,
    profil?.nickname,
    profil?.bio,
    profil?.website,
    user?.id,
  ]);
  async function save(e) {
    e.preventDefault();
    if (!user) return;
    setBusy("save");
    setError("");
    setSuccess("");
    try {
      const username = form.username.trim().toLocaleLowerCase("en-US");
      if (!/^[a-z0-9_]{3,30}$/.test(username))
        throw new Error(
          "Kullanıcı adı 3–30 karakter olmalı; küçük harf, sayı ve alt çizgi kullanabilirsin.",
        );
      if (form.website.trim() && !safeUrl(form.website.trim()))
        throw new Error("Website adresi https:// veya http:// ile başlamalı.");
      const payload = {
        username,
        nickname: form.nickname.trim().slice(0, 80),
        bio: form.bio.trim().slice(0, 1000),
        website: safeUrl(form.website.trim()) || null,
      };
      unwrap(
        await client()
          .from("profiles")
          .update(payload)
          .eq("id", user.id)
          .select("id")
          .single(),
      );
      await profilYenile();
      setSuccess("Profilin kaydedildi.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  async function image(e, purpose) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(purpose);
    setError("");
    setSuccess("");
    try {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
        throw new Error("JPEG, PNG veya WebP görsel seç.");
      const { asset } = await uploadMedia(file, purpose);
      if (!safeUrl(asset.url))
        throw new Error("Yüklenen görsel doğrulanamadı.");
      unwrap(
        await client()
          .from("profiles")
          .update({ [purpose + "_url"]: asset.url })
          .eq("id", user.id)
          .select("id")
          .single(),
      );
      await profilYenile();
      setSuccess("Görsel güncellendi.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy("");
    }
  }
  return (
    <SocialLayout
      title="Yazar profilin."
      subtitle="Kendini tanıt, eserlerini yönet, okurlarınla buluş."
      actions={
        profil?.username ? (
          <a className="btn btn-secondary" href={`/@${profil.username}`}>
            Herkese açık profil ↗
          </a>
        ) : null
      }
    >
      <AuthRequired>
        <Notice error={error} success={success} />
        <div className="social-columns">
          <Card>
            <form onSubmit={save} className="social-form">
              <div className="cluster">
                <Avatar profile={profil} size={76} />
                <div className="stack">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!!busy}
                    onClick={() => avatarInput.current?.click()}
                  >
                    {busy === "avatar" ? "Yükleniyor…" : "Profil fotoğrafı"}
                  </Button>
                  <input
                    ref={avatarInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    disabled={!!busy}
                    onChange={(e) => image(e, "avatar")}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!!busy}
                    onClick={() => bannerInput.current?.click()}
                  >
                    {busy === "banner" ? "Yükleniyor…" : "Kapak fotoğrafı"}
                  </Button>
                  <input
                    ref={bannerInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    disabled={!!busy}
                    onChange={(e) => image(e, "banner")}
                  />
                </div>
              </div>
              <Field
                label="Kullanıcı adı"
                htmlFor="username"
                hint="Küçük harf, sayı ve alt çizgi; 3–30 karakter."
              >
                <Input
                  id="username"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  maxLength={30}
                  required
                  autoComplete="username"
                />
              </Field>
              <Field label="Görünen ad" htmlFor="nickname">
                <Input
                  id="nickname"
                  value={form.nickname}
                  onChange={(e) =>
                    setForm({ ...form, nickname: e.target.value })
                  }
                  maxLength={80}
                  autoComplete="name"
                />
              </Field>
              <Field
                label="Hakkında"
                htmlFor="bio"
                hint={`${form.bio.length}/1000`}
              >
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  maxLength={1000}
                  rows={5}
                  placeholder="Hangi hikâyeleri anlatmayı seviyorsun?"
                />
              </Field>
              <Field label="Website" htmlFor="website">
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                  maxLength={500}
                  placeholder="https://"
                />
              </Field>
              <Button type="submit" loading={busy === "save"} disabled={!!busy}>
                Değişiklikleri kaydet
              </Button>
            </form>
          </Card>
          <aside className="social-note">
            <strong>İyi bir tanışma.</strong>
            <p>
              Birkaç cümleyle ilgi alanlarını ve üzerinde çalıştığın hikâyeleri
              anlat.
            </p>
            <p>
              Eserlerin varsayılan olarak özeldir. Paylaşmak istediğin eserleri
              kitaplığından yayınlayabilirsin.
            </p>
          </aside>
        </div>
        <div className="social-section-head">
          <h2>Eserlerin</h2>
          <a className="btn btn-secondary" href="/uret">
            Yeni senaryo
          </a>
        </div>
        {user && <Feed ownerId={user.id} editable />}
      </AuthRequired>
    </SocialLayout>
  );
}
