'use client';
// src/app/admin/categories/page.tsx - Manajemen Kategori
import { useEffect, useState } from 'react';
import { categoriesApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCats = async () => {
    setLoading(true);
    try { const r = await categoriesApi.getAll(); setCategories(r.data); } catch {}
    setLoading(false);
  };
  useEffect(() => { fetchCats(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true); setError('');
    try {
      await categoriesApi.create(getToken()!, { name, description });
      setName(''); setDescription('');
      fetchCats();
    } catch (err: any) { setError(err.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus kategori ini? Berita yang menggunakan kategori ini tidak akan terhapus.')) return;
    try { await categoriesApi.remove(getToken()!, id); fetchCats(); } catch { alert('Gagal menghapus.'); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>Manajemen Kategori</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Form Tambah */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.5rem' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: '1rem', color: '#111827' }}>Tambah Kategori Baru</h2>
          {error && <div style={{ background: '#FEF2F2', color: '#DC2626', borderRadius: 10, padding: '0.6rem 1rem', marginBottom: '1rem', fontSize: 13 }}><span className="material-symbols-outlined">warning</span> {error}</div>}
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Nama Kategori *</label>
              <input value={name} onChange={e => setName(e.target.value)} required placeholder="Misalnya: Pengumuman"
                style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Deskripsi (opsional)</label>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Deskripsi singkat..."
                style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" disabled={saving} style={{ padding: '0.7rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: '0.25rem' }}>
              {saving ? 'Menyimpan...' : '+ Tambah Kategori'}
            </button>
          </form>
        </div>

        {/* Daftar Kategori */}
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
          {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Memuat...</div> : categories.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Belum ada kategori.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Nama', 'Slug', 'Jumlah Berita', 'Aksi'].map(h => <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {categories.map((cat: any) => (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '1rem', fontSize: 14, fontWeight: 600, color: '#111827' }}>{cat.name}</td>
                    <td style={{ padding: '1rem', fontSize: 13, color: '#6B7280', fontFamily: 'monospace' }}>{cat.slug}</td>
                    <td style={{ padding: '1rem', fontSize: 13, color: '#6B7280' }}>{cat._count?.posts || 0} berita</td>
                    <td style={{ padding: '1rem' }}>
                      <button onClick={() => handleDelete(cat.id)} style={{ padding: '0.35rem 0.85rem', background: '#FEE2E2', color: '#DC2626', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
