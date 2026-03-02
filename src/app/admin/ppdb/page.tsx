'use client';
import { useState, useEffect } from 'react';
import { academicYearsApi, registrationsApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function AdminPPDBPage() {
  const formatDate = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    return String(date.getDate()).padStart(2, '0') + '/' + String(date.getMonth() + 1).padStart(2, '0') + '/' + date.getFullYear();
  };

  const [activeTab, setActiveTab] = useState<'REGISTRATIONS' | 'ACADEMIC_YEARS'>('REGISTRATIONS');
  
  // Data State
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State untuk Tahun Ajaran Baru
  const [ayForm, setAyForm] = useState({ name: '', registrationStart: '', registrationEnd: '', quota: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setPageError(null);
    const token = getToken();
    try {
      if (activeTab === 'REGISTRATIONS') {
        const res = await registrationsApi.getAll(token || '');
        setRegistrations(res.data);
      } else {
        const res = await academicYearsApi.getAll(token || '');
        setAcademicYears(res.data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengambil data. Pastikan server backend berjalan.';
      setPageError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAY = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMsg(null);
    try {
      await academicYearsApi.create(getToken() || '', ayForm);
      setAyForm({ name: '', registrationStart: '', registrationEnd: '', quota: 0 });
      setFormMsg({ type: 'success', text: 'Gelombang pendaftaran berhasil ditambahkan!' });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menambah gelombang.';
      setFormMsg({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetActiveAY = async (id: string) => {
    if (!confirm('Ubah tahun ajaran ini menjadi aktif?')) return;
    try {
      await academicYearsApi.setActive(getToken() || '', id);
      setFormMsg({ type: 'success', text: 'Tahun ajaran aktif berhasil diubah.' });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status aktif.';
      setFormMsg({ type: 'error', text: msg });
    }
  };

  const handleDeleteAY = async (id: string) => {
    if (!confirm('Hapus tahun ajaran ini? Tidak dapat dikembalikan.')) return;
    try {
      await academicYearsApi.delete(getToken() || '', id);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus.';
      setFormMsg({ type: 'error', text: msg });
    }
  };

  const handleVerifyRegistration = async (id: string, status: 'VERIFYING' | 'ACCEPTED' | 'REJECTED') => {
    let reason = '';
    if (status === 'REJECTED') {
      reason = prompt('Alasan penolakan:') || 'Tidak memenuhi syarat';
    }
    try {
      await registrationsApi.updateStatus(getToken() || '', id, { status, rejectReason: reason });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status pendaftar.';
      setPageError(msg);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>Manajemen PPDB</h1>

      {pageError && (
        <div style={{ padding: '0.875rem 1rem', background: '#FEF2F2', color: '#B91C1C', borderRadius: 8, marginBottom: '1rem', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
          {pageError}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #E5E7EB' }}>
        <button onClick={() => { setActiveTab('REGISTRATIONS'); setPageError(null); }} style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'REGISTRATIONS' ? '2px solid #1B6B44' : '2px solid transparent', color: activeTab === 'REGISTRATIONS' ? '#1B6B44' : '#6B7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <span className="material-symbols-outlined" style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>group</span> Calon Siswa
        </button>
        <button onClick={() => { setActiveTab('ACADEMIC_YEARS'); setPageError(null); }} style={{ padding: '0.75rem 1rem', background: 'transparent', border: 'none', borderBottom: activeTab === 'ACADEMIC_YEARS' ? '2px solid #1B6B44' : '2px solid transparent', color: activeTab === 'ACADEMIC_YEARS' ? '#1B6B44' : '#6B7280', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <span className="material-symbols-outlined" style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>date_range</span> Gelombang / Tahun Ajaran
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Memuat data...</div>
      ) : activeTab === 'ACADEMIC_YEARS' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
          {/* Form Buat TA */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: 12, border: '1px solid #E5E7EB', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Tambah Gelombang Baru</h3>

            {formMsg && (
              <div style={{ padding: '0.75rem', borderRadius: 6, marginBottom: '1rem', background: formMsg.type === 'success' ? '#D1FAE5' : '#FEE2E2', color: formMsg.type === 'success' ? '#065F46' : '#991B1B', fontSize: 13, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{formMsg.type === 'success' ? 'check_circle' : 'error'}</span>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateAY} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: '0.25rem' }}>Nama (Contoh: Gelombang 1 - 2026/2027)</label>
                <input required value={ayForm.name} onChange={e => setAyForm({...ayForm, name: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: 6, boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: '0.25rem' }}>Tgl Mulai</label>
                  <input required type="date" value={ayForm.registrationStart} onChange={e => setAyForm({...ayForm, registrationStart: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: 6 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: '0.25rem' }}>Tgl Selesai</label>
                  <input required type="date" value={ayForm.registrationEnd} onChange={e => setAyForm({...ayForm, registrationEnd: e.target.value})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: 6 }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: '0.25rem' }}>Kuota Pendaftar (0 = tak terbatas)</label>
                <input required type="number" min={0} value={ayForm.quota} onChange={e => setAyForm({...ayForm, quota: parseInt(e.target.value) || 0})} style={{ width: '100%', padding: '0.5rem', border: '1px solid #D1D5DB', borderRadius: 6 }} />
              </div>
              <button disabled={isSubmitting} type="submit" style={{ padding: '0.75rem', background: isSubmitting ? '#6B7280' : '#1B6B44', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{isSubmitting ? 'hourglass_empty' : 'add_circle'}</span>
                {isSubmitting ? 'Menyimpan...' : 'Tambah Gelombang'}
              </button>
            </form>
          </div>

          {/* List TA */}
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                <tr>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Tahun Ajaran / Gelombang</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Jadwal Buka</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#6B7280', fontWeight: 600 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {academicYears.map(ay => (
                  <tr key={ay.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>{ay.name}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>Kuota: {ay.quota === 0 ? 'Tanpa Bebas' : ay.quota} | Pendaftar: {ay._count?.registrations || 0}</div>
                    </td>
                    <td style={{ padding: '1rem', color: '#374151', fontSize: 13 }}>
                      {formatDate(ay.registrationStart)} - {formatDate(ay.registrationEnd)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {ay.isActive ? (
                        <span style={{ padding: '0.2rem 0.5rem', background: '#D1FAE5', color: '#065F46', fontSize: 11, fontWeight: 600, borderRadius: 20 }}>AKTIF</span>
                      ) : (
                        <span style={{ padding: '0.2rem 0.5rem', background: '#F3F4F6', color: '#4B5563', fontSize: 11, fontWeight: 600, borderRadius: 20 }}>NONAKTIF</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {!ay.isActive && <button onClick={() => handleSetActiveAY(ay.id)} style={{ padding: '0.35rem 0.75rem', background: '#F2D98A', color: '#0F3D24', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, marginRight: '0.5rem', cursor: 'pointer' }}>Jadikan Aktif</button>}
                      <button onClick={() => handleDeleteAY(ay.id)} style={{ padding: '0.35rem 0.75rem', background: '#FEE2E2', color: '#B91C1C', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Hapus</button>
                    </td>
                  </tr>
                ))}
                {academicYears.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Tidak ada data gelombang pendaftaran.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Tgl Daftar</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>No Reg / Nama Siswa</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#6B7280', fontWeight: 600 }}>Aksi Peninjauan</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(reg => (
                <tr key={reg.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '1rem', color: '#6B7280', fontSize: 13 }}>{formatDate(reg.createdAt)}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#1B6B44', fontSize: 12 }}>{reg.registrationNo}</div>
                    <div style={{ fontWeight: 600, color: '#111827' }}>{reg.studentName} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({reg.gender})</span></div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>Gelombang: {reg.academicYear?.name}</div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {reg.status === 'PENDING' && <span style={{ padding: '0.2rem 0.5rem', background: '#FEF3C7', color: '#92400E', fontSize: 11, fontWeight: 600, borderRadius: 20 }}>Menunggu Berkas</span>}
                    {reg.status === 'VERIFYING' && <span style={{ padding: '0.2rem 0.5rem', background: '#DBEAFE', color: '#1E40AF', fontSize: 11, fontWeight: 600, borderRadius: 20 }}>Proses Verifikasi</span>}
                    {reg.status === 'ACCEPTED' && <span style={{ padding: '0.2rem 0.5rem', background: '#D1FAE5', color: '#065F46', fontSize: 11, fontWeight: 600, borderRadius: 20 }}>DITERIMA</span>}
                    {reg.status === 'REJECTED' && <span style={{ padding: '0.2rem 0.5rem', background: '#FEE2E2', color: '#991B1B', fontSize: 11, fontWeight: 600, borderRadius: 20 }}>DITOLAK</span>}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {(reg.status === 'PENDING' || reg.status === 'VERIFYING') && (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleVerifyRegistration(reg.id, 'ACCEPTED')} style={{ padding: '0.35rem 0.75rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Terima</button>
                        <button onClick={() => handleVerifyRegistration(reg.id, 'REJECTED')} style={{ padding: '0.35rem 0.75rem', background: '#FEE2E2', color: '#B91C1C', border: 'none', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Tolak</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>Belum ada data pendaftar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
