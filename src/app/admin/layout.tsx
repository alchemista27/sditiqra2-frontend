'use client';
// src/app/admin/layout.tsx - Admin Dashboard Layout
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getToken, getUserFromToken, removeToken } from '@/lib/auth';

const navItems = [
  { href: '/admin', icon: 'home', label: 'Dasbor' },
  { href: '/admin/posts', icon: 'article', label: 'Berita & Artikel' },
  { href: '/admin/pages', icon: 'description', label: 'Halaman' },
  { href: '/admin/categories', icon: 'label', label: 'Kategori' },
  { href: '/admin/media', icon: 'image', label: 'Media' },
  { href: '/admin/ppdb', icon: 'school', label: 'PPDB — Pendaftaran' },
  { href: '/admin/ppdb/observasi', icon: 'event_available', label: 'PPDB — Observasi' },
  { href: '/admin/ppdb/kelas', icon: 'meeting_room', label: 'PPDB — Kelas' },
  { href: '/admin/attendance', icon: 'how_to_reg', label: 'Kehadiran Staf' },
  { href: '/admin/attendance/leaves', icon: 'event_busy', label: 'Pengajuan Izin' },
  { href: '/admin/attendance/holidays', icon: 'calendar_month', label: 'Hari Libur' },
  { href: '/admin/attendance/config', icon: 'my_location', label: 'Geofencing' },
  { href: '/admin/attendance/reports', icon: 'download', label: 'Laporan Absensi' },
  { href: '/admin/attendance/anomalies', icon: 'warning', label: 'Log Anomali' },
];

const settingsItems = [
  { href: '/admin/menu', icon: 'menu', label: 'Menu Navigasi' },
  { href: '/admin/settings/general', icon: 'tune', label: 'Pengaturan Umum' },
  { href: '/admin/settings/homepage', icon: 'web', label: 'Editor Homepage' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') { setLoaded(true); return; }
    const token = getToken();
    if (!token) { router.replace('/admin/login'); return; }
    const userData = getUserFromToken(token);
    if (!userData || !['SUPER_ADMIN', 'ADMIN_CMS', 'ADMIN_PPDB', 'KEPALA_SEKOLAH'].includes(userData.role)) {
      router.replace('/admin/login'); return;
    }
    setUser(userData);
    setLoaded(true);
  }, [pathname, router]);

  if (!loaded) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}><div style={{ color: '#1B6B44', fontSize: 16 }}>Memuat...</div></div>;
  if (pathname === '/admin/login') return <>{children}</>;

  const handleLogout = () => { removeToken(); router.push('/admin/login'); };

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
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #2D9164, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>I2</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>SD IT Iqra 2</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Admin Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflow: 'auto' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: '0.5rem 0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>CMS</div>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.75rem', borderRadius: 10, marginBottom: '0.15rem',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                borderLeft: isActive ? '3px solid #C9A84C' : '3px solid transparent',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

          {/* Pengaturan Section */}
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', padding: '0.5rem 0.75rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '1rem' }}>Pengaturan</div>
          {settingsItems.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.75rem', borderRadius: 10, marginBottom: '0.15rem',
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 400,
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
            {[...navItems, ...settingsItems].find(n => pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href)))?.label || 'Dashboard'}
          </div>
          <Link href="/" target="_blank" style={{ fontSize: 13, color: '#1B6B44', textDecoration: 'none', fontWeight: 500 }}>Lihat Website →</Link>
        </div>
        <main style={{ flex: 1, padding: '2rem 1.5rem' }}>{children}</main>
      </div>

      <style>{`@media (max-width: 768px) { .admin-sidebar { transform: translateX(-100%); } .admin-content { margin-left: 0 !important; } }`}</style>
    </div>
  );
}
