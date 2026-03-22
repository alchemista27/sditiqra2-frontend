'use client';
// src/app/ppdb/portal/klinik/page.tsx — Download surat pengantar + upload surat klinik IMC
import { useEffect, useState, useRef } from 'react';
import { ppdbParentApi } from '@/lib/api';

const PARENT_TOKEN_KEY = 'sditiqra2_parent_token';

export default function KlinikPage() {
  const [registration, setRegistration] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem(PARENT_TOKEN_KEY);
    if (!token) return;
    ppdbParentApi.getMyRegistration(token).then(r => setRegistration(r.data)).catch(() => {});
  }, []);

  const status = registration?.status;
  const canAccess = ['ADMIN_PASSED', 'CLINIC_LETTER_UPLOADED', 'OBSERVATION_SCHEDULED', 'OBSERVATION_DONE', 'ACCEPTED'].includes(status);
  const alreadyUploaded = !!registration?.docClinicCert;

  const handleDownload = async () => {
    setDownloading(true); setError('');
    try {
      const token = localStorage.getItem(PARENT_TOKEN_KEY)!;
      const res = await ppdbParentApi.downloadReferralLetter(token);
      if (!res.ok) { setError('Gagal mendownload surat. Coba lagi.'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `surat-pengantar-klinik-${registration?.registrationNo}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) { setError(e.message || 'Download gagal.'); }
    finally { setDownloading(false); }
  };

  const handleUpload = async () => {
    if (!file) { setError('Pilih file surat keterangan klinik.'); return; }
    setUploading(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem(PARENT_TOKEN_KEY)!;
      const res = await ppdbParentApi.uploadClinicCert(token, file) as any;
      if (res.success) {
        setSuccess('Surat keterangan klinik berhasil diupload! Anda sekarang dapat memilih jadwal observasi.');
        setRegistration(res.data); setFile(null);
      } else setError(res.message);
    } catch (e: any) { setError(e.message); }
    finally { setUploading(false); }
  };

  if (!canAccess) return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Pemeriksaan Klinik IMC</h2>
      <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 16, padding: '2rem', textAlign: 'center', marginTop: '1.5rem' }}>
        <div style={{ fontSize: 36, marginBottom: '0.75rem' }}>🔒</div>
        <div style={{ fontWeight: 700, color: '#92400E' }}>Belum Bisa Diakses</div>
        <div style={{ color: '#78350F', fontSize: 14, marginTop: '0.5rem' }}>
          Halaman ini hanya dapat diakses setelah Anda <strong>lulus seleksi administrasi</strong>.
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Pemeriksaan Klinik IMC</h2>
      <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: 14 }}>
        Selamat! Anda lulus seleksi administrasi. Langkah selanjutnya adalah pemeriksaan kesehatan.
      </p>

      {error && <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: '#DC2626', fontSize: 14 }}>{error}</div>}
      {success && <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: '#065F46', fontSize: 14 }}>{success}</div>}

      {/* Step 1: Download surat */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', border: '1px solid #E5E7EB', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #1B6B44, #2D9164)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 }}>1</div>
          <div>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Download Surat Pengantar Klinik</div>
            <div style={{ fontSize: 14, color: '#6B7280' }}>Download surat pengantar resmi dari SD IT Iqra 2 untuk diserahkan ke klinik IMC saat pemeriksaan.</div>
          </div>
        </div>
        <button id="download-referral-btn" onClick={handleDownload} disabled={downloading} style={{
          width: '100%', padding: '0.875rem', borderRadius: 12, border: 'none',
          background: downloading ? '#9CA3AF' : 'linear-gradient(135deg, #1B6B44, #2D9164)',
          color: '#fff', fontWeight: 700, fontSize: 15, cursor: downloading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
          {downloading ? 'Mengunduh...' : 'Download Surat Pengantar (PDF)'}
        </button>
      </div>

      {/* Info klinik */}
      <div style={{ background: 'linear-gradient(135deg, #0F3D24, #1B6B44)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.25rem', color: '#fff' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: '0.75rem' }}>🏥 Iqra Medical Clinic (IMC)</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>
          📍 Jl. Adam Malik No. 1, Kota Bengkulu<br />
          🕐 Jam Operasional: Senin–Sabtu, 08.00–16.00 WIB<br />
          📞 Hubungi klinik untuk info lebih lanjut
        </div>
        <div style={{ marginTop: '0.75rem', background: 'rgba(201,168,76,0.2)', borderRadius: 8, padding: '0.75rem', fontSize: 13, color: '#F2D98A' }}>
          💡 Bawa surat pengantar yang sudah didownload saat datang ke klinik
        </div>
      </div>

      {/* Step 2: Upload surat keterangan */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', border: `1.5px solid ${alreadyUploaded ? '#6EE7B7' : '#E5E7EB'}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: alreadyUploaded ? '#D1FAE5' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: alreadyUploaded ? '#065F46' : '#6B7280', flexShrink: 0 }}>
            {alreadyUploaded ? '✅' : '2'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Upload Surat Keterangan dari IMC</div>
            <div style={{ fontSize: 14, color: '#6B7280' }}>
              {alreadyUploaded
                ? 'Surat keterangan sudah diupload. Anda dapat memilih jadwal observasi.'
                : 'Setelah pemeriksaan, upload surat keterangan kesehatan yang diberikan oleh IMC.'}
            </div>
          </div>
        </div>

        {alreadyUploaded ? (
          <a href={registration?.docClinicCert} target="_blank" rel="noopener noreferrer" style={{
            display: 'block', textAlign: 'center', padding: '0.75rem', borderRadius: 10,
            background: '#F0F9F4', color: '#1B6B44', textDecoration: 'none', fontSize: 14, fontWeight: 600,
          }}>
            Lihat surat keterangan yang diupload →
          </a>
        ) : (
          <>
            <div onClick={() => fileRef.current?.click()} style={{
              border: `2px dashed ${file ? '#1B6B44' : '#D1D5DB'}`, borderRadius: 12, padding: '1.5rem',
              textAlign: 'center', cursor: 'pointer', background: file ? '#F0F9F4' : '#FAFAFA', marginBottom: '1rem',
            }}>
              {file ? (
                <div style={{ fontSize: 14, color: '#1B6B44', fontWeight: 600 }}>📄 {file.name}</div>
              ) : (
                <>
                  <div style={{ fontSize: 32, marginBottom: '0.5rem' }}>📄</div>
                  <div style={{ fontSize: 14, color: '#6B7280' }}>Klik untuk pilih file surat keterangan</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: '0.25rem' }}>PDF / JPG — Maks. 5 MB</div>
                </>
              )}
            </div>
            <input ref={fileRef} id="clinic-cert-file" type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
            <button id="upload-clinic-cert-btn" onClick={handleUpload} disabled={uploading || !file} style={{
              width: '100%', padding: '0.875rem', borderRadius: 12, border: 'none',
              background: (uploading || !file) ? '#9CA3AF' : 'linear-gradient(135deg, #1B6B44, #2D9164)',
              color: '#fff', fontWeight: 700, fontSize: 15, cursor: (uploading || !file) ? 'not-allowed' : 'pointer',
            }}>
              {uploading ? 'Mengupload...' : 'Upload Surat Keterangan Klinik'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
