// src/app/(public)/page.tsx - Halaman Beranda
import Link from 'next/link';
import { postsApi, pagesApi } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function HomePage() {
  const [postsResult, pagesResult] = await Promise.allSettled([
    postsApi.getAll({ limit: '6', status: 'PUBLISHED' }),
    pagesApi.getAll(),
  ]);

  const posts = postsResult.status === 'fulfilled' ? postsResult.value.data : [];
  const pages = pagesResult.status === 'fulfilled' ? pagesResult.value.data : [];

  return (
    <>
      {/* ─── HERO ───────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #0F3D24 0%, #1B6B44 50%, #1a5c3a 100%)',
        color: '#fff', minHeight: '90vh',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Dekorasi background */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'rgba(201,168,76,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -150, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 1.5rem', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 30, padding: '0.4rem 1rem', marginBottom: '1.5rem', fontSize: 13, color: '#F2D98A' }}>
              ✨ Sekolah Islam Terpadu Bengkulu
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
              SD Islam Terpadu<br />
              <span style={{ color: '#C9A84C' }}>Iqra 2</span> Kota Bengkulu
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 480, marginBottom: '2rem' }}>
              Mewujudkan generasi Islami yang cerdas, berakhlak mulia, dan berprestasi dalam lingkungan pendidikan yang kondusif dan Islami.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/ppdb" style={{
                padding: '0.875rem 2rem', background: 'linear-gradient(135deg, #C9A84C, #F2D98A)',
                color: '#0F3D24', borderRadius: 50, fontWeight: 700, fontSize: 15,
                textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
              }}>🎓 Daftar Sekarang</Link>
              <Link href="/berita" style={{
                padding: '0.875rem 2rem', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
                borderRadius: 50, fontWeight: 600, fontSize: 15, textDecoration: 'none',
                backdropFilter: 'blur(10px)', transition: 'background 0.2s',
              }}>Lihat Berita</Link>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { icon: '🎓', value: '600+', label: 'Siswa Aktif' },
              { icon: '👨‍🏫', value: '40+', label: 'Tenaga Pendidik' },
              { icon: '🏆', value: '25+', label: 'Prestasi' },
              { icon: '📚', value: '15+', label: 'Tahun Berpengalaman' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '1.5rem', textAlign: 'center',
                backdropFilter: 'blur(10px)',
              }}>
                <div style={{ fontSize: 28, marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#F2D98A' }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <style>{`@media (max-width: 768px) { section > div > div:last-child { display: none !important; } section > div { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ─── BERITA TERBARU ─────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-block', background: '#E8F5EE', color: '#1B6B44', padding: '0.35rem 1rem', borderRadius: 30, fontSize: 13, fontWeight: 600, marginBottom: '0.75rem' }}>📰 Informasi Terkini</div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: '#111827' }}>Berita & Pengumuman</h2>
            <p style={{ color: '#6B7280', marginTop: '0.5rem', maxWidth: 500, margin: '0.75rem auto 0' }}>Ikuti perkembangan terbaru kegiatan dan informasi penting dari sekolah kami.</p>
          </div>

          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF' }}>Belum ada berita yang dipublikasikan.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {posts.map((post: any) => (
                <Link key={post.id} href={`/berita/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <article style={{
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB',
                    height: '100%',
                  }} className="hover-card">
                    {/* Cover Image */}
                    <div style={{ height: 180, background: 'linear-gradient(135deg, #1B6B44, #2D9164)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                      {post.coverImage
                        ? <img src={`${API_BASE}${post.coverImage}`} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '📰'}
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      {post.category && (
                        <span style={{ display: 'inline-block', background: '#E8F5EE', color: '#1B6B44', padding: '0.2rem 0.75rem', borderRadius: 30, fontSize: 11, fontWeight: 600, marginBottom: '0.75rem' }}>
                          {post.category.name}
                        </span>
                      )}
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: '0.5rem', lineHeight: 1.4 }}>{post.title}</h3>
                      {post.excerpt && <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: '1rem' }}>{post.excerpt.substring(0, 100)}...</p>}
                      <div style={{ fontSize: 12, color: '#9CA3AF' }}>{formatDate(post.publishedAt || post.createdAt)}</div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <Link href="/berita" style={{
              display: 'inline-block', padding: '0.75rem 2rem',
              border: '2px solid #1B6B44', color: '#1B6B44',
              borderRadius: 50, fontWeight: 600, textDecoration: 'none',
            }} className="hover-btn">
              Lihat Semua Berita →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── PPDB CTA ────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, #1B6B44, #0F3D24)',
        color: '#fff', padding: '5rem 1.5rem', textAlign: 'center',
      }}>
        <div style={{ maxWidth: 650, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>🎓</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', marginBottom: '1rem' }}>Penerimaan Siswa Baru</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, lineHeight: 1.7, marginBottom: '2rem' }}>
            Daftarkan putra-putri Anda sekarang! Pendaftaran dapat dilakukan secara online melalui portal PPDB kami.
          </p>
          <Link href="/ppdb" style={{
            display: 'inline-block', padding: '1rem 2.5rem',
            background: 'linear-gradient(135deg, #C9A84C, #F2D98A)',
            color: '#0F3D24', borderRadius: 50,
            fontWeight: 700, fontSize: 16, textDecoration: 'none',
            boxShadow: '0 6px 25px rgba(201,168,76,0.4)',
          }}>
            Mulai Pendaftaran →
          </Link>
        </div>
      </section>
    </>
  );
}
