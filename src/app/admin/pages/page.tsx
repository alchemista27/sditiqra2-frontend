'use client';
// src/app/admin/pages/page.tsx - Manajemen Halaman Statis
import { useEffect, useState } from 'react';
import { pagesApi } from '@/lib/api';
import { getToken } from '@/lib/auth';
import Link from 'next/link';

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  sortOrder: number;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    setLoading(true);
    try { const r = await pagesApi.getAll(); setPages(r.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPages(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus halaman ini?')) return;
    try { await pagesApi.remove(getToken()!, id); fetchPages(); }
    catch { alert('Gagal menghapus.'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div><h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>Halaman Statis</h1></div>
        <Link href="/admin/pages/create" style={{ padding: '0.65rem 1.25rem', background: '#1B6B44', color: '#fff', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> Halaman Baru
        </Link>
      </div>

      {/* ─── Tabel Daftar Halaman ────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Memuat...</div>
        ) : pages.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: '0.75rem', opacity: 0.4 }}>article</span>
            Belum ada halaman. Klik &quot;Halaman Baru&quot; untuk memulai.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Judul', 'Slug', 'Urutan', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '1rem', fontSize: 14, fontWeight: 600, color: '#111827' }}>{page.title}</td>
                  <td style={{ padding: '1rem', fontSize: 13, color: '#6B7280', fontFamily: 'monospace' }}>/halaman/{page.slug}</td>
                  <td style={{ padding: '1rem', fontSize: 13, color: '#6B7280', textAlign: 'center' }}>{page.sortOrder}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.2rem 0.65rem', borderRadius: 30, fontSize: 11, fontWeight: 600,
                      background: page.status === 'PUBLISHED' ? '#DCFCE7' : '#FEF3C7',
                      color: page.status === 'PUBLISHED' ? '#166534' : '#92400E',
                    }}>{page.status}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/admin/pages/${page.id}/edit`}
                        style={{ padding: '0.35rem 0.85rem', background: '#E8F5EE', color: '#1B6B44', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span> Edit
                      </Link>
                      <button onClick={() => handleDelete(page.id)}
                        style={{ padding: '0.35rem 0.85rem', background: '#FEE2E2', color: '#DC2626', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span> Hapus
                      </button>
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
