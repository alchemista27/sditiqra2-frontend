'use client';
// src/app/ppdb/masuk/page.tsx - Halaman login orang tua
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ppdbParentApi } from '@/lib/api';

export const PARENT_TOKEN_KEY = 'sditiqra2_parent_token';

export default function PpdbMasukPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await ppdbParentApi.login(form.email, form.password);
      const user = res.data?.user;
      if (!user || user.role !== 'PARENT') {
        setError('Akun ini tidak terdaftar sebagai orang tua PPDB. Gunakan halaman login admin untuk akun pendidik.');
        return;
      }
      localStorage.setItem(PARENT_TOKEN_KEY, res.data.token);
      router.push('/ppdb/portal');
    } catch (err: any) {
      setError(err.message || 'Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg, #1B6B44, #2D9164)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem', fontSize: 28,
            }}>🔐</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Masuk Portal PPDB</h1>
            <p style={{ color: '#6B7280', fontSize: 14 }}>Gunakan email yang didaftarkan saat registrasi</p>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.25rem', color: '#DC2626', fontSize: 14, display: 'flex', gap: '0.5rem' }}>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { name: 'email', label: 'Email', type: 'email', placeholder: 'email@contoh.com' },
              { name: 'password', label: 'Password', type: 'password', placeholder: 'Masukkan password Anda' },
            ].map(field => (
              <div key={field.name}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  {field.label}
                </label>
                <input
                  id={`ppdb-masuk-${field.name}`}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  required
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                    border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1B6B44'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
            ))}

            <button
              id="ppdb-masuk-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.875rem', borderRadius: 12,
                background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #1B6B44, #2D9164)',
                color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 15, marginTop: '0.25rem',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(27,107,68,0.3)',
              }}
            >
              {loading ? 'Memproses...' : 'Masuk ke Portal →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 14, color: '#6B7280' }}>
            Belum punya akun?{' '}
            <Link href="/ppdb/daftar" style={{ color: '#1B6B44', fontWeight: 600, textDecoration: 'none' }}>Daftar di sini</Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: 12, color: '#9CA3AF' }}>
          Halaman ini khusus untuk orang tua / wali murid PPDB.{' '}
          <Link href="/admin/login" style={{ color: '#9CA3AF' }}>Login Admin →</Link>
        </div>
      </div>
    </div>
  );
}
