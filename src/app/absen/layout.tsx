'use client';
// src/app/absen/layout.tsx - Layout Khusus Absensi (Mobile Friendly)
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken, getUserFromToken, removeToken } from '@/lib/auth';

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

  // Tampilan layout khusus untuk mobile / PWA
  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      {pathname !== '/absen/login' && (
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
          <button 
            onClick={() => { removeToken(); router.replace('/absen/login'); }}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'rgba(255,255,255,0.8)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '0.5rem'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>logout</span>
          </button>
        </header>
      )}
      
      {/* Main Content */}
      <main style={{ flex: 1, position: 'relative' }}>
        {children}
      </main>
    </div>
  );
}
