'use client';
// src/app/ppdb/portal/layout.tsx
// Layout portal orang tua yang sudah login — menampilkan stepper dan sidebar status
import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ppdbParentApi } from '@/lib/api';

export const PARENT_TOKEN_KEY = 'sditiqra2_parent_token';

// Status → step aktif (index 0-based)
const STATUS_TO_STEP: Record<string, number> = {
  PENDING_PAYMENT: 0,
  PAYMENT_UPLOADED: 0,
  PAYMENT_VERIFIED: 1,
  FORM_SUBMITTED: 2,
  ADMIN_REVIEW: 2,
  ADMIN_PASSED: 3,
  CLINIC_LETTER_UPLOADED: 4,
  OBSERVATION_SCHEDULED: 5,
  OBSERVATION_DONE: 5,
  ACCEPTED: 6,
  REJECTED: 6,
};

const STEPS = [
  { label: 'Pembayaran', icon: 'payments', href: '/ppdb/portal/pembayaran' },
  { label: 'Formulir', icon: 'assignment', href: '/ppdb/portal/formulir' },
  { label: 'Upload Berkas', icon: 'upload_file', href: '/ppdb/portal/berkas' },
  { label: 'Surat Klinik', icon: 'medical_services', href: '/ppdb/portal/klinik' },
  { label: 'Observasi', icon: 'event_available', href: '/ppdb/portal/observasi' },
  { label: 'Hasil', icon: 'emoji_events', href: '/ppdb/portal/status' },
];

