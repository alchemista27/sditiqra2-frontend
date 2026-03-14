'use client';
// src/app/absen/login/page.tsx - Halaman Login Absensi
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setToken } from '@/lib/auth';
import { useSiteSettings } from '@/components/SiteLogo';
import NewsTicker from '@/components/NewsTicker';

export default function AbsenLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { logoUrl, siteName } = useSiteSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await authApi.login(email, password);
      // Simpan token ke cookie & localStorage
      setToken(result.data.token);
      
      const user = result.data.user as { role: string };
      if (!['SUPER_ADMIN', 'ADMIN_CMS', 'ADMIN_PPDB', 'KEPALA_SEKOLAH', 'KARYAWAN'].includes(user.role)) {
        setError('Akses ditolak. Akun ini tidak terdaftar sebagai staf kependidikan.');
        return;
      }
      
      // Berhasil
      router.push('/absen');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F3D24 0%, #1B6B44 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', paddingBottom: '56px' }}>
      
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: -50, right: -50, width: 250, height: 250, borderRadius: '50%', background: 'rgba(201,168,76,0.08)' }} />
      <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div style={{ background: '#fff', borderRadius: 24, padding: '2.5rem 1.5rem', width: '100%', maxWidth: 400, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative', zIndex: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={siteName} style={{ width: 64, height: 64, borderRadius: 18, objectFit: 'contain', background: '#fff', padding: 2, margin: '0 auto 1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #1B6B44, #2D9164)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff', fontWeight: 800, fontSize: 24 }}>I2</div>
          )}
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Absensi Pegawai</h1>
          <p style={{ fontSize: 13, color: '#6B7280' }}>{siteName}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: 13 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Email</label>
            <input
              id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required
              placeholder="email@contoh.com"
              style={{ width: '100%', padding: '0.875rem 1rem', border: '2px solid #E5E7EB', borderRadius: 12, fontSize: 15, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#1B6B44')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Password</label>
            <input
              id="password" type="password" value={password}
              onChange={e => setPassword(e.target.value)} required
              placeholder="••••••••"
              style={{ width: '100%', padding: '0.875rem 1rem', border: '2px solid #E5E7EB', borderRadius: 12, fontSize: 15, outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#1B6B44')}
              onBlur={e => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '0.9rem',
            background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #1B6B44, #2D9164)',
            color: '#fff', borderRadius: 12, fontSize: 16, fontWeight: 700,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s', boxShadow: '0 4px 15px rgba(27,107,68,0.3)',
          }}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
    <NewsTicker />
    </>
  );
}
