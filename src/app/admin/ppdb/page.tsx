'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { academicYearsApi, ppdbAdminApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Stat { label: string; value: number; icon: string; color: string; bg: string; href?: string }

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  PENDING_PAYMENT:        { label: 'Menunggu Pembayaran', color: '#92400E', bg: '#FEF3C7' },
  PAYMENT_UPLOADED:       { label: 'Bukti Transfer Diupload', color: '#5B21B6', bg: '#EDE9FE' },
  PAYMENT_VERIFIED:       { label: 'Pembayaran Terverifikasi', color: '#1D4ED8', bg: '#DBEAFE' },
  FORM_SUBMITTED:         { label: 'Formulir Disubmit', color: '#7C3AED', bg: '#EDE9FE' },
  ADMIN_REVIEW:           { label: 'Sedang Direview', color: '#7C3AED', bg: '#EDE9FE' },
  ADMIN_PASSED:           { label: 'Lulus Administrasi', color: '#065F46', bg: '#D1FAE5' },
  CLINIC_LETTER_UPLOADED: { label: 'Surat Klinik Diupload', color: '#065F46', bg: '#D1FAE5' },
  OBSERVATION_SCHEDULED:  { label: 'Jadwal Observasi Dipilih', color: '#1D4ED8', bg: '#DBEAFE' },
  OBSERVATION_DONE:       { label: 'Observasi Selesai', color: '#7C3AED', bg: '#EDE9FE' },
  ACCEPTED:               { label: 'Diterima', color: '#065F46', bg: '#D1FAE5' },
  REJECTED:               { label: 'Ditolak', color: '#B91C1C', bg: '#FEE2E2' },
};

