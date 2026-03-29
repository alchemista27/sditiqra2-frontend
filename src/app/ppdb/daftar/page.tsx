'use client';
// src/app/ppdb/daftar/page.tsx - Halaman registrasi akun orang tua
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ppdbParentApi } from '@/lib/api';
import { useSiteSettings } from '@/components/SiteLogo';

const PARENT_TOKEN_KEY = 'sditiqra2_parent_token';

export default function PpdbDaftarPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { logoUrl, siteName } = useSiteSettings();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password tidak cocok.'); return;
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter.'); return;
    }

    setLoading(true);
    try {
      const res = await ppdbParentApi.register({
        name: form.name, email: form.email, phone: form.phone, password: form.password,
      });
      if (res.data?.token) {
        localStorage.setItem(PARENT_TOKEN_KEY, res.data.token);
        router.push('/ppdb/portal');
      }
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '2.5rem', boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={siteName} style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'contain', background: '#fff', padding: 2, margin: '0 auto 1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} />
            ) : (
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'linear-gradient(135deg, #1B6B44, #2D9164)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', fontSize: 28,
              }}>👨‍👩‍👧</div>
            )}
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Buat Akun</h1>
            <p style={{ color: '#6B7280', fontSize: 14 }}>Daftarkan akun orang tua / wali untuk mengakses portal PPDB</p>
          </div>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '0.875rem 1rem', marginBottom: '1.25rem', color: '#DC2626', fontSize: 14, display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <span className="material-symbols-outlined" style={{ flexShrink: 0 }}>warning</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { name: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama lengkap orang tua / wali', required: true },
              { name: 'email', label: 'Email', type: 'email', placeholder: 'email@contoh.com', required: true },
              { name: 'phone', label: 'Nomor HP / WhatsApp', type: 'tel', placeholder: '08xxxxxxxxxx', required: true },
              { name: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 karakter', required: true },
              { name: 'confirmPassword', label: 'Konfirmasi Password', type: 'password', placeholder: 'Ulangi password', required: true },
            ].map(field => (
              <div key={field.name}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  {field.label} {field.required && <span style={{ color: '#DC2626' }}>*</span>}
                </label>
                <input
                  id={`ppdb-daftar-${field.name}`}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: 10,
                    border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => e.target.style.borderColor = '#1B6B44'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>
            ))}

            <button
              id="ppdb-daftar-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '0.875rem', borderRadius: 12,
                background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #1B6B44, #2D9164)',
                color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 700, fontSize: 15, marginTop: '0.5rem',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(27,107,68,0.3)',
                transition: 'all 0.2s',
              }}
            >
              {loading ? 'Mendaftarkan...' : 'Buat Akun & Mulai Daftar →'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: 14, color: '#6B7280' }}>
            Sudah punya akun?{' '}
            <Link href="/ppdb/masuk" style={{ color: '#1B6B44', fontWeight: 600, textDecoration: 'none' }}>Masuk di sini</Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: 12, color: '#9CA3AF' }}>
          Dengan mendaftar, Anda menyetujui penggunaan data untuk keperluan PPDB SDIT Iqra 2 Bengkulu.
        </p>
      </div>
    </div>
  );
}
