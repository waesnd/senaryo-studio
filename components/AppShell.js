import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { ArrowUpRight, Bell, BookOpen, Compass, LogOut, MessageSquare, Moon, PenLine, Search, Sun, Bookmark, ChevronDown } from "lucide-react";
import { useAuth } from "../lib/useAuth";
import { Alert, Button } from "./ui";

export function StudioMark({ className, size = 36 }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect width="40" height="40" rx="11" fill="currentColor"/><path d="M26 12H17.5a5 5 0 0 0 0 10h5a3 3 0 0 1 0 6H14" stroke="var(--surface,#fffefa)" strokeWidth="2.6" strokeLinecap="round"/><path d="M27 11v5M13 24v5" stroke="var(--surface,#fffefa)" strokeWidth="2.6" strokeLinecap="round"/></svg>;
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark(document.documentElement.dataset.theme === "dark"); }, []);
  const toggle = () => {
    const next = !dark;
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try { localStorage.setItem("studio-theme", next ? "dark" : "light"); } catch { /* Theme stays available when browser storage is disabled. */ }
    setDark(next);
  };
  return <button type="button" className="icon-button" onClick={toggle} aria-label={dark ? "Açık temaya geç" : "Koyu temaya geç"} title={dark ? "Açık tema" : "Koyu tema"}>{dark ? <Sun size={19} /> : <Moon size={19} />}</button>;
}

const primary = [
  { href: "/uret", label: "Yazı stüdyosu", short: "Stüdyo", icon: PenLine },
  { href: "/profil", label: "Kitaplığım", short: "Kitaplık", icon: BookOpen },
  { href: "/kesfet", label: "Keşfet", short: "Keşfet", icon: Compass },
];
const secondary = [
  { href: "/kaydedilenler", label: "Kaydettiklerim", icon: Bookmark },
  { href: "/mesajlar", label: "Mesajlar", short: "Mesajlar", icon: MessageSquare },
  { href: "/bildirimler", label: "Bildirimler", short: "Bildirimler", icon: Bell },
];

function NavigationLink({ item, active, count, mobile = false }) {
  const Icon = item.icon;
  return <Link href={item.href} aria-current={active ? "page" : undefined} className={`nav-link${active ? " is-active" : ""}`}>
    <span className="nav-icon"><Icon size={mobile ? 21 : 19} strokeWidth={1.7} />{!!count && <span className="nav-count">{count > 99 ? "99+" : count}<span className="sr-only"> okunmamış bildirim</span></span>}</span>
    <span>{mobile ? item.short || item.label : item.label}</span>
  </Link>;
}

