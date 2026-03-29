'use client';
// src/app/admin/ppdb/kelas/[id]/print/page.tsx
import { useEffect, useState, useCallback, use } from 'react';
import { ppdbAdminApi } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useSiteSettings } from '@/components/SiteLogo';

export default function CetakKelasPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const classroomId = unwrappedParams.id;
  const token = getToken() || '';
  const { logoUrl, siteName } = useSiteSettings();

  const [loading, setLoading] = useState(true);
  const [classroom, setClassroom] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      if (!token) return;
      const [classRes, allRegsRes] = await Promise.all([
        ppdbAdminApi.getClassrooms(token),
        ppdbAdminApi.getAll(token, { limit: '500' })
      ]);
      
      const foundClass = classRes.data?.find((c: any) => c.id === classroomId);
      if (foundClass) setClassroom(foundClass);

      const all = allRegsRes.data?.data || [];
      const assigned = all.filter((r: any) => r.classroomId === classroomId)
                          .sort((a: any, b: any) => (a.studentName || '').localeCompare(b.studentName || ''));
      setStudents(assigned);
    } catch (e: any) {
      console.error('Error fetching print data:', e);
    } finally {
      setLoading(false);
    }
  }, [token, classroomId]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    // Open print dialog automatically once loaded
    if (!loading && classroom) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, classroom]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>Memuat dokumen cetak...</div>;
  if (!classroom) return <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>Kelas tidak ditemukan.</div>;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body { -webkit-print-color-adjust: exact; margin: 0; background: #fff !important; }
          .no-print { display: none !important; }
        }
        body { background: #fff; font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 0.5cm; }
        .print-header { border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 20px; display: flex; align-items: center; gap: 15px; }
        .print-title { flex: 1; text-align: center; }
        .print-title h1 { margin: 0; font-size: 20px; text-transform: uppercase; font-weight: bold; }
        .print-title h2 { margin: 4px 0 0 0; font-size: 16px; font-weight: normal; }
        .print-meta { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px; }
        .print-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .print-table th, .print-table td { border: 1px solid #000; padding: 6px 10px; text-align: left; }
        .print-table th { background: #f2f2f2; font-weight: bold; text-align: center; }
        .print-footer { margin-top: 40px; display: flex; justify-content: flex-end; font-size: 14px; }
        .print-signature { text-align: center; width: 200px; }
        .signature-space { height: 80px; }
      `}</style>

      <div className="no-print" style={{ background: '#FEF3C7', padding: '10px', textAlign: 'center', marginBottom: '20px', fontFamily: 'sans-serif', borderRadius: '8px', border: '1px solid #F59E0B' }}>
        Dokumen cetak ini disiapkan dalam format hitam-putih. Tekan <strong>Ctrl+P</strong> atau <strong>Cmd+P</strong> jika dialog cetak tidak otomatis muncul.
      </div>

      <div style={{ maxWidth: '210mm', margin: '0 auto' }}>
        {/* Header */}
        <div className="print-header">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" style={{ width: 70, height: 70, objectFit: 'contain' }} />
          ) : (
            <div style={{ width: 70, height: 70, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>LOGO</div>
          )}
          <div className="print-title">
            <h1>DAFTAR SISWA KELAS {classroom.name}</h1>
            <h2>{siteName || 'SD IT Iqra 2 Bengkulu'} — Penerimaan Peserta Didik Baru</h2>
          </div>
          <div style={{ width: 70 }}></div> {/* spacer */}
        </div>

        {/* Mata Iniformasi */}
        <div className="print-meta">
          <div>
            <strong>Nama Kelas:</strong> {classroom.name} <br/>
            <strong>Wali Kelas:</strong> {classroom.homeroomTeacher || 'Belum Ditetapkan'}
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Tahun Ajaran:</strong> {students.length > 0 ? students[0].academicYear?.name : '-'} <br/>
            <strong>Jumlah Siswa:</strong> {students.length} Anak
          </div>
        </div>

        {/* Tabel Data Siswa */}
        <table className="print-table">
          <thead>
            <tr>
              <th style={{ width: '5%' }}>No</th>
              <th style={{ width: '40%' }}>Nama Lengkap Siswa</th>
              <th style={{ width: '25%' }}>No. Registrasi</th>
              <th style={{ width: '30%' }}>Nama Orang Tua</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>Tidak ada siswa yang ditempatkan di kelas ini.</td>
              </tr>
            ) : (
              students.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ textAlign: 'center' }}>{i + 1}</td>
                  <td>{r.studentName || '-'}</td>
                  <td>{r.registrationNo}</td>
                  <td>{r.parent?.name || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer Tanda Tangan */}
        <div className="print-footer">
          <div className="print-signature">
            Bengkulu, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            Panitia PPDB / Kepala Sekolah
            <div className="signature-space"></div>
            (...........................................)
          </div>
        </div>
      </div>
    </>
  );
}
