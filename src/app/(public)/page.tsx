// src/app/(public)/page.tsx - Halaman Beranda
// ISR: Revalidate setiap 60 detik agar perubahan settings & berita cepat tampil
import Link from 'next/link';
import { postsApi, settingsApi } from '@/lib/api';
import GallerySlideshow from '@/components/GallerySlideshow';

export const revalidate = 60; // ISR: regenerate setiap 60 detik

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

interface StatItem { icon: string; value: string; label: string }
interface FeatureItem { icon: string; title: string; desc: string }
type Post = { id: string; title: string; slug: string; excerpt?: string; coverImage?: string; publishedAt?: string; createdAt: string; category?: { name: string } }

export default async function HomePage() {
  // Fetch paralel: posts terbaru + semua site settings
  const [postsResult, settingsResult] = await Promise.allSettled([
    postsApi.getAll({ limit: '6', status: 'PUBLISHED' }),
    settingsApi.getAll(),
  ]);

  const posts: Post[] = postsResult.status === 'fulfilled' ? postsResult.value.data : [];
  const settings: Record<string, string> = settingsResult.status === 'fulfilled' ? settingsResult.value.data : {};

  // Ambil nilai dari settings dengan fallback default
  const siteName = settings.site_name || 'SD Islam Terpadu Iqra 2';
  const heroTitle = settings.hero_title || siteName;
  const heroSubtitle = settings.hero_subtitle || 'Mewujudkan generasi Islami yang cerdas dan berakhlak mulia.';
  const ctaPrimaryText = settings.hero_cta_primary_text || 'Daftar Sekarang';
  const ctaPrimaryUrl = settings.hero_cta_primary_url || '/ppdb';
  const ctaSecondaryText = settings.hero_cta_secondary_text || 'Lihat Berita';
  const ctaSecondaryUrl = settings.hero_cta_secondary_url || '/berita';

  let stats: StatItem[] = [];
  let features: FeatureItem[] = [];
  try { stats = JSON.parse(settings.stats || '[]'); } catch { stats = []; }
  try { features = JSON.parse(settings.features || '[]'); } catch { features = []; }

  // Fallback stats jika belum ada
  if (stats.length === 0) {
    stats = [
      { icon: 'school', value: '600+', label: 'Siswa Aktif' },
      { icon: 'person', value: '40+', label: 'Tenaga Pendidik' },
      { icon: 'emoji_events', value: '25+', label: 'Prestasi' },
      { icon: 'menu_book', value: '15+', label: 'Tahun Berpengalaman' },
    ];
  }

  // Fallback features jika belum ada
  if (features.length === 0) {
    features = [
      { icon: 'mosque', title: 'Pendidikan Islami', desc: 'Kurikulum terintegrasi nilai-nilai Islam dalam setiap mata pelajaran.' },
      { icon: 'science', title: 'Akademik Unggul', desc: 'Standar akademik tinggi dengan metode pembelajaran inovatif.' },
      { icon: 'sports_soccer', title: 'Ekstrakurikuler', desc: 'Berbagai kegiatan untuk mengembangkan bakat dan minat siswa.' },
      { icon: 'family_restroom', title: 'Lingkungan Kondusif', desc: 'Lingkungan belajar yang aman, nyaman, dan mendukung tumbuh kembang.' },
    ];
  }

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
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', margin: '0 0 1.25rem' }}>
              {heroTitle}
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 480, marginBottom: '2rem' }}>
              {heroSubtitle}
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href={ctaPrimaryUrl} style={{
                padding: '0.875rem 2rem', background: 'linear-gradient(135deg, #C9A84C, #F2D98A)',
                color: '#0F3D24', borderRadius: 50, fontWeight: 700, fontSize: 15,
                textDecoration: 'none', boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}><span className="material-symbols-outlined" style={{ fontSize: 20 }}>school</span> {ctaPrimaryText}</Link>
              <Link href={ctaSecondaryUrl} style={{
                padding: '0.875rem 2rem', background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.3)', color: '#fff',
                borderRadius: 50, fontWeight: 600, fontSize: 15, textDecoration: 'none',
                backdropFilter: 'blur(10px)',
              }}>{ctaSecondaryText}</Link>
            </div>
          </div>

          {/* Stats Cards — dari settings.stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {stats.map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16, padding: '1.5rem', textAlign: 'center',
                backdropFilter: 'blur(10px)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#C9A84C', display: 'block', marginBottom: '0.5rem' }}>{stat.icon}</span>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#F2D98A' }}>{stat.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <style>{`@media (max-width: 768px) { section > div > div:last-child { display: none !important; } section > div { grid-template-columns: 1fr !important; } }`}</style>
      </section>

      {/* ─── GALLERY SLIDESHOW ──────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#E8F5EE', color: '#1B6B44', padding: '0.35rem 1rem', borderRadius: 30, fontSize: 13, fontWeight: 600, marginBottom: '0.75rem', width: 'fit-content', margin: '0 auto 0.75rem' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_camera</span> Galeri Sekolah</div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: '#111827', margin: '0 0 0.75rem' }}>Momen Kebersamaan</h2>
            <p style={{ color: '#6B7280', maxWidth: 500, margin: '0 auto' }}>Potret kegiatan belajar mengajar dan aktivitas unggulan di lingkungan sekolah kami.</p>
          </div>
          <GallerySlideshow />
        </div>
      </section>

      {/* ─── FITUR UNGGULAN ─────────────────────────────────── */}
      {features.length > 0 && (
        <section style={{ padding: '5rem 1.5rem', background: '#fff' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#E8F5EE', color: '#1B6B44', padding: '0.35rem 1rem', borderRadius: 30, fontSize: 13, fontWeight: 600, marginBottom: '0.75rem', width: 'fit-content', margin: '0 auto 0.75rem' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>star</span> Keunggulan Kami</div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: '#111827', margin: '0 0 0.75rem' }}>Mengapa Memilih Kami?</h2>
              <p style={{ color: '#6B7280', maxWidth: 500, margin: '0 auto' }}>Kami berkomitmen memberikan pendidikan berkualitas tinggi yang terintegrasi dengan nilai-nilai Islam.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {features.map((feat, i) => (
                <div key={i} style={{
                  background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 16, padding: '2rem',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }} className="feature-card">
                  <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #E8F5EE, #D4EDE0)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#1B6B44' }}>{feat.icon}</span>
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: '0.5rem', margin: '0 0 0.5rem' }}>{feat.title}</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, margin: 0 }}>{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <style>{`.feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(0,0,0,0.08); border-color: #A7F3D0 !important; }`}</style>
        </section>
      )}

      {/* ─── BERITA TERBARU ─────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: '#E8F5EE', color: '#1B6B44', padding: '0.35rem 1rem', borderRadius: 30, fontSize: 13, fontWeight: 600, marginBottom: '0.75rem', width: 'fit-content', margin: '0 auto 0.75rem' }}><span className="material-symbols-outlined" style={{ fontSize: 18 }}>newspaper</span> Informasi Terkini</div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: '#111827', margin: '0 0 0.75rem' }}>Berita &amp; Pengumuman</h2>
            <p style={{ color: '#6B7280', maxWidth: 500, margin: '0 auto' }}>Ikuti perkembangan terbaru kegiatan dan informasi penting dari sekolah kami.</p>
          </div>

          {posts.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9CA3AF' }}>Belum ada berita yang dipublikasikan.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {posts.map((post) => (
                <Link key={post.id} href={`/berita/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <article style={{
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', height: '100%',
                  }} className="hover-card">
                    <div style={{ height: 180, background: 'linear-gradient(135deg, #1B6B44, #2D9164)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>
                      {post.coverImage
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={`${API_BASE}${post.coverImage}`} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'rgba(255,255,255,0.8)' }}>article</span>}
                    </div>
                    <div style={{ padding: '1.25rem' }}>
                      {post.category && (
                        <span style={{ display: 'inline-block', background: '#E8F5EE', color: '#1B6B44', padding: '0.2rem 0.75rem', borderRadius: 30, fontSize: 11, fontWeight: 600, marginBottom: '0.75rem' }}>
                          {post.category.name}
                        </span>
                      )}
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: '0.5rem', lineHeight: 1.4, margin: '0 0 0.5rem' }}>{post.title}</h3>
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
            }}>
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
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}><span className="material-symbols-outlined" style={{ fontSize: 56, color: '#F2D98A' }}>school</span></div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', marginBottom: '1rem', margin: '0 0 1rem' }}>Penerimaan Siswa Baru</h2>
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
