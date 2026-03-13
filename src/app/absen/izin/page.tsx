'use client';
// src/app/absen/izin/page.tsx - Pengajuan Izin / Cuti
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { leaveApi } from '@/lib/api';

interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  approverNote?: string;
  createdAt: string;
}

const leaveTypes = [
  { value: 'IZIN', label: 'Izin', icon: 'assignment' },
  { value: 'SAKIT', label: 'Sakit', icon: 'local_hospital' },
  { value: 'CUTI', label: 'Cuti', icon: 'beach_access' },
  { value: 'DINAS', label: 'Dinas', icon: 'directions_car' },
];

const statusInfo: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E', label: 'Menunggu', icon: 'hourglass_empty' },
  APPROVED: { bg: '#D1FAE5', color: '#065F46', label: 'Disetujui', icon: 'check_circle' },
  REJECTED: { bg: '#FEE2E2', color: '#991B1B', label: 'Ditolak', icon: 'cancel' },
};

export default function IzinPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ type: 'IZIN', startDate: '', endDate: '', reason: '' });

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) { router.replace('/absen/login'); return; }
      const res = await leaveApi.getMyRequests(token);
      setRequests(((res as unknown as Record<string, unknown>).data as { requests: LeaveRequest[] })?.requests || []);
    } catch (err: unknown) {
      console.error('Fetch leave requests error:', err);
      if (err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 401) {
        router.replace('/absen/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      alert('Tanggal dan alasan wajib diisi.');
      return;
    }
    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) { router.replace('/absen/login'); return; }
      await leaveApi.create(token, form);
      alert('Pengajuan izin berhasil dikirim.');
      setShowForm(false);
      setForm({ type: 'IZIN', startDate: '', endDate: '', reason: '' });
      fetchRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim pengajuan.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div style={{ padding: '1rem', maxWidth: 480, margin: '0 auto' }}>
      {/* Title */}
      <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>assignment</span>
        Pengajuan Izin
      </h1>

      {/* New Request Button */}
      <button
        onClick={() => setShowForm(true)}
        style={{
          width: '100%',
          padding: '14px',
          background: '#1B6B44',
          color: '#fff',
          borderRadius: 14,
          border: 'none',
          fontSize: 15,
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '1rem',
          boxShadow: '0 4px 12px rgba(27,107,68,0.25)',
        }}
      >
        + Buat Pengajuan Baru
      </button>

      {/* Request List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: '#1B6B44' }}>
          <div style={{ fontSize: 14 }}>Memuat data...</div>
        </div>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#9CA3AF', marginBottom: 12, display: 'block' }}>assignment</span>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#374151' }}>Belum ada pengajuan</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Buat pengajuan izin baru di atas</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {requests.map(req => {
            const sc = statusInfo[req.status] || statusInfo.PENDING;
            const lt = leaveTypes.find(o => o.value === req.type);
            return (
              <div key={req.id} style={{
                background: '#fff',
                borderRadius: 14,
                padding: '16px',
                border: '1px solid #E5E7EB',
              }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{lt?.icon || 'assignment'}</span>
                    {lt?.label || req.type}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 10px',
                    borderRadius: 12,
                    background: sc.bg,
                    color: sc.color,
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>{sc.icon}</span>
                    {sc.label}
                  </div>
                </div>

                {/* Date */}
                <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>event</span>
                  {fmtDate(req.startDate)} — {fmtDate(req.endDate)}
                </div>

                {/* Reason */}
                <div style={{ fontSize: 13, color: '#374151' }}>{req.reason}</div>

                {/* Admin Note */}
                {req.approverNote && (
                  <div style={{
                    background: '#FEF3C7',
                    borderRadius: 8,
                    padding: 10,
                    marginTop: 8,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E' }}>Catatan Admin:</div>
                    <div style={{ fontSize: 12, color: '#78350F', marginTop: 2 }}>{req.approverNote}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: '24px',
            paddingBottom: 40,
            width: '100%',
            maxWidth: 480,
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 16, textAlign: 'center' }}>
              Pengajuan Izin Baru
            </h2>

            {/* Leave Type */}
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Tipe Izin</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {leaveTypes.map(opt => {
                const isActive = form.type === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setForm({ ...form, type: opt.value })}
                    style={{
                      flex: 1,
                      background: isActive ? '#1B6B44' : '#F3F4F6',
                      borderRadius: 12,
                      padding: '10px 4px',
                      border: `1px solid ${isActive ? '#1B6B44' : '#E5E7EB'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: isActive ? '#fff' : '#6B7280' }}>
                      {opt.icon}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#fff' : '#374151' }}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dates */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mulai</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={e => setForm({ ...form, startDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    fontSize: 14,
                    color: '#111827',
                    background: '#F9FAFB',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Selesai</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={e => setForm({ ...form, endDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 12,
                    fontSize: 14,
                    color: '#111827',
                    background: '#F9FAFB',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Reason */}
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Alasan</label>
            <textarea
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              placeholder="Jelaskan alasan pengajuan izin..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #E5E7EB',
                borderRadius: 12,
                fontSize: 14,
                color: '#111827',
                background: '#F9FAFB',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: '#F3F4F6',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: submitting ? '#9CA3AF' : '#1B6B44',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#fff',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
