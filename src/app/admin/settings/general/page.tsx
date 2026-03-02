'use client';
// src/app/admin/settings/general/page.tsx
// Pengaturan Umum: Nama Sekolah, Logo, Favicon, Kontak, Sosial Media
import { useEffect, useState, useRef } from 'react';
import { settingsApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Settings { [key: string]: string }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid #F3F4F6' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B6B44' }}>{icon}</span>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text', hint }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; hint?: string;
}) {
  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem',
    border: '1.5px solid #E5E7EB', borderRadius: 10,
    fontSize: 14, fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
    outline: 'none', transition: 'border-color 0.15s',
  };
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={inputStyle} />
      {hint && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.25rem' }}>{hint}</div>}
    </div>
  );
}

function ImageUploadCard({ label, currentUrl, onUpload, hint }: {
  label: string; currentUrl: string; onUpload: (file: File) => void; hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Preview */}
        <div style={{ width: 80, height: 80, border: '2px dashed #E5E7EB', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#F9FAFB', flexShrink: 0 }}>
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUrl.startsWith('/') ? `${API_URL.replace('/api','')}${currentUrl}` : currentUrl}
              alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#D1D5DB' }}>image</span>
          )}
        </div>
        <div>
          <button type="button" onClick={() => ref.current?.click()}
            style={{ padding: '0.55rem 1rem', background: '#F3F4F6', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>upload</span> Pilih File
          </button>
          {hint && <div style={{ fontSize: 12, color: '#9CA3AF' }}>{hint}</div>}
          {currentUrl && <div style={{ fontSize: 11, color: '#6B7280', marginTop: '0.2rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{currentUrl}</div>}
          <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); }} />
        </div>
      </div>
    </div>
  );
}

export default function AdminGeneralSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const s = (key: string) => settings[key] || '';
  const set = (key: string) => (val: string) => setSettings(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    settingsApi.getAll().then(r => {
      setSettings(r.data || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.updateMany(getToken()!, settings);
      showToast('✅ Pengaturan berhasil disimpan!');
    } catch {
      showToast('❌ Gagal menyimpan pengaturan.', 'err');
    }
    setSaving(false);
  };

  const handleLogoUpload = async (file: File) => {
    try {
      const r = await settingsApi.uploadLogo(getToken()!, file);
      if (r.data?.url) { set('site_logo')(r.data.url); showToast('✅ Logo berhasil diupload!'); }
    } catch { showToast('❌ Gagal upload logo.', 'err'); }
  };

  const handleFaviconUpload = async (file: File) => {
    try {
      const r = await settingsApi.uploadFavicon(getToken()!, file);
      if (r.data?.url) { set('site_favicon')(r.data.url); showToast('✅ Favicon berhasil diupload!'); }
    } catch { showToast('❌ Gagal upload favicon.', 'err'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#9CA3AF', fontSize: 15 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 36, marginRight: '0.5rem', animation: 'spin 1s linear infinite' }}>sync</span> Memuat...
    </div>
  );

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: toast.type === 'ok' ? '#111827' : '#DC2626', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 12, fontSize: 14, zIndex: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Pengaturan Umum</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Konfigurasi identitas sekolah, logo, kontak, dan media sosial.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '0.65rem 1.5rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 14 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{saving ? 'sync' : 'save'}</span>
          {saving ? 'Menyimpan...' : 'Simpan Semua'}
        </button>
      </div>

      {/* ─── Identitas Sekolah ───────────────────────── */}
      <SectionCard title="Identitas Sekolah" icon="school">
        <InputField label="Nama Sekolah" value={s('site_name')} onChange={set('site_name')} placeholder="SD Islam Terpadu Iqra 2" />
        <InputField label="Tagline / Slogan" value={s('site_tagline')} onChange={set('site_tagline')} placeholder="Mewujudkan Generasi Islami..." />
      </SectionCard>

      {/* ─── Logo & Favicon ──────────────────────────── */}
      <SectionCard title="Logo & Favicon" icon="image">
        <ImageUploadCard
          label="Logo Sekolah"
          currentUrl={s('site_logo')}
          onUpload={handleLogoUpload}
          hint="Rekomendasi: PNG transparan, min. 200×200px"
        />
        <div style={{ borderTop: '1px solid #F3F4F6', marginBottom: '1rem' }} />
        <ImageUploadCard
          label="Favicon (ikon tab browser)"
          currentUrl={s('site_favicon')}
          onUpload={handleFaviconUpload}
          hint="Rekomendasi: ICO atau PNG, 32×32px atau 64×64px"
        />
        <div style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 10, padding: '0.75rem 1rem', fontSize: 13, color: '#065F46' }}>
          <strong>Info:</strong> Setelah upload logo baru, klik &quot;Simpan Semua&quot; untuk memastikan URL tersimpan ke database.
        </div>
      </SectionCard>

      {/* ─── Informasi Kontak ────────────────────────── */}
      <SectionCard title="Informasi Kontak" icon="contact_phone">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <InputField label="Email" value={s('contact_email')} onChange={set('contact_email')} placeholder="info@sekolah.sch.id" type="email" />
          <InputField label="No. Telepon" value={s('contact_phone')} onChange={set('contact_phone')} placeholder="(0736) 123456" />
        </div>
        <InputField label="Alamat Lengkap" value={s('contact_address')} onChange={set('contact_address')} placeholder="Jl. Contoh No. 1, Kota Bengkulu" />
        <InputField label="Embed Google Maps (URL iframe src)" value={s('contact_maps_embed')} onChange={set('contact_maps_embed')}
          placeholder="https://www.google.com/maps/embed?..."
          hint="Buka Google Maps → Share → Embed a map → salin URL dari src='...'" />
      </SectionCard>

      {/* ─── Media Sosial ────────────────────────────── */}
      <SectionCard title="Media Sosial" icon="share">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <div>
            <InputField label="Facebook" value={s('social_facebook')} onChange={set('social_facebook')} placeholder="https://facebook.com/SDITIqra2" />
            <InputField label="Instagram" value={s('social_instagram')} onChange={set('social_instagram')} placeholder="https://instagram.com/sdit_iqra2" />
          </div>
          <div>
            <InputField label="YouTube" value={s('social_youtube')} onChange={set('social_youtube')} placeholder="https://youtube.com/@SDITIqra2" />
          </div>
        </div>
      </SectionCard>

      {/* Save Button Bottom */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '0.75rem 2rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 15 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{saving ? 'sync' : 'check_circle'}</span>
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus { border-color: #1B6B44 !important; box-shadow: 0 0 0 3px rgba(27,107,68,0.1); }
      `}</style>
    </div>
  );
}
