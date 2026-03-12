'use client';
// src/components/cms/MediaLibraryModal.tsx
// Modal WordPress-style untuk memilih atau upload gambar dari Cloudinary
import { useState, useEffect, useRef, useCallback } from 'react';
import { mediaApi, type CloudinaryMedia } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

type Tab = 'library' | 'upload';

export default function MediaLibraryModal({ open, onClose, onSelect }: Props) {
  const [tab, setTab] = useState<Tab>('library');
  const [media, setMedia] = useState<CloudinaryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<CloudinaryMedia | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const r = await mediaApi.getAll(token, { max_results: '60' });
      setMedia(r.data);
    } catch (err) {
      console.error('Error fetching media:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      fetchMedia();
      setSelected(null);
      setTab('library');
    }
  }, [open, fetchMedia]);

  const handleUpload = async (files: FileList) => {
    const token = getToken();
    if (!token) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await mediaApi.upload(token, file, 'media');
      }
      await fetchMedia();
      setTab('library');
    } catch {
      alert('Upload gagal.');
    }
    setUploading(false);
  };

  const handleInsert = () => {
    if (selected) {
      onSelect(selected.url);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 20, width: '90vw', maxWidth: 960,
        height: '80vh', maxHeight: 680, display: 'flex', flexDirection: 'column',
        boxShadow: '0 25px 80px rgba(0,0,0,0.25)', overflow: 'hidden',
        animation: 'slideUp 0.2s ease-out',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem', borderBottom: '1px solid #E5E7EB', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B6B44' }}>photo_library</span>
              Media Library
            </h2>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', borderRadius: 10, padding: 3 }}>
              {([['library', 'Galeri Media', 'photo_library'], ['upload', 'Upload Baru', 'cloud_upload']] as const).map(([key, label, icon]) => (
                <button
                  key={key}
                  onClick={() => setTab(key as Tab)}
                  style={{
                    padding: '0.4rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: tab === key ? '#fff' : 'transparent',
                    color: tab === key ? '#1B6B44' : '#6B7280',
                    fontWeight: tab === key ? 700 : 500, fontSize: 13,
                    boxShadow: tab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: '#F3F4F6', border: 'none', borderRadius: 10, width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#6B7280', transition: 'background 0.15s',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {tab === 'library' ? (
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Grid area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                {loading ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} style={{ aspectRatio: '1', background: '#F3F4F6', borderRadius: 12, animation: 'pulse 1.5s infinite' }} />
                    ))}
                  </div>
                ) : media.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#9CA3AF' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 56, display: 'block', marginBottom: 12, color: '#D1D5DB' }}>photo_library</span>
                    <p style={{ fontWeight: 600, color: '#374151' }}>Belum ada media</p>
                    <p style={{ fontSize: 13, marginTop: 4 }}>Upload gambar di tab &quot;Upload Baru&quot;</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                    {media.map(item => (
                      <div
                        key={item.publicId}
                        onClick={() => setSelected(item)}
                        style={{
                          cursor: 'pointer', borderRadius: 12, overflow: 'hidden',
                          border: selected?.publicId === item.publicId ? '3px solid #1B6B44' : '3px solid transparent',
                          background: '#F3F4F6', position: 'relative', aspectRatio: '1',
                          transition: 'border-color 0.15s, transform 0.15s',
                          transform: selected?.publicId === item.publicId ? 'scale(0.96)' : 'scale(1)',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.url} alt={item.displayName || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {selected?.publicId === item.publicId && (
                          <div style={{
                            position: 'absolute', top: 6, right: 6, width: 24, height: 24,
                            background: '#1B6B44', borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#fff' }}>check</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detail sidebar */}
              {selected && (
                <div style={{
                  width: 220, flexShrink: 0, borderLeft: '1px solid #E5E7EB',
                  padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem',
                  overflowY: 'auto', background: '#FAFAFA',
                }}>
                  <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '1', background: '#F3F4F6' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected.url} alt={selected.displayName || ''} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: '#111827', wordBreak: 'break-all' }}>{selected.displayName}</p>
                    <p style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>
                      {selected.format?.toUpperCase()} · {selected.width}×{selected.height}
                    </p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                      {new Date(selected.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Upload Tab */
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
              <div
                onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files); }}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onClick={() => fileRef.current?.click()}
                style={{
                  width: '100%', maxWidth: 500, padding: '4rem 2rem',
                  border: `2.5px dashed ${dragActive ? '#1B6B44' : '#D1D5DB'}`,
                  borderRadius: 20, textAlign: 'center', cursor: 'pointer',
                  background: dragActive ? '#F0FDF4' : '#FAFAFA',
                  transition: 'all 0.2s',
                }}
              >
                {uploading ? (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 56, color: '#1B6B44', display: 'block', marginBottom: 16, animation: 'spin 1s linear infinite' }}>sync</span>
                    <p style={{ fontWeight: 700, color: '#111827', fontSize: 16 }}>Mengupload...</p>
                    <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>Harap tunggu, file sedang diproses</p>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 56, color: dragActive ? '#1B6B44' : '#9CA3AF', display: 'block', marginBottom: 16, transition: 'color 0.2s' }}>cloud_upload</span>
                    <p style={{ fontWeight: 700, color: '#111827', fontSize: 16 }}>Drag & drop gambar di sini</p>
                    <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>atau klik untuk memilih file</p>
                    <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.6rem 1.5rem', background: 'linear-gradient(135deg, #1B6B44, #2D9164)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>upload</span>
                      Pilih File
                    </div>
                  </>
                )}
                <input ref={fileRef} type="file" multiple accept="image/*" onChange={e => e.target.files && handleUpload(e.target.files)} style={{ display: 'none' }} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem', borderTop: '1px solid #E5E7EB', flexShrink: 0,
          background: '#FAFAFA',
        }}>
          <p style={{ fontSize: 13, color: '#6B7280' }}>
            {selected ? `Dipilih: ${selected.displayName}` : 'Pilih gambar untuk disisipkan'}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{
              padding: '0.6rem 1.5rem', background: '#F3F4F6', color: '#374151',
              border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>
              Batal
            </button>
            <button
              onClick={handleInsert}
              disabled={!selected}
              style={{
                padding: '0.6rem 1.5rem',
                background: selected ? 'linear-gradient(135deg, #1B6B44, #2D9164)' : '#E5E7EB',
                color: selected ? '#fff' : '#9CA3AF',
                border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14,
                cursor: selected ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_photo_alternate</span>
              Sisipkan ke Editor
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
