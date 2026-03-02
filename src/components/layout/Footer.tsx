// src/components/layout/Footer.tsx
// Footer Server Component — baca site settings dari API untuk kontak, sosmed, nama sekolah
import Link from 'next/link';
import { settingsApi, menuApi } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default async function Footer() {
  // Fetch settings + menu paralel di server
  const [settingsResult, menuResult] = await Promise.allSettled([
    settingsApi.getAll(),
    menuApi.getAll(),
  ]);

  const settings: Record<string, string> =
    settingsResult.status === 'fulfilled' ? settingsResult.value.data : {};
  const menuItems = menuResult.status === 'fulfilled'
    ? menuResult.value.data.filter(m => m.isActive)
    : [];

  const siteName = settings.site_name || 'SD Islam Terpadu Iqra 2';
  const siteTagline = settings.site_tagline || 'Mewujudkan generasi Islami yang cerdas dan berakhlak mulia.';
  const logoUrl = settings.site_logo || '';
  const email = settings.contact_email || '';
  const phone = settings.contact_phone || '';
  const address = settings.contact_address || 'Kota Bengkulu, Provinsi Bengkulu';
  const facebook = settings.social_facebook || '';
  const instagram = settings.social_instagram || '';
  const youtube = settings.social_youtube || '';

  const logoSrc = logoUrl
    ? (logoUrl.startsWith('http') ? logoUrl : `${API_BASE}${logoUrl}`)
    : null;

  const hasSocial = facebook || instagram || youtube;

  const footerLinks = menuItems.length > 0
    ? menuItems.map(m => ({ href: m.url, label: m.label, external: m.openInNewTab }))
    : [
        { href: '/', label: 'Beranda', external: false },
        { href: '/berita', label: 'Berita & Pengumuman', external: false },
        { href: '/ppdb', label: 'Pendaftaran (PPDB)', external: false },
      ];

  return (
    <footer style={{ background: '#0F3D24', color: '#fff', marginTop: 'auto' }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem 2rem',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem',
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoSrc} alt={siteName} style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'contain', background: '#fff', padding: '2px' }} />
            ) : (
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #2D9164, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>I2</div>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>{siteName}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.2 }}>Kota Bengkulu</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.7, margin: 0 }}>{siteTagline}</p>

          {/* Sosial Media */}
          {hasSocial && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}
                  title="Facebook">f</a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', textDecoration: 'none', fontWeight: 700, fontSize: 11 }}
                  title="Instagram">ig</a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', textDecoration: 'none', fontWeight: 700, fontSize: 11 }}
                  title="YouTube">yt</a>
              )}
            </div>
          )}
        </div>

        {/* Menu Cepat */}
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: '1rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem' }}>Menu Cepat</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {footerLinks.map((link) => (
              <Link key={link.href + link.label} href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className="footer-link">
                → {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Kontak */}
        <div>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: '1rem', color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem' }}>Kontak</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 13, color: '#9CA3AF' }}>
            {address && <p style={{ margin: 0 }}>📍 {address}</p>}
            {phone && <p style={{ margin: 0 }}>📞 {phone}</p>}
            {email && <p style={{ margin: 0 }}>✉️ <a href={`mailto:${email}`} style={{ color: '#9CA3AF', textDecoration: 'none' }}>{email}</a></p>}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.5rem', textAlign: 'center', fontSize: 12, color: '#6B7280' }}>
        © {new Date().getFullYear()} {siteName}. Hak cipta dilindungi.
      </div>

      <style>{`
        .footer-link { color: #D1D5DB; font-size: 14px; text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: #C9A84C; }
      `}</style>
    </footer>
  );
}
