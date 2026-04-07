'use client';
// src/app/admin/layout.tsx - Admin Dashboard Layout
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getToken, getUserFromToken, removeToken } from '@/lib/auth';
import { useSiteSettings } from '@/components/SiteLogo';
import ProfileMenu from '@/components/profile/ProfileMenu';

const navItems = [
  { href: '/admin', icon: 'home', label: 'Dasbor' },
  { href: '/admin/posts', icon: 'article', label: 'Berita & Artikel' },
  { href: '/admin/pages', icon: 'description', label: 'Halaman' },
  { href: '/admin/categories', icon: 'label', label: 'Kategori' },
  { href: '/admin/gallery', icon: 'photo_library', label: 'Galeri' },
  { href: '/admin/media', icon: 'perm_media', label: 'Media Library' },
];

const ppdbItems = [
  { href: '/admin/ppdb', icon: 'school', label: 'Pendaftar Baru' },
  { href: '/admin/ppdb/observasi', icon: 'event_available', label: 'Jadwal Observasi' },
  { href: '/admin/ppdb/kelas', icon: 'meeting_room', label: 'Pembagian Kelas' },
];

const attendanceItems = [
  { href: '/admin/attendance', icon: 'how_to_reg', label: 'Log Kehadiran' },
  { href: '/admin/attendance/leaves', icon: 'event_busy', label: 'Pengajuan Izin' },
  { href: '/admin/attendance/holidays', icon: 'calendar_month', label: 'Daftar Libur' },
  { href: '/admin/attendance/config', icon: 'my_location', label: 'Geofencing' },
  { href: '/admin/attendance/reports', icon: 'download', label: 'Ekspor Excel' },
  { href: '/admin/attendance/anomalies', icon: 'warning', label: 'Log Anomali' },
];

