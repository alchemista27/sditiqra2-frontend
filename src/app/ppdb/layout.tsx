'use client';
// src/app/ppdb/layout.tsx
// Layout untuk seluruh area PPDB publik dan portal orang tua
import Link from 'next/link';
import { useSiteSettings } from '@/components/SiteLogo';
import NewsTicker from '@/components/NewsTicker';

export default function PpdbLayout({ children }: { children: React.ReactNode }) {
  const { logoUrl, siteName } = useSiteSettings();

  return (
    <div style={{ minHeight: '100vh', background: '#F0F9F4', fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
      {/* Top bar navigasi PPDB */}
      <header style={{
        background: '#0F3D24', color: '#fff', padding: '0.875rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        <Link href="/ppdb" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#fff' }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 2 }} />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'linear-gradient(135deg, #2D9164, #C9A84C)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 14,
            }}>I2</div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>PPDB Online</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{siteName}</div>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>← Beranda</Link>
          <Link href="/ppdb/masuk" style={{
            background: '#C9A84C', color: '#fff', padding: '0.45rem 1rem',
            borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>Masuk Portal</Link>
        </div>
      </header>
      <div style={{ paddingBottom: '40px' }}>
        {children}
      </div>
      <NewsTicker />
    </div>
  );
}
