'use client';
// src/app/absen/layout.tsx - Layout Khusus Absensi dengan Sidebar Navigation
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getToken, getUserFromToken, removeToken } from '@/lib/auth';
import { useSiteSettings } from '@/components/SiteLogo';
import NewsTicker from '@/components/NewsTicker';
import EditPasswordModal from '@/components/profile/EditPasswordModal';

const navItems = [
  { href: '/absen', label: 'Beranda', icon: 'home' },
  { href: '/absen/riwayat', label: 'Riwayat', icon: 'history' },
  { href: '/absen/izin', label: 'Izin', icon: 'assignment' },
  { href: '/absen/profil', label: 'Profil', icon: 'person' },
];

export default function AbsenLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loaded, setLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editPwOpen, setEditPwOpen] = useState(false);
  const { logoUrl, siteName } = useSiteSettings();

  useEffect(() => {
    if (pathname === '/absen/login') { 
      setLoaded(true); 
      return; 
    }
    
    const token = getToken();
    if (!token) { 
      router.replace('/absen/login'); 
      return; 
    }
    
    const userData = getUserFromToken(token);
    // Semua user dengan role yg terdaftar bisa akses fitur absen, utama KARYAWAN
    if (!userData || !['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'KARYAWAN'].includes(userData.role)) {
      removeToken();
      router.replace('/absen/login'); 
      return;
    }
    
    setLoaded(true);
  }, [pathname, router]);

  if (!loaded) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
        <div style={{ color: '#1B6B44', fontSize: 16 }}>Memuat...</div>
      </div>
    );
  }

  const isLoginPage = pathname === '/absen/login';

  // Login page tidak perlu layout
  if (isLoginPage) return <>{children}</>;

  const handleLogout = () => {
    removeToken();
    router.push('/absen/login');
  };

  // Layout dengan sidebar untuk halaman setelah login
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#0F3D24',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        transition: 'transform 0.3s ease',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }} className="absen-sidebar">
        {/* Logo Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'contain', background: '#fff', padding: 2 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2D9164, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>I2</div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{siteName}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Sistem Kehadiran</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', overflow: 'auto' }}>
          {navItems.map((item) => {
            const isActive = item.href === '/absen' 
              ? pathname === '/absen' 
              : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  borderRadius: 10,
                  marginBottom: '0.25rem',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.65)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Edit Password & Logout */}
        <div style={{ marginTop: 'auto', padding: '1rem 1rem 3.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            onClick={() => setEditPwOpen(true)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.8)',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>lock</span>
            Ubah Password
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              background: 'rgba(220,38,38,0.15)',
              color: '#FCA5A5',
              border: 'none',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(220,38,38,0.15)';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
            Keluar
          </button>
        </div>

        <EditPasswordModal open={editPwOpen} onClose={() => setEditPwOpen(false)} />
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="absen-main">
        {/* Mobile Header with Hamburger */}
        <header style={{
          display: 'none',
          background: '#0F3D24',
          padding: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }} className="absen-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 2 }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #2D9164, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>I2</div>
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{siteName}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Sistem Kehadiran</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 24,
              cursor: 'pointer',
              padding: '0.5rem',
            }}
          >
            <span className="material-symbols-outlined">{sidebarOpen ? 'close' : 'menu'}</span>
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, paddingBottom: '48px' }}>
          {children}
        </main>

        {/* News Ticker */}
        <NewsTicker />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'none',
          }}
          className="absen-overlay"
        />
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .absen-sidebar {
            transform: translateX(-100%);
          }
          .absen-sidebar.open {
            transform: translateX(0);
          }
          .absen-main {
            margin-left: 0 !important;
          }
          .absen-mobile-header {
            display: flex !important;
          }
          .absen-overlay {
            display: block !important;
          }
        }
        ${sidebarOpen ? `
          @media (max-width: 768px) {
            .absen-sidebar {
              transform: translateX(0) !important;
            }
          }
        ` : ''}
      `}</style>
    </div>
  );
}