const TABS = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'payments', label: 'Pembayaran', icon: 'payments' },
  { key: 'registrations', label: 'Seleksi Admin', icon: 'assignment_turned_in' },
  { key: 'academic_years', label: 'Tahun Ajaran', icon: 'date_range' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminPPDBPage() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

  // Detail modal
  const [detailReg, setDetailReg] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // AY form
  const [ayForm, setAyForm] = useState({ name: '', registrationStart: '', registrationEnd: '', quota: 0, registrationFee: 300000 });
  const [aySubmitting, setAySubmitting] = useState(false);
  const [ayMsg, setAyMsg] = useState('');

  const token = getToken() || '';

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, regsRes] = await Promise.all([
        ppdbAdminApi.getStats(token),
        ppdbAdminApi.getAll(token),
      ]);
      setStats(statsRes.data);
      setRegistrations(statsRes.data?.recent || regsRes.data?.data || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [token]);

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      const res = await ppdbAdminApi.getAll(token, Object.keys(params).length ? params : undefined);
      setRegistrations(res.data?.data || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [token, filterStatus]);

  const loadAcademicYears = useCallback(async () => {
    setLoading(true);
    try {
      const res = await academicYearsApi.getAll(token);
      setAcademicYears(res.data || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    if (tab === 'dashboard') loadDashboard();
    else if (tab === 'payments') loadRegistrations();
    else if (tab === 'registrations') loadRegistrations();
    else if (tab === 'academic_years') loadAcademicYears();
  }, [tab, loadDashboard, loadRegistrations, loadAcademicYears]);

  // ── Actions ──
  const openDetail = async (id: string) => {
    try {
      const res = await ppdbAdminApi.getDetail(token, id);
      setDetailReg(res.data);
      setActionMsg('');
    } catch { setError('Gagal memuat detail.'); }
  };

  const verifyPayment = async (id: string, approve: boolean) => {
    setActionLoading(true);
    try {
      const note = approve ? '' : (prompt('Alasan penolakan pembayaran:') || 'Bukti tidak valid');
      await ppdbAdminApi.verifyPayment(token, id, { approved: approve, note });
      setActionMsg(approve ? '✅ Pembayaran diverifikasi.' : '❌ Pembayaran ditolak.');
      await openDetail(id);
      loadRegistrations();
    } catch (e: any) { setActionMsg('Error: ' + e.message); }
    finally { setActionLoading(false); }
  };

  const reviewAdmin = async (id: string, passed: boolean) => {
    setActionLoading(true);
    try {
      const note = passed ? (prompt('Catatan (opsional):') || '') : (prompt('Alasan penolakan:') || 'Tidak memenuhi syarat administrasi');
      await ppdbAdminApi.reviewRegistration(token, id, { result: passed ? 'ADMIN_PASSED' : 'REJECTED', note });
      setActionMsg(passed ? '✅ Lulus seleksi administrasi.' : '❌ Pendaftar ditolak.');
      await openDetail(id);
      loadRegistrations();
    } catch (e: any) { setActionMsg('Error: ' + e.message); }
    finally { setActionLoading(false); }
  };

  const createAY = async (e: React.FormEvent) => {
    e.preventDefault();
    setAySubmitting(true);
    try {
      await academicYearsApi.create(token, ayForm);
      setAyMsg('✅ Tahun ajaran berhasil dibuat.');
      setAyForm({ name: '', registrationStart: '', registrationEnd: '', quota: 0, registrationFee: 300000 });
      loadAcademicYears();
    } catch (e: any) { setAyMsg('Error: ' + e.message); }
    finally { setAySubmitting(false); }
  };

  const setActiveAY = async (id: string) => {
    if (!confirm('Jadikan tahun ajaran ini aktif?')) return;
    try { await academicYearsApi.setActive(token, id); loadAcademicYears(); }
    catch (e: any) { setError(e.message); }
  };

  // ── Filtered list ──
  const filtered = registrations.filter(r => {
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchSearch = !filterSearch || r.studentName?.toLowerCase().includes(filterSearch.toLowerCase()) || r.registrationNo?.includes(filterSearch);
    return matchStatus && matchSearch;
  });

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>Manajemen PPDB</h1>
        <p style={{ color: '#6B7280', fontSize: 14 }}>Penerimaan Peserta Didik Baru — Panel Admin</p>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: '#DC2626', fontSize: 14 }}>
          ⚠️ {error} <button onClick={() => setError('')} style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontWeight: 700 }}>×</button>
        </div>
      )}

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '2px solid #E5E7EB', marginBottom: '1.5rem' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setError(''); }} style={{
            padding: '0.65rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
            borderBottom: tab === t.key ? '2px solid #1B6B44' : '2px solid transparent',
            marginBottom: -2, color: tab === t.key ? '#1B6B44' : '#6B7280',
            fontWeight: tab === t.key ? 700 : 400, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: '0.4rem',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>Memuat data...</div>}

      {/* ── DASHBOARD ── */}
      {!loading && tab === 'dashboard' && (
        <div>
          {/* Stats Cards */}
          {stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Pendaftar', value: stats.total ?? 0, icon: 'groups', color: '#1D4ED8', bg: '#DBEAFE' },
                { label: 'Menunggu Verifikasi Bayar', value: stats.pendingPayment ?? 0, icon: 'pending', color: '#92400E', bg: '#FEF3C7' },
                { label: 'Formulir Disubmit', value: stats.formSubmitted ?? 0, icon: 'assignment', color: '#7C3AED', bg: '#EDE9FE' },
                { label: 'Lulus Administrasi', value: stats.adminPassed ?? 0, icon: 'verified', color: '#065F46', bg: '#D1FAE5' },
                { label: 'Diterima', value: stats.accepted ?? 0, icon: 'emoji_events', color: '#065F46', bg: '#D1FAE5' },
                { label: 'Ditolak', value: stats.rejected ?? 0, icon: 'cancel', color: '#B91C1C', bg: '#FEE2E2' },
              ].map((s: Stat) => (
                <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '1.25rem', border: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#111827' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: '0.2rem' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Verifikasi Pembayaran', desc: 'Review bukti transfer', icon: 'payments', tab: 'payments', urgent: (stats?.pendingPayment ?? 0) > 0 },
              { label: 'Seleksi Administrasi', desc: 'Review formulir & berkas', icon: 'assignment_turned_in', tab: 'registrations', urgent: (stats?.formSubmitted ?? 0) > 0 },
              { label: 'Jadwal Observasi', desc: 'Kelola slot observasi', icon: 'event', tab: 'registrations', urgent: false },
            ].map(action => (
              <button key={action.label} onClick={() => setTab(action.tab)} style={{
                background: action.urgent ? 'linear-gradient(135deg, #1B6B44, #2D9164)' : '#fff',
                borderRadius: 14, padding: '1.25rem', border: `1px solid ${action.urgent ? 'transparent' : '#E5E7EB'}`,
                cursor: 'pointer', textAlign: 'left',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: action.urgent ? '#F2D98A' : '#1B6B44', display: 'block', marginBottom: '0.5rem' }}>{action.icon}</span>
                <div style={{ fontWeight: 700, fontSize: 14, color: action.urgent ? '#fff' : '#111827' }}>{action.label}</div>
                <div style={{ fontSize: 12, color: action.urgent ? 'rgba(255,255,255,0.7)' : '#6B7280', marginTop: '0.2rem' }}>{action.desc}</div>
              </button>
            ))}
          </div>

          {/* Recent registrations */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F3F4F6', fontWeight: 700, color: '#111827', fontSize: 15 }}>
              Pendaftar Terbaru
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ background: '#F9FAFB' }}>
                {['No. Reg', 'Nama Siswa', 'Orang Tua', 'Status', 'Tgl Daftar', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(stats?.recentRegistrations || []).slice(0, 8).map((r: any) => {
                  const s = STATUS_LABELS[r.status] ?? { label: r.status, color: '#374151', bg: '#F3F4F6' };
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontSize: 12, color: '#1B6B44', fontWeight: 700 }}>{r.registrationNo}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#111827' }}>{r.studentName || <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontWeight: 400 }}>Belum diisi</span>}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#374151', fontSize: 13 }}>{r.parent?.name || '-'}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#6B7280', fontSize: 12 }}>{fmtDate(r.createdAt)}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button onClick={() => openDetail(r.id)} style={{ padding: '0.35rem 0.75rem', background: '#F0F9F4', border: '1px solid #D1E9DA', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#1B6B44', fontWeight: 600 }}>
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {(!stats?.recentRegistrations || stats.recentRegistrations.length === 0) && (
                  <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Belum ada pendaftar.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PAYMENTS / REGISTRATIONS TAB ── */}
      {!loading && (tab === 'payments' || tab === 'registrations') && (
        <div>
          {/* Filter bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <input
              placeholder="Cari nama / no. reg..."
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              style={{ padding: '0.6rem 1rem', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', flex: 1, minWidth: 200 }}
            />
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); }}
              style={{ padding: '0.6rem 1rem', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', background: '#fff' }}
            >
              <option value="">Semua Status</option>
              {tab === 'payments'
                ? ['PAYMENT_UPLOADED', 'PAYMENT_VERIFIED', 'PENDING_PAYMENT'].map(s => <option key={s} value={s}>{STATUS_LABELS[s]?.label}</option>)
                : ['FORM_SUBMITTED', 'ADMIN_REVIEW', 'ADMIN_PASSED', 'REJECTED'].map(s => <option key={s} value={s}>{STATUS_LABELS[s]?.label}</option>)
              }
            </select>
            <button onClick={tab === 'payments' ? loadRegistrations : loadRegistrations} style={{ padding: '0.6rem 1rem', borderRadius: 10, background: '#1B6B44', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Refresh
            </button>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ background: '#F9FAFB' }}>
                {['No. Reg', 'Nama Siswa', 'Orang Tua', tab === 'payments' ? 'Bukti Transfer' : 'Berkas', 'Status', 'Tgl Submit', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((r: any) => {
                  const s = STATUS_LABELS[r.status] ?? { label: r.status, color: '#374151', bg: '#F3F4F6' };
                  const docs = [r.docPhoto, r.docTkCert, r.docBirthCert, r.docKartuKeluarga, r.docKtpFather, r.docKtpMother].filter(Boolean).length;
                  return (
                    <tr key={r.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontSize: 12, color: '#1B6B44', fontWeight: 700 }}>{r.registrationNo}</td>
                      <td style={{ padding: '0.875rem 1rem', fontWeight: 600 }}>{r.studentName || <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontWeight: 400 }}>Belum diisi</span>}</td>
                      <td style={{ padding: '0.875rem 1rem', color: '#374151', fontSize: 13 }}>{r.parent?.name}<br /><span style={{ color: '#9CA3AF', fontSize: 11 }}>{r.parent?.phone}</span></td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        {tab === 'payments'
                          ? r.paymentProof
                            ? <a href={r.paymentProof} target="_blank" rel="noopener noreferrer" style={{ color: '#1B6B44', fontSize: 12, fontWeight: 600 }}>Lihat →</a>
                            : <span style={{ color: '#9CA3AF', fontSize: 12 }}>Belum upload</span>
                          : <span style={{ fontWeight: 600, color: docs === 6 ? '#065F46' : '#92400E' }}>{docs}/6 berkas</span>
                        }
                      </td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>
                      </td>
                      <td style={{ padding: '0.875rem 1rem', color: '#6B7280', fontSize: 12 }}>{fmtDate(r.createdAt)}</td>
                      <td style={{ padding: '0.875rem 1rem' }}>
                        <button onClick={() => openDetail(r.id)} style={{ padding: '0.35rem 0.75rem', background: '#F0F9F4', border: '1px solid #D1E9DA', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#1B6B44', fontWeight: 600 }}>
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Tidak ada data.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ACADEMIC YEARS ── */}
      {!loading && tab === 'academic_years' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', border: '1px solid #E5E7EB', height: 'fit-content' }}>
            <div style={{ fontWeight: 700, marginBottom: '1.25rem', color: '#111827' }}>Tambah Tahun Ajaran</div>
            {ayMsg && <div style={{ background: ayMsg.startsWith('✅') ? '#D1FAE5' : '#FEF2F2', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem', fontSize: 13, color: ayMsg.startsWith('✅') ? '#065F46' : '#DC2626' }}>{ayMsg}</div>}
            <form onSubmit={createAY} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { key: 'name', label: 'Nama (misal: 2026/2027)', type: 'text' },
                { key: 'registrationStart', label: 'Tanggal Mulai', type: 'date' },
                { key: 'registrationEnd', label: 'Tanggal Selesai', type: 'date' },
                { key: 'quota', label: 'Kuota (0 = tak terbatas)', type: 'number' },
                { key: 'registrationFee', label: 'Biaya Pendaftaran (Rp)', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>{f.label}</label>
                  <input
                    required type={f.type}
                    value={(ayForm as any)[f.key]}
                    onChange={e => setAyForm(a => ({ ...a, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    style={{ width: '100%', padding: '0.65rem 0.875rem', borderRadius: 8, border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
              <button type="submit" disabled={aySubmitting} style={{ padding: '0.75rem', background: aySubmitting ? '#9CA3AF' : '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, cursor: aySubmitting ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {aySubmitting ? 'Menyimpan...' : 'Tambah Tahun Ajaran'}
              </button>
            </form>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ background: '#F9FAFB' }}>
                {['Tahun Ajaran', 'Periode', 'Kuota / Pendaftar', 'Biaya', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {academicYears.map((ay: any) => (
                  <tr key={ay.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#111827' }}>{ay.name}</td>
                    <td style={{ padding: '1rem', fontSize: 13, color: '#374151' }}>{fmtDate(ay.registrationStart)} – {fmtDate(ay.registrationEnd)}</td>
                    <td style={{ padding: '1rem', fontSize: 13 }}>{ay._count?.registrations ?? 0} / {ay.quota === 0 ? '∞' : ay.quota}</td>
                    <td style={{ padding: '1rem', fontSize: 13 }}>Rp {(ay.registrationFee || 300000).toLocaleString('id-ID')}</td>
                    <td style={{ padding: '1rem' }}>
                      {ay.isActive
                        ? <span style={{ padding: '0.2rem 0.6rem', background: '#D1FAE5', color: '#065F46', fontSize: 11, fontWeight: 700, borderRadius: 100 }}>AKTIF</span>
                        : <span style={{ padding: '0.2rem 0.6rem', background: '#F3F4F6', color: '#6B7280', fontSize: 11, borderRadius: 100 }}>Nonaktif</span>
                      }
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {!ay.isActive && (
                        <button onClick={() => setActiveAY(ay.id)} style={{ padding: '0.3rem 0.7rem', background: '#C9A84C', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          Aktifkan
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {academicYears.length === 0 && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Belum ada tahun ajaran.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {detailReg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: 640, background: '#fff', borderRadius: 20, height: 'calc(100vh - 2rem)', overflowY: 'auto', padding: '1.75rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontFamily: 'monospace', color: '#1B6B44', fontWeight: 700, fontSize: 13 }}>{detailReg.registrationNo}</div>
                <div style={{ fontWeight: 800, fontSize: 20, color: '#111827', marginTop: '0.25rem' }}>{detailReg.studentName || 'Nama belum diisi'}</div>
                <div style={{ marginTop: '0.4rem' }}>
                  {(() => { const s = STATUS_LABELS[detailReg.status] ?? { label: detailReg.status, color: '#374151', bg: '#F3F4F6' }; return <span style={{ padding: '0.25rem 0.75rem', borderRadius: 100, fontSize: 12, fontWeight: 700, background: s.bg, color: s.color }}>{s.label}</span>; })()}
                </div>
              </div>
              <button onClick={() => { setDetailReg(null); setActionMsg(''); }} style={{ background: '#F3F4F6', border: 'none', borderRadius: 10, padding: '0.5rem', cursor: 'pointer', fontSize: 20, color: '#374151', lineHeight: 1 }}>×</button>
            </div>

            {actionMsg && <div style={{ background: actionMsg.startsWith('✅') ? '#D1FAE5' : '#FEF2F2', borderRadius: 10, padding: '0.75rem', marginBottom: '1rem', fontSize: 13, fontWeight: 600, color: actionMsg.startsWith('✅') ? '#065F46' : '#DC2626' }}>{actionMsg}</div>}

            {/* Info orang tua */}
            <Section title="Orang Tua / Wali">
              <InfoRow label="Nama" val={detailReg.parent?.name} />
              <InfoRow label="Email" val={detailReg.parent?.email} />
              <InfoRow label="HP" val={detailReg.parent?.phone} />
            </Section>

            {/* Biodata siswa */}
            {detailReg.studentName && (
              <Section title="Biodata Calon Siswa">
                <InfoRow label="Nama Lengkap" val={detailReg.studentName} />
                <InfoRow label="Nama Panggilan" val={detailReg.nickName} />
                <InfoRow label="Jenis Kelamin" val={detailReg.gender === 'L' ? 'Laki-laki' : 'Perempuan'} />
                <InfoRow label="TTL" val={detailReg.birthPlace && detailReg.birthDate ? `${detailReg.birthPlace}, ${fmtDate(detailReg.birthDate)}` : undefined} />
                <InfoRow label="Agama" val={detailReg.religion} />
                <InfoRow label="Alamat" val={detailReg.address} />
                <InfoRow label="Transportasi" val={detailReg.transport} />
                <InfoRow label="Hobi / Cita-cita" val={detailReg.hobby && detailReg.aspiration ? `${detailReg.hobby} / ${detailReg.aspiration}` : undefined} />
              </Section>
            )}

            {/* Pembayaran */}
            <Section title="Pembayaran">
              <InfoRow label="Status" val={STATUS_LABELS[detailReg.status]?.label} />
              {detailReg.paymentProof && (
                <div style={{ marginTop: '0.75rem' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={detailReg.paymentProof} alt="Bukti transfer" style={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 10, border: '1px solid #E5E7EB' }} />
                  <a href={detailReg.paymentProof} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', marginTop: '0.5rem', fontSize: 12, color: '#1B6B44' }}>Buka di tab baru</a>
                </div>
              )}
              {detailReg.status === 'PAYMENT_UPLOADED' && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button disabled={actionLoading} onClick={() => verifyPayment(detailReg.id, true)} style={{ flex: 1, padding: '0.75rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
                    ✅ Verifikasi Pembayaran
                  </button>
                  <button disabled={actionLoading} onClick={() => verifyPayment(detailReg.id, false)} style={{ flex: 1, padding: '0.75rem', background: '#FEE2E2', color: '#B91C1C', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
                    ❌ Tolak
                  </button>
                </div>
              )}
            </Section>

            {/* Berkas */}
            {(detailReg.docPhoto || detailReg.docBirthCert) && (
              <Section title="Berkas yang Diupload">
                {[
                  { key: 'docPhoto', label: 'Pasfoto 3×4' },
                  { key: 'docTkCert', label: 'Surat TK/PAUD' },
                  { key: 'docBirthCert', label: 'Akte Kelahiran' },
                  { key: 'docKartuKeluarga', label: 'Kartu Keluarga' },
                  { key: 'docKtpFather', label: 'KTP Ayah' },
                  { key: 'docKtpMother', label: 'KTP Ibu' },
                ].map(doc => (
                  <div key={doc.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F3F4F6', fontSize: 13 }}>
                    <span style={{ color: '#6B7280' }}>{doc.label}</span>
                    {detailReg[doc.key]
                      ? <a href={detailReg[doc.key]} target="_blank" rel="noopener noreferrer" style={{ color: '#1B6B44', fontWeight: 600 }}>Lihat →</a>
                      : <span style={{ color: '#9CA3AF' }}>Belum upload</span>
                    }
                  </div>
                ))}

                {detailReg.status === 'FORM_SUBMITTED' && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button disabled={actionLoading} onClick={() => reviewAdmin(detailReg.id, true)} style={{ flex: 1, padding: '0.75rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
                      ✅ Lulus Administrasi
                    </button>
                    <button disabled={actionLoading} onClick={() => reviewAdmin(detailReg.id, false)} style={{ flex: 1, padding: '0.75rem', background: '#FEE2E2', color: '#B91C1C', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
                      ❌ Tolak
                    </button>
                  </div>
                )}
              </Section>
            )}

            {/* Surat klinik */}
            {detailReg.docClinicCert && (
              <Section title="Surat Keterangan Klinik IMC">
                <a href={detailReg.docClinicCert} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '0.6rem 1rem', background: '#F0F9F4', borderRadius: 8, color: '#1B6B44', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                  📄 Lihat Surat Keterangan Klinik
                </a>
              </Section>
            )}

            {/* Observasi */}
            {detailReg.observationSlot && (
              <Section title="Jadwal Observasi">
                <InfoRow label="Tanggal" val={fmtDate(detailReg.observationSlot.date)} />
                <InfoRow label="Waktu" val={`${detailReg.observationSlot.startTime} – ${detailReg.observationSlot.endTime} WIB`} />
              </Section>
            )}

            {/* Kelas */}
            {detailReg.classroom && (
              <Section title="Kelas yang Ditetapkan">
                <div style={{ fontSize: 28, fontWeight: 800, color: '#1B6B44' }}>{detailReg.classroom.name}</div>
              </Section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper Components ─────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>{title}</div>
      <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '1rem' }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, val }: { label: string; val?: string | null }) {
  if (!val) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: 13, borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ color: '#6B7280' }}>{label}</span>
      <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right', maxWidth: '65%' }}>{val}</span>
    </div>
  );
}
