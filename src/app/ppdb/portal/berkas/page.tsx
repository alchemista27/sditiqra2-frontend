'use client';
// src/app/ppdb/portal/berkas/page.tsx — Upload 6 berkas + submit formulir
import { useEffect, useState, useRef } from 'react';
import { ppdbParentApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

const PARENT_TOKEN_KEY = 'sditiqra2_parent_token';

const DOCS = [
  { key: 'docPhoto',         label: 'Pasfoto 3×4 Warna',             icon: 'photo_camera', accept: 'image/*',             hint: 'JPG/PNG, maks. 2 MB. Latar belakang warna.' },
  { key: 'docTkCert',        label: 'Surat Keterangan TK/PAUD',       icon: 'article',      accept: 'image/*,.pdf',         hint: 'PDF/JPG, maks. 5 MB.' },
  { key: 'docBirthCert',     label: 'Scan Akte Kelahiran',            icon: 'book',         accept: 'image/*,.pdf',         hint: 'PDF/JPG, maks. 5 MB.' },
  { key: 'docKartuKeluarga', label: 'Scan Kartu Keluarga',            icon: 'family_restroom', accept: 'image/*,.pdf',      hint: 'PDF/JPG, maks. 5 MB.' },
  { key: 'docKtpFather',     label: 'Scan KTP Ayah',                  icon: 'badge',        accept: 'image/*,.pdf',         hint: 'PDF/JPG, maks. 5 MB.' },
  { key: 'docKtpMother',     label: 'Scan KTP Ibu',                   icon: 'badge',        accept: 'image/*,.pdf',         hint: 'PDF/JPG, maks. 5 MB.' },
];

export default function BerkasPage() {
  const router = useRouter();
  const [registration, setRegistration] = useState<any>(null);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  const loadRegistration = async () => {
    const token = localStorage.getItem(PARENT_TOKEN_KEY);
    if (!token) return;
    const res = await ppdbParentApi.getMyRegistration(token);
    setRegistration(res.data);
  };

  useEffect(() => { loadRegistration(); }, []);

  const isLocked = registration && !['PAYMENT_VERIFIED'].includes(registration?.status || '');
  const canUpload = registration?.status === 'PAYMENT_VERIFIED';

  const handleFileChange = async (key: string, file: File) => {
    const maxSize = key === 'docPhoto' ? 2 : 5;
    if (file.size > maxSize * 1024 * 1024) {
      setError(`${DOCS.find(d => d.key === key)?.label}: ukuran maks. ${maxSize} MB`); return;
    }
    setError(''); setSuccess('');
    setFiles(f => ({ ...f, [key]: file }));
    setUploading(key);
    try {
      const token = localStorage.getItem(PARENT_TOKEN_KEY)!;
      const res = await ppdbParentApi.uploadDocuments(token, { [key]: file });
      if (res.success) { setRegistration(res.data); setSuccess(`${DOCS.find(d => d.key === key)?.label} berhasil diupload.`); }
      else setError(res.message || 'Upload gagal.');
    } catch (e: any) { setError(e.message); }
    finally { setUploading(null); }
  };

  const handleSubmit = async () => {
    setSubmitting(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem(PARENT_TOKEN_KEY)!;
      const res = await ppdbParentApi.submitForm(token) as any;
      if (res.success) {
        setSuccess('Formulir berhasil disubmit! Admin akan melakukan seleksi administrasi.');
        await loadRegistration();
        setTimeout(() => router.push('/ppdb/portal/status'), 1500);
      } else setError(res.message);
    } catch (e: any) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  const allUploaded = DOCS.every(d => registration?.[d.key]);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Upload Berkas</h2>
      <p style={{ color: '#6B7280', marginBottom: '1.5rem', fontSize: 14 }}>Upload semua 6 berkas yang diperlukan. Setiap berkas tersimpan otomatis setelah dipilih.</p>

      {!canUpload && !isLocked && (
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: '0.75rem' }}>🔒</div>
          <div style={{ fontWeight: 700, color: '#92400E' }}>Belum Bisa Upload</div>
          <div style={{ color: '#78350F', fontSize: 14, marginTop: '0.5rem' }}>Selesaikan pembayaran dan tunggu verifikasi admin terlebih dahulu.</div>
        </div>
      )}

      {(canUpload || isLocked) && (
        <>
          {success && <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: '#065F46', fontSize: 14 }}>{success}</div>}
          {error && <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: '#DC2626', fontSize: 14 }}>{error}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {DOCS.map(doc => {
              const uploaded = registration?.[doc.key];
              const isLoading = uploading === doc.key;
              return (
                <div key={doc.key} style={{
                  background: '#fff', borderRadius: 14, padding: '1.25rem 1.5rem',
                  border: `1.5px solid ${uploaded ? '#6EE7B7' : '#E5E7EB'}`,
                  display: 'flex', alignItems: 'center', gap: '1.25rem',
                }}>
                  {/* Icon */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: uploaded ? '#D1FAE5' : '#F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {uploaded
                      ? <span style={{ color: '#059669', fontSize: 24 }}>✅</span>
                      : <span className="material-symbols-outlined" style={{ fontSize: 24, color: '#9CA3AF' }}>{doc.icon}</span>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{doc.label}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: '0.1rem' }}>
                      {uploaded ? (
                        <a href={uploaded} target="_blank" rel="noopener noreferrer" style={{ color: '#1B6B44', textDecoration: 'none' }}>
                          Lihat file yang diupload →
                        </a>
                      ) : doc.hint}
                    </div>
                  </div>

                  {/* Aksi */}
                  {canUpload && (
                    <button
                      id={`upload-${doc.key}`}
                      onClick={() => refs.current[doc.key]?.click()}
                      disabled={isLoading}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: 8, border: `1.5px solid ${uploaded ? '#1B6B44' : '#E5E7EB'}`,
                        background: uploaded ? '#F0F9F4' : '#F9FAFB', cursor: isLoading ? 'wait' : 'pointer',
                        fontSize: 13, fontWeight: 600, color: uploaded ? '#1B6B44' : '#374151', flexShrink: 0,
                      }}
                    >
                      {isLoading ? '⏳' : uploaded ? 'Ganti' : 'Upload'}
                    </button>
                  )}
                  <input
                    ref={el => { refs.current[doc.key] = el; }}
                    type="file"
                    accept={doc.accept}
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(doc.key, f); }}
                  />
                </div>
              );
            })}
          </div>

          {/* Progress */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', marginTop: '1.5rem', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: 14 }}>
              <span style={{ fontWeight: 600, color: '#111827' }}>Kelengkapan Berkas</span>
              <span style={{ color: '#1B6B44', fontWeight: 700 }}>{DOCS.filter(d => registration?.[d.key]).length} / {DOCS.length}</span>
            </div>
            <div style={{ background: '#F3F4F6', borderRadius: 100, height: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 100, background: 'linear-gradient(90deg, #1B6B44, #2D9164)', width: `${(DOCS.filter(d => registration?.[d.key]).length / DOCS.length) * 100}%`, transition: 'width 0.4s ease' }} />
            </div>

            {canUpload && allUploaded && (
              <button id="submit-form-btn" onClick={handleSubmit} disabled={submitting} style={{
                marginTop: '1.25rem', width: '100%', padding: '0.875rem', borderRadius: 12, border: 'none',
                background: submitting ? '#9CA3AF' : 'linear-gradient(135deg, #0F3D24, #1B6B44)',
                color: '#fff', fontWeight: 700, fontSize: 15, cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(27,107,68,0.3)',
              }}>
                {submitting ? 'Menyubmit...' : '✅ Submit Formulir Pendaftaran'}
              </button>
            )}
            {canUpload && !allUploaded && (
              <div style={{ marginTop: '0.75rem', fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
                Upload semua {DOCS.length} berkas untuk mengaktifkan tombol submit
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
