import { useState } from 'react';
import Link from 'next/link';
import { Feather, ArrowRight, ShieldCheck } from 'lucide-react';
import AppShell from '../components/AppShell';
import { useAuth } from '../lib/useAuth';
import { Button, Alert } from '../components/ui';
export default function SignIn() {
  const { user, configured, signIn } = useAuth();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function start() {
    setBusy(true); setError('');
    try { await signIn(); } catch (err) { setError(err.message); setBusy(false); }
  }
  return <AppShell title="Hikâyene alan aç" hideSidebar>
    <div className="auth-screen"><section className="auth-card stack">
      <Feather size={36} aria-hidden="true" /><p className="section-label">SENARYO STUDIO</p>
      <h1>Bir sonraki hikâyen burada başlıyor.</h1>
      <p className="muted">Taslaklarını koru, sahnelerini geliştir ve hikâyeni paylaşacağın zamanı kendin seç.</p>
      {error && <Alert tone="danger">{error}</Alert>}
      {!configured && <Alert tone="warning">Hesap bağlantısı henüz hazır değil. Editörde yerel taslak oluşturabilirsin.</Alert>}
      {user ? <Link className="btn btn-primary" href="/profil">Çalışma alanıma git <ArrowRight size={16} /></Link>
        : <Button onClick={start} disabled={!configured} loading={busy}>Google ile devam et <ArrowRight size={16} /></Button>}
      <Link className="btn btn-secondary" href="/uret">Yerel taslakla başla</Link>
      <p className="small muted"><ShieldCheck size={14} aria-hidden="true" /> Taslakların varsayılan olarak özeldir.</p>
    </section></div>
  </AppShell>;
}
