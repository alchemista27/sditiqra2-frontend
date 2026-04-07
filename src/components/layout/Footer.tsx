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
  const footerCopyright = settings.footer_copyright || `Hak cipta dilindungi`;
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

  let footerLinks: { href: string; label: string; external?: boolean }[] = [];
  try {
    const quickLinks = settings.footer_quick_links;
    if (quickLinks) {
      const parsed = JSON.parse(quickLinks);
      if (Array.isArray(parsed)) {
        footerLinks = parsed.map((l: any) => ({ href: l.url || l.href, label: l.label, external: l.external }));
      }
    }
  } catch {}
  
  if (footerLinks.length === 0) {
    footerLinks = menuItems.length > 0
      ? menuItems.map(m => ({ href: m.url, label: m.label, external: m.openInNewTab }))
      : [
          { href: '/', label: 'Beranda', external: false },
          { href: '/berita', label: 'Berita & Pengumuman', external: false },
          { href: '/ppdb', label: 'Pendaftaran (PPDB)', external: false },
        ];
  }

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
                  style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', textDecoration: 'none' }}
                  title="Facebook" className="hover:bg-green-700 transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', textDecoration: 'none' }}
                  title="Instagram" className="hover:bg-green-700 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.822a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"/></svg>
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer"
                  style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D1D5DB', textDecoration: 'none' }}
                  title="YouTube" className="hover:bg-green-700 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 13, color: '#9CA3AF' }}>
            {address && <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span className="material-symbols-outlined" style={{ fontSize: 18, color: '#C9A84C', flexShrink: 0 }}>location_on</span><span>{address}</span></div>}
            {phone && <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span className="material-symbols-outlined" style={{ fontSize: 18, color: '#C9A84C', flexShrink: 0 }}>phone</span><span>{phone}</span></div>}
            {email && <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}><span className="material-symbols-outlined" style={{ fontSize: 18, color: '#C9A84C', flexShrink: 0 }}>email</span><a href={`mailto:${email}`} style={{ color: '#9CA3AF', textDecoration: 'none' }}>{email}</a></div>}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '1rem 1.5rem', textAlign: 'center', fontSize: 12, color: '#6B7280' }}>
        © {new Date().getFullYear()} {siteName}. {footerCopyright}.
      </div>

      <style>{`
        .footer-link { color: #D1D5DB; font-size: 14px; text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: #C9A84C; }
      `}</style>
    </footer>
  );
}
