'use client';
// src/app/(public)/galeri/page.tsx - Halaman Galeri Lengkap

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { galleryApi, type GalleryItem } from '@/lib/api';

export default function GaleriPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    galleryApi.getAll().then(r => {
      setImages(r.data.filter((i: GalleryItem) => i.isActive));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
    <div style={{ minHeight: '100vh', padding: '8rem 1.5rem 4rem', background: '#F9FAFB' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: '5/4', background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)', borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
          <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '6rem 1.5rem 4rem', background: '#F9FAFB' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#E8F5EE', color: '#1B6B44', padding: '0.35rem 1rem', borderRadius: 30, fontSize: 13, fontWeight: 600, marginBottom: '0.75rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_camera</span> Galeri Kami
          </div>
          <h1 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: '#111827', margin: '0 0 0.75rem' }}>Momen Kebersamaan</h1>
          <p style={{ color: '#6B7280', maxWidth: 500, margin: '0 auto' }}>
            Potret kegiatan belajar mengajar dan aktivitas unggulan di lingkungan sekolah kami.
          </p>
          <p style={{ color: '#9CA3AF', fontSize: 14, marginTop: '0.5rem' }}>
            Total {images.length} foto
          </p>
        </div>

        {images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 64, marginBottom: '1rem' }}>photo_library</span>
            <p style={{ fontSize: 16 }}>Belum ada foto di galeri</p>
          </div>
        ) : (
          /* Grid - 4 columns */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.75rem',
          }}>
            {images.map((img, i) => (
              <div
                key={img.id}
                onClick={() => setLightboxIndex(i)}
                style={{
                  position: 'relative',
                  aspectRatio: '5/4',
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#E5E7EB',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
                className="gallery-item"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  unoptimized={img.imageUrl.startsWith('https://res.cloudinary.com')}
                />
                {/* Hover overlay */}
                <div className="gallery-overlay" style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(15,61,36,0.55)',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '0.4rem',
                  opacity: 0,
                  transition: 'opacity 0.25s ease',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 30, color: '#fff' }}>zoom_in</span>
                  <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, margin: 0, textAlign: 'center', padding: '0 0.75rem', lineHeight: 1.4, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                    {img.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox */}
        <Lightbox
          index={lightboxIndex}
          open={lightboxIndex >= 0}
          close={() => setLightboxIndex(-1)}
          slides={images.map(img => ({ src: img.imageUrl, title: img.title, description: img.description || undefined }))}
          plugins={[Zoom]}
          controller={{ closeOnBackdropClick: true }}
        />

        {/* CSS */}
        <style>{`
          .gallery-item:hover .gallery-overlay { opacity: 1 !important; }
          .gallery-item:hover img { transform: scale(1.05); }
          @media (max-width: 1024px) {
            div[style*="grid-template-columns: repeat(4"] {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }
          @media (max-width: 768px) {
            div[style*="grid-template-columns: repeat(4"] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            .gallery-item { border-radius: 8px !important; }
          }
          @media (max-width: 480px) {
            div[style*="grid-template-columns: repeat(4"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}