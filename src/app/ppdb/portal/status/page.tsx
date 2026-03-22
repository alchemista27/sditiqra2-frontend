'use client';
// src/app/ppdb/portal/status/page.tsx — Halaman status & hasil akhir pendaftaran
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ppdbParentApi } from '@/lib/api';

const PARENT_TOKEN_KEY = 'sditiqra2_parent_token';

const STATUS_CONFIG: Record<string, { icon: string; title: string; desc: string; color: string; bg: string; border: string }> = {
  PENDING_PAYMENT:        { icon: '⏳', title: 'Menunggu Pembayaran', desc: 'Silakan lakukan transfer dan upload buktinya.', color: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
  PAYMENT_UPLOADED:       { icon: '🔍', title: 'Verifikasi Pembayaran', desc: 'Bukti transfer sedang diverifikasi oleh admin (maks. 1×24 jam kerja).', color: '#5B21B6', bg: '#EDE9FE', border: '#C4B5FD' },
  PAYMENT_VERIFIED:       { icon: '✅', title: 'Pembayaran Terverifikasi', desc: 'Silakan isi formulir biodata dan upload berkas pendaftaran.', color: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
  FORM_SUBMITTED:         { icon: '📥', title: 'Formulir Disubmit', desc: 'Formulir sedang diproses oleh admin.', color: '#5B21B6', bg: '#EDE9FE', border: '#C4B5FD' },
  ADMIN_REVIEW:           { icon: '🔎', title: 'Sedang Diseleksi Admin', desc: 'Dokumen Anda sedang dalam proses penelaahan oleh panitia.', color: '#5B21B6', bg: '#EDE9FE', border: '#C4B5FD' },
  ADMIN_PASSED:           { icon: '🎉', title: 'Lulus Seleksi Administrasi', desc: 'Selamat! Anda lulus seleksi administrasi. Silakan download surat pengantar klinik.', color: '#065F46', bg: '#D1FAE5', border: '#6EE7B7' },
  CLINIC_LETTER_UPLOADED: { icon: '🏥', title: 'Surat Klinik Diupload', desc: 'Silakan pilih jadwal observasi.', color: '#065F46', bg: '#D1FAE5', border: '#6EE7B7' },
  OBSERVATION_SCHEDULED:  { icon: '📅', title: 'Jadwal Observasi Sudah Dipilih', desc: 'Hadir tepat waktu sesuai jadwal yang telah dipilih.', color: '#1D4ED8', bg: '#DBEAFE', border: '#93C5FD' },
  OBSERVATION_DONE:       { icon: '🔄', title: 'Observasi Selesai', desc: 'Hasil observasi sedang diproses oleh panitia.', color: '#5B21B6', bg: '#EDE9FE', border: '#C4B5FD' },
  ACCEPTED:               { icon: '🏆', title: 'DITERIMA!', desc: 'Selamat! Calon siswa diterima di SD IT Iqra 2 Bengkulu.', color: '#065F46', bg: '#D1FAE5', border: '#34D399' },
  REJECTED:               { icon: '😢', title: 'Tidak Diterima', desc: 'Mohon maaf, pendaftaran tidak dapat dilanjutkan.', color: '#B91C1C', bg: '#FEE2E2', border: '#FECACA' },
};

const PROGRESS_STEPS = [
  { key: 'PAYMENT', label: 'Pembayaran', statuses: ['PENDING_PAYMENT', 'PAYMENT_UPLOADED', 'PAYMENT_VERIFIED'] },
  { key: 'FORM', label: 'Formulir', statuses: ['FORM_SUBMITTED', 'ADMIN_REVIEW'] },
  { key: 'SELECTION', label: 'Seleksi Admin', statuses: ['ADMIN_PASSED'] },
  { key: 'CLINIC', label: 'Klinik', statuses: ['CLINIC_LETTER_UPLOADED'] },
  { key: 'OBSERVATION', label: 'Observasi', statuses: ['OBSERVATION_SCHEDULED', 'OBSERVATION_DONE'] },
  { key: 'RESULT', label: 'Hasil', statuses: ['ACCEPTED', 'REJECTED'] },
];

function getCurrentStepIndex(status: string): number {
  for (let i = PROGRESS_STEPS.length - 1; i >= 0; i--) {
    if (PROGRESS_STEPS[i].statuses.includes(status)) return i;
    // Cek apakah status sudah melewati step ini
    const allPrevStatuses = PROGRESS_STEPS.slice(0, i + 1).flatMap(s => s.statuses);
    const allStatuses = ['PENDING_PAYMENT', 'PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'FORM_SUBMITTED', 'ADMIN_REVIEW', 'ADMIN_PASSED', 'CLINIC_LETTER_UPLOADED', 'OBSERVATION_SCHEDULED', 'OBSERVATION_DONE', 'ACCEPTED', 'REJECTED'];
    const statusIdx = allStatuses.indexOf(status);
    const stepLastStatusIdx = allStatuses.indexOf(PROGRESS_STEPS[i].statuses[PROGRESS_STEPS[i].statuses.length - 1]);
    if (statusIdx > stepLastStatusIdx) return i + 1;
  }
  return 0;
}

export default function StatusPage() {
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(PARENT_TOKEN_KEY);
    if (!token) return;
    ppdbParentApi.getMyResult(token)
      .then(r => setRegistration(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#1B6B44', fontWeight: 600 }}>Memuat status...</div>;

  if (!registration) return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: 48, marginBottom: '1rem' }}>📋</div>
      <div style={{ fontWeight: 700 }}>Belum ada pendaftaran</div>
      <Link href="/ppdb/portal/pembayaran" style={{ color: '#1B6B44', fontWeight: 600 }}>Mulai daftar →</Link>
    </div>
  );

  const status = registration.status;
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['PENDING_PAYMENT'];
  const currentStepIdx = getCurrentStepIndex(status);
  const isAccepted = status === 'ACCEPTED';
  const isRejected = status === 'REJECTED';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Status Pendaftaran</h2>
      <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: 14 }}>
        No. Pendaftaran: <strong>{registration.registrationNo}</strong>
      </p>

      {/* Status Card */}
      <div style={{
        background: config.bg, border: `2px solid ${config.border}`,
        borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: isAccepted ? 64 : 48, marginBottom: '1rem' }}>{config.icon}</div>
        <div style={{ fontWeight: 800, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', color: config.color, marginBottom: '0.5rem' }}>
          {config.title}
        </div>
        <div style={{ color: config.color, opacity: 0.8, fontSize: 14 }}>{config.desc}</div>

        {/* Info kelas jika diterima */}
        {isAccepted && registration.classroom && (
          <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.7)', borderRadius: 14, padding: '1.25rem' }}>
            <div style={{ fontSize: 12, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Ditempatkan di</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0F3D24' }}>{registration.classroom.name}</div>
            {registration.classroom.homeroomTeacher && (
              <div style={{ fontSize: 14, color: '#374151', marginTop: '0.25rem' }}>Wali Kelas: {registration.classroom.homeroomTeacher}</div>
            )}
          </div>
        )}

        {/* Alasan ditolak */}
        {isRejected && registration.rejectReason && (
          <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.6)', borderRadius: 10, padding: '1rem', fontSize: 14, color: '#B91C1C', textAlign: 'left' }}>
            <strong>Keterangan:</strong> {registration.rejectReason}
          </div>
        )}
      </div>

      {/* Progress timeline */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', border: '1px solid #E5E7EB', marginBottom: '1.5rem' }}>
        <div style={{ fontWeight: 700, color: '#111827', marginBottom: '1.5rem', fontSize: 15 }}>Progres Pendaftaran</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
          {/* Garis penghubung */}
          <div style={{ position: 'absolute', top: 20, left: '8%', right: '8%', height: 2, background: '#E5E7EB', zIndex: 0 }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg, #1B6B44, #2D9164)', width: `${Math.min((currentStepIdx / (PROGRESS_STEPS.length - 1)) * 100, 100)}%`, transition: 'width 0.5s ease' }} />
          </div>
          {PROGRESS_STEPS.map((step, i) => {
            const isDone = i < currentStepIdx || (isAccepted && step.key === 'RESULT') || (isRejected && step.key === 'RESULT');
            const isCurrent = i === currentStepIdx;
            return (
              <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1, flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isDone ? '#1B6B44' : isCurrent ? '#E8F5EE' : '#F3F4F6',
                  border: isCurrent ? '2px solid #1B6B44' : 'none',
                  fontWeight: 700, fontSize: 14,
                  color: isDone ? '#fff' : isCurrent ? '#1B6B44' : '#9CA3AF',
                  boxShadow: isCurrent ? '0 0 0 4px rgba(27,107,68,0.15)' : 'none',
                }}>
                  {isDone ? '✓' : i + 1}
                </div>
                <div style={{ fontSize: 11, fontWeight: isCurrent || isDone ? 600 : 400, color: isCurrent || isDone ? '#1B6B44' : '#9CA3AF', textAlign: 'center', lineHeight: 1.3 }}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail info */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #E5E7EB' }}>
        <div style={{ fontWeight: 700, color: '#111827', marginBottom: '1rem', fontSize: 15 }}>Informasi Pendaftaran</div>
        {[
          { label: 'Nama Calon Siswa', val: registration.studentName || '-' },
          { label: 'Tahun Ajaran', val: registration.academicYear?.name || '-' },
          { label: 'Tanggal Daftar', val: new Date(registration.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) },
          ...(registration.observationSlot ? [{
            label: 'Jadwal Observasi',
            val: `${new Date(registration.observationSlot.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}, ${registration.observationSlot.startTime}–${registration.observationSlot.endTime}`,
          }] : []),
          ...(registration.classroom ? [{ label: 'Kelas', val: registration.classroom.name }] : []),
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #F3F4F6', fontSize: 14 }}>
            <span style={{ color: '#6B7280' }}>{item.label}</span>
            <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right', maxWidth: '60%' }}>{item.val}</span>
          </div>
        ))}
      </div>

      {/* CTA sesuai status */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {status === 'PAYMENT_VERIFIED' && (
          <Link href="/ppdb/portal/formulir" style={{ flex: 1, padding: '0.875rem', background: '#1B6B44', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
            Isi Formulir →
          </Link>
        )}
        {status === 'ADMIN_PASSED' && (
          <Link href="/ppdb/portal/klinik" style={{ flex: 1, padding: '0.875rem', background: '#1B6B44', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
            Download Surat Klinik →
          </Link>
        )}
        {status === 'CLINIC_LETTER_UPLOADED' && (
          <Link href="/ppdb/portal/observasi" style={{ flex: 1, padding: '0.875rem', background: '#1B6B44', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 14, textAlign: 'center' }}>
            Pilih Jadwal Observasi →
          </Link>
        )}
      </div>
    </div>
  );
}
