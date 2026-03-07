'use client';
import { useState, useEffect } from 'react';
import { attendanceApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

const anomalyLabels: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  OUT_OF_RADIUS: { label: 'Di Luar Radius', icon: 'location_off', color: '#92400E', bg: '#FEF3C7' },
  MOCK_GPS: { label: 'Fake GPS', icon: 'gps_off', color: '#991B1B', bg: '#FEE2E2' },
  LOW_FACE_CONFIDENCE: { label: 'Pengenalan Wajah Gagal', icon: 'face_retouching_off', color: '#5B21B6', bg: '#EDE9FE' },
};

export default function AnomaliesPage() {
  const now = new Date();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  useEffect(() => { fetchAnomalies(); }, [month, year]);

  const fetchAnomalies = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.getAnomalyLogs(getToken() || '', { month, year });
      setLogs(res.data.logs);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Log Anomali</h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: '1.5rem' }}>Pantau absensi yang mencurigakan: di luar radius, fake GPS, atau pengenalan wajah gagal</p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'end' }}>
        <div>
          <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: '0.35rem', display: 'block' }}>Bulan</label>
          <select value={month} onChange={e => setMonth(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14 }}>
            {monthNames.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: '0.35rem', display: 'block' }}>Tahun</label>
          <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14 }}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Banner */}
      {!loading && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {['OUT_OF_RADIUS', 'MOCK_GPS', 'LOW_FACE_CONFIDENCE'].map(type => {
            const count = logs.filter(l => l.anomalyFlag === type).length;
            const info = anomalyLabels[type];
            return (
              <div key={type} style={{ flex: 1, background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: info.color, background: info.bg, padding: '0.5rem', borderRadius: 10 }}>{info.icon}</span>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>{count}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{info.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Memuat data...</div>
      ) : logs.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#34D399', display: 'block', marginBottom: '0.5rem' }}>verified</span>
          <p style={{ color: '#065F46', fontWeight: 600 }}>Tidak ada anomali ditemukan! 🎉</p>
          <p style={{ fontSize: 12, color: '#6B7280' }}>Semua absensi pada bulan ini berjalan normal</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#991B1B', fontWeight: 600 }}>Karyawan</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#991B1B', fontWeight: 600 }}>Tanggal</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#991B1B', fontWeight: 600 }}>Jenis Anomali</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#991B1B', fontWeight: 600 }}>Jarak</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#991B1B', fontWeight: 600 }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => {
                const info = anomalyLabels[log.anomalyFlag] || { label: log.anomalyFlag, icon: 'error', color: '#6B7280', bg: '#F3F4F6' };
                return (
                  <tr key={log.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{log.employee?.user?.name || '-'}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{log.employee?.position}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#374151' }}>{formatDate(log.date)}</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span style={{ padding: '0.25rem 0.6rem', borderRadius: 20, fontSize: 11, fontWeight: 700, background: info.bg, color: info.color, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{info.icon}</span>
                        {info.label}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 600, color: '#DC2626' }}>
                      {log.clockInDistance ? `${Math.round(log.clockInDistance)}m` : '-'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: 13, color: '#6B7280' }}>{log.anomalyNote || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #E5E7EB', fontSize: 12, color: '#6B7280' }}>Total: {logs.length} anomali</div>
        </div>
      )}
    </div>
  );
}
