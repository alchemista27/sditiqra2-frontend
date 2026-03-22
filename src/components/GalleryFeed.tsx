'use client';
// src/components/GalleryFeed.tsx
// Galeri bergaya feed Instagram — grid rasio 5:4 dengan pagination & lightbox

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import { galleryApi, type GalleryItem } from '@/lib/api';

interface Props {
  cols?: number;
  rows?: number;
}

export default function GalleryFeed({ cols = 3, rows = 2 }: Props) {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    galleryApi.getAll().then(r => {
      setImages(r.data.filter((i: GalleryItem) => i.isActive));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const perPage = cols * rows;
  const totalPages = Math.ceil(images.length / perPage);
  const pageImages = images.slice(page * perPage, page * perPage + perPage);
  // For lightbox we need global index in original array
  const pageOffset = page * perPage;

  if (loading) {
    // Skeleton loader
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '0.75rem' }}>
        {Array.from({ length: perPage }).map((_, i) => (
          <div key={i} style={{ aspectRatio: '5/4', background: 'linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)', borderRadius: 12, animation: 'shimmer 1.5s infinite' }} />
        ))}
        <style>{`@keyframes shimmer { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div>
      {/* ─── GRID ─────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '0.625rem',
        marginBottom: totalPages > 1 ? '1.75rem' : '0',
      }}>
        {pageImages.map((img, i) => (
          <div
            key={img.id}
            onClick={() => setLightboxIndex(pageOffset + i)}
            style={{
              position: 'relative',
              aspectRatio: '5/4',
              borderRadius: 12,
              overflow: 'hidden',
              cursor: 'pointer',
              background: '#E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
            className="gallery-feed-item"
          >
            <Image
              src={img.imageUrl}
              alt={img.title}
              fill
              sizes={`(max-width: 768px) 50vw, ${Math.round(100 / cols)}vw`}
              style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
              unoptimized={img.imageUrl.startsWith('https://res.cloudinary.com')}
            />
            {/* Hover overlay */}
            <div className="gallery-feed-overlay" style={{
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

      {/* ─── PAGINATION ───────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, borderRadius: 10,
              border: '1.5px solid #E5E7EB',
              background: page === 0 ? '#F9FAFB' : '#fff',
              color: page === 0 ? '#D1D5DB' : '#1B6B44',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              fontSize: 18,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
          </button>

          {Array.from({ length: totalPages }).map((_, p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: 38, height: 38, borderRadius: 10,
                border: p === page ? 'none' : '1.5px solid #E5E7EB',
                background: p === page ? 'linear-gradient(135deg, #1B6B44, #2D9164)' : '#fff',
                color: p === page ? '#fff' : '#374151',
                fontWeight: p === page ? 700 : 500,
                fontSize: 14,
                cursor: 'pointer',
                boxShadow: p === page ? '0 2px 8px rgba(27,107,68,0.3)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {p + 1}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, borderRadius: 10,
              border: '1.5px solid #E5E7EB',
              background: page === totalPages - 1 ? '#F9FAFB' : '#fff',
              color: page === totalPages - 1 ? '#D1D5DB' : '#1B6B44',
              cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
          </button>

          <span style={{ fontSize: 13, color: '#9CA3AF', marginLeft: '0.25rem' }}>
            {page * perPage + 1}–{Math.min((page + 1) * perPage, images.length)} dari {images.length} foto
          </span>
        </div>
      )}

      {/* ─── LIGHTBOX ─────────────────────────────────────── */}
      <Lightbox
        index={lightboxIndex - pageOffset}
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        slides={pageImages.map(img => ({ src: img.imageUrl, title: img.title, description: img.description || undefined }))}
        plugins={[Zoom]}
        controller={{ closeOnBackdropClick: true }}
      />

      {/* ─── CSS ──────────────────────────────────────────── */}
      <style>{`
        .gallery-feed-item:hover .gallery-feed-overlay { opacity: 1 !important; }
        .gallery-feed-item:hover img { transform: scale(1.05); }
        @media (max-width: 640px) {
          .gallery-feed-item { border-radius: 8px !important; }
        }
      `}</style>
    </div>
  );
}
