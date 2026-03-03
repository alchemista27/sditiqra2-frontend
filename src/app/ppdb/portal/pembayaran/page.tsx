'use client';
// src/app/ppdb/portal/pembayaran/page.tsx
import { useEffect, useState, useRef } from 'react';
import { ppdbParentApi } from '@/lib/api';

const PARENT_TOKEN_KEY = 'sditiqra2_parent_token';

const BANK_INFO = {
  bank: 'BRI',
  accountNo: '1234-5678-9012-3456',
  accountName: 'Yayasan Iqra Kota Bengkulu',
  amount: 'Rp 300.000',
};

export default function PembayaranPage() {
  const [registration, setRegistration] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem(PARENT_TOKEN_KEY);
    if (!token) return;
    ppdbParentApi.getMyRegistration(token).then(r => setRegistration(r.data)).catch(() => {});
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError('Ukuran file maksimal 5 MB.'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  };

  const handleSubmit = async () => {
    if (!file) { setError('Pilih file bukti transfer terlebih dahulu.'); return; }
    setLoading(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem(PARENT_TOKEN_KEY)!;
      const res = await ppdbParentApi.uploadPayment(token, file, note);
      if (res.success) {
        setSuccess('Bukti transfer berhasil diupload! Admin akan memverifikasi dalam 1×24 jam.');
        setRegistration(res.data);
        setFile(null); setPreview(null); setNote('');
      } else {
        setError(res.message || 'Upload gagal.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const status = registration?.status;
  const isVerified = status === 'PAYMENT_VERIFIED' || ['FORM_SUBMITTED', 'ADMIN_REVIEW', 'ADMIN_PASSED', 'CLINIC_LETTER_UPLOADED', 'OBSERVATION_SCHEDULED', 'OBSERVATION_DONE', 'ACCEPTED'].includes(status);
  const isUploaded = status === 'PAYMENT_UPLOADED';
  const isRejected = status === 'PENDING_PAYMENT' && registration?.paymentNote?.startsWith('[DITOLAK]');

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Pembayaran Biaya Pendaftaran</h2>
      <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: 14 }}>
        Transfer biaya pendaftaran dan upload bukti transfernya di sini
      </p>

      {/* Status badge */}
      {isVerified && (
        <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <div style={{ fontWeight: 700, color: '#065F46' }}>Pembayaran Terverifikasi</div>
            <div style={{ fontSize: 13, color: '#047857' }}>Anda sekarang dapat mengisi formulir pendaftaran di menu "Formulir".</div>
          </div>
        </div>
      )}

      {isUploaded && (
        <div style={{ background: '#EDE9FE', border: '1px solid #C4B5FD', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: 24 }}>⏳</span>
          <div>
            <div style={{ fontWeight: 700, color: '#5B21B6' }}>Menunggu Verifikasi Admin</div>
            <div style={{ fontSize: 13, color: '#6D28D9' }}>Bukti transfer sudah diterima. Proses verifikasi 1×24 jam kerja.</div>
          </div>
        </div>
      )}

      {isRejected && (
        <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, color: '#B91C1C', marginBottom: '0.25rem' }}>❌ Bukti Transfer Ditolak</div>
          <div style={{ fontSize: 13, color: '#DC2626' }}>
            {registration?.paymentNote?.replace('[DITOLAK] ', '')}
          </div>
          <div style={{ fontSize: 13, color: '#DC2626', marginTop: '0.25rem' }}>Silakan upload ulang bukti transfer yang benar.</div>
        </div>
      )}

      {/* Info rekening */}
      <div style={{ background: 'linear-gradient(135deg, #0F3D24, #1B6B44)', borderRadius: 16, padding: '1.75rem', marginBottom: '1.5rem', color: '#fff' }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Transfer ke Rekening Berikut</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {[
            { label: 'Bank', val: BANK_INFO.bank },
            { label: 'Nomor Rekening', val: BANK_INFO.accountNo },
            { label: 'Atas Nama', val: BANK_INFO.accountName },
            { label: 'Nominal', val: BANK_INFO.amount },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{item.label}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: '0.2rem' }}>{item.val}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1rem', background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 8, padding: '0.75rem', fontSize: 13, color: '#F2D98A' }}>
          💡 Pastikan nominal transfer <strong>tepat Rp 300.000</strong> agar mudah diverifikasi
        </div>
      </div>

      {/* Upload area — hanya tampil jika belum verified */}
      {!isVerified && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', border: '1px solid #E5E7EB' }}>
          <div style={{ fontWeight: 700, color: '#111827', marginBottom: '1.25rem' }}>Upload Bukti Transfer</div>

          {success && (
            <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '0.875rem', marginBottom: '1.25rem', color: '#065F46', fontSize: 14 }}>
              {success}
            </div>
          )}
          {error && (
            <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '0.875rem', marginBottom: '1.25rem', color: '#DC2626', fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Drop area */}
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${preview ? '#1B6B44' : '#D1D5DB'}`,
              borderRadius: 12, padding: '2rem', textAlign: 'center', cursor: 'pointer',
              background: preview ? '#F0F9F4' : '#FAFAFA', transition: 'all 0.2s',
              marginBottom: '1.25rem',
            }}
          >
            {preview ? (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview bukti transfer" style={{ maxHeight: 240, maxWidth: '100%', borderRadius: 8, objectFit: 'contain' }} />
                <div style={{ marginTop: '0.75rem', fontSize: 13, color: '#1B6B44' }}>
                  {file?.name} · {((file?.size || 0) / 1024).toFixed(0)} KB
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: '0.25rem' }}>Klik untuk ganti gambar</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 40, marginBottom: '0.75rem' }}>📷</div>
                <div style={{ fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>Klik atau seret foto bukti transfer ke sini</div>
                <div style={{ fontSize: 13, color: '#9CA3AF' }}>JPG, PNG — Maks. 5 MB</div>
              </>
            )}
          </div>
          <input ref={fileRef} id="bukti-transfer-file" type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

          {/* Catatan opsional */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
              Catatan (opsional)
            </label>
            <input
              id="bukti-transfer-note"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Contoh: transfer BRI 3 Maret 2026"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#1B6B44'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
          </div>

          <button
            id="bukti-transfer-submit"
            onClick={handleSubmit}
            disabled={loading || !file || isUploaded}
            style={{
              width: '100%', padding: '0.875rem', borderRadius: 12,
              background: (loading || !file || isUploaded) ? '#9CA3AF' : 'linear-gradient(135deg, #1B6B44, #2D9164)',
              color: '#fff', border: 'none',
              cursor: (loading || !file || isUploaded) ? 'not-allowed' : 'pointer',
              fontWeight: 700, fontSize: 15,
            }}
          >
            {loading ? 'Mengupload...' : isUploaded ? 'Menunggu Verifikasi Admin...' : 'Upload Bukti Transfer'}
          </button>
        </div>
      )}
    </div>
  );
}
