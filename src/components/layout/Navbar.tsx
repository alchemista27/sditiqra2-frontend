'use client';
// src/components/layout/Navbar.tsx
// Navbar dinamis: menu dibaca dari API CMS (menuApi), logo dari site settings
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { menuApi, settingsApi } from '@/lib/api';
import type { MenuItem } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Navbar() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [siteName, setSiteName] = useState('SD IT Iqra 2');
  const [logoUrl, setLogoUrl] = useState('');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      menuApi.getAll(),
      settingsApi.getAll(),
    ]).then(([menuRes, settingsRes]) => {
      if (menuRes.status === 'fulfilled') {
        setMenuItems(menuRes.value.data.filter(m => m.isActive));
      }
      if (settingsRes.status === 'fulfilled') {
        const d = settingsRes.value.data;
        if (d.site_name) setSiteName(d.site_name);
        if (d.site_logo) setLogoUrl(d.site_logo);
      }
    });

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logoSrc = logoUrl
    ? (logoUrl.startsWith('http') ? logoUrl : `${API_BASE}${logoUrl}`)
    : null;

  // Hanya tampilkan root items (parentId = null)
  const rootItems = menuItems.filter(m => !m.parentId);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
      transition: 'all 0.3s ease',
      borderBottom: scrolled ? '1px solid #E5E7EB' : 'none',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt={siteName} style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'contain' }} />
          ) : (
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #1B6B44, #2D9164)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0,
            }}>I2</div>
          )}
          <div>
            <div style={{
              fontWeight: 800, fontSize: 14, lineHeight: 1.2,
              color: scrolled ? '#1B6B44' : '#fff',
              textShadow: scrolled ? 'none' : '0 1px 4px rgba(0,0,0,0.4)',
            }}>{siteName}</div>
            <div style={{
              fontSize: 11, lineHeight: 1.2,
              color: scrolled ? '#4B5563' : 'rgba(255,255,255,0.8)',
            }}>Kota Bengkulu</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {rootItems.map(item => {
            const subItems = menuItems.filter(m => m.parentId === item.id);
            return <NavItem key={item.id} item={item} subItems={subItems} scrolled={scrolled} />;
          })}
          <Link href="/ppdb" style={{
            marginLeft: '0.5rem', padding: '0.5rem 1.25rem',
            background: 'linear-gradient(135deg, #1B6B44, #2D9164)',
            color: '#fff', borderRadius: 30, fontSize: 14, fontWeight: 600,
            textDecoration: 'none', transition: 'opacity 0.2s',
          }}>Daftar PPDB</Link>
        </nav>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: scrolled ? '#1B6B44' : '#fff' }}
          className="burger-btn" aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div style={{ background: '#fff', borderTop: '1px solid #E5E7EB', padding: '1rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {rootItems.map(item => (
            <MobileLink key={item.id} href={item.url} onClick={() => setOpen(false)} external={item.openInNewTab}>
              {item.label}
            </MobileLink>
          ))}
          <Link href="/ppdb" onClick={() => setOpen(false)} style={{ textAlign: 'center', padding: '0.75rem', background: 'linear-gradient(135deg, #1B6B44, #2D9164)', color: '#fff', borderRadius: 10, fontWeight: 600, textDecoration: 'none', marginTop: '0.5rem' }}>
            Daftar PPDB
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } .burger-btn { display: block !important; } }
        .nav-dropdown { position: relative; }
        .nav-dropdown-menu { display: none; position: absolute; top: calc(100% + 8px); left: 0; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); border: 1px solid #E5E7EB; padding: 0.5rem; min-width: 180px; z-index: 200; }
        .nav-dropdown:hover .nav-dropdown-menu { display: block; animation: fadeDown 0.15s ease; }
        @keyframes fadeDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .nav-dropdown-item { display: block; padding: 0.5rem 0.75rem; color: #374151; font-size: 13.5px; font-weight: 500; text-decoration: none; border-radius: 8px; white-space: nowrap; }
        .nav-dropdown-item:hover { background: #E8F5EE; color: #1B6B44; }
      `}</style>
    </header>
  );
}

function NavItem({ item, subItems, scrolled }: { item: MenuItem; subItems: MenuItem[]; scrolled: boolean }) {
  const textColor = scrolled ? '#374151' : '#fff';
  const textShadow = scrolled ? 'none' : '0 1px 3px rgba(0,0,0,0.45)';

  if (subItems.length > 0) {
    return (
      <div className="nav-dropdown">
        <Link href={item.url} target={item.openInNewTab ? '_blank' : undefined}
          style={{ padding: '0.4rem 0.85rem', color: textColor, fontSize: 14, fontWeight: 500, textDecoration: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.3rem', textShadow }}>
          {item.label} <span style={{ fontSize: 11 }}>▾</span>
        </Link>
        <div className="nav-dropdown-menu">
          {subItems.map(child => (
            <a key={child.id} href={child.url} target={child.openInNewTab ? '_blank' : undefined} className="nav-dropdown-item">
              {child.label}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Link href={item.url}
      target={item.openInNewTab ? '_blank' : undefined}
      rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
      style={{ padding: '0.4rem 0.85rem', color: textColor, fontSize: 14, fontWeight: 500, textDecoration: 'none', borderRadius: 8, transition: 'background 0.2s', textShadow }}
      onMouseEnter={e => (e.currentTarget.style.background = scrolled ? '#E8F5EE' : 'rgba(255,255,255,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {item.label}
    </Link>
  );
}

function MobileLink({ href, children, onClick, external }: { href: string; children: React.ReactNode; onClick: () => void; external?: boolean }) {
  return (
    <Link href={href} onClick={onClick}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={{ padding: '0.75rem 1rem', color: '#374151', fontSize: 15, fontWeight: 500, textDecoration: 'none', borderRadius: 10, background: '#F9FAFB', display: 'block' }}>
      {children}
    </Link>
  );
}
