// src/app/(public)/berita/page.tsx - Daftar Berita
import Link from 'next/link';
import { postsApi, categoriesApi } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export const metadata = { title: 'Berita & Pengumuman' };

export default async function BeritaPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string }> }) {
  const params = await searchParams;
  const page = params.page || '1';
  const categoryId = params.category;

  const [postsResult, catsResult] = await Promise.allSettled([
    postsApi.getAll({ page, limit: '9', status: 'PUBLISHED', ...(categoryId ? { categoryId } : {}) }),
    categoriesApi.getAll(),
  ]);

  const { data: posts = [], pagination } = postsResult.status === 'fulfilled' ? postsResult.value : { data: [], pagination: null };
  const categories = catsResult.status === 'fulfilled' ? catsResult.value.data : [];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
      <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: '#111827', marginBottom: '0.5rem' }}>Berita & Pengumuman</h1>
      <p style={{ color: '#6B7280', marginBottom: '2rem' }}>Informasi terkini dari SD IT Iqra 2 Kota Bengkulu.</p>

      {/* Filter Kategori */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <Link href="/berita" style={{ padding: '0.4rem 1rem', background: !categoryId ? '#1B6B44' : '#F3F4F6', color: !categoryId ? '#fff' : '#374151', borderRadius: 30, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>Semua</Link>
        {categories.map((cat: any) => (
          <Link key={cat.id} href={`/berita?category=${cat.id}`} style={{ padding: '0.4rem 1rem', background: categoryId === cat.id ? '#1B6B44' : '#F3F4F6', color: categoryId === cat.id ? '#fff' : '#374151', borderRadius: 30, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Posts Grid */}
      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>📭</div>
          <p>Belum ada berita di kategori ini.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {posts.map((post: any) => (
            <Link key={post.id} href={`/berita/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
              <article style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }} className="hover-card">
                <div style={{ height: 180, background: 'linear-gradient(135deg, #1B6B44, #2D9164)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                  {post.coverImage ? <img src={`${API_BASE}${post.coverImage}`} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📰'}
                </div>
                <div style={{ padding: '1.25rem' }}>
                  {post.category && <span style={{ display: 'inline-block', background: '#E8F5EE', color: '#1B6B44', padding: '0.2rem 0.75rem', borderRadius: 30, fontSize: 11, fontWeight: 600, marginBottom: '0.75rem' }}>{post.category.name}</span>}
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: '0.5rem', lineHeight: 1.4 }}>{post.title}</h2>
                  {post.excerpt && <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginBottom: '0.75rem' }}>{post.excerpt.substring(0, 90)}...</p>}
                  <div style={{ fontSize: 12, color: '#9CA3AF' }}>{formatDate(post.publishedAt || post.createdAt)}</div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
            <Link key={p} href={`/berita?page=${p}${categoryId ? `&category=${categoryId}` : ''}`}
              style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, background: p === Number(page) ? '#1B6B44' : '#F3F4F6', color: p === Number(page) ? '#fff' : '#374151', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
