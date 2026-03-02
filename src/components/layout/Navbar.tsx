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
    // Ambil menu aktif + site settings paralel
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
            <div style={{ fontWeight: 800, fontSize: 14, color: '#1B6B44', lineHeight: 1.2 }}>{siteName}</div>
            <div style={{ fontSize: 11, color: '#4B5563', lineHeight: 1.2 }}>Kota Bengkulu</div>
          </div>
        </Link>

        {/* Desktop Nav — dari menuApi */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="desktop-nav">
          {menuItems.map(item => (
            <NavLink key={item.id} href={item.url} external={item.openInNewTab}>
              {item.label}
            </NavLink>
          ))}
          <Link href="/ppdb" style={{
            marginLeft: '0.5rem', padding: '0.5rem 1.25rem',
            background: 'linear-gradient(135deg, #1B6B44, #2D9164)',
            color: '#fff', borderRadius: 30, fontSize: 14, fontWeight: 600,
            textDecoration: 'none', transition: 'opacity 0.2s',
          }}>Daftar PPDB</Link>
        </nav>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)}
          style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, color: '#1B6B44' }}
          className="burger-btn" aria-label="Menu">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div style={{ background: '#fff', borderTop: '1px solid #E5E7EB', padding: '1rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map(item => (
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
      `}</style>
    </header>
  );
}

function NavLink({ href, children, external }: { href: string; children: React.ReactNode; external?: boolean }) {
  return (
    <Link href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      style={{ padding: '0.4rem 0.85rem', color: '#374151', fontSize: 14, fontWeight: 500, textDecoration: 'none', borderRadius: 8, transition: 'background 0.2s' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#E8F5EE')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      {children}
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
