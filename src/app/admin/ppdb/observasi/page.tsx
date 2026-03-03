'use client';
// src/app/admin/ppdb/observasi/page.tsx — Manajemen jadwal observasi
import { useState, useEffect, useCallback } from 'react';
import { ppdbAdminApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function AdminObservasiPage() {
  const token = getToken() || '';
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: '', startTime: '08:00', endTime: '10:00', quota: 10, note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [observeReg, setObserveReg] = useState<{ id: string; name: string } | null>(null);
  const [observeResult, setObserveResult] = useState('PASSED');
  const [observeNote, setObserveNote] = useState('');
  const [observeLoading, setObserveLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ppdbAdminApi.getObservationSlots(token);
      setSlots(res.data || []);
    } catch (e: any) { setMsg('Error: ' + e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setMsg('');
    try {
      await ppdbAdminApi.createObservationSlot(token, form);
      setMsg('✅ Jadwal berhasil dibuat.');
      setForm({ date: '', startTime: '08:00', endTime: '10:00', quota: 10, note: '' });
      load();
    } catch (e: any) { setMsg('Error: ' + e.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jadwal ini? Peserta yang sudah booking akan terpengaruh.')) return;
    try {
      await ppdbAdminApi.deleteObservationSlot(token, id);
      load();
    } catch (e: any) { setMsg('Error: ' + e.message); }
  };

  const submitObservation = async () => {
    if (!observeReg) return;
    setObserveLoading(true);
    try {
      await ppdbAdminApi.recordObservationResult(token, observeReg.id, {
        result: observeResult,
        note: observeNote,
      });
      setMsg(`✅ Hasil observasi ${observeReg.name} berhasil dicatat.`);
      setObserveReg(null);
      setObserveNote('');
      load();
    } catch (e: any) { setMsg('Error: ' + e.message); }
    finally { setObserveLoading(false); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>Jadwal Observasi</h1>
        <p style={{ color: '#6B7280', fontSize: 14 }}>Buat dan kelola slot jadwal observasi calon siswa</p>
      </div>

      {msg && (
        <div style={{ background: msg.startsWith('✅') ? '#D1FAE5' : '#FEF2F2', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: msg.startsWith('✅') ? '#065F46' : '#DC2626', fontSize: 14 }}>
          {msg} <button onClick={() => setMsg('')} style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
        {/* Form tambah jadwal */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #E5E7EB', height: 'fit-content' }}>
          <div style={{ fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Buat Jadwal Baru</div>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Tanggal <span style={{ color: '#DC2626' }}>*</span></label>
              <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ width: '100%', padding: '0.65rem 0.875rem', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[{ key: 'startTime', label: 'Mulai' }, { key: 'endTime', label: 'Selesai' }].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>{f.label}</label>
                  <input type="time" value={(form as any)[f.key]} onChange={e => setForm(ff => ({ ...ff, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.875rem', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Kuota</label>
              <input type="number" min={1} value={form.quota} onChange={e => setForm(f => ({ ...f, quota: Number(e.target.value) }))}
                style={{ width: '100%', padding: '0.65rem 0.875rem', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Catatan (opsional)</label>
              <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="Misal: Bawa buku anak" 
                style={{ width: '100%', padding: '0.65rem 0.875rem', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={submitting} style={{ padding: '0.75rem', background: submitting ? '#9CA3AF' : '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
              {submitting ? 'Menyimpan...' : '+ Buat Jadwal'}
            </button>
          </form>
        </div>

        {/* Daftar slot */}
        <div>
          {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Memuat jadwal...</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {slots.length === 0 && (
                <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                  <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>📅</div>
                  <div style={{ fontWeight: 600 }}>Belum ada jadwal observasi</div>
                  <div style={{ fontSize: 14, marginTop: '0.35rem' }}>Buat jadwal baru melalui form di kiri</div>
                </div>
              )}
              {slots.map(slot => {
                const filled = slot._count?.registrations ?? slot.registrations?.length ?? 0;
                const remaining = slot.quota - filled;
                const isExpanded = expandedSlot === slot.id;
                return (
                  <div key={slot.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                    <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{fmtDate(slot.date)}</div>
                        <div style={{ fontSize: 13, color: '#6B7280', marginTop: '0.2rem' }}>
                          🕐 {slot.startTime} – {slot.endTime} WIB
                          {slot.note && <span style={{ marginLeft: '0.75rem', color: '#9CA3AF' }}>· {slot.note}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: 20, color: remaining === 0 ? '#DC2626' : '#1B6B44' }}>{remaining}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>sisa / {slot.quota}</div>
                        </div>
                        <button onClick={() => setExpandedSlot(isExpanded ? null : slot.id)} style={{ padding: '0.4rem 0.75rem', background: '#F0F9F4', border: '1px solid #D1E9DA', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#1B6B44', fontWeight: 600 }}>
                          {isExpanded ? 'Tutup' : `${filled} Peserta`}
                        </button>
                        <button onClick={() => handleDelete(slot.id)} style={{ padding: '0.4rem 0.75rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#DC2626', fontWeight: 600 }}>
                          Hapus
                        </button>
                      </div>
                    </div>

                    {/* Daftar peserta slot ini */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid #F3F4F6', background: '#F9FAFB' }}>
                        {(slot.registrations || []).length === 0
                          ? <div style={{ padding: '1.25rem', color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>Belum ada peserta yang memilih jadwal ini.</div>
                          : (slot.registrations || []).map((reg: any) => (
                            <div key={reg.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', borderBottom: '1px solid #F3F4F6' }}>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{reg.studentName || '(nama belum diisi)'}</div>
                                <div style={{ fontSize: 12, color: '#6B7280' }}>{reg.parent?.name} · {reg.registrationNo}</div>
                              </div>
                              {reg.status === 'OBSERVATION_SCHEDULED' && (
                                <button onClick={() => { setObserveReg({ id: reg.id, name: reg.studentName || reg.registrationNo }); setObserveResult('PASSED'); setObserveNote(''); }}
                                  style={{ padding: '0.4rem 0.875rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                                  Catat Hasil
                                </button>
                              )}
                              {reg.status === 'OBSERVATION_DONE' && (
                                <span style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>✅ Selesai</span>
                              )}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal catat hasil observasi */}
      {observeReg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%' }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#111827', marginBottom: '0.35rem' }}>Catat Hasil Observasi</div>
            <div style={{ color: '#6B7280', fontSize: 14, marginBottom: '1.5rem' }}>{observeReg.name}</div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Hasil Observasi</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {['PASSED', 'FAILED'].map(r => (
                  <label key={r} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', borderRadius: 10, border: `2px solid ${observeResult === r ? (r === 'PASSED' ? '#1B6B44' : '#DC2626') : '#E5E7EB'}`, cursor: 'pointer', background: observeResult === r ? (r === 'PASSED' ? '#F0F9F4' : '#FEF2F2') : '#fff', fontWeight: 600, fontSize: 14, color: observeResult === r ? (r === 'PASSED' ? '#1B6B44' : '#DC2626') : '#6B7280' }}>
                    <input type="radio" value={r} checked={observeResult === r} onChange={() => setObserveResult(r)} style={{ display: 'none' }} />
                    {r === 'PASSED' ? '✅ Lulus' : '❌ Tidak Lulus'}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Catatan</label>
              <textarea rows={3} value={observeNote} onChange={e => setObserveNote(e.target.value)} placeholder="Catatan hasil observasi..."
                style={{ width: '100%', padding: '0.75rem', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setObserveReg(null)} style={{ flex: 1, padding: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Batal</button>
              <button onClick={submitObservation} disabled={observeLoading} style={{ flex: 1, padding: '0.75rem', background: observeLoading ? '#9CA3AF' : '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, cursor: observeLoading ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {observeLoading ? 'Menyimpan...' : 'Simpan Hasil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
