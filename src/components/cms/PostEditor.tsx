'use client';
// src/components/cms/PostEditor.tsx - Form editor untuk buat/edit berita
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { postsApi, categoriesApi } from '@/lib/api';
import { getToken } from '@/lib/auth';
import dynamic from 'next/dynamic';

// Load RichTextEditor secara dinamis agar tidak ada SSR error
const RichTextEditor = dynamic(() => import('@/components/cms/RichTextEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ border: '1.5px solid #E5E7EB', borderRadius: 12, minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 14 }}>
      Memuat editor...
    </div>
  ),
});

interface Props {
  mode: 'create' | 'edit';
  postId?: string;
}

export default function PostEditor({ mode, postId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', categoryId: '', status: 'DRAFT' });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editorKey, setEditorKey] = useState(0); // untuk force-reset editor setelah save

  useEffect(() => {
    categoriesApi.getAll().then(r => setCategories(r.data)).catch(() => {});

    if (mode === 'edit' && postId) {
      setLoading(true);
      postsApi.getBySlug(postId)
        .then((response) => {
          const post = response.data;
          if (post) {
            setForm({
              title: post.title || '',
              excerpt: post.excerpt || '',
              content: post.content || '',
              categoryId: post.categoryId || '',
              status: post.status || 'DRAFT',
            });
            if (post.coverImage) {
              setCoverPreview(post.coverImage);
            }
          } else {
            setError('Berita tidak ditemukan.');
          }
        })
        .catch(() => {
          setError('Gagal memuat data berita.');
        })
        .finally(() => setLoading(false));
    }
  }, [mode, postId]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent, saveStatus?: string) => {
    e.preventDefault();
    if (!form.title) { setError('Judul berita wajib diisi.'); return; }
    if (!form.content || form.content === '<p></p>') { setError('Konten berita tidak boleh kosong.'); return; }

    setSaving(true);
    setError('');
    try {
      const token = getToken()!;
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('excerpt', form.excerpt);
      fd.append('content', form.content);
      fd.append('status', saveStatus || form.status);
      if (form.categoryId) fd.append('categoryId', form.categoryId);
      if (coverFile) fd.append('coverImage', coverFile);

      if (mode === 'create') {
        await postsApi.create(token, fd);
        // Reset editor setelah berhasil buat artikel baru
        setForm({ title: '', excerpt: '', content: '', categoryId: '', status: 'DRAFT' });
        setCoverFile(null);
        setCoverPreview('');
        setEditorKey(k => k + 1);
      } else {
        await postsApi.update(token, postId!, fd);
      }
      router.push('/admin/posts');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan berita.');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box' as const, fontFamily: 'inherit' };
  const labelStyle = { display: 'block' as const, fontSize: 13, fontWeight: 600 as const, color: '#374151', marginBottom: '0.5rem' };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Memuat...</div>;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button onClick={() => router.push('/admin/posts')} style={{ background: '#F3F4F6', border: 'none', borderRadius: 10, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#374151' }}>← Kembali</button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{mode === 'create' ? 'Tulis Berita Baru' : 'Edit Berita'}</h1>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: 14, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Judul Berita *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Masukkan judul berita..." style={{ ...inputStyle, fontSize: 18, fontWeight: 700 }} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Ringkasan (Excerpt)</label>
                <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Ringkasan singkat berita (ditampilkan di daftar berita)..."
                  rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={labelStyle}>Konten Berita *</label>
                <RichTextEditor
                  key={editorKey}
                  content={form.content}
                  onChange={(html) => setForm(f => ({ ...f, content: html }))}
                  placeholder="Mulai menulis konten berita di sini..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Publish Actions */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.25rem' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Publikasi</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button type="submit" disabled={saving} style={{ padding: '0.75rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                  {saving ? 'Menyimpan...' : (mode === 'create' ? 'Simpan & Publish' : 'Perbarui')}
                </button>
                {mode === 'create' && (
                  <button type="button" onClick={e => handleSubmit(e as any, 'DRAFT')} disabled={saving}
                    style={{ padding: '0.65rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    Simpan sebagai Draft
                  </button>
                )}
              </div>
            </div>

            {/* Category */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.25rem' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Kategori</h3>
              <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Tanpa Kategori</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            {/* Cover Image */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.25rem' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Foto Sampul</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {coverPreview && <img src={coverPreview} alt="Preview" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10, marginBottom: '0.75rem' }} />}
              <label style={{ padding: '0.65rem', background: '#F3F4F6', border: '2px dashed #D1D5DB', borderRadius: 10, textAlign: 'center', fontSize: 13, color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{coverPreview ? 'sync' : 'add_photo_alternate'}</span>
                {coverPreview ? 'Ganti Foto' : 'Pilih Foto Sampul'}
                <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
