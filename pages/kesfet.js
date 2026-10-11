import SocialLayout from "../components/social/Layout";
import Feed from "../components/social/Feed";
export default function Discover() {
  return (
    <SocialLayout
      title="Yeni dünyalar keşfet."
      subtitle="Topluluğun yayınladığı senaryoları oku, beğen ve kitaplığına ekle."
      actions={
        <a href="/arama" className="btn btn-secondary">
          Yazar ara
        </a>
      }
    >
      <Feed allowFollowing />
    </SocialLayout>
  );
}
