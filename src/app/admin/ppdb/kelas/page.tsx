'use client';
// src/app/admin/ppdb/kelas/page.tsx — Manajemen kelas paralel + assign siswa
import { useState, useEffect, useCallback } from 'react';
import { ppdbAdminApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function AdminKelasPage() {
  const token = getToken() || '';
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filterAssign, setFilterAssign] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', grade: 1, maxStudents: 30, homeroomTeacher: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [assignReg, setAssignReg] = useState<any | null>(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadPdf = async (classroomId: string, classroomName: string) => {
    setDownloadingId(classroomId);
    try {
      const res = await ppdbAdminApi.downloadClassRosterPdf(token, classroomId);
      if (!res.ok) throw new Error('Gagal generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `daftar-siswa-kelas-${classroomName}.pdf`;
      a.click(); URL.revokeObjectURL(url);
    } catch (e: any) { setMsg('Error: ' + e.message); }
    finally { setDownloadingId(null); }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [classRes, regRes] = await Promise.all([
        ppdbAdminApi.getClassrooms(token),
        ppdbAdminApi.getAll(token, { limit: 500 }),
      ]);
      setClassrooms(classRes.data || []);
      
      const allRegs = regRes.data?.data || [];
      const graduates = allRegs.filter((r: any) => 
        r.status === 'ACCEPTED' || 
        (r.status === 'OBSERVATION_DONE' && r.observationResult === 'PASSED')
      );
      setStudents(graduates);
    } catch (e: any) { setMsg('Error: ' + e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await ppdbAdminApi.createClassroom(token, form);
      setMsg('✅ Kelas berhasil dibuat.');
      setForm({ name: '', grade: 1, maxStudents: 30, homeroomTeacher: '' });
      load();
    } catch (e: any) { setMsg('Error: ' + e.message); }
    finally { setSubmitting(false); }
  };

  const assignClass = async () => {
    if (!assignReg || !selectedClass) return;
    setAssigning(true);
    try {
      await ppdbAdminApi.assignClassroom(token, assignReg.id, selectedClass);
      setMsg(`✅ ${assignReg.studentName} berhasil ditempatkan di ${classrooms.find(c => c.id === selectedClass)?.name}.`);
      setAssignReg(null); setSelectedClass('');
      load();
    } catch (e: any) { setMsg('Error: ' + e.message); }
    finally { setAssigning(false); }
  };

  const deleteClass = async (id: string) => {
    if (!confirm('Hapus kelas ini?')) return;
    try { await ppdbAdminApi.deleteClassroom(token, id); load(); }
    catch (e: any) { setMsg('Error: ' + e.message); }
  };

  const filteredStudents = students.filter(r => {
    if (filterAssign === 'ASSIGNED') return !!r.classroomId;
    if (filterAssign === 'UNASSIGNED') return !r.classroomId;
    return true; // ALL
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>Penugasan Kelas Paralel</h1>
        <p style={{ color: '#6B7280', fontSize: 14 }}>Buat kelas dan tempatkan siswa yang diterima ke kelas masing-masing</p>
      </div>

      {msg && (
        <div style={{ background: msg.startsWith('✅') ? '#D1FAE5' : '#FEF2F2', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: msg.startsWith('✅') ? '#065F46' : '#DC2626', fontSize: 14 }}>
          {msg} <button onClick={() => setMsg('')} style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>×</button>
        </div>
      )}

      {loading ? <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Memuat data...</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem' }}>
          {/* Form kelas */}
          <div>
            <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #E5E7EB', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Buat Kelas Baru</div>
              <form onSubmit={createClass} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { key: 'name', label: 'Nama Kelas', placeholder: '1A', type: 'text' },
                  { key: 'homeroomTeacher', label: 'Wali Kelas', placeholder: 'Nama wali kelas', type: 'text' },
                  { key: 'maxStudents', label: 'Maks. Siswa', placeholder: '30', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>{f.label}</label>
                    <input required={f.key === 'name'} type={f.type} placeholder={f.placeholder}
                      value={(form as any)[f.key]} onChange={e => setForm(ff => ({ ...ff, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      style={{ width: '100%', padding: '0.65rem 0.875rem', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
                <button type="submit" disabled={submitting} style={{ padding: '0.75rem', background: submitting ? '#9CA3AF' : '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                  {submitting ? 'Menyimpan...' : '+ Buat Kelas'}
                </button>
              </form>
            </div>

            {/* Daftar kelas */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', padding: '1.25rem' }}>
              <div style={{ fontWeight: 700, color: '#111827', marginBottom: '1rem', fontSize: 15 }}>Kelas Tersedia</div>
              {classrooms.length === 0
                ? <div style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', padding: '1rem' }}>Belum ada kelas.</div>
                : classrooms.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #F3F4F6' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: '#1B6B44' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>
                        {c._count?.registrations ?? 0}/{c.maxStudents} siswa
                        {c.homeroomTeacher && ` · Wali: ${c.homeroomTeacher}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => downloadPdf(c.id, c.name)} disabled={downloadingId === c.id}
                        style={{ padding: '0.35rem 0.65rem', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 6, cursor: downloadingId === c.id ? 'not-allowed' : 'pointer', fontSize: 11, color: '#166534', fontWeight: 700 }}>
                        {downloadingId === c.id ? '...' : 'Unduh PDF'}
                      </button>
                      <button onClick={() => deleteClass(c.id)} style={{ padding: '0.35rem 0.65rem', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, cursor: 'pointer', fontSize: 11, color: '#DC2626', fontWeight: 700 }}>
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* List Siswa */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>
                Siswa Lulus Observasi
                <span style={{ marginLeft: '0.5rem', background: '#FEF3C7', color: '#92400E', borderRadius: 100, padding: '0.15rem 0.6rem', fontSize: 12, fontWeight: 700 }}>
                  {filteredStudents.length}
                </span>
              </div>
              <select value={filterAssign} onChange={e => setFilterAssign(e.target.value)} style={{ padding: '0.4rem 0.75rem', borderRadius: 8, border: '1.5px solid #E5E7EB', outline: 'none', fontSize: 13, background: '#fff' }}>
                <option value="ALL">Semua Siswa</option>
                <option value="UNASSIGNED">Belum Ditugaskan</option>
                <option value="ASSIGNED">Sudah Ditempatkan</option>
              </select>
            </div>

            {filteredStudents.length === 0
              ? (
                <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
                  <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>🎓</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Tidak Ada Siswa</div>
                  <div style={{ fontSize: 14, marginTop: '0.35rem' }}>Berdasarkan filter yang dipilih.</div>
                </div>
              )
              : (
                <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Nama Siswa', 'Orang Tua', 'No. Reg', 'Kelas', 'Aksi'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((r: any) => (
                        <tr key={r.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                          <td style={{ padding: '1rem', fontWeight: 700, color: '#111827' }}>{r.studentName || '-'}</td>
                          <td style={{ padding: '1rem', color: '#6B7280', fontSize: 13 }}>{r.parent?.name || '-'}</td>
                          <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: 12, color: '#1B6B44' }}>{r.registrationNo}</td>
                          <td style={{ padding: '1rem', fontWeight: 600, color: r.classroom ? '#065F46' : '#9CA3AF' }}>
                            {r.classroom?.name || 'Belum ada'}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <button onClick={() => { setAssignReg(r); setSelectedClass(r.classroomId || ''); }}
                              style={{ padding: '0.4rem 0.875rem', background: 'linear-gradient(135deg, #1B6B44, #2D9164)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                              {r.classroom ? 'Ubah Kelas' : 'Tugaskan'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* Modal assign kelas */}
      {assignReg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', maxWidth: 440, width: '100%' }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: '#111827', marginBottom: '0.25rem' }}>Tugaskan Kelas</div>
            <div style={{ color: '#6B7280', fontSize: 14, marginBottom: '1.5rem' }}>{assignReg.studentName}</div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>Pilih Kelas</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem' }}>
                {classrooms.map(c => {
                  const isFull = (c._count?.registrations ?? 0) >= c.maxStudents;
                  return (
                    <button key={c.id} onClick={() => !isFull && setSelectedClass(c.id)} disabled={isFull}
                      style={{ padding: '1rem 0.5rem', borderRadius: 12, border: `2px solid ${selectedClass === c.id ? '#1B6B44' : '#E5E7EB'}`, background: selectedClass === c.id ? '#F0F9F4' : isFull ? '#F9FAFB' : '#fff', cursor: isFull ? 'not-allowed' : 'pointer', opacity: isFull ? 0.5 : 1, transition: 'all 0.15s' }}>
                      <div style={{ fontWeight: 800, fontSize: 20, color: selectedClass === c.id ? '#1B6B44' : '#374151' }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: '0.2rem' }}>{c._count?.registrations ?? 0}/{c.maxStudents}</div>
                      {isFull && <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 700 }}>PENUH</div>}
                    </button>
                  );
                })}
              </div>
              {classrooms.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13, marginTop: '0.5rem' }}>Buat kelas terlebih dahulu.</div>}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setAssignReg(null)} style={{ flex: 1, padding: '0.75rem', background: '#F3F4F6', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Batal</button>
              <button onClick={assignClass} disabled={assigning || !selectedClass}
                style={{ flex: 1, padding: '0.75rem', background: (!selectedClass || assigning) ? '#9CA3AF' : '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, cursor: (!selectedClass || assigning) ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {assigning ? 'Menyimpan...' : 'Tugaskan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
