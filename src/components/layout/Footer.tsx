'use client';
// src/components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: '#0F3D24', color: '#fff', marginTop: 'auto' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #2D9164, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>I2</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>SD Islam Terpadu Iqra 2</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.2 }}>Kota Bengkulu</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.7 }}>
            Mewujudkan generasi Islami yang cerdas, berakhlak mulia, dan berprestasi.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: '1rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Menu Cepat</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[['/', 'Beranda'], ['/berita', 'Berita & Pengumuman'], ['/ppdb', 'Pendaftaran (PPDB)']].map(([href, label]) => (
              <Link key={href} href={href} style={{ color: '#D1D5DB', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C9A84C')}
                onMouseLeave={e => (e.currentTarget.style.color = '#D1D5DB')}>
                → {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: '1rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kontak</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 13, color: '#9CA3AF' }}>
            <p>📍 Kota Bengkulu, Provinsi Bengkulu</p>
            <p>📞 (0736) XXX-XXXX</p>
            <p>✉️ info@sditiqra2bengkulu.sch.id</p>
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.5rem', textAlign: 'center', fontSize: 12, color: '#6B7280' }}>
        © {new Date().getFullYear()} SD Islam Terpadu Iqra 2 Kota Bengkulu. Hak cipta dilindungi.
      </div>
    </footer>
  );
}
