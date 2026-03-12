// src/app/admin/pages/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { pagesApi } from '@/lib/api';
import { getToken } from '@/lib/auth';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/cms/RichTextEditor'), { ssr: false });

export default function CreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', content: '', status: 'PUBLISHED', sortOrder: '0' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content || form.content.trim() === '') {
      setError('Konten halaman tidak boleh kosong.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await pagesApi.create(getToken()!, form);
      router.push('/admin/pages');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan halaman.');
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.85rem 1rem',
    border: '1.5px solid #E5E7EB', borderRadius: 10,
    fontSize: 14, fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  };

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-5xl mx-auto pb-24">
        <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-1">
            <Link href="/admin/pages" className="hover:text-gray-900 transition-colors">Halaman</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-gray-900 font-medium">Buat Baru</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Buat Halaman Baru</h1>
        </div>
        <Link href="/admin/pages" className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors" style={{ padding: '10px 20px', backgroundColor: '#F3F4F6', color: '#374151', borderRadius: '12px' }}>
          Batal
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 font-medium text-sm flex items-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-lg">error</span> {error}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Kolom Kiri - Editor */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Judul Halaman *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required placeholder="Contoh: Tentang Kami Sekolah"
              style={inputStyle}
              className="focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Konten Halaman *</label>
            <RichTextEditor
              content={form.content}
              onChange={(html) => setForm(f => ({ ...f, content: html }))}
              placeholder="Mulai menulis konten halaman di sini..."
            />
          </div>
        </div>

        {/* Kolom Kanan - Sidebar Attributes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6 sticky top-8" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Status Publikasi</label>
            <select 
                value={form.status} 
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))} 
                style={inputStyle}
                className="focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow"
            >
              <option value="PUBLISHED">🟢 Published (Aktif)</option>
              <option value="DRAFT">⚪ Draft (Konsep)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Urutan Tampil</label>
            <input 
                type="number" 
                value={form.sortOrder} 
                onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} 
                style={inputStyle} 
                className="focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow"
            />
            <p className="text-xs text-gray-500 mt-2">Urutan untuk pengurutan manual di menu (0 = Pertama).</p>
          </div>

          <hr className="border-gray-100" />

          <button 
            type="submit" 
            disabled={saving}
            className="w-full py-3.5 bg-[#1B6B44] text-white rounded-xl font-bold text-sm hover:bg-[#0F3D24] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            style={{ padding: '14px', width: '100%', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <span className="material-symbols-outlined text-[20px]">{saving ? 'sync' : 'publish'}</span>
            {saving ? 'Menyimpan...' : 'Simpan Halaman'}
          </button>
        </div>
      </form>
    </div>
    </div>
  );
}
