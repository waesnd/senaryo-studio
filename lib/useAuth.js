import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const PROFILE_COLUMNS = 'id,username,nickname,bio,website,avatar_url,banner_url,dogrulandi,senaryo_sayisi,takipci_sayisi,takip_sayisi';
export const AuthContext = createContext({ user: null, profil: null, authHazir: false, configured: false,
  okunmayanBildirim: 0, authError: '', setProfil: () => {}, setOkunmayanBildirim: () => {},
  profilYenile: async () => null, signIn: async () => {}, signOut: async () => {} });
export function useAuth() { return useContext(AuthContext); }
function fallbackProfile(user) {
  return { id: user.id, username: user.email?.split('@')[0] || 'yazar',
    nickname: user.user_metadata?.full_name || '', avatar_url: user.user_metadata?.avatar_url || null,
    bio: '', website: '', banner_url: null, dogrulandi: false, senaryo_sayisi: 0, takipci_sayisi: 0, takip_sayisi: 0 };
}
export function AuthProvider({ children }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = useState(null);
  const [profil, setProfil] = useState(null);
  const [authHazir, setAuthHazir] = useState(false);
  const [authError, setAuthError] = useState('');
  const [okunmayanBildirim, setOkunmayanBildirim] = useState(0);
  const activeUser = useRef(null);
  const mounted = useRef(false);
  const generation = useRef(0);
  const profilYukle = useCallback(async (nextUser, epoch) => {
    const sb = getSupabaseClient();
    if (!sb || !nextUser) return null;
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 8000);
    try {
      const { data, error } = await sb.from('profiles').select(PROFILE_COLUMNS).eq('id', nextUser.id).maybeSingle().abortSignal(abort.signal);
      if (!mounted.current || epoch !== generation.current) return null;
      if (error) setAuthError('Profil yüklenemedi. Bağlantını kontrol edip yeniden deneyebilirsin.');
      const profile = data || fallbackProfile(nextUser);
      setProfil(profile);
      return profile;
    } catch {
      if (mounted.current && epoch === generation.current) setProfil(fallbackProfile(nextUser));
      return null;
    } finally { clearTimeout(timeout); }
  }, []);
  const profilYenile = useCallback(async () => profilYukle(activeUser.current, generation.current), [profilYukle]);
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    const sb = getSupabaseClient();
    const applySession = session => {
      if (cancelled) return;
      const nextUser = session?.user || null;
      const changed = activeUser.current?.id !== nextUser?.id;
      activeUser.current = nextUser;
      // Refreshing a token must not remount account-scoped forms or discard input.
      setUser(previous => previous?.id === nextUser?.id && previous?.email === nextUser?.email
        && JSON.stringify(previous?.user_metadata) === JSON.stringify(nextUser?.user_metadata) ? previous : nextUser);
      setAuthHazir(true);
      if (changed || !nextUser) {
        generation.current += 1;
        setProfil(null); setOkunmayanBildirim(0); setAuthError('');
        if (nextUser) void profilYukle(nextUser, generation.current);
      }
    };
    if (!sb) {
      queueMicrotask(() => { if (!cancelled) { setAuthHazir(true); setAuthError('Hesap bağlantısı henüz yapılandırılmadı. Yerel taslaklarla çalışabilirsin.'); } });
      return () => { cancelled = true; mounted.current = false; activeUser.current = null; generation.current += 1; };
    }
    let sawAuthEvent = false;
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      sawAuthEvent = true;
      queueMicrotask(() => applySession(session));
    });
    const timer = setTimeout(() => {
      if (!cancelled && !sawAuthEvent) { setAuthHazir(true); setAuthError('Oturum bağlantısı gecikti. Yeniden giriş yapabilirsin.'); }
    }, 10000);
    sb.auth.getSession().then(({ data, error }) => {
      if (!cancelled && !sawAuthEvent) {
        if (error) { setAuthError('Oturum doğrulanamadı. Yeniden giriş yap.'); setAuthHazir(true); }
        else applySession(data?.session);
      }
    }).catch(() => { if (!cancelled) { setAuthHazir(true); setAuthError('Oturum yüklenemedi.'); } }).finally(() => clearTimeout(timer));
    return () => { cancelled = true; mounted.current = false; activeUser.current = null; generation.current += 1; clearTimeout(timer); subscription.unsubscribe(); };
  }, [profilYukle]);
  useEffect(() => {
    const sb = getSupabaseClient();
    if (!sb || !user?.id) return undefined;
    let cancelled = false;
    const updateCount = async () => {
      const { count, error } = await sb.from('bildirimler').select('id', { count: 'exact', head: true }).eq('alici_id', user.id).eq('okundu', false);
      if (!cancelled && !error) setOkunmayanBildirim(count || 0);
    };
    void updateCount();
    const channel = sb.channel('notification-count:' + user.id).on('postgres_changes',
      { event: '*', schema: 'public', table: 'bildirimler', filter: 'alici_id=eq.' + user.id }, updateCount).subscribe();
    return () => { cancelled = true; void sb.removeChannel(channel); };
  }, [user?.id]);
  const signIn = useCallback(async () => {
    const sb = getSupabaseClient();
    if (!sb) throw new Error('Hesap bağlantısı henüz yapılandırılmadı.');
    const origin = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '');
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: origin + '/auth/callback' } });
    if (error) throw new Error('Giriş başlatılamadı. Lütfen yeniden dene.');
  }, []);
  const signOut = useCallback(async () => {
    const sb = getSupabaseClient();
    if (!sb) return;
    const { error } = await sb.auth.signOut();
    if (error) throw new Error('Çıkış tamamlanamadı. Lütfen yeniden dene.');
    try {
      for (const key of Object.keys(localStorage)) if (key.startsWith('sf_not_') || key === 'scriptify_last_chat') localStorage.removeItem(key);
    } catch { /* Browser storage may be disabled; the authenticated logout already succeeded. */ }
    window.dispatchEvent(new Event('senaryo:signout'));
  }, []);
  const value = useMemo(() => ({ user, profil, authHazir, configured, authError, setProfil, okunmayanBildirim,
    setOkunmayanBildirim, profilYenile, signIn, signOut }), [user, profil, authHazir, configured, authError, okunmayanBildirim, profilYenile, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
