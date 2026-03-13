'use client';
// src/app/absen/layout.tsx - Layout Khusus Absensi (Mobile Friendly)
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken, getUserFromToken, removeToken } from '@/lib/auth';

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
    if (!userData || !['SUPER_ADMIN', 'ADMIN_CMS', 'ADMIN_PPDB', 'KEPALA_SEKOLAH', 'KARYAWAN'].includes(userData.role)) {
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

  // Tampilan layout khusus untuk mobile / PWA
  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      {!isLoginPage && (
        <header style={{ 
          background: '#0F3D24', 
          padding: '1rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          color: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2D9164, #C9A84C)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>I2</div>
             <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>SD IT Iqra 2</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Sistem Kehadiran</div>
             </div>
          </div>
        </header>
      )}
      
      {/* Main Content */}
      <main style={{ flex: 1, position: 'relative', paddingBottom: !isLoginPage ? 72 : 0 }}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!isLoginPage && (
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: 64,
          zIndex: 50,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        }}>
          {navItems.map((item) => {
            const isActive = item.href === '/absen' 
              ? pathname === '/absen' 
              : pathname.startsWith(item.href);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  color: isActive ? '#1B6B44' : '#6B7280',
                  transition: 'color 0.2s',
                }}
              >
                <span 
                  className="material-symbols-outlined" 
                  style={{ 
                    fontSize: 24, 
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {item.icon}
                </span>
                <span style={{ 
                  fontSize: 11, 
                  fontWeight: isActive ? 700 : 500,
                  lineHeight: 1,
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
