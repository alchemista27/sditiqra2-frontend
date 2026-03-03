// src/app/ppdb/layout.tsx
// Layout untuk seluruh area PPDB publik dan portal orang tua
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PPDB Online – SD IT Iqra 2 Kota Bengkulu',
  description: 'Penerimaan Peserta Didik Baru (PPDB) SD IT Iqra 2 Kota Bengkulu. Daftar online, upload berkas, dan pantau status pendaftaran secara digital.',
};

export default function PpdbLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F0F9F4', fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif' }}>
      {/* Top bar navigasi PPDB */}
      <header style={{
        background: '#0F3D24', color: '#fff', padding: '0.875rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
      }}>
        <Link href="/ppdb" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: '#fff' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'linear-gradient(135deg, #2D9164, #C9A84C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14,
          }}>I2</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>PPDB Online</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>SD IT Iqra 2 Bengkulu</div>
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
      {children}
    </div>
  );
}
