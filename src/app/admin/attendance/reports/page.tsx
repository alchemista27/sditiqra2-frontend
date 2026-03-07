'use client';
import { useState } from 'react';
import { reportApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function ReportsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await reportApi.getSummary(getToken() || '', month, year);
      setSummary(res.data);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = getToken() || '';
      const url = reportApi.downloadExcelUrl(month, year);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Gagal mengunduh laporan');
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `Laporan_Kehadiran_${monthNames[month - 1]}_${year}.xlsx`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err: any) { alert(err.message); }
    finally { setDownloading(false); }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Laporan Kehadiran</h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: '1.5rem' }}>Generate dan download laporan kehadiran bulanan dalam format Excel</p>

      {/* Kontrol */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: '0.35rem', display: 'block' }}>Bulan</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{ padding: '0.65rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, minWidth: 150 }}>
              {monthNames.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: '0.35rem', display: 'block' }}>Tahun</label>
            <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ padding: '0.65rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14 }}>
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={fetchSummary} disabled={loading} style={{ padding: '0.65rem 1.25rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            {loading ? 'Memuat...' : '📊 Tampilkan Preview'}
          </button>
          <button onClick={handleDownload} disabled={downloading} style={{ padding: '0.65rem 1.25rem', background: '#065F46', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>
            {downloading ? 'Mengunduh...' : 'Download Excel'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.75rem' }}>File Excel berisi 3 sheet: Summary (Rekapitulasi), Detail Harian, dan Log Anomali</p>
      </div>

      {/* Preview Summary */}
      {summary && (
        <>
          {/* Stats cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { label: 'Total Karyawan', value: summary.totalEmployees, icon: 'people', color: '#1B6B44', bg: '#D1FAE5' },
              { label: 'Hari Kerja', value: summary.workingDays, icon: 'calendar_today', color: '#1E40AF', bg: '#DBEAFE' },
              { label: 'Rata-rata Kehadiran', value: summary.summary.length > 0 ? (summary.summary.reduce((a: number, s: any) => a + s.percentage, 0) / summary.summary.length).toFixed(1) + '%' : '0%', icon: 'trending_up', color: '#065F46', bg: '#D1FAE5' },
              { label: 'Total Terlambat', value: summary.summary.reduce((a: number, s: any) => a + s.late, 0), icon: 'schedule', color: '#92400E', bg: '#FEF3C7' },
            ].map((card, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20, color: card.color, background: card.bg, padding: '0.35rem', borderRadius: 8 }}>{card.icon}</span>
                  <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{card.label}</span>
                </div>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{card.value}</span>
              </div>
            ))}
          </div>

          {/* Summary Table */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid #E5E7EB', fontWeight: 700, color: '#111827' }}>
              Preview Rekapitulasi — {monthNames[month - 1]} {year}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Nama</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Tepat Waktu</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Terlambat</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Izin/Cuti</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>% Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {summary.summary.map((emp: any) => (
                  <tr key={emp.employeeId} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#111827' }}>{emp.name}</td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span style={{ color: '#065F46', fontWeight: 600 }}>{emp.onTime}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span style={{ color: emp.late > 0 ? '#DC2626' : '#6B7280', fontWeight: 600 }}>{emp.late}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span style={{ color: '#92400E', fontWeight: 600 }}>{emp.leave}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: 12, fontWeight: 700,
                        background: emp.percentage >= 90 ? '#D1FAE5' : emp.percentage >= 70 ? '#FEF3C7' : '#FEE2E2',
                        color: emp.percentage >= 90 ? '#065F46' : emp.percentage >= 70 ? '#92400E' : '#991B1B'
                      }}>{emp.percentage}%</span>
                    </td>
                  </tr>
                ))}
                {summary.summary.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Tidak ada data kehadiran</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
