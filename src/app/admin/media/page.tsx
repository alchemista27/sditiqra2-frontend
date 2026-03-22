// src/app/admin/media/page.tsx — Media Library (WordPress-style, Cloudinary)
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { mediaApi, type CloudinaryMedia } from '@/lib/api';
import { getToken } from '@/lib/auth';
import Image from 'next/image';

type ViewMode = 'grid' | 'list';

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<CloudinaryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<CloudinaryMedia | null>(null);
  const [view, setView] = useState<ViewMode>('grid');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchMedia = useCallback(async (cursor?: string) => {
    setLoading(true);
    try {
      const params: Record<string, string> = { max_results: '40' };
      if (cursor) params.next_cursor = cursor;
      const r = await mediaApi.getAll(getToken()!, params);
      setMedia(prev => cursor ? [...prev, ...r.data] : r.data);
      setNextCursor(r.nextCursor || null);
      setTotal(r.totalCount || r.data.length);
    } catch (err) { console.error(err); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMedia(); }, [fetchMedia]);

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await mediaApi.upload(getToken()!, file, 'media');
      }
      await fetchMedia();
    } catch { alert('Upload gagal.'); }
    setUploading(false);
  };

  const handleDelete = async (item: CloudinaryMedia) => {
    if (!confirm(`Hapus "${item.displayName}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await mediaApi.remove(getToken()!, item.publicId);
      setMedia(prev => prev.filter(m => m.publicId !== item.publicId));
      if (selected?.publicId === item.publicId) setSelected(null);
    } catch { alert('Gagal menghapus.'); }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 130px)' }}>
      {/* Sidebar kiri — daftar media */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Media Library</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{total} file di Cloudinary</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* View toggle */}
            <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 10, padding: 3, gap: 2 }}>
              {(['grid', 'list'] as ViewMode[]).map(v => (
                <button key={v} onClick={() => setView(v)} style={{ padding: '0.4rem 0.65rem', borderRadius: 8, border: 'none', cursor: 'pointer', background: view === v ? '#fff' : 'transparent', color: view === v ? '#1B6B44' : '#6B7280', boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.15s' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{v === 'grid' ? 'grid_view' : 'view_list'}</span>
                </button>
              ))}
            </div>

            {/* Upload button */}
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #1B6B44, #2D9164)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{uploading ? 'sync' : 'upload'}</span>
              {uploading ? 'Mengupload...' : 'Upload File'}
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*" onChange={e => e.target.files && handleUpload(e.target.files)} style={{ display: 'none' }} />
          </div>
        </div>

        {/* Drop zone */}
        <div
          onDrop={e => { e.preventDefault(); if (e.dataTransfer.files) handleUpload(e.dataTransfer.files); }}
          onDragOver={e => e.preventDefault()}
          style={{ flex: 1, overflowY: 'auto' }}
        >
          {loading && media.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, display: 'block', animation: 'spin 1s linear infinite' }}>refresh</span>
              Memuat media...
            </div>
          ) : media.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#F9FAFB', borderRadius: 16, border: '2px dashed #E5E7EB' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#D1D5DB', display: 'block', marginBottom: 12 }}>photo_library</span>
              <p style={{ fontWeight: 600, color: '#374151' }}>Belum ada media</p>
              <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Upload file atau drag & drop di sini</p>
            </div>
          ) : view === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.875rem' }}>
              {media.map(item => (
                <div
                  key={item.publicId}
                  onClick={() => setSelected(item)}
                  style={{ cursor: 'pointer', borderRadius: 12, overflow: 'hidden', border: selected?.publicId === item.publicId ? '2.5px solid #1B6B44' : '2px solid transparent', background: '#F3F4F6', position: 'relative', aspectRatio: '1', transition: 'border-color 0.15s, transform 0.15s' }}
                >
                  <Image src={item.url} alt={item.displayName || ''} fill sizes="200px" style={{ objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)', color: '#fff', fontSize: 11, padding: '1.25rem 0.5rem 0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.displayName}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Preview', 'Nama', 'Tipe', 'Ukuran', 'Dimensi', 'Tanggal'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {media.map(item => (
                    <tr key={item.publicId} onClick={() => setSelected(item)} style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer', background: selected?.publicId === item.publicId ? '#F0FDF4' : 'transparent', transition: 'background 0.15s' }}>
                      <td style={{ padding: '0.5rem 1rem' }}>
                        <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                          <Image src={item.url} alt={item.displayName || ''} fill sizes="48px" style={{ objectFit: 'cover' }} />
                        </div>
                      </td>
                      <td style={{ padding: '0.5rem 1rem', fontSize: 13, fontWeight: 500, color: '#111827', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.displayName}</td>
                      <td style={{ padding: '0.5rem 1rem', fontSize: 12, color: '#6B7280' }}>{item.format?.toUpperCase()}</td>
                      <td style={{ padding: '0.5rem 1rem', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{formatBytes(item.bytes)}</td>
                      <td style={{ padding: '0.5rem 1rem', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{item.width && item.height ? `${item.width}×${item.height}` : '—'}</td>
                      <td style={{ padding: '0.5rem 1rem', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{new Date(item.createdAt).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {nextCursor && (
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <button onClick={() => fetchMedia(nextCursor)} disabled={loading} style={{ padding: '0.65rem 2rem', background: '#F3F4F6', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#374151' }}>
                {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel kanan */}
      <div style={{ width: 280, flexShrink: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {!selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center', color: '#9CA3AF' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, color: '#E5E7EB' }}>image_search</span>
            <p style={{ fontSize: 13 }}>Pilih sebuah gambar untuk melihat detailnya</p>
          </div>
        ) : (
          <>
            <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', aspectRatio: '1', background: '#F3F4F6' }}>
              <Image src={selected.url} alt={selected.displayName || ''} fill sizes="280px" style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#111827', wordBreak: 'break-all' }}>{selected.displayName}</p>
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>{selected.format?.toUpperCase()} · {formatBytes(selected.bytes)}</p>
              {selected.width && <p style={{ fontSize: 12, color: '#6B7280' }}>{selected.width} × {selected.height} px</p>}
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{new Date(selected.createdAt).toLocaleString('id-ID')}</p>
            </div>

            {/* URL Field */}
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>URL Gambar</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input readOnly value={selected.url} style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 11, color: '#6B7280', background: '#F9FAFB', minWidth: 0 }} />
                <button onClick={() => copyUrl(selected.url)} title="Salin URL" style={{ padding: '0.5rem 0.75rem', background: copied ? '#D1FAE5' : '#F0FDF4', border: `1px solid ${copied ? '#86EFAC' : '#BBF7D0'}`, borderRadius: 8, cursor: 'pointer', color: '#1B6B44', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{copied ? 'check' : 'content_copy'}</span>
                </button>
              </div>
            </div>

            <a href={selected.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.6rem', background: '#F0FDF4', color: '#1B6B44', border: '1px solid #86EFAC', borderRadius: 10, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span> Buka Original
            </a>

            <button onClick={() => handleDelete(selected)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.6rem', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span> Hapus Permanen
            </button>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