// Label status yang tampil ke orang tua
const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_PAYMENT:        { label: 'Menunggu Pembayaran', color: '#B45309', bg: '#FEF3C7' },
  PAYMENT_UPLOADED:       { label: 'Verifikasi Pembayaran', color: '#7C3AED', bg: '#EDE9FE' },
  PAYMENT_VERIFIED:       { label: 'Formulir Dapat Diisi', color: '#1D4ED8', bg: '#DBEAFE' },
  FORM_SUBMITTED:         { label: 'Menunggu Seleksi Admin', color: '#7C3AED', bg: '#EDE9FE' },
  ADMIN_REVIEW:           { label: 'Sedang Direview Admin', color: '#7C3AED', bg: '#EDE9FE' },
  ADMIN_PASSED:           { label: 'Lulus Seleksi Administrasi', color: '#065F46', bg: '#D1FAE5' },
  CLINIC_LETTER_UPLOADED: { label: 'Surat Klinik Diupload', color: '#065F46', bg: '#D1FAE5' },
  OBSERVATION_SCHEDULED:  { label: 'Jadwal Observasi Dipilih', color: '#1D4ED8', bg: '#DBEAFE' },
  OBSERVATION_DONE:       { label: 'Observasi Selesai', color: '#7C3AED', bg: '#EDE9FE' },
  ACCEPTED:               { label: '🎉 Diterima!', color: '#065F46', bg: '#D1FAE5' },
  REJECTED:               { label: 'Tidak Diterima', color: '#B91C1C', bg: '#FEE2E2' },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [parent, setParent] = useState<any>(null);
  const [registration, setRegistration] = useState<any>(null);
  const [loaded, setLoaded] = useState(false);

  const loadData = useCallback(async () => {
    const token = localStorage.getItem(PARENT_TOKEN_KEY);
    if (!token) { router.replace('/ppdb/masuk'); return; }

    try {
      const [meRes, regRes] = await Promise.all([
        ppdbParentApi.me(token),
        ppdbParentApi.getMyRegistration(token),
      ]);
      if (meRes.data?.role !== 'PARENT') { router.replace('/ppdb/masuk'); return; }
      setParent(meRes.data);
      setRegistration(regRes.data);

      // Jika belum ada registrasi aktif, inisiasi satu
      if (!regRes.data) {
        await ppdbParentApi.start(token);
        const refreshed = await ppdbParentApi.getMyRegistration(token);
        setRegistration(refreshed.data);
      }
    } catch {
      router.replace('/ppdb/masuk');
    } finally {
      setLoaded(true);
    }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = () => {
    localStorage.removeItem(PARENT_TOKEN_KEY);
    router.push('/ppdb/masuk');
  };

  if (!loaded) return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#1B6B44' }}>
        <div style={{ fontSize: 32, marginBottom: '0.5rem' }}>⏳</div>
        <div style={{ fontWeight: 600 }}>Memuat portal...</div>
      </div>
    </div>
  );

  const currentStatus = registration?.status || 'PENDING_PAYMENT';
  const currentStep = STATUS_TO_STEP[currentStatus] ?? 0;
  const statusInfo = STATUS_LABELS[currentStatus] ?? { label: currentStatus, color: '#374151', bg: '#F3F4F6' };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'grid', gridTemplateColumns: '280px 1fr', background: '#F0F9F4' }} className="portal-grid">
      {/* Sidebar */}
      <aside style={{
        background: '#fff', borderRight: '1px solid #E5E7EB',
        padding: '1.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0',
        position: 'sticky', top: 64, height: 'calc(100vh - 64px)', overflowY: 'auto',
      }}>
        {/* Info orang tua */}
        <div style={{ background: '#F0F9F4', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{parent?.name}</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: '0.2rem' }}>{parent?.email}</div>
          {registration && (
            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', padding: '0.2rem 0.6rem',
                borderRadius: 100, fontSize: 11, fontWeight: 600,
                background: statusInfo.bg, color: statusInfo.color,
              }}>
                {statusInfo.label}
              </div>
            </div>
          )}
          {registration && (
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: '0.4rem' }}>
              No. {registration.registrationNo}
            </div>
          )}
        </div>

        {/* Stepper */}
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
          Tahapan Pendaftaran
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
          {STEPS.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;
            const isLocked = i > currentStep && currentStatus !== 'ACCEPTED';
            const isActive = pathname === step.href || pathname.startsWith(step.href + '/');

            return (
              <div key={step.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
                {/* Garis vertikal */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 19, top: 40, width: 2, height: 'calc(100% - 8px)',
                    background: isCompleted ? '#1B6B44' : '#E5E7EB', zIndex: 0,
                  }} />
                )}
                <Link
                  href={isLocked ? '#' : step.href}
                  onClick={e => isLocked && e.preventDefault()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.65rem 0.75rem', borderRadius: 10, width: '100%',
                    background: isActive ? '#E8F5EE' : 'transparent',
                    textDecoration: 'none', position: 'relative', zIndex: 1,
                    opacity: isLocked ? 0.45 : 1,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Icon circle */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isCompleted ? '#1B6B44' : isCurrent ? '#E8F5EE' : '#F3F4F6',
                    border: isCurrent ? '2px solid #1B6B44' : 'none',
                    fontSize: 14, color: isCompleted ? '#fff' : '#6B7280',
                  }}>
                    {isCompleted
                      ? <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff' }}>check</span>
                      : <span className="material-symbols-outlined" style={{ fontSize: 16, color: isCurrent ? '#1B6B44' : '#9CA3AF' }}>{step.icon}</span>
                    }
                  </div>
                  <div style={{ fontSize: 13, fontWeight: isCurrent || isCompleted ? 600 : 400, color: isCompleted ? '#1B6B44' : isCurrent ? '#111827' : '#6B7280' }}>
                    {step.label}
                  </div>
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <button onClick={handleLogout} style={{
          marginTop: '1.5rem', width: '100%', padding: '0.6rem', background: 'none',
          border: '1px solid #E5E7EB', borderRadius: 10, cursor: 'pointer',
          fontSize: 13, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
          Keluar
        </button>
      </aside>

      {/* Main content */}
      <main style={{ padding: '2rem', minWidth: 0 }}>
        {/* Pass registration data ke children via re-render trigger */}
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .portal-grid { grid-template-columns: 1fr !important; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
      `}</style>
    </div>
  );
}
