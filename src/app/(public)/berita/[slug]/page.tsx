// src/app/(public)/berita/[slug]/page.tsx - Detail Berita
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { postsApi } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { data: post } = await postsApi.getBySlug(slug);
    return { title: post.title, description: post.excerpt || '' };
  } catch {
    return { title: 'Berita Tidak Ditemukan' };
  }
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: any;

  try {
    const result = await postsApi.getBySlug(slug);
    post = result.data;
  } catch {
    notFound();
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '6rem 1.5rem 3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
        <Link href="/berita" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#1B6B44', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
          Kembali ke Berita
        </Link>
        {post.category && (
          <span style={{ display: 'inline-block', background: '#E8F5EE', color: '#1B6B44', padding: '0.3rem 0.9rem', borderRadius: 30, fontSize: 12, fontWeight: 600 }}>
            {post.category.name}
          </span>
        )}
      </div>

      <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, color: '#111827', lineHeight: 1.3, marginBottom: '1rem' }}>{post.title}</h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#6B7280', fontSize: 14, marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E5E7EB' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span> {post.author?.name}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span> {formatDate(post.publishedAt || post.createdAt)}</span>
      </div>

      {post.coverImage && (
        <img src={`${API_BASE}${post.coverImage}`} alt={post.title}
          style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 16, marginBottom: '2rem' }} />
      )}

      <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
