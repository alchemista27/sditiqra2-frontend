'use client';
import { useEffect, useState } from 'react';
import { settingsApi, instagramApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

interface Settings { [key: string]: string }

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

interface InstagramStatus {
  status?: string;
  postId?: string;
  postTitle?: string;
  igPostId?: string;
  error?: string;
  timestamp?: string;
}

export default function InstagramSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
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
      const toSave: Record<string, string> = {
        instagram_auto_post: s('instagram_auto_post') || 'false',
        instagram_make_webhook_url: s('instagram_make_webhook_url') || '',
      };
      await settingsApi.updateMany(getToken()!, toSave);
      showToast('✅ Pengaturan berhasil disimpan!');
    } catch {
      showToast('❌ Gagal menyimpan pengaturan.', 'err');
    }
    setSaving(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      await instagramApi.testConnection(getToken()!);
      showToast('✅ Koneksi berhasil! Coba cek Instagram.');
    } catch (err: any) {
      showToast('❌ ' + (err.message || 'Koneksi gagal'), 'err');
    }
    setTesting(false);
  };

  let lastStatus: InstagramStatus | null = null;
  try {
    const raw = s('instagram_last_post_status');
    if (raw) lastStatus = JSON.parse(raw);
  } catch {}

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#9CA3AF', fontSize: 15 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 36, marginRight: '0.5rem', animation: 'spin 1s linear infinite' }}>sync</span> Memuat...
    </div>
  );

  return (
    <div style={{ maxWidth: 760 }}>
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: toast.type === 'ok' ? '#111827' : '#DC2626', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 12, fontSize: 14, zIndex: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Instagram Auto-Post</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Konfigurasi posting otomatis ke Instagram via Make.com.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '0.65rem 1.5rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 14 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{saving ? 'sync' : 'save'}</span>
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      <SectionCard title="Koneksi Make.com" icon="hub">
        <InputField
          label="Webhook URL"
          value={s('instagram_make_webhook_url')}
          onChange={set('instagram_make_webhook_url')}
          placeholder="https://hook.eu2.make.com/xxxxx"
          hint="Salin URL dari Make.com scenario webhook"
        />
        <button
          onClick={handleTestConnection}
          disabled={testing || !s('instagram_make_webhook_url')}
          style={{ padding: '0.6rem 1.2rem', background: testing ? '#9CA3AF' : '#F3F4F6', color: '#374151', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: testing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{testing ? 'sync' : 'wifi_tethering'}</span>
          {testing ? 'Menguji...' : 'Test Koneksi'}
        </button>
      </SectionCard>

      <SectionCard title="Auto-Post" icon="auto_awesome">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
          <input
            type="checkbox"
            checked={s('instagram_auto_post') === 'true'}
            onChange={e => set('instagram_auto_post')(e.target.checked ? 'true' : 'false')}
            style={{ width: 20, height: 20, accentColor: '#1B6B44' }}
          />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Aktifkan auto-post ke Instagram</span>
        </label>
        <div style={{ fontSize: 12, color: '#6B7280', marginLeft: '2rem' }}>
          Post akan otomatis terkirim ke Instagram saat dipublish dari Admin Panel.
        </div>
      </SectionCard>

      {lastStatus && (
        <SectionCard title="Status Terakhir" icon="history">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: lastStatus.status === 'published' ? '#D1FAE5' : '#FEE2E2',
              color: lastStatus.status === 'published' ? '#065F46' : '#991B1B',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                {lastStatus.status === 'published' ? 'check_circle' : 'error'}
              </span>
              {lastStatus.status === 'published' ? 'Berhasil' : lastStatus.error || 'Gagal'}
            </span>
          </div>
          {lastStatus.postTitle && (
            <div style={{ fontSize: 13, color: '#374151', marginBottom: '0.25rem' }}>
              <strong>Post:</strong> {lastStatus.postTitle}
            </div>
          )}
          {lastStatus.igPostId && (
            <div style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace', marginBottom: '0.25rem' }}>
              <strong>IG Post ID:</strong> {lastStatus.igPostId}
            </div>
          )}
          {lastStatus.timestamp && (
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>
              {new Date(lastStatus.timestamp).toLocaleString('id-ID')}
            </div>
          )}
        </SectionCard>
      )}

      <SectionCard title="Panduan Setup" icon="help">
        <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: 13, color: '#374151', lineHeight: 1.8 }}>
          <li>Daftar di <a href="https://make.com" target="_blank" rel="noopener noreferrer" style={{ color: '#1B6B44' }}>make.com</a> (free plan)</li>
          <li>Buat Scenario baru → Custom Webhook → Copy URL</li>
          <li>Tambah module Instagram for Business → Create Photo Post</li>
          <li>Login Facebook → Pilih Instagram Business Account</li>
          <li>Tambah module HTTP → PUT ke backend callback</li>
          <li>Copy webhook URL ke field di atas</li>
        </ol>
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#FEF3C7', borderRadius: 10, fontSize: 12, color: '#92400E' }}>
          <strong>Note:</strong> Image harus bisa diakses publik (Cloudinary URL). Post dengan gambar lokal akan di-skip.
        </div>
      </SectionCard>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus { border-color: #1B6B44 !important; box-shadow: 0 0 0 3px rgba(27,107,68,0.1); }
      `}</style>
    </div>
  );
}