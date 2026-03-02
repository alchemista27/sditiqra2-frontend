'use client';
import { useState, useEffect } from 'react';
import { attendanceApi } from '@/lib/api';
import { getToken, getUserFromToken } from '@/lib/auth';

export default function AdminAttendancePage() {
  const [user, setUser] = useState<any>(null);
  
  // State for Personal Attendance
  const [myLogs, setMyLogs] = useState<any[]>([]);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockOutLoading, setClockOutLoading] = useState(false);

  // State for Admin/HR Recap
  const [allLogsToday, setAllLogsToday] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'RECAP' | 'EMPLOYEES'>('PERSONAL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const u = getUserFromToken(token);
      setUser(u);
      
      // Default to Recap if user is super admin and wants to see everything
      if (['SUPER_ADMIN', 'KEPALA_SEKOLAH'].includes(u.role)) {
        setActiveTab('RECAP');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    const token = getToken() || '';
    try {
      if (activeTab === 'PERSONAL') {
        const d = new Date();
        const res = await attendanceApi.getMyLogs(token, d.getMonth() + 1, d.getFullYear());
        setMyLogs(res.data);
      } else if (activeTab === 'RECAP') {
        const res = await attendanceApi.getTodayLogs(token);
        setAllLogsToday(res.data);
      } else if (activeTab === 'EMPLOYEES') {
        const res = await attendanceApi.getAllEmployees(token);
        setEmployees(res.data);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengambil data kehadiran');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setClockInLoading(true);
    try {
      await attendanceApi.clockIn(getToken() || '');
      alert('Berhasil Clock In!');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClockInLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockOutLoading(true);
    try {
      await attendanceApi.clockOut(getToken() || '');
      alert('Berhasil Clock Out!');
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setClockOutLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '--:--';
    const d = new Date(timeStr);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  };

  const isAdmin = user && ['SUPER_ADMIN', 'KEPALA_SEKOLAH', 'ADMIN_CMS'].includes(user.role);

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>Kehadiran Pegawai</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => setActiveTab('PERSONAL')} style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'PERSONAL' ? '2px solid #1B6B44' : '2px solid transparent', color: activeTab === 'PERSONAL' ? '#1B6B44' : '#6B7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <span className="material-symbols-outlined" style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>person</span> Absensi Saya
        </button>
        {isAdmin && (
          <>
            <button onClick={() => setActiveTab('RECAP')} style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'RECAP' ? '2px solid #1B6B44' : '2px solid transparent', color: activeTab === 'RECAP' ? '#1B6B44' : '#6B7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>fact_check</span> Rekap Hari Ini
            </button>
            <button onClick={() => setActiveTab('EMPLOYEES')} style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'EMPLOYEES' ? '2px solid #1B6B44' : '2px solid transparent', color: activeTab === 'EMPLOYEES' ? '#1B6B44' : '#6B7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>badge</span> Data Pegawai
            </button>
          </>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Memuat data kehadiran...</div>
      ) : activeTab === 'PERSONAL' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 12, border: '1px solid #E5E7EB', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Clock In / Out Hari Ini</h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: '1.5rem' }}>Silakan catat kehadiran Anda untuk hari ini.</p>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <button onClick={handleClockIn} disabled={clockInLoading || clockOutLoading} style={{ padding: '1rem', background: '#D1FAE5', color: '#065F46', border: '1px solid #34D399', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined">login</span> Clock IN (Datang)
              </button>
              <button onClick={handleClockOut} disabled={clockInLoading || clockOutLoading} style={{ padding: '1rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171', borderRadius: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="material-symbols-outlined">logout</span> Clock OUT (Pulang)
              </button>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Tanggal</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Clock In</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Clock Out</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {myLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{formatDate(log.date)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: log.clockIn ? '#1B6B44' : '#6B7280', fontWeight: 600 }}>{formatTime(log.clockIn)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: log.clockOut ? '#991B1B' : '#6B7280', fontWeight: 600 }}>{formatTime(log.clockOut)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ padding: '0.2rem 0.5rem', background: '#F3F4F6', color: '#374151', fontSize: 11, fontWeight: 600, borderRadius: 20 }}>{log.type}</span>
                    </td>
                  </tr>
                ))}
                {myLogs.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Belum ada log kehadiran bulan ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'RECAP' ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Pegawai</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Clock In</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Clock Out</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Status Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {allLogsToday.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{log.employee?.user?.name}</div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{log.employee?.position}</div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: log.clockIn ? '#1B6B44' : '#6B7280', fontWeight: 600 }}>{formatTime(log.clockIn)}</td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: log.clockOut ? '#991B1B' : '#6B7280', fontWeight: 600 }}>{formatTime(log.clockOut)}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ padding: '0.2rem 0.5rem', background: log.type === 'HADIR' ? '#D1FAE5' : '#FEF3C7', color: log.type === 'HADIR' ? '#065F46' : '#92400E', fontSize: 11, fontWeight: 600, borderRadius: 20 }}>{log.type}</span>
                  </td>
                </tr>
              ))}
              {allLogsToday.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Belum ada log kehadiran tercatat hari ini.</td></tr>
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
              {employees.map(emp => (
                <tr key={emp.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#111827' }}>{emp.user?.name}</td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{emp.nip || '-'}</td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{emp.position}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
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
