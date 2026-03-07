'use client';
import { useState, useEffect } from 'react';
import { attendanceApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function AttendanceConfigPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    try {
      const res = await attendanceApi.getConfig(getToken() || '');
      setConfig(res.data);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      await attendanceApi.updateConfig(getToken() || '', config);
      setMsg('✅ Konfigurasi berhasil disimpan!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) { setMsg('❌ ' + err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Memuat konfigurasi...</div>;

  const inputStyle = { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, background: '#fff', outline: 'none' };
  const labelStyle = { fontWeight: 600 as const, fontSize: 13, color: '#374151', marginBottom: '0.35rem', display: 'block' as const };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Pengaturan Geofencing</h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: '0.25rem' }}>Atur lokasi sekolah, radius absensi, dan jam kerja</p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.5rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
          {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
        </button>
      </div>

      {msg && <div style={{ padding: '0.75rem 1rem', borderRadius: 8, marginBottom: '1rem', background: msg.startsWith('✅') ? '#D1FAE5' : '#FEE2E2', color: msg.startsWith('✅') ? '#065F46' : '#991B1B', fontSize: 14, fontWeight: 500 }}>{msg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Lokasi Sekolah */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#1B6B44' }}>location_on</span>
            Lokasi Sekolah
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Nama Sekolah</label>
              <input style={inputStyle} value={config?.schoolName || ''} onChange={e => setConfig({ ...config, schoolName: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Latitude</label>
                <input type="number" step="0.0001" style={inputStyle} value={config?.schoolLatitude || ''} onChange={e => setConfig({ ...config, schoolLatitude: parseFloat(e.target.value) })} />
              </div>
              <div>
                <label style={labelStyle}>Longitude</label>
                <input type="number" step="0.0001" style={inputStyle} value={config?.schoolLongitude || ''} onChange={e => setConfig({ ...config, schoolLongitude: parseFloat(e.target.value) })} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Radius Absensi (meter)</label>
              <input type="number" style={inputStyle} value={config?.radiusMeters || ''} onChange={e => setConfig({ ...config, radiusMeters: parseInt(e.target.value) })} />
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.25rem' }}>Karyawan harus berada dalam radius ini untuk melakukan absensi</p>
            </div>
          </div>
        </div>

        {/* Jam Kerja */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#1B6B44' }}>schedule</span>
            Jam Kerja
          </h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Clock In Mulai</label>
                <input type="time" style={inputStyle} value={config?.clockInStart || '06:30'} onChange={e => setConfig({ ...config, clockInStart: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Clock In Batas</label>
                <input type="time" style={inputStyle} value={config?.clockInEnd || '08:00'} onChange={e => setConfig({ ...config, clockInEnd: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Clock Out Mulai</label>
                <input type="time" style={inputStyle} value={config?.clockOutStart || '14:00'} onChange={e => setConfig({ ...config, clockOutStart: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Clock Out Batas</label>
                <input type="time" style={inputStyle} value={config?.clockOutEnd || '17:00'} onChange={e => setConfig({ ...config, clockOutEnd: e.target.value })} />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Batas Terlambat</label>
              <input type="time" style={inputStyle} value={config?.lateThreshold || '07:15'} onChange={e => setConfig({ ...config, lateThreshold: e.target.value })} />
              <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.25rem' }}>Clock in setelah waktu ini dianggap <b>terlambat</b></p>
            </div>
          </div>
        </div>

        {/* Face Recognition */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#1B6B44' }}>face</span>
            Pengenalan Wajah
          </h3>
          <div>
            <label style={labelStyle}>Minimum Confidence Score</label>
            <input type="number" step="0.01" min="0" max="1" style={inputStyle} value={config?.minFaceConfidence || 0.75} onChange={e => setConfig({ ...config, minFaceConfidence: parseFloat(e.target.value) })} />
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.25rem' }}>Nilai 0-1. Semakin tinggi semakin ketat (rekomendasi: 0.75)</p>
          </div>
        </div>

        {/* Anti Mock GPS */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#DC2626' }}>gps_off</span>
            Anti Fake GPS
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={!config?.allowMockGps} onChange={e => setConfig({ ...config, allowMockGps: !e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Blokir absensi dengan Fake GPS</span>
            </label>
          </div>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.5rem' }}>
            Jika aktif, karyawan yang terdeteksi menggunakan GPS palsu (mock location) tidak bisa melakukan absensi. Nonaktifkan hanya untuk keperluan testing.
          </p>
        </div>
      </div>
    </div>
  );
}
