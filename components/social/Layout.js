import AppShell from "../AppShell";
import { Alert, Card, Button } from "../ui";
import { useAuth } from "../../lib/useAuth";
import { safeUrl } from "../../lib/social-client";

export function Avatar({ profile, size = 42 }) {
  const url = safeUrl(profile?.avatar_url);
  return (
    <span className="social-avatar" style={{ width: size, height: size }}>
      {url ? (
        <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" />
      ) : (
        <span>
          {(profile?.nickname || profile?.username || "S")
            .slice(0, 1)
            .toLocaleUpperCase("tr-TR")}
        </span>
      )}
    </span>
  );
}
export function AuthRequired({ children }) {
  const { user, authHazir } = useAuth();
  if (!authHazir)
    return (
      <p className="muted" role="status">
        Hesap bilgileri yükleniyor…
      </p>
    );
  if (!user)
    return (
      <Card>
        <div className="stack">
          <h2>Çalışma alanın seni bekliyor.</h2>
          <p className="muted">
            Eserlerini, mesajlarını ve kayıtlarını görmek için giriş yap.
          </p>
          <a className="btn btn-primary" href="/giris">
            Giriş yap
          </a>
        </div>
      </Card>
    );
  return children;
}
export function Notice({ error, success }) {
  return (
    <>
      {error && (
        <Alert tone="danger" title="İşlem tamamlanamadı">
          {error}
        </Alert>
      )}
      {success && <Alert tone="success">{success}</Alert>}
    </>
  );
}
export function Empty({ title, description, href, action }) {
  return (
    <Card className="social-empty">
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      {href && (
        <a className="btn btn-secondary" href={href}>
          {action || "Yeni senaryo"}
        </a>
      )}
    </Card>
  );
}
export function LoadMore({ more, loading, onClick }) {
  return more ? (
    <div className="social-more">
      <Button variant="secondary" loading={loading} onClick={onClick}>
        Daha fazla göster
      </Button>
    </div>
  ) : null;
}
export function ProfileCard({ profile }) {
  return (
    <a
      className="social-person"
      href={`/@${encodeURIComponent(profile.username || "")}`}
    >
      <Avatar profile={profile} size={52} />
      <div>
        <strong>{profile.nickname || profile.username}</strong>
        <p className="muted small">@{profile.username}</p>
        {profile.bio && <p className="small social-clamp">{profile.bio}</p>}
      </div>
    </a>
  );
}
export default function SocialLayout(props) {
  return (
    <AppShell {...props}>
      {props.children}
      <style jsx global>{`
        .social-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px;
        }
        .social-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .social-avatar {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: var(--accent-soft, #e4eee8);
          color: var(--accent, #16635b);
          font-weight: 700;
          overflow: hidden;
        }
        .social-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .social-person {
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px;
          border: 1px solid var(--border);
          background: var(--surface);
          border-radius: 16px;
          transition: border-color 0.2s;
        }
        .social-person:hover {
          border-color: var(--accent);
        }
        .social-empty {
          padding: 38px !important;
          text-align: center;
          display: grid;
          gap: 14px;
          justify-items: center;
        }
        .social-more {
          text-align: center;
          margin: 26px 0;
        }
        .social-clamp {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.7;
        }
        .social-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .social-author strong {
          overflow-wrap: anywhere;
          font-size: 13px;
        }
        .social-card {
          display: flex;
          flex-direction: column;
          gap: 18px;
          height: 100%;
          padding: 24px !important;
        }
        .social-card h2 {
          overflow-wrap: anywhere;
          font-family: var(--font-display, Georgia);
          font-size: 28px;
          line-height: 1.2;
          margin: 0;
        }
        .social-card-summary {
          line-height: 1.8;
          color: var(--muted);
          font-size: 14px;
        }
        .social-card-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 16px;
          margin-top: auto;
          border-top: 1px solid var(--border);
        }
        .social-card-actions {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
        }
        .social-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .social-tags a {
          font-size: 12px;
          color: var(--accent);
        }
        .social-hero {
          padding: 50px 0 38px;
          max-width: 850px;
        }
        .social-hero h1 {
          font-family: var(--font-display, Georgia);
          font-size: clamp(42px, 7vw, 76px);
          font-weight: 500;
          line-height: 1.05;
          letter-spacing: -0.045em;
        }
        .social-hero p {
          font-size: 18px;
          line-height: 1.8;
          max-width: 620px;
          color: var(--muted);
          margin: 24px 0;
        }
        .social-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-size: 11px;
          font-weight: 700;
          color: var(--accent);
          margin-bottom: 20px;
        }
        .social-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin: 38px 0;
        }
        .social-feature {
          padding: 25px !important;
        }
        .social-feature h2 {
          font-family: var(--font-display, Georgia);
          font-size: 24px;
          margin: 14px 0;
        }
        .social-feature p {
          font-size: 14px;
          line-height: 1.8;
          color: var(--muted);
        }
        .social-filter {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
          margin-bottom: 24px;
        }
        .social-filter form {
          display: flex;
          gap: 10px;
          flex: 1;
          min-width: 200px;
        }
        .social-filter input {
          flex: 1;
          min-width: 0;
        }
        .social-profile-cover {
          height: 150px;
          background: var(--accent-soft);
          border-radius: 18px 18px 0 0;
          overflow: hidden;
        }
        .social-profile-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .social-profile-content {
          padding: 28px;
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        .social-profile-bio {
          line-height: 1.8;
          max-width: 680px;
          white-space: pre-wrap;
        }
        .social-stat {
          display: flex;
          gap: 24px;
          margin: 16px 0;
          color: var(--muted);
          font-size: 13px;
        }
        .social-stat strong {
          color: var(--text);
          display: block;
          font-size: 22px;
        }
        .social-form {
          max-width: 720px;
          display: grid;
          gap: 22px;
        }
        .social-columns {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
        }
        .social-note {
          padding: 20px;
          border-left: 3px solid var(--accent);
          background: var(--accent-soft);
          font-size: 14px;
          line-height: 1.8;
        }
        .social-notification {
          display: flex;
          gap: 14px;
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }
        .social-notification.unread {
          background: var(--accent-soft);
        }
        .social-notification:last-child {
          border-bottom: none;
        }
        .social-notification p {
          margin: 4px 0;
          font-size: 14px;
        }
        .social-notification time {
          font-size: 12px;
          color: var(--muted);
        }
        .social-challenge {
          display: grid;
          gap: 18px;
          padding: 26px !important;
        }
        .social-challenge h2 {
          font-family: var(--font-display, Georgia);
          font-size: 28px;
        }
        .social-challenge p {
          white-space: pre-wrap;
          line-height: 1.8;
          color: var(--muted);
        }
        .social-challenge form {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .social-challenge select {
          flex: 1;
          min-width: 160px;
        }
        .social-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin: 28px 0 20px;
        }
        .social-section-head h2 {
          font-family: var(--font-display, Georgia);
          font-size: 30px;
          font-weight: 500;
        }
        .social-dialog {
          display: grid;
          gap: 18px;
        }
        .social-dialog textarea {
          min-height: 110px;
        }
        @media (max-width: 900px) {
          .social-columns {
            grid-template-columns: 1fr;
          }
          .social-features {
            grid-template-columns: 1fr;
          }
          .social-grid {
            gap: 16px;
          }
          .social-profile-content {
            gap: 16px;
            padding: 20px;
          }
        }
        @media (max-width: 640px) {
          .social-grid {
            grid-template-columns: 1fr;
          }
          .social-hero {
            padding-top: 26px;
          }
          .social-profile-content {
            flex-wrap: wrap;
          }
          .social-card {
            padding: 20px !important;
          }
          .social-filter form {
            flex-basis: 100%;
          }
          .social-stat {
            gap: 20px;
          }
          .social-profile-cover {
            height: 110px;
          }
        }
      `}</style>
    </AppShell>
  );
}
