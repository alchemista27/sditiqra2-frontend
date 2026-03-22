'use client';
// src/app/admin/settings/homepage/page.tsx
// Editor konten section-section Homepage: Hero, Statistik, Feature Cards
import { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface StatItem { icon: string; value: string; label: string }
interface FeatureItem { icon: string; title: string; desc: string }
type Settings = Record<string, string>

const MATERIAL_ICONS_SUGGESTIONS = [
  'school', 'person', 'emoji_events', 'menu_book', 'science', 'sports_soccer',
  'family_restroom', 'mosque', 'auto_stories', 'psychology', 'diversity_3',
  'volunteer_activism', 'star', 'workspace_premium', 'military_tech',
];

function SectionCard({ title, icon, children, badge }: { title: string; icon: string; children: React.ReactNode; badge?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', paddingBottom: '0.875rem', borderBottom: '1px solid #F3F4F6' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B6B44' }}>{icon}</span>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0, flex: 1 }}>{title}</h2>
        {badge && <span style={{ fontSize: 11, background: '#DCFCE7', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: 20, fontWeight: 600 }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function TextInput({ label, value, onChange, placeholder, textarea, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; rows?: number;
}) {
  const baseStyle = { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' as const, outline: 'none' };
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...baseStyle, resize: 'vertical', lineHeight: 1.6 }} />
        : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={baseStyle} />
      }
    </div>
  );
}

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: '0.3rem' }}>Ikon Material Symbols</label>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
        {MATERIAL_ICONS_SUGGESTIONS.map(icon => (
          <button key={icon} type="button" onClick={() => onChange(icon)}
            title={icon}
            style={{ width: 36, height: 36, background: value === icon ? '#1B6B44' : '#F3F4F6', color: value === icon ? '#fff' : '#374151', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.1s' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
          </button>
        ))}
      </div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder="Nama ikon custom..." style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', boxSizing: 'border-box' as const }} />
    </div>
  );
}

