import { useRouter } from "next/router";
import SocialLayout from "../../components/social/Layout";
import Feed from "../../components/social/Feed";
import { normalizeTag } from "../../lib/social-client";
export default function Hashtag() {
  const router = useRouter();
  const tag = normalizeTag(
    typeof router.query.tag === "string" ? router.query.tag : "",
  );
  return (
    <SocialLayout
      title={tag ? `#${tag}` : "Etiket"}
      subtitle="Aynı temada buluşan hikâyeler."
    >
      {router.isReady && tag ? (
        <Feed tag={tag} />
      ) : (
        <p className="muted">Etiket yükleniyor…</p>
      )}
    </SocialLayout>
  );
}
