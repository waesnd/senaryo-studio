import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { getSupabaseClient } from '../../lib/supabase';
import { Spinner, Alert } from '../../components/ui';
export default function AuthCallback() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!router.isReady || started.current) return;
    started.current = true;
    const run = async () => {
      const sb = getSupabaseClient();
      if (!sb) throw new Error('Hesap bağlantısı yapılandırılmadı.');
      if (router.query.error) throw new Error('Giriş tamamlanmadı. Yeniden deneyebilirsin.');
      if (router.query.code) {
        const { error: exchangeError } = await sb.auth.exchangeCodeForSession(String(router.query.code));
        if (exchangeError) throw new Error('Giriş bağlantısı geçersiz veya süresi dolmuş. Yeniden giriş yap.');
      }
      const { data, error: sessionError } = await sb.auth.getSession();
      if (sessionError || !data.session) throw new Error('Oturum oluşturulamadı. Yeniden giriş yap.');
      await router.replace('/profil');
    };
    void run().catch(err => setError(err.message));
  }, [router]);
  return <main className="auth-screen"><div className="auth-card">
    {error ? <><Alert tone="danger">{error}</Alert><Link className="btn btn-primary" href="/giris">Giriş sayfasına dön</Link></>
      : <><Spinner /><h1>Çalışma alanın hazırlanıyor</h1><p className="muted">Girişin tamamlanıyor…</p></>}
  </div></main>;
}
