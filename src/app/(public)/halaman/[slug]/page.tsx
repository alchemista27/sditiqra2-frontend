// src/app/(public)/halaman/[slug]/page.tsx - Halaman Statis Dinamis
import { notFound } from 'next/navigation';
import { pagesApi } from '@/lib/api';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const { data: page } = await pagesApi.getBySlug(slug);
    return { title: page.title };
  } catch {
    return { title: 'Halaman Tidak Ditemukan' };
  }
}

export default async function PageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let page: any;

  try {
    const result = await pagesApi.getBySlug(slug);
    page = result.data;
  } catch {
    notFound();
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: 13, color: '#9CA3AF', marginBottom: '1.5rem' }}>
        <a href="/" style={{ color: '#1B6B44', textDecoration: 'none' }}>Beranda</a>
        <span style={{ margin: '0 0.5rem' }}>›</span>
        <span>{page.title}</span>
      </nav>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #E8F5EE, #FDF7E3)', borderRadius: 20, padding: '2.5rem', marginBottom: '2.5rem', borderLeft: '4px solid #1B6B44' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#0F3D24' }}>{page.title}</h1>
      </div>

      {/* Content */}
      <div className="prose" style={{ maxWidth: '100%' }} dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}