const settingsItems = [
  { href: '/admin/menu', icon: 'menu', label: 'Menu Navigasi' },
  { href: '/admin/settings/general', icon: 'tune', label: 'Pengaturan Umum' },
  { href: '/admin/settings/homepage', icon: 'web', label: 'Editor Homepage' },
  { href: '/admin/settings/instagram', icon: 'photo_camera', label: 'Instagram' },
  { href: '/admin/users', icon: 'manage_accounts', label: 'Kelola User' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const { logoUrl, siteName } = useSiteSettings();

  // Auto-open accordions based on current path
  useEffect(() => {
    if (pathname.startsWith('/admin/ppdb')) setOpenAccordion('ppdb');
    else if (pathname.startsWith('/admin/attendance')) setOpenAccordion('attendance');
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/admin/login') { setLoaded(true); return; }
    const token = getToken();
    if (!token) { router.replace('/admin/login'); return; }
    const userData = getUserFromToken(token);
    // Updated Role access checking: using ADMIN_HUMAS and ADMIN_PERSONALIA
    if (!userData || !['SUPER_ADMIN', 'ADMIN_HUMAS', 'ADMIN_PERSONALIA', 'KEPALA_SEKOLAH'].includes(userData.role)) {
      router.replace('/admin/login'); return;
    }
    setUser(userData);
    setLoaded(true);
  }, [pathname, router]);

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}><div style={{ color: '#1B6B44', fontSize: 16 }}>Memuat...</div></div>;
  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = () => { removeToken(); router.push('/admin/login'); };

  const role = user?.role;
  const showCMS = role && ['SUPER_ADMIN', 'ADMIN_HUMAS'].includes(role);
  const showPPDB = role && ['SUPER_ADMIN', 'ADMIN_HUMAS'].includes(role);
  const showAttendance = role && ['SUPER_ADMIN', 'ADMIN_PERSONALIA', 'KEPALA_SEKOLAH'].includes(role);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Sidebar */}
      <aside style={{
        width: 256, background: '#0F3D24', color: '#fff',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, bottom: 0, zIndex: 50,
        transition: 'transform 0.3s ease',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }} className="admin-sidebar">
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'contain', background: '#fff', padding: 2 }} />
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #2D9164, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>I2</div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{siteName}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Admin Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflow: 'auto' }}>
          {showCMS && (
            <>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: '0.5rem 0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>CMS</div>
              {navItems.map(item => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link key={item.href} href={item.href} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.75rem', borderRadius: 8, marginBottom: '0.15rem',
                    background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                    textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 400,
                    transition: 'all 0.15s',
                    borderLeft: isActive ? '3px solid #C9A84C' : '3px solid transparent',
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}

          {/* Accordion PPDB */}
          {showPPDB && (
            <div style={{ marginTop: '0.5rem' }}>
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'ppdb' ? null : 'ppdb')}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem', borderRadius: 8, background: 'transparent', border: 'none',
                  color: pathname.startsWith('/admin/ppdb') ? '#fff' : 'rgba(255,255,255,0.65)',
                  cursor: 'pointer', fontSize: 13, fontWeight: pathname.startsWith('/admin/ppdb') ? 600 : 500,
                  transition: 'all 0.2s', borderLeft: pathname.startsWith('/admin/ppdb') ? '3px solid #C9A84C' : '3px solid transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>group_add</span>
                  Manajemen PPDB
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 18, transform: openAccordion === 'ppdb' ? 'rotate(180deg)' : 'rotate(0)' }}>expand_more</span>
              </button>
              {openAccordion === 'ppdb' && (
                <div style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                  {ppdbItems.map(item => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href} style={{
                        display: 'block', padding: '0.5rem 0.75rem', borderRadius: 6, fontSize: 12,
                        color: isActive ? '#F2D98A' : 'rgba(255,255,255,0.5)', background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                        textDecoration: 'none', marginBottom: '0.1rem', fontWeight: isActive ? 600 : 400,
                      }}>
                        • {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Accordion Absensi */}
          {showAttendance && (
            <div style={{ marginTop: '0.25rem' }}>
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'attendance' ? null : 'attendance')}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem', borderRadius: 8, background: 'transparent', border: 'none',
                  color: pathname.startsWith('/admin/attendance') ? '#fff' : 'rgba(255,255,255,0.65)',
                  cursor: 'pointer', fontSize: 13, fontWeight: pathname.startsWith('/admin/attendance') ? 600 : 500,
                  transition: 'all 0.2s', borderLeft: pathname.startsWith('/admin/attendance') ? '3px solid #C9A84C' : '3px solid transparent',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>co_present</span>
                  Kehadiran Staf
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 18, transform: openAccordion === 'attendance' ? 'rotate(180deg)' : 'rotate(0)' }}>expand_more</span>
              </button>
              {openAccordion === 'attendance' && (
                <div style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                  {attendanceItems.map(item => {
                    const isActive = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href} style={{
                        display: 'block', padding: '0.5rem 0.75rem', borderRadius: 6, fontSize: 12,
                        color: isActive ? '#F2D98A' : 'rgba(255,255,255,0.5)', background: isActive ? 'rgba(201,168,76,0.1)' : 'transparent',
                        textDecoration: 'none', marginBottom: '0.1rem', fontWeight: isActive ? 600 : 400,
                      }}>
                        • {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Pengaturan Section */}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: '0.5rem 0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '1.5rem' }}>Pengaturan</div>
          {settingsItems.map(item => {
            // Hide users menu unless SUPER_ADMIN
            if (item.href === '/admin/users' && role !== 'SUPER_ADMIN') return null;
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.75rem', borderRadius: 8, marginBottom: '0.15rem',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                borderLeft: isActive ? '3px solid #C9A84C' : '3px solid transparent',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: '0.15rem' }}>{user?.role?.replace('_', ' ')}</div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '0.6rem', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 256, display: 'flex', flexDirection: 'column' }} className="admin-content">
        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
          <div style={{ fontWeight: 600, color: '#111827', fontSize: 15 }}>
            {
              [...navItems, ...ppdbItems, ...attendanceItems, ...settingsItems].find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label 
              || 'Dashboard'
            }
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link href="/" target="_blank" style={{ fontSize: 13, color: '#1B6B44', textDecoration: 'none', fontWeight: 500 }}>Lihat Website →</Link>
            <ProfileMenu user={user} onLogout={handleLogout} />
          </div>
        </div>
        <main style={{ flex: 1, padding: '2rem 1.5rem' }}>{children}</main>
      </div>

      <style>{`@media (max-width: 768px) { .admin-sidebar { transform: translateX(-100%); } .admin-content { margin-left: 0 !important; } }`}</style>
    </div>
  );
}
