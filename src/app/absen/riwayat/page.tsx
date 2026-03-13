'use client';
// src/app/absen/riwayat/page.tsx - Riwayat Kehadiran Bulanan
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { attendanceApi } from '@/lib/api';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

interface AttendanceLog {
  id: string;
  date: string;
  type: string;
  clockIn: string | null;
  clockOut: string | null;
  isLate: boolean;
  anomalyFlag: string | null;
}

const typeColors: Record<string, { bg: string; color: string }> = {
  HADIR: { bg: '#D1FAE5', color: '#065F46' },
  IZIN: { bg: '#DBEAFE', color: '#1E40AF' },
  SAKIT: { bg: '#FEF3C7', color: '#92400E' },
  CUTI: { bg: '#EDE9FE', color: '#5B21B6' },
  DINAS: { bg: '#E0F2FE', color: '#0369A1' },
  ALPHA: { bg: '#FEE2E2', color: '#991B1B' },
  LIBUR: { bg: '#F3F4F6', color: '#6B7280' },
};

export default function RiwayatPage() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  // Auto-scroll to active month on mount
  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) { router.replace('/absen/login'); return; }
      const res = await attendanceApi.getMyLogs(token, month, year);
      setLogs(((res as unknown as Record<string, unknown>).data as AttendanceLog[]) || []);
    } catch (err: unknown) {
      console.error('Fetch logs error:', err);
      if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 401) {
        router.replace('/absen/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (t: string | null) => {
    if (!t) return '--:--';
    const d = new Date(t);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // Stats
  const hadir = logs.filter(l => l.type === 'HADIR').length;
  const terlambat = logs.filter(l => l.type === 'HADIR' && l.isLate).length;
  const izinTotal = logs.filter(l => ['IZIN', 'SAKIT', 'CUTI', 'DINAS'].includes(l.type)).length;

  return (
    <div style={{ padding: '1rem', maxWidth: 480, margin: '0 auto' }}>
      {/* Title */}
      <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>history</span>
        Riwayat Kehadiran
      </h1>

      {/* Month Selector */}
      <div 
        ref={scrollRef}
        style={{ 
          display: 'flex', 
          gap: 8, 
          overflowX: 'auto', 
          paddingBottom: 8, 
          marginBottom: '1rem',
          scrollbarWidth: 'none',
        }}
      >
        {monthNames.map((name, i) => {
          const isActive = month === i + 1;
          return (
            <button
              key={i}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => setMonth(i + 1)}
              style={{
                padding: '8px 16px',
                borderRadius: 20,
                border: `1px solid ${isActive ? '#1B6B44' : '#E5E7EB'}`,
                background: isActive ? '#1B6B44' : '#fff',
                color: isActive ? '#fff' : '#6B7280',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Year Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: '1rem' }}>
        <button 
          onClick={() => setYear(y => y - 1)} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 18, padding: 4 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_left</span>
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{year}</span>
        <button 
          onClick={() => setYear(y => y + 1)} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 18, padding: 4 }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '12px', borderLeft: '3px solid #1B6B44', border: '1px solid #E5E7EB', borderLeftColor: '#1B6B44' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{hadir}</div>
          <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, marginTop: 2 }}>Hadir</div>
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '12px', borderLeft: '3px solid #F59E0B', border: '1px solid #E5E7EB', borderLeftColor: '#F59E0B' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{terlambat}</div>
          <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, marginTop: 2 }}>Terlambat</div>
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '12px', borderLeft: '3px solid #3B82F6', border: '1px solid #E5E7EB', borderLeftColor: '#3B82F6' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{izinTotal}</div>
          <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500, marginTop: 2 }}>Izin/Cuti</div>
        </div>
      </div>

      {/* Logs */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#1B6B44' }}>
          <div style={{ fontSize: 14 }}>Memuat data...</div>
        </div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#9CA3AF', marginBottom: 12, display: 'block' }}>fact_check</span>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>Belum ada data kehadiran</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>{monthNames[month - 1]} {year}</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map((log) => {
            const dateObj = new Date(log.date);
            const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
            const dayNum = dateObj.getDate();
            const tc = typeColors[log.type] || typeColors.HADIR;

            return (
              <div key={log.id} style={{
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                borderRadius: 12,
                padding: '14px',
                border: '1px solid #E5E7EB',
              }}>
                {/* Date */}
                <div style={{ width: 44, textAlign: 'center', marginRight: 12, flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{dayNum}</div>
                  <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>{dayName}</div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#6B7280' }}>
                    <span>Masuk: <strong style={{ color: '#111827' }}>{formatTime(log.clockIn)}</strong></span>
                    <span>Pulang: <strong style={{ color: '#111827' }}>{formatTime(log.clockOut)}</strong></span>
                  </div>
                  {log.anomalyFlag && (
                    <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>warning</span>
                      {log.anomalyFlag === 'MOCK_GPS' ? 'Fake GPS' : log.anomalyFlag === 'OUT_OF_RADIUS' ? 'Luar Radius' : log.anomalyFlag}
                    </div>
                  )}
                </div>

                {/* Type Badge */}
                <div style={{
                  padding: '4px 10px',
                  borderRadius: 12,
                  background: tc.bg,
                  color: tc.color,
                  fontSize: 10,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {log.isLate ? 'TELAT' : log.type}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
