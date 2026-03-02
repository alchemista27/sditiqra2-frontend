'use client';
// src/app/admin/login/page.tsx - Halaman Login Admin
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { setToken } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await authApi.login(email, password);
      setToken(result.data.token);
      const user = result.data.user;
      if (!['SUPER_ADMIN', 'ADMIN_CMS', 'ADMIN_PPDB', 'KEPALA_SEKOLAH', 'KARYAWAN'].includes(user.role)) {
        setError('Akses ditolak. Akun ini tidak memiliki akses dashboard.');
        return;
      }
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0F3D24 0%, #1B6B44 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(201,168,76,0.08)' }} />
      <div style={{ position: 'fixed', bottom: -100, left: -100, width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <div style={{ background: '#fff', borderRadius: 24, padding: '3rem', width: '100%', maxWidth: 440, boxShadow: '0 25px 60px rgba(0,0,0,0.25)', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: 'linear-gradient(135deg, #1B6B44, #2D9164)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#fff', fontWeight: 800, fontSize: 24 }}>I2</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Dashboard Admin</h1>
          <p style={{ fontSize: 13, color: '#6B7280' }}>SD IT Iqra 2 Kota Bengkulu</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: 14 }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Email</label>
            <input
              id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required
              placeholder="admin@sditiqra2.sch.id"
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
  );
}
