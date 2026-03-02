'use client';
import { useState, useEffect } from 'react';
import { academicYearsApi, registrationsApi } from '@/lib/api';

export default function PPDBPage() {
  const [activeYear, setActiveYear] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    studentName: '',
    gender: 'L',
    birthPlace: '',
    birthDate: '',
    religion: 'Islam',
    address: '',
    previousSchool: '',
  });

  const [files, setFiles] = useState({
    photo: null as File | null,
    docBirthCert: null as File | null,
    docKartuKeluarga: null as File | null,
  });

  useEffect(() => {
    academicYearsApi.getActive()
      .then((res) => {
        setActiveYear(res.data);
      })
      .catch(() => {
        setActiveYear(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [e.target.name]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (files.photo) data.append('photo', files.photo);
      if (files.docBirthCert) data.append('docBirthCert', files.docBirthCert);
      if (files.docKartuKeluarga) data.append('docKartuKeluarga', files.docKartuKeluarga);

      // Parent ID sementara akan di-hardcode ke 'dummy-parent' di backend apabila auth public parent belum dibuat - TAPI 
      // kita harus mock value parent di form agar query di Prisma tidak error, atau kita biarkan controller error lalu kita adjust controller.
      // Kita assign dummy parent di body untuk MVP ini, nanti parents perlu login mandiri (tahap lanjutan jika dibutuhkan)
      data.append('parentId', 'user-super-admin-id'); // Workaround sementara karena Portal Parent belum ada

      await registrationsApi.submitForm('', data);
      setSuccessMsg('Pendaftaran berhasil disubmit! Silakan tunggu konfirmasi panitia.');
      
      // Reset form
      setFormData({
        studentName: '', gender: 'L', birthPlace: '', birthDate: '', religion: 'Islam', address: '', previousSchool: '',
      });
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengirim formulir.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '5rem', textAlign: 'center' }}>Memuat informasi PPDB...</div>;

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        <div style={{ background: 'linear-gradient(135deg, #1B6B44, #2D9164)', padding: '2.5rem 2rem', color: '#fff', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Penerimaan Siswa Baru</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            {activeYear ? `Tahun Ajaran ${activeYear.name}` : 'Saat ini sedang tidak ada pendaftaran yang dibuka.'}
          </p>
        </div>

        {activeYear ? (
          <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
            {successMsg && (
              <div style={{ padding: '1rem', background: '#ecfdf5', color: '#047857', borderRadius: 8, marginBottom: '2rem', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>check_circle</span> {successMsg}
              </div>
            )}
            
            {errorMsg && (
              <div style={{ padding: '1rem', background: '#fef2f2', color: '#b91c1c', borderRadius: 8, marginBottom: '2rem', border: '1px solid #fecaca', display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{ marginRight: '0.5rem' }}>error</span> {errorMsg}
              </div>
            )}

            <h3 style={{ fontSize: '1.25rem', color: '#111827', marginBottom: '1.5rem', borderBottom: '2px solid #F3F4F6', paddingBottom: '0.5rem' }}>A. Data Calon Siswa</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Nama Lengkap Siswa *</label>
                <input required name="studentName" value={formData.studentName} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #D1D5DB' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Tempat Lahir *</label>
                <input required name="birthPlace" value={formData.birthPlace} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #D1D5DB' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Tanggal Lahir *</label>
                <input required type="date" name="birthDate" value={formData.birthDate} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #D1D5DB' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Jenis Kelamin *</label>
                <select required name="gender" value={formData.gender} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #D1D5DB' }}>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Agama *</label>
                <select required name="religion" value={formData.religion} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #D1D5DB' }}>
                  <option value="Islam">Islam</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Asal Sekolah (TK / PAUD)</label>
                <input name="previousSchool" value={formData.previousSchool} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #D1D5DB' }} />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Alamat Lengkap *</label>
                <textarea required name="address" rows={3} value={formData.address} onChange={handleInputChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #D1D5DB' }} />
              </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', color: '#111827', margin: '2.5rem 0 1.5rem', borderBottom: '2px solid #F3F4F6', paddingBottom: '0.5rem' }}>B. Berkas Persyaratan (JPG/PNG)</h3>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Pas Foto Anak (Maks 2MB) *</label>
                <input required type="file" name="photo" accept="image/*" onChange={handleFileChange} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Scan/Foto Akte Kelahiran *</label>
                <input required type="file" name="docBirthCert" accept="image/*" onChange={handleFileChange} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Scan/Foto Kartu Keluarga (KK) *</label>
                <input required type="file" name="docKartuKeluarga" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>

            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #E5E7EB' }}>
               <button type="submit" disabled={submitting} style={{ 
                 width: '100%', padding: '1rem', background: submitting ? '#9CA3AF' : '#1B6B44', color: '#fff', 
                 border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' 
               }}>
                 {submitting ? 'Mengirim Data...' : <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}>Kirim Pendaftaran <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>send</span></span>}
               </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#9CA3AF' }}>lock</span>
            </div>
            <h3 style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '1rem' }}>Pendaftaran Ditutup</h3>
            <p style={{ color: '#6B7280' }}>Mohon maaf, saat ini tidak ada gelombang pendaftaran PPDB yang aktif. Silahkan kembali lagi nanti atau hubungi pihak sekolah.</p>
          </div>
        )}

      </div>
    </div>
  );
}
