'use client';
import { useState, useEffect } from 'react';
import { leaveApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

const leaveTypeLabels: Record<string, string> = { IZIN: 'Izin', SAKIT: 'Sakit', CUTI: 'Cuti', DINAS: 'Dinas' };
const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  APPROVED: { bg: '#D1FAE5', color: '#065F46' },
  REJECTED: { bg: '#FEE2E2', color: '#991B1B' },
};

export default function LeavesPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [actionLoading, setActionLoading] = useState('');
  const [noteModal, setNoteModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => { fetchRequests(); }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filter !== 'ALL') params.status = filter;
      const res = await leaveApi.getAll(getToken() || '', params);
      setRequests(res.data.requests);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject', approverNote?: string) => {
    setActionLoading(id);
    try {
      if (action === 'approve') {
        await leaveApi.approve(getToken() || '', id, approverNote);
      } else {
        await leaveApi.reject(getToken() || '', id, approverNote || 'Ditolak oleh admin');
      }
      setNoteModal(null);
      setNote('');
      fetchRequests();
    } catch (err: any) { alert(err.message); }
    finally { setActionLoading(''); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Pengajuan Izin / Cuti</h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: '1.5rem' }}>Kelola pengajuan izin, sakit, cuti, dan dinas dari guru & karyawan</p>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '0.5rem 1rem', borderRadius: 8, border: filter === s ? '2px solid #1B6B44' : '1px solid #D1D5DB',
            background: filter === s ? '#D1FAE5' : '#fff', color: filter === s ? '#065F46' : '#374151',
            fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: '0.3rem'
          }}>
            {s === 'ALL' ? (
              <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>list_alt</span> Semua</>
            ) : s === 'PENDING' ? (
              <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>hourglass_empty</span> Menunggu</>
            ) : s === 'APPROVED' ? (
              <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span> Disetujui</>
            ) : (
              <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>cancel</span> Ditolak</>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Memuat data...</div>
      ) : requests.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280', background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#D1D5DB', display: 'block', marginBottom: '0.5rem' }}>inbox</span>
          Tidak ada pengajuan {filter !== 'ALL' ? `berstatus ${filter}` : ''}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {requests.map(req => (
            <div key={req.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{req.employee?.user?.name || 'N/A'}</span>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusColors[req.status]?.bg, color: statusColors[req.status]?.color }}>{req.status}</span>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#EDE9FE', color: '#5B21B6' }}>{leaveTypeLabels[req.type] || req.type}</span>
                </div>
                <p style={{ fontSize: 13, color: '#374151', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#6B7280' }}>event</span>
                  {formatDate(req.startDate)} — {formatDate(req.endDate)}
                </p>
                <p style={{ fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chat</span>
                  {req.reason}
                </p>
                {req.attachment && <a href={req.attachment} target="_blank" style={{ fontSize: 12, color: '#1B6B44', textDecoration: 'underline', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><span className="material-symbols-outlined" style={{ fontSize: 14 }}>attachment</span> Lihat Lampiran</a>}
                {req.approverNote && <p style={{ fontSize: 12, color: '#92400E', marginTop: '0.35rem', fontStyle: 'italic' }}>Catatan: {req.approverNote}</p>}
              </div>

              {req.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button onClick={() => setNoteModal({ id: req.id, action: 'approve' })} disabled={!!actionLoading} style={{ padding: '0.5rem 1rem', background: '#D1FAE5', color: '#065F46', border: '1px solid #34D399', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span> Setujui
                  </button>
                  <button onClick={() => setNoteModal({ id: req.id, action: 'reject' })} disabled={!!actionLoading} style={{ padding: '0.5rem 1rem', background: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>cancel</span> Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Note Modal */}
      {noteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 420 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {noteModal.action === 'approve' ? (
                <><span className="material-symbols-outlined" style={{ color: '#065F46' }}>check_circle</span> Setujui Pengajuan</>
              ) : (
                <><span className="material-symbols-outlined" style={{ color: '#991B1B' }}>cancel</span> Tolak Pengajuan</>
              )}
            </h3>
            <label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: '0.35rem', display: 'block' }}>Catatan (opsional)</label>
            <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} placeholder="Tambahkan catatan..." style={{ width: '100%', padding: '0.65rem', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setNoteModal(null); setNote(''); }} style={{ padding: '0.5rem 1.25rem', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Batal</button>
              <button onClick={() => handleAction(noteModal.id, noteModal.action, note)} disabled={!!actionLoading} style={{
                padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13,
                background: noteModal.action === 'approve' ? '#1B6B44' : '#DC2626', color: '#fff'
              }}>
                {actionLoading ? 'Memproses...' : noteModal.action === 'approve' ? 'Setujui' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
