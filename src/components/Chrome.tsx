import { useEffect, useRef, useState, type AnchorHTMLAttributes } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronDown, Facebook, Globe, Heart, Instagram, Menu, Search, X, Youtube } from 'lucide-react';
import { BOOKING, footerCols, landingNav, photoCredits, type NavItem } from '@/data/landing';
import { useLockBody } from '@/hooks/useLockBody';
import '@/landing.css';

/**
 * One link component: "/..." uses the router, "#..." scrolls, "http..." opens a new tab.
 * Pass sameTab to open an outside link (e.g. the Rezdy booking page) in the same tab.
 */
export function A({ to, children, sameTab = false, ...rest }: { to: string; sameTab?: boolean } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  if (to.startsWith('/')) return <Link to={to} {...rest}>{children}</Link>;
  const newTab = /^https?:/.test(to) && !sameTab;
  return <a href={to} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>{children}</a>;
}

export function EiffelMark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 40" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 1v4M10.6 5h2.8M11 5 8.6 18 3 39M13 5l2.4 13L21 39M8.2 18h7.6M6.4 27h11.2M7.6 39c1-5 2.6-7.6 4.4-7.6s3.4 2.6 4.4 7.6M10.2 9.5h3.6M9.3 18 12 27l2.7-9M7 27l5 6 5-6" />
    </svg>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <A to="/" className={`pl-logo ${light ? 'is-light' : ''}`} aria-label="Paris Top Sights Tours, home">
      <EiffelMark className="pl-logo-mark" />
      <span>
        <strong>Paris Top Sights Tours</strong>
        <small>Extraordinary places. Meaningful moments.</small>
      </span>
    </A>
  );
}

/** Which nav item is highlighted for the current URL. */
function isActive(to: string, pathname: string) {
  if (to === '/tours') return pathname.startsWith('/tours');
  return to === pathname;
}

/** "Destinations" dropdown: opens on click, closes on outside click, Escape or navigation. */
function Dropdown({ item, onNavigate }: { item: Extract<NavItem, { children: unknown }>; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={`pl-dd ${open ? 'is-open' : ''}`} ref={ref}>
      <button type="button" aria-expanded={open} aria-controls="pl-dd-menu" onClick={() => setOpen((v) => !v)}>
        {item.label} <ChevronDown size={13} />
      </button>
      <div id="pl-dd-menu" className="pl-dd-menu" hidden={!open}>
        {item.children.map((c) => <A key={c.label} to={c.to} onClick={() => { setOpen(false); onNavigate(); }}>{c.label}</A>)}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  useLockBody(open);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  // On the home page the header sits on the hero photo until you scroll.
  const over = pathname === '/' && !scrolled && !open;

  return (
    <header className={`pl-header ${over ? 'is-over' : ''}`}>
      <div className="pl-wrap pl-nav">
        <Logo />
        <nav className={`pl-links ${open ? 'is-open' : ''}`} aria-label="Main">
          {landingNav.map((item) => {
            if ('children' in item) return <Dropdown key={item.label} item={item} onNavigate={() => setOpen(false)} />;
            const active = isActive(item.to, pathname);
            return (
              <A key={item.label} to={item.to} onClick={() => setOpen(false)} className={active ? 'active' : undefined} aria-current={active ? 'page' : undefined}>
                {item.label}
              </A>
            );
          })}
          <A to="/tours" className="pl-btn pl-btn-caps pl-links-cta" onClick={() => setOpen(false)}>Explore Tours <ArrowRight size={14} /></A>
        </nav>
        <div className="pl-nav-actions">
          <A to="/tours#search" className="pl-icon" aria-label="Search tours"><Search size={18} /></A>
          <A to="/tours" className="pl-btn pl-btn-caps pl-nav-cta">Explore Tours <ArrowRight size={14} /></A>
          <button type="button" className="pl-icon pl-burger" aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function Pinterest() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M10.5 9.5c.4-1.6 3.6-2 4.4-.1.8 2-1 4.6-2.6 4.1-1-.3-.9-1.4-.6-2.4M11.7 11.1 9.6 19.5" />
    </svg>
  );
}

// Replace "#" with your real social profile URLs.
const socials = [
  { label: 'Instagram', icon: <Instagram size={16} strokeWidth={1.6} /> },
  { label: 'Facebook', icon: <Facebook size={16} strokeWidth={1.6} /> },
  { label: 'YouTube', icon: <Youtube size={17} strokeWidth={1.6} /> },
  { label: 'Pinterest', icon: <Pinterest /> },
];

export function SiteFooter() {
  return (
    <footer className="pl-footer">
      <div className="pl-wrap pl-footer-top">
        <div className="pl-footer-brand">
          <Logo light />
          <div className="pl-socials">
            {socials.map((s) => <a key={s.label} href="#" aria-label={s.label}>{s.icon}</a>)}
          </div>
        </div>
        {footerCols.map((col) => (
          <div key={col.title} className="pl-footer-col">
            <h3>{col.title}</h3>
            {col.links.map((link) => <A key={link.label} to={link.to}>{link.label}</A>)}
          </div>
        ))}
        <p className="pl-footer-script" aria-hidden="true">More<br />Than a Trip<br /><span>A Deeper Connection <Heart size={18} strokeWidth={1.2} /></span></p>
      </div>
      <div className="pl-wrap pl-footer-bottom">
        <span>© 2024 Paris Top Sights Tours. All rights reserved.</span>
        <nav aria-label="Legal">
          <A to={BOOKING}>Terms &amp; Conditions</A>
          <A to={BOOKING}>Privacy Policy</A>
          <A to={BOOKING}>Cookie Preferences</A>
          <details className="pl-credits">
            <summary>Photo credits</summary>
            <ul>
              {photoCredits.map((c) => (
                <li key={c.subject}>
                  {c.subject}: <A to={c.source}>{c.author}</A>, <A to={c.licenseUrl}>{c.license}</A>, via Wikimedia Commons
                </li>
              ))}
            </ul>
          </details>
          <span className="pl-lang"><Globe size={13} /> English <ChevronDown size={12} /></span>
        </nav>
      </div>
    </footer>
  );
}