export default function AdminHomepageEditorPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [stats, setStats] = useState<StatItem[]>([]);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [galleryCols, setGalleryCols] = useState('3');
  const [galleryRows, setGalleryRows] = useState('2');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    settingsApi.getAll().then(r => {
      const d = r.data || {};
      setSettings(d);
      try { setStats(JSON.parse(d.stats || '[]')); } catch { setStats([]); }
      try { setFeatures(JSON.parse(d.features || '[]')); } catch { setFeatures([]); }
      if (d.gallery_cols) setGalleryCols(d.gallery_cols);
      if (d.gallery_rows) setGalleryRows(d.gallery_rows);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const s = (key: string) => settings[key] || '';
  const set = (key: string) => (val: string) => setSettings(prev => ({ ...prev, [key]: val }));

  // ── Save Hero Section ─────────────────────────────────────
  const saveHero = async () => {
    setSaving('hero');
    try {
      await settingsApi.updateMany(getToken()!, {
        hero_title: s('hero_title'),
        hero_subtitle: s('hero_subtitle'),
        hero_cta_primary_text: s('hero_cta_primary_text'),
        hero_cta_primary_url: s('hero_cta_primary_url'),
        hero_cta_secondary_text: s('hero_cta_secondary_text'),
        hero_cta_secondary_url: s('hero_cta_secondary_url'),
      });
      showToast('✅ Hero section disimpan!');
    } catch { showToast('❌ Gagal menyimpan.', 'err'); }
    setSaving(null);
  };

  // ── Save Stats ────────────────────────────────────────────
  const saveStats = async () => {
    setSaving('stats');
    try {
      await settingsApi.updateMany(getToken()!, { stats: JSON.stringify(stats) });
      showToast('✅ Kartu statistik disimpan!');
    } catch { showToast('❌ Gagal menyimpan.', 'err'); }
    setSaving(null);
  };

  const addStat = () => setStats([...stats, { icon: 'star', value: '0+', label: 'Label Baru' }]);
  const removeStat = (i: number) => setStats(stats.filter((_, idx) => idx !== i));
  const updateStat = (i: number, field: keyof StatItem, val: string) => {
    setStats(stats.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  // ── Save Features ─────────────────────────────────────────
  const saveFeatures = async () => {
    setSaving('features');
    try {
      await settingsApi.updateMany(getToken()!, { features: JSON.stringify(features) });
      showToast('✅ Feature cards disimpan!');
    } catch { showToast('❌ Gagal menyimpan.', 'err'); }
    setSaving(null);
  };

  const addFeature = () => setFeatures([...features, { icon: 'star', title: 'Judul Baru', desc: 'Deskripsi singkat.' }]);
  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, field: keyof FeatureItem, val: string) => {
    setFeatures(features.map((f, idx) => idx === i ? { ...f, [field]: val } : f));
  };

  // ── Save Gallery Settings ──────────────────────────────────
  const saveGallery = async () => {
    setSaving('gallery');
    try {
      await settingsApi.updateMany(getToken()!, {
        gallery_cols: galleryCols,
        gallery_rows: galleryRows,
      });
      showToast('✅ Pengaturan galeri disimpan!');
    } catch { showToast('❌ Gagal menyimpan.', 'err'); }
    setSaving(null);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#9CA3AF', fontSize: 15 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 36, marginRight: '0.5rem' }}>sync</span> Memuat...
    </div>
  );

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: toast.type === 'ok' ? '#111827' : '#DC2626', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 12, fontSize: 14, zIndex: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Editor Homepage</h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Edit konten hero section, kartu statistik, dan fitur unggulan yang tampil di halaman utama.</p>
      </div>

      {/* ─── HERO SECTION ──────────────────────────────── */}
      <SectionCard title="Hero Section" icon="hero" badge="Tampil Pertama">
        {/* Live Preview */}
        <div style={{ background: 'linear-gradient(135deg, #0F3D24 0%, #1B6B44 50%, #0F3D24 100%)', borderRadius: 12, padding: '2rem 1.5rem', marginBottom: '1.25rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(201,168,76,0.1) 0%, transparent 60%)' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 11, color: '#A7F3D0', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Preview Hero</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 0.5rem', lineHeight: 1.3 }}>{s('hero_title') || '—'}</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 1rem', lineHeight: 1.6, maxWidth: 480 }}>{s('hero_subtitle') || '—'}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {s('hero_cta_primary_text') && <span style={{ padding: '0.4rem 0.9rem', background: '#C9A84C', color: '#1a1a1a', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>{s('hero_cta_primary_text')}</span>}
              {s('hero_cta_secondary_text') && <span style={{ padding: '0.4rem 0.9rem', background: 'rgba(255,255,255,0.12)', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13 }}>{s('hero_cta_secondary_text')}</span>}
            </div>
          </div>
        </div>

        <TextInput label="Judul Hero" value={s('hero_title')} onChange={set('hero_title')} placeholder="SD Islam Terpadu Iqra 2 Kota Bengkulu" />
        <TextInput label="Subjudul / Deskripsi" value={s('hero_subtitle')} onChange={set('hero_subtitle')} placeholder="Mewujudkan generasi Islami..." textarea rows={3} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <TextInput label="Tombol Utama — Label" value={s('hero_cta_primary_text')} onChange={set('hero_cta_primary_text')} placeholder="Daftar Sekarang" />
          <TextInput label="Tombol Utama — URL" value={s('hero_cta_primary_url')} onChange={set('hero_cta_primary_url')} placeholder="/ppdb" />
          <TextInput label="Tombol Kedua — Label" value={s('hero_cta_secondary_text')} onChange={set('hero_cta_secondary_text')} placeholder="Lihat Berita" />
          <TextInput label="Tombol Kedua — URL" value={s('hero_cta_secondary_url')} onChange={set('hero_cta_secondary_url')} placeholder="/berita" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={saveHero} disabled={saving === 'hero'}
            style={{ padding: '0.65rem 1.5rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{saving === 'hero' ? 'sync' : 'save'}</span>
            {saving === 'hero' ? 'Menyimpan...' : 'Simpan Hero'}
          </button>
        </div>
      </SectionCard>

      {/* ─── STATISTIK ─────────────────────────────────── */}
      <SectionCard title="Kartu Statistik" icon="bar_chart" badge={`${stats.length} item`}>
        {/* Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: '0.5rem', marginBottom: '1.25rem' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ background: 'linear-gradient(135deg, #0F3D24, #1B6B44)', color: '#fff', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#C9A84C', display: 'block', marginBottom: '0.35rem' }}>{stat.icon}</span>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Stats Editor */}
        {stats.map((stat, i) => (
          <div key={i} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Statistik #{i + 1}</div>
              <button onClick={() => removeStat(i)}
                style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 6, padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
              </button>
            </div>
            <IconPicker value={stat.icon} onChange={v => updateStat(i, 'icon', v)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0 0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: '0.3rem' }}>Nilai</label>
                <input value={stat.value} onChange={e => updateStat(i, 'value', e.target.value)}
                  placeholder="600+" style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' as const }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: '0.3rem' }}>Label</label>
                <input value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)}
                  placeholder="Siswa Aktif" style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, boxSizing: 'border-box' as const }} />
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button onClick={addStat} style={{ padding: '0.55rem 1rem', background: '#F3F4F6', color: '#374151', border: '1.5px dashed #D1D5DB', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Tambah Statistik
          </button>
          <button onClick={saveStats} disabled={saving === 'stats'}
            style={{ padding: '0.65rem 1.5rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{saving === 'stats' ? 'sync' : 'save'}</span>
            {saving === 'stats' ? 'Menyimpan...' : 'Simpan Statistik'}
          </button>
        </div>
      </SectionCard>

      {/* ─── FEATURE CARDS ─────────────────────────────── */}
      <SectionCard title="Feature Cards (Keunggulan)" icon="auto_awesome" badge={`${features.length} item`}>
        {/* Preview */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(features.length, 2)}, 1fr)`, gap: '0.5rem', marginBottom: '1.25rem' }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: '#F0FDF4', border: '1px solid #A7F3D0', borderRadius: 10, padding: '1rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#1B6B44', display: 'block', marginBottom: '0.35rem' }}>{f.icon}</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>{f.title}</div>
              <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Features Editor */}
        {features.map((feat, i) => (
          <div key={i} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Keunggulan #{i + 1}</div>
              <button onClick={() => removeFeature(i)}
                style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 6, padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
              </button>
            </div>
            <IconPicker value={feat.icon} onChange={v => updateFeature(i, 'icon', v)} />
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: '0.3rem' }}>Judul</label>
              <input value={feat.title} onChange={e => updateFeature(i, 'title', e.target.value)}
                placeholder="Pendidikan Islami" style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, marginBottom: '0.6rem', boxSizing: 'border-box' as const }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: '0.3rem' }}>Deskripsi</label>
              <textarea value={feat.desc} onChange={e => updateFeature(i, 'desc', e.target.value)}
                placeholder="Kurikulum terintegrasi..." rows={2}
                style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13, resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box' as const }} />
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
          <button onClick={addFeature} style={{ padding: '0.55rem 1rem', background: '#F3F4F6', color: '#374151', border: '1.5px dashed #D1D5DB', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span> Tambah Feature
          </button>
          <button onClick={saveFeatures} disabled={saving === 'features'}
            style={{ padding: '0.65rem 1.5rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{saving === 'features' ? 'sync' : 'save'}</span>
            {saving === 'features' ? 'Menyimpan...' : 'Simpan Features'}
          </button>
        </div>
      </SectionCard>

      {/* ─── GALLERY SETTINGS ──────────────────────────── */}
      <SectionCard title="Pengaturan Galeri Homepage" icon="photo_library" badge="Grid Feed">
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Atur jumlah kolom dan baris yang tampil di galeri homepage. Total gambar per halaman = Kolom × Baris.
        </p>
        {/* Preview Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(parseInt(galleryCols) || 3, 6)}, 1fr)`, gap: '0.35rem', marginBottom: '1.25rem' }}>
          {Array.from({ length: (parseInt(galleryCols) || 3) * Math.min(parseInt(galleryRows) || 2, 3) }).map((_, i) => (
            <div key={i} style={{ background: i % 3 === 0 ? '#A7F3D0' : i % 3 === 1 ? '#D1FAE5' : '#ECFDF5', borderRadius: 6, aspectRatio: '5/4' }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Jumlah Kolom</label>
            <input
              type="number" min="1" max="6"
              value={galleryCols}
              onChange={e => setGalleryCols(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.3rem' }}>Rekomendasi: 3–4 kolom</p>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Jumlah Baris</label>
            <input
              type="number" min="1" max="10"
              value={galleryRows}
              onChange={e => setGalleryRows(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.3rem' }}>Rekomendasi: 2–3 baris</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
          <span style={{ fontSize: 13, color: '#6B7280' }}>
            {parseInt(galleryCols) || 3} kolom × {parseInt(galleryRows) || 2} baris = <strong style={{ color: '#111827' }}>{(parseInt(galleryCols) || 3) * (parseInt(galleryRows) || 2)} foto</strong> per halaman
          </span>
          <button onClick={saveGallery} disabled={saving === 'gallery'}
            style={{ padding: '0.65rem 1.5rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 14 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{saving === 'gallery' ? 'sync' : 'save'}</span>
            {saving === 'gallery' ? 'Menyimpan...' : 'Simpan Pengaturan Galeri'}
          </button>
        </div>
      </SectionCard>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, textarea:focus { border-color: #1B6B44 !important; box-shadow: 0 0 0 3px rgba(27,107,68,0.1); outline: none; }
      `}</style>
    </div>
  );
}
