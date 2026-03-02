'use client';
// src/app/admin/pages/page.tsx - Manajemen Halaman Statis
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { pagesApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function AdminPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [form, setForm] = useState({ title: '', content: '', status: 'PUBLISHED', sortOrder: '0' });
  const [saving, setSaving] = useState(false);

  const fetchPages = async () => {
    setLoading(true);
    try { const r = await pagesApi.getAll(); setPages(r.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, []);

  const openCreate = () => { setEditingPage(null); setForm({ title: '', content: '', status: 'PUBLISHED', sortOrder: String(pages.length) }); setShowForm(true); };
  const openEdit = (p: any) => { setEditingPage(p); setForm({ title: p.title, content: '', status: p.status, sortOrder: String(p.sortOrder) }); setShowForm(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const token = getToken()!;
      if (editingPage) await pagesApi.update(token, editingPage.id, form);
      else await pagesApi.create(token, form);
      setShowForm(false);
      fetchPages();
    } catch (err: any) { alert(err.message); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus halaman ini?')) return;
    try { await pagesApi.remove(getToken()!, id); fetchPages(); } catch { alert('Gagal menghapus.'); }
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' as const };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div><h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>Halaman Statis</h1></div>
        <button onClick={openCreate} style={{ padding: '0.65rem 1.25rem', background: '#1B6B44', color: '#fff', borderRadius: 10, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer' }}>+ Halaman Baru</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{editingPage ? 'Edit Halaman' : 'Halaman Baru'}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6B7280' }}>✕</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Judul *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="Tentang Kami" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Konten (HTML) *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  required rows={10} placeholder="<h2>Judul Konten</h2><p>Paragraf...</p>"
                  style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Urutan Tampil</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '0.65rem 1.25rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Batal</button>
                <button type="submit" disabled={saving} style={{ padding: '0.65rem 1.5rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Memuat...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Judul', 'Slug', 'Urutan', 'Status', 'Aksi'].map(h => <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {pages.map((page: any) => (
                <tr key={page.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '1rem', fontSize: 14, fontWeight: 600, color: '#111827' }}>{page.title}</td>
                  <td style={{ padding: '1rem', fontSize: 13, color: '#6B7280', fontFamily: 'monospace' }}>/halaman/{page.slug}</td>
                  <td style={{ padding: '1rem', fontSize: 13, color: '#6B7280' }}>{page.sortOrder}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.2rem 0.65rem', borderRadius: 30, fontSize: 11, fontWeight: 600, background: page.status === 'PUBLISHED' ? '#DCFCE7' : '#FEF3C7', color: page.status === 'PUBLISHED' ? '#166534' : '#92400E' }}>{page.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEdit(page)} style={{ padding: '0.35rem 0.85rem', background: '#E8F5EE', color: '#1B6B44', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(page.id)} style={{ padding: '0.35rem 0.85rem', background: '#FEE2E2', color: '#DC2626', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
