'use client';
// src/app/absen/login/page.tsx - Halaman Login Portal Kehadiran
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function AbsenLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('SD IT Iqra 2 Kota Bengkulu');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { settingsApi } = await import('@/lib/api');
        const res = await settingsApi.getAll();
        const settings: Record<string, string> = res.data;
        if (settings.site_name) setSiteName(settings.site_name);
        if (settings.site_logo) {
          const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
          setLogoSrc(settings.site_logo.startsWith('http') ? settings.site_logo : `${apiBase}${settings.site_logo}`);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await authApi.login(email, password);
      setToken(result.data.token);
      const user = result.data.user as { role: string };
      // Hanya role ini yg bisa absen
      if (!['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'KARYAWAN'].includes(user.role)) {
        setError('Akses ditolak. Akun ini tidak terdaftar sebagai staf kependidikan.');
        return;
      }
      router.push('/absen');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '3rem', width: '100%', maxWidth: 440, boxShadow: '0 10px 40px rgba(0,0,0,0.05)', position: 'relative', border: '1px solid #E5E7EB' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          {logoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoSrc} alt="Logo Sekolah" style={{ width: 64, height: 64, borderRadius: 18, objectFit: 'contain', background: '#fff', padding: '2px', margin: '0 auto 1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #1B6B44, #2D9164)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff', fontWeight: 800, fontSize: 24 }}>I2</div>
          )}
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Portal Kehadiran</h1>
          <p style={{ fontSize: 13, color: '#6B7280' }}>{siteName}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Email Karyawan</label>
            <input
              id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required
              placeholder="nama@sditiqra2.sch.id"
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
            background: loading ? '#9CA3AF' : '#1B6B44',
            color: '#fff', borderRadius: 12, fontSize: 16, fontWeight: 700,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
          }}>
            {loading ? 'Memproses...' : 'Masuk Absensi'}
          </button>
        </form>
      </div>
    </div>
  );
}
