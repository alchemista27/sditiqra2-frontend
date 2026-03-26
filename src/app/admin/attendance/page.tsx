'use client';
import { useState, useEffect } from 'react';
import { attendanceApi } from '@/lib/api';
import { getToken, getUserFromToken } from '@/lib/auth';
import Link from 'next/link';

export default function AdminAttendancePage() {
  const [user, setUser] = useState<any>(null);
  const [todayData, setTodayData] = useState<{ logs: any[]; stats: any } | null>(null);
  const [myLogs, setMyLogs] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'RECAP' | 'PERSONAL' | 'EMPLOYEES'>('RECAP');
  const [loading, setLoading] = useState(true);
  const [anomaliesCount, setAnomaliesCount] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const u = getUserFromToken(token);
      setUser(u);
      if (u && !['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'ADMIN_PERSONALIA'].includes(u.role)) {
        setActiveTab('PERSONAL');
      }
    }
  }, []);

  useEffect(() => { if (user) fetchData(); }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = getToken() || '';
    try {
      if (activeTab === 'PERSONAL') {
        const d = new Date();
        const res = await attendanceApi.getMyLogs(token, d.getMonth() + 1, d.getFullYear());
        setMyLogs(res.data as any[]);
      } else if (activeTab === 'RECAP') {
        const res = await attendanceApi.getTodayLogs(token);
        setTodayData(res.data);
      } else if (activeTab === 'EMPLOYEES') {
        const res = await attendanceApi.getAllEmployees(token);
        setEmployees(res.data as any[]);
      }
      
      // Also fetch anomalies count for admin
      if (user && ['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'ADMIN_PERSONALIA'].includes(user.role)) {
        const anomalyRes = await attendanceApi.getAnomalyLogs(token);
        if (anomalyRes.data?.logs) {
           setAnomaliesCount(anomalyRes.data.logs.length);
        }
      }
    } catch (err: any) { 
      // ignore
    }
    finally { setLoading(false); }
  };

  const formatTime = (t: string | null) => {
    if (!t) return '--:--';
    const d = new Date(t);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };
  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  const isAdmin = user && ['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'ADMIN_PERSONALIA'].includes(user.role);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Kehadiran Pegawai</h1>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/admin/attendance/reports" style={{ padding: '0.5rem 1rem', background: '#065F46', color: '#fff', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span> Laporan
            </Link>
            <Link href="/admin/attendance/config" style={{ padding: '0.5rem 1rem', background: '#EDE9FE', color: '#5B21B6', borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>settings</span> Pengaturan
            </Link>
          </div>
        )}
      </div>

      {/* Stats Cards (Admin) */}
      {isAdmin && todayData?.stats && activeTab === 'RECAP' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Hadir', value: todayData.stats.total, icon: 'how_to_reg', color: '#1B6B44', bg: '#D1FAE5' },
            { label: 'Tepat Waktu', value: todayData.stats.onTime, icon: 'check_circle', color: '#065F46', bg: '#D1FAE5' },
            { label: 'Terlambat', value: todayData.stats.late, icon: 'schedule', color: '#92400E', bg: '#FEF3C7' },
            { label: 'Izin/Cuti', value: todayData.stats.leave, icon: 'event_busy', color: '#1E40AF', bg: '#DBEAFE' },
            { label: 'Anomali GPS', value: anomaliesCount || todayData.stats.anomalies, icon: 'warning', color: '#991B1B', bg: '#FEE2E2' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1rem', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 24, color: s.color, background: s.bg, padding: '0.4rem', borderRadius: 8, display: 'inline-block', marginBottom: '0.35rem' }}>{s.icon}</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #E5E7EB' }}>
        {isAdmin && (
          <button onClick={() => setActiveTab('RECAP')} style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'RECAP' ? '2px solid #1B6B44' : '2px solid transparent', color: activeTab === 'RECAP' ? '#1B6B44' : '#6B7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>fact_check</span> Rekap Hari Ini
          </button>
        )}
        <button onClick={() => setActiveTab('PERSONAL')} style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'PERSONAL' ? '2px solid #1B6B44' : '2px solid transparent', color: activeTab === 'PERSONAL' ? '#1B6B44' : '#6B7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span> Absensi Saya
        </button>
        {isAdmin && (
          <button onClick={() => setActiveTab('EMPLOYEES')} style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'EMPLOYEES' ? '2px solid #1B6B44' : '2px solid transparent', color: activeTab === 'EMPLOYEES' ? '#1B6B44' : '#6B7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>badge</span> Data Pegawai
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Memuat data kehadiran...</div>
      ) : activeTab === 'RECAP' ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Pegawai</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Clock In</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Clock Out</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Jarak</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Anomali</th>
              </tr>
            </thead>
            <tbody>
              {(todayData?.logs || []).map((log: any) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{log.employee?.user?.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{log.employee?.position}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: log.clockIn ? '#1B6B44' : '#6B7280', fontWeight: 600 }}>{formatTime(log.clockIn)}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: log.clockOut ? '#991B1B' : '#6B7280', fontWeight: 600 }}>{formatTime(log.clockOut)}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: log.isLate ? '#FEF3C7' : log.type === 'HADIR' ? '#D1FAE5' : '#DBEAFE',
                      color: log.isLate ? '#92400E' : log.type === 'HADIR' ? '#065F46' : '#1E40AF'
                    }}>{log.isLate ? 'TERLAMBAT' : log.type}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: 13 }}>
                    {log.clockInDistance ? `${Math.round(log.clockInDistance)}m` : '-'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    {log.anomalyFlag ? (
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: 10, fontWeight: 700, background: '#FEE2E2', color: '#991B1B', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span> {log.anomalyFlag === 'MOCK_GPS' ? 'FAKE GPS' : log.anomalyFlag === 'OUT_OF_RADIUS' ? 'LUAR RADIUS' : log.anomalyFlag}
                      </span>
                    ) : <span className="material-symbols-outlined" style={{ color: '#34D399', fontSize: 18 }}>check_circle</span>}
                  </td>
                </tr>
              ))}
              {(!todayData?.logs || todayData.logs.length === 0) && (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Belum ada log kehadiran hari ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'PERSONAL' ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Tanggal</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Clock In</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Clock Out</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {myLogs.map((log: any) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>{formatDate(log.date)}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#1B6B44', fontWeight: 600 }}>{formatTime(log.clockIn)}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#991B1B', fontWeight: 600 }}>{formatTime(log.clockOut)}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: log.isLate ? '#FEF3C7' : '#D1FAE5',
                      color: log.isLate ? '#92400E' : '#065F46'
                    }}>{log.isLate ? 'TERLAMBAT' : log.type}</span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: 12, color: '#6B7280' }}>
                    {log.anomalyFlag ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#92400E' }}>warning</span>
                        {log.anomalyNote || log.anomalyFlag}
                      </span>
                    ) : (log.note || '-')}
                  </td>
                </tr>
              ))}
              {myLogs.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Belum ada log kehadiran bulan ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Nama Pegawai</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>NIP</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Jabatan</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp: any) => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#111827' }}>{emp.user?.name}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#374151' }}>{emp.nip || '-'}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#374151' }}>{emp.position}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <span style={{ padding: '0.2rem 0.5rem', background: emp.status === 'ACTIVE' ? '#D1FAE5' : '#F3F4F6', color: emp.status === 'ACTIVE' ? '#065F46' : '#4B5563', fontSize: 11, fontWeight: 600, borderRadius: 20 }}>{emp.status}</span>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Tidak ada data pegawai.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
