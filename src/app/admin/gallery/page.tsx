// src/app/admin/gallery/page.tsx — Manajemen Galeri Website
'use client';

import { useState, useEffect, useRef } from 'react';
import { galleryApi, type GalleryItem } from '@/lib/api';
import { getToken } from '@/lib/auth';
import Image from 'next/image';
import MediaLibraryModal from '@/components/cms/MediaLibraryModal';

type FormState = {
  title: string;
  description: string;
  order: string;
  isActive: boolean;
  imageUrl?: string;
};

const empty: FormState = { title: '', description: '', order: '0', isActive: true };

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [preview, setPreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const r = await galleryApi.getAll();
      setItems(r.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm(empty);
    setPreview('');
    setError('');
    setShowModal(true);
  };

  const openEdit = (item: GalleryItem) => {
    setEditItem(item);
    setForm({
      title: item.title,
      description: item.description || '',
      order: String(item.order),
      isActive: item.isActive,
    });
    setPreview(item.imageUrl);
    setError('');
    setShowModal(true);
  };

  const handleSelectImage = (url: string) => {
    // Tambahkan ke preview namun tetap buka modal untuk memilih lebih dari 1
    setForm(f => ({ ...f, imageUrl: url }));
    setPreview(url);
    // Jangan tutup modal, biarkan user bisa milih lebih banyak
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) { setError('Judul wajib diisi.'); return; }
    if (!editItem && !form.imageUrl) { setError('Pilih gambar terlebih dahulu.'); return; }

    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('order', form.order);
      fd.append('isActive', String(form.isActive));
      
      // Only append imageUrl if it's a new image (from media library)
      // For updates without changing image, don't append anything
      if (form.imageUrl && !editItem?.id) {
        fd.append('imageUrl', form.imageUrl);
      } else if (form.imageUrl && editItem && form.imageUrl !== editItem.imageUrl) {
        fd.append('imageUrl', form.imageUrl);
      }

      const token = getToken()!;
      if (editItem) {
        await galleryApi.update(token, editItem.id, fd);
      } else {
        await galleryApi.create(token, fd);
      }
      setShowModal(false);
      fetchItems();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus item galeri ini?')) return;
    try { await galleryApi.remove(getToken()!, id); fetchItems(); }
    catch { alert('Gagal menghapus.'); }
  };

  const handleToggle = async (item: GalleryItem) => {
    const fd = new FormData();
    fd.append('isActive', String(!item.isActive));
    fd.append('title', item.title);
    await galleryApi.update(getToken()!, item.id, fd);
    fetchItems();
  };

  const cardStyle = {
    background: '#fff', borderRadius: 16, border: '1px solid #F0F0F0',
    overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    transition: 'transform 0.15s, box-shadow 0.15s',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>Galeri Website</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Kelola foto dan gambar yang tampil di slideshow homepage.</p>
        </div>
        <button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg, #1B6B44, #2D9164)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add_photo_alternate</span>
          Tambah Foto
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF' }}>Memuat galeri...</div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9CA3AF', background: '#F9FAFB', borderRadius: 16, border: '2px dashed #E5E7EB' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, display: 'block', color: '#D1D5DB' }}>photo_library</span>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Belum ada foto di galeri</p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Klik tombol &quot;Tambah Foto&quot; untuk mulai menambahkan.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {items.map(item => (
            <div key={item.id} style={{ ...cardStyle, opacity: item.isActive ? 1 : 0.6 }}>
              <div style={{ position: 'relative', paddingTop: '66%', background: '#F3F4F6', overflow: 'hidden' }}>
                <Image src={item.imageUrl} alt={item.title} fill sizes="280px" style={{ objectFit: 'cover' }} />
                {!item.isActive && (
                  <div style={{ position: 'absolute', top: 8, left: 8, background: '#4B5563', color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>HIDDEN</div>
                )}
              </div>
              <div style={{ padding: '0.875rem 1rem' }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                {item.description && (
                  <p style={{ fontSize: 12, color: '#6B7280', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(item)} style={{ flex: 1, padding: '0.4rem', background: '#F0FDF4', color: '#1B6B44', border: '1px solid #86EFAC', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span> Edit
                  </button>
                  <button onClick={() => handleToggle(item)} title={item.isActive ? 'Sembunyikan' : 'Tampilkan'} style={{ padding: '0.4rem 0.7rem', background: item.isActive ? '#FEF3C7' : '#F0FDF4', color: item.isActive ? '#92400E' : '#166534', border: `1px solid ${item.isActive ? '#FDE68A' : '#86EFAC'}`, borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{item.isActive ? 'visibility_off' : 'visibility'}</span>
                  </button>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '0.4rem 0.7rem', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 540, padding: '2rem', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflowY: 'auto', maxHeight: '90vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800 }}>{editItem ? 'Edit Foto' : 'Tambah Foto Baru'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6B7280' }}>✕</button>
            </div>

            {error && <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '0.75rem 1rem', borderRadius: 10, marginBottom: '1rem', fontSize: 13 }}>{error}</div>}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Image picker button */}
              {preview ? (
                <div style={{ borderRadius: 12, overflow: 'hidden', background: '#F9FAFB', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <Image src={preview} alt="preview" fill sizes="500px" style={{ objectFit: 'cover' }} />
                </div>
              ) : null}
               <button
                type="button"
                onClick={() => setShowMediaModal(true)}
                style={{
                  padding: '0.85rem',
                  background: 'linear-gradient(135deg, #1B6B44, #2D9164)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_library</span>
                {preview ? 'Ubah Foto' : 'Pilih Foto dari Media Library'}
              </button>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Judul Foto *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Deskripsi (opsional)</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit' }} />
              </div>

<div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6 }}>Urutan</label>
                  <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '0.75rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, userSelect: 'none' }}>
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#1B6B44' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Tampilkan di Website</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.85rem', background: '#F3F4F6', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Batal</button>
                <button type="submit" disabled={saving} style={{ flex: 2, padding: '0.85rem', background: 'linear-gradient(135deg, #1B6B44, #2D9164)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
                  {saving ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Tambah ke Galeri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibraryModal
        open={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handleSelectImage}
      />
    </div>
  );
}
