'use client';
// src/app/admin/posts/page.tsx - Manajemen Berita
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { postsApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

  const fetchPosts = async (p = 1) => {
    setLoading(true);
    try {
      const token = getToken()!;
      const result = await postsApi.getAll({ page: String(p), limit: '10' });
      setPosts(result.data);
      setPagination(result.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus berita ini?')) return;
    setDeleting(id);
    try {
      const token = getToken()!;
      await postsApi.remove(token, id);
      fetchPosts(page);
    } catch { alert('Gagal menghapus berita.'); }
    setDeleting(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>Berita & Artikel</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: '0.25rem' }}>Kelola semua berita dan pengumuman sekolah.</p>
        </div>
        <Link href="/admin/posts/new" style={{ padding: '0.65rem 1.25rem', background: '#1B6B44', color: '#fff', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
          + Tulis Berita
        </Link>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Memuat data...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: 40, marginBottom: '1rem' }}>📭</div>
            <p>Belum ada berita. <Link href="/admin/posts/new" style={{ color: '#1B6B44', fontWeight: 600 }}>Tulis berita pertama</Link>.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Judul', 'Kategori', 'Status', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post: any) => (
                <tr key={post.id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                  <td style={{ padding: '1rem', fontSize: 14 }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{post.title}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.2rem' }}>{post.author?.name}</div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: 13, color: '#6B7280' }}>{post.category?.name || '—'}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.2rem 0.7rem', borderRadius: 30, fontSize: 11, fontWeight: 600, background: post.status === 'PUBLISHED' ? '#DCFCE7' : post.status === 'ARCHIVED' ? '#F3F4F6' : '#FEF3C7', color: post.status === 'PUBLISHED' ? '#166534' : post.status === 'ARCHIVED' ? '#6B7280' : '#92400E' }}>
                      {post.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: 13, color: '#6B7280' }}>{formatDate(post.publishedAt || post.createdAt)}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/admin/posts/${post.id}/edit`} style={{ padding: '0.35rem 0.85rem', background: '#E8F5EE', color: '#1B6B44', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Edit</Link>
                      <button onClick={() => handleDelete(post.id)} disabled={deleting === post.id} style={{ padding: '0.35rem 0.85rem', background: '#FEE2E2', color: '#DC2626', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                        {deleting === post.id ? '...' : 'Hapus'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.5rem', borderTop: '1px solid #F3F4F6' }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { setPage(p); fetchPosts(p); }}
                style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #E5E7EB', background: p === page ? '#1B6B44' : '#fff', color: p === page ? '#fff' : '#374151', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