export default function AppShell({ children, title, subtitle, actions, wide = false, hideSidebar = false }) {
  const router = useRouter();
  const { user, profil, configured, signIn: beginSignIn, signOut: endSession, okunmayanBildirim = 0 } = useAuth();
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const connected = Boolean(configured);
  const name = profil?.nickname || profil?.username || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Yazar";
  const initials = name.split(/\s+/).slice(0, 2).map(part => part[0]).join("").toLocaleUpperCase("tr-TR");
  const active = href => router.pathname === href || (href === "/kesfet" && ["/topluluk", "/senaryo/[id]", "/hashtag/[tag]", "/@[username]"].includes(router.pathname));
  const signIn = async () => {
    if (!connected) return;
    setAuthLoading(true); setAuthError("");
    try {
      await beginSignIn();
    } catch { setAuthError("Giriş bağlantısı kurulamadı. Lütfen tekrar deneyin."); setAuthLoading(false); }
  };
  const signOut = async () => {
    if (!connected) return;
    setAuthError("");
    try { await endSession(); await router.push("/"); }
    catch { setAuthError("Oturum kapatılamadı. Lütfen tekrar deneyin."); }
  };
  const mobileItems = [...primary, secondary[1], secondary[2]];
  return <div className={`app-shell${hideSidebar ? " shell-no-sidebar" : ""}`}>
    <Head><title>{title ? `${title} · Senaryo Studio` : "Senaryo Studio · Hikâyene alan aç"}</title></Head>
    <a className="skip-link" href="#main-content">İçeriğe geç</a>
    {!hideSidebar && <aside className="app-sidebar" aria-label="Ana menü">
      <Link href="/" className="brand" aria-label="Senaryo Studio ana sayfa"><StudioMark /><span>Senaryo<span className="brand-second">Studio</span></span></Link>
      <div className="sidebar-primary"><p className="nav-section-label">ÇALIŞMA ALANI</p><nav aria-label="Çalışma alanı">{primary.map(item => <NavigationLink key={item.href} item={item} active={active(item.href)} />)}</nav></div>
      <div className="sidebar-secondary"><p className="nav-section-label">TOPLULUK</p><nav aria-label="Topluluk">{secondary.map(item => <NavigationLink key={item.href} item={item} active={active(item.href)} count={item.href === "/bildirimler" ? okunmayanBildirim : 0} />)}</nav></div>
      <div className="sidebar-note"><span className="sidebar-note-icon"><PenLine size={18} strokeWidth={1.5} /></span><p>Bir fikrin var.<br /><strong>Ona bir sahne ver.</strong></p><Link href="/uret">Yazmaya başla <ArrowUpRight size={14} /></Link></div>
      <div className="sidebar-account">
        {user ? <><Link href="/profil" className="account-link"><span className="avatar avatar-sm">{initials}</span><span className="account-copy"><strong>{name}</strong><span>Yazar hesabı</span></span><ChevronDown size={15} /></Link><button className="signout-button" type="button" onClick={signOut}><LogOut size={15} /> Oturumu kapat</button></> : <><p className="small muted">Hikâyelerini yanında taşı.</p><Button variant="secondary" size="sm" onClick={signIn} disabled={!connected} loading={authLoading}>Hesabına giriş yap <ArrowUpRight size={15} /></Button></>}
      </div>
    </aside>}
    <div className="app-main">
      <header className="app-topbar">
        {hideSidebar ? <Link href="/" className="brand brand-inline"><StudioMark size={30} /><span>Senaryo Studio</span></Link> : <div className="topbar-location"><span className="topbar-root">Çalışma alanı</span><span className="topbar-divider">/</span><span>{title || "Senaryo Studio"}</span></div>}
        <div className="topbar-actions"><Link href="/arama" className="icon-button" aria-label="Senaryo ve yazar ara" title="Ara"><Search size={19} /></Link><ThemeToggle />{user ? <Link href="/profil" className="avatar avatar-sm" aria-label={`${name}, profilini aç`}>{initials}</Link> : <Button variant="secondary" size="sm" onClick={signIn} disabled={!connected} loading={authLoading}>Giriş yap</Button>}</div>
      </header>
      <main id="main-content" tabIndex={-1} className={`app-content${wide ? " app-content-wide" : ""}`}>
        {authError && <Alert tone="danger" onDismiss={() => setAuthError("")}>{authError}</Alert>}
        {!connected && <div className="connection-note"><span className="connection-dot" /><p>Bulut bağlantısı henüz etkin değil. Yazı stüdyosunda yerel taslaklarla çalışabilirsiniz.</p></div>}
        {subtitle && <div className="shell-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{actions && <div className="page-actions">{actions}</div>}</div>}
        {!subtitle && actions && <div className="shell-actions">{actions}</div>}
        {children}
      </main>
      <footer className="app-footer"><span>Senaryo Studio</span><span>Fikirden son sahneye.</span></footer>
    </div>
    {!hideSidebar && <nav className="mobile-nav" aria-label="Ana menü">{mobileItems.map(item => <NavigationLink key={item.href} item={item} active={active(item.href)} count={item.href === "/bildirimler" ? okunmayanBildirim : 0} mobile />)}</nav>}
  </div>;
}
