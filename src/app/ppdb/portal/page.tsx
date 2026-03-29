'use client';
// src/app/ppdb/portal/page.tsx - Redirect ke halaman yang tepat sesuai status
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ppdbParentApi } from '@/lib/api';

const PARENT_TOKEN_KEY = 'sditiqra2_parent_token';

const STATUS_REDIRECT: Record<string, string> = {
  PENDING_PAYMENT:        '/ppdb/portal/pembayaran',
  PAYMENT_UPLOADED:       '/ppdb/portal/pembayaran',
  PAYMENT_VERIFIED:       '/ppdb/portal/formulir',
  FORM_SUBMITTED:         '/ppdb/portal/status',
  ADMIN_REVIEW:           '/ppdb/portal/status',
  ADMIN_PASSED:           '/ppdb/portal/klinik',
  CLINIC_LETTER_UPLOADED: '/ppdb/portal/observasi',
  OBSERVATION_SCHEDULED:  '/ppdb/portal/observasi',
  OBSERVATION_DONE:       '/ppdb/portal/status',
  ACCEPTED:               '/ppdb/portal/status',
  REJECTED:               '/ppdb/portal/status',
};

export default function PortalIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem(PARENT_TOKEN_KEY);
    if (!token) { router.replace('/ppdb/masuk'); return; }
    ppdbParentApi.getMyRegistration(token)
      .then(res => {
        const status = res.data?.status || 'PENDING_PAYMENT';
        router.replace(STATUS_REDIRECT[status] || '/ppdb/portal/pembayaran');
      })
      .catch(() => router.replace('/ppdb/portal/pembayaran'));
  }, [router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ textAlign: 'center', color: '#1B6B44' }}>
        <div style={{ fontSize: 36, marginBottom: '0.5rem' }}><span className="material-symbols-outlined">hourglass_empty</span></div>
        <div style={{ fontWeight: 600 }}>Mengarahkan ke halaman Anda...</div>
      </div>
    </div>
  );
}
