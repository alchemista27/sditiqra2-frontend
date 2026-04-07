'use client';
// src/app/admin/page.tsx - Dashboard Overview
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { postsApi, pagesApi, categoriesApi } from '@/lib/api';
import { getToken, getUserFromToken } from '@/lib/auth';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ posts: 0, pages: 0, categories: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (token) setUser(getUserFromToken(token));

    Promise.all([
      postsApi.getAll({ limit: '5' }),
      pagesApi.getAll(),
      categoriesApi.getAll(),
    ]).then(([posts, pages, cats]) => {
      setStats({ posts: posts.pagination?.total || 0, pages: pages.data.length, categories: cats.data.length });
      setRecentPosts(posts.data.slice(0, 5));
    }).catch(() => {});
  }, []);

  const statCards = [
    { label: 'Total Berita', value: stats.posts, icon: 'newspaper', href: '/admin/posts', color: '#1B6B44' },
    { label: 'Halaman Statis', value: stats.pages, icon: 'description', href: '/admin/pages', color: '#2D9164' },
    { label: 'Kategori', value: stats.categories, icon: 'sell', href: '/admin/categories', color: '#C9A84C' },
  ];

  return (
    <div>
      {/* Welcome */}
      <div style={{ background: 'linear-gradient(135deg, #1B6B44, #2D9164)', borderRadius: 20, padding: '1.75rem 2rem', marginBottom: '1.5rem', color: '#fff' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 26 }}>waving_hand</span>
          Selamat datang, {user?.name?.split(' ')[0] || 'Admin'}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>Kelola konten website SD IT Iqra 2 Bengkulu dari sini.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {statCards.map(card => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.5rem', transition: 'box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = 'none'}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 24, color: card.color }}>{card.icon}</span>
              </div>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>{card.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Aksi Cepat</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { href: '/admin/posts/new', label: 'Tulis Berita', icon: 'edit', bg: '#1B6B44' },
            { href: '/admin/pages/create', label: 'Buat Halaman', icon: 'note_add', bg: '#2D9164' },
            { href: '/admin/categories', label: 'Kategori', icon: 'category', bg: '#C9A84C' },
            { href: '/admin/media', label: 'Kelola Media', icon: 'folder', bg: '#374151' },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ padding: '0.6rem 1.25rem', background: a.bg, color: '#fff', borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Berita Terbaru</h2>
          <Link href="/admin/posts" style={{ fontSize: 13, color: '#1B6B44', textDecoration: 'none', fontWeight: 600 }}>Lihat Semua →</Link>
        </div>
        {recentPosts.length === 0 ? (
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Belum ada berita.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {recentPosts.map((post: any, i) => (
              <div key={post.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 0', borderBottom: i < recentPosts.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.15rem' }}>{post.category?.name || 'Tanpa Kategori'}</div>
                </div>
                <span style={{
                  padding: '0.2rem 0.65rem', borderRadius: 30, fontSize: 11, fontWeight: 600, marginLeft: '1rem',
                  background: post.status === 'PUBLISHED' ? '#DCFCE7' : '#FEF3C7',
                  color: post.status === 'PUBLISHED' ? '#166534' : '#92400E',
                }}>{post.status === 'PUBLISHED' ? 'Published' : 'Draft'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
