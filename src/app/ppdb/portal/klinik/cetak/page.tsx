'use client';
// src/app/ppdb/portal/klinik/cetak/page.tsx
import { useEffect, useState, useCallback } from 'react';
import { ppdbParentApi } from '@/lib/api';
import { useSiteSettings } from '@/components/SiteLogo';

const PARENT_TOKEN_KEY = 'sditiqra2_parent_token';

export default function CetakSuratKlinikPage() {
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<any>(null);
  const { logoUrl, siteName } = useSiteSettings();

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem(PARENT_TOKEN_KEY);
      if (!token) return;
      const res = await ppdbParentApi.getMyRegistration(token);
      setRegistration(res.data);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    // Open print dialog automatically once loaded
    if (!loading && registration) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, registration]);

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>Memuat surat pengantar...</div>;
  if (!registration) return <div style={{ padding: '3rem', textAlign: 'center', fontFamily: 'sans-serif' }}>Data pendaftaran tidak ditemukan.</div>;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 20mm; }
          body { -webkit-print-color-adjust: exact; margin: 0; background: #fff !important; }
          .no-print { display: none !important; }
        }
        body { background: #fff; font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 0.5cm; }
        .print-header { border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 25px; display: flex; align-items: center; gap: 15px; }
        .print-title { flex: 1; text-align: center; }
        .print-title h1 { margin: 0; font-size: 20px; text-transform: uppercase; font-weight: bold; }
        .print-title h2 { margin: 4px 0 0 0; font-size: 14px; font-weight: normal; }
        .print-title p { margin: 4px 0 0 0; font-size: 12px; }
        
        .letter-content { font-size: 15px; line-height: 1.6; text-align: justify; }
        .meta-table { width: 100%; border-collapse: collapse; margin: 25px 0 25px 30px; }
        .meta-table td { padding: 5px 0; vertical-align: top; }
        .meta-table td:first-child { width: 180px; font-weight: bold; }
        
        .print-footer { margin-top: 50px; display: flex; justify-content: flex-end; font-size: 15px; }
        .print-signature { text-align: center; width: 250px; }
        .signature-space { height: 80px; }
      `}</style>

      <div className="no-print" style={{ background: '#FEF3C7', padding: '10px', textAlign: 'center', marginBottom: '20px', fontFamily: 'sans-serif', borderRadius: '8px', border: '1px solid #F59E0B' }}>
        Dokumen cetak ini disiapkan dalam format hitam-putih khusus print. Tekan <strong>Ctrl+P</strong> atau <strong>Cmd+P</strong> jika dialog cetak tidak otomatis muncul.
      </div>

      <div style={{ maxWidth: '210mm', margin: '0 auto' }}>
        {/* Header */}
        <div className="print-header">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain' }} />
          ) : (
             <div style={{ width: 80, height: 80, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>LOGO</div>
          )}
          <div className="print-title">
            <h1>PANITIA PENERIMAAN PESERTA DIDIK BARU</h1>
            <h2>{siteName || 'SD IT Iqra 2 Bengkulu'}</h2>
            <p>Jalan Raden Fatah RT. 01 RW. 01 Kelurahan Pagar Dewa, Kecamatan Selebar, Kota Bengkulu</p>
          </div>
        </div>

        {/* Content */}
        <div className="letter-content">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 5px 0', textDecoration: 'underline', fontSize: '18px' }}>SURAT PENGANTAR PEMERIKSAAN KLINIK</h3>
            <div>Nomor: {registration.clinicReferralNo || '-'}</div>
          </div>

          <p>Kepada Yth.,</p>
          <p><strong>Pimpinan Klinik Iqra Medical Clinic (IMC)</strong><br/>di tempat</p>

          <p>Dengan hormat,</p>
          <p>Sehubungan dengan rangkaian proses Penerimaan Peserta Didik Baru (PPDB) SD IT Iqra 2 Kota Bengkulu, dengan ini kami memberikan pengantar kepada calon peserta didik di bawah ini:</p>

          <table className="meta-table">
            <tbody>
              <tr>
                <td>Nama Lengkap</td>
                <td style={{ width: '20px' }}>:</td>
                <td>{registration.studentName || '-'}</td>
              </tr>
              <tr>
                <td>Nomor Registrasi</td>
                <td>:</td>
                <td>{registration.registrationNo}</td>
              </tr>
              <tr>
                <td>Tempat, Tgl Lahir</td>
                <td>:</td>
                <td>{registration.birthPlace || '-'}, {registration.birthDate ? new Date(registration.birthDate).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric'}) : '-'}</td>
              </tr>
              <tr>
                <td>Asal TK/PAUD</td>
                <td>:</td>
                <td>{registration.kindergarten || '-'}</td>
              </tr>
              <tr>
                <td>Nama Orang Tua</td>
                <td>:</td>
                <td>{registration.parent?.name || '-'}</td>
              </tr>
            </tbody>
          </table>

          <p>Mohon kiranya dapat dilakukan pemeriksaan kesehatan dasar administrasi bagi calon peserta didik tersebut. Hasil pemeriksaan klinik ini akan digunakan sebagai pelengkap seleksi PPDB tahun ini.</p>

          <p>Demikian surat pengantar ini kami sampaikan. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.</p>
        </div>

        {/* Footer */}
        <div className="print-footer">
          <div className="print-signature">
            Bengkulu, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br/>
            Panitia PPDB,<br/>
            {siteName || 'SD IT Iqra 2'}
            <div className="signature-space"></div>
            (...........................................)
          </div>
        </div>
      </div>
    </>
  );
}
