'use client';
// src/app/ppdb/page.tsx - Landing page PPDB
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { academicYearsApi } from '@/lib/api';

const STEPS = [
  { no: 1, icon: 'payments', title: 'Registrasi & Pembayaran', desc: 'Buat akun, lalu bayar biaya pendaftaran Rp 300.000' },
  { no: 2, icon: 'assignment', title: 'Isi Formulir', desc: 'Biodata calon siswa & data orang tua/wali' },
  { no: 3, icon: 'upload_file', title: 'Upload Berkas', desc: 'Pasfoto, akte, KK, KTP orang tua, surat TK asal' },
  { no: 4, icon: 'verified', title: 'Seleksi Administrasi', desc: 'Admin memverifikasi kelengkapan berkas' },
  { no: 5, icon: 'medical_services', title: 'Pemeriksaan Klinik', desc: 'Periksa kesehatan di IMC dengan surat pengantar dari sekolah' },
  { no: 6, icon: 'event_available', title: 'Jadwal Observasi', desc: 'Pilih jadwal observasi yang tersedia' },
  { no: 7, icon: 'emoji_events', title: 'Pengumuman', desc: 'Lihat hasil & kelas yang ditetapkan' },
];

const DOCS = [
  { icon: 'photo_camera', label: 'Pasfoto 3x4 warna (JPEG/PNG)' },
  { icon: 'article', label: 'Surat keterangan TK/PAUD asal' },
  { icon: 'book', label: 'Scan akte kelahiran' },
  { icon: 'family_restroom', label: 'Scan kartu keluarga' },
  { icon: 'badge', label: 'Scan KTP ayah' },
  { icon: 'badge', label: 'Scan KTP ibu' },
];

export default function PpdbLandingPage() {
  const [activeYear, setActiveYear] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    academicYearsApi.getActive()
      .then(r => setActiveYear(r.data))
      .catch(() => setActiveYear(null))
      .finally(() => setLoading(false));
  }, []);

  const isOpen = activeYear && (() => {
    const now = new Date();
    const start = new Date(activeYear.registrationStart);
    const end = new Date(activeYear.registrationEnd);
    return now >= start && now <= end;
  })();

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0F3D24 0%, #1B6B44 60%, #2D9164 100%)',
        color: '#fff', padding: '5rem 1.5rem 6rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        {/* Dekorasi bulatan abstrak */}
        <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(201,168,76,0.12)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto' }}>
          {!loading && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: isOpen ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.1)',
              border: `1px solid ${isOpen ? '#C9A84C' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: 100, padding: '0.35rem 1rem', marginBottom: '1.5rem',
              fontSize: 13, color: isOpen ? '#F2D98A' : 'rgba(255,255,255,0.7)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: isOpen ? '#C9A84C' : 'rgba(255,255,255,0.4)', display: 'inline-block' }} />
              {activeYear
                ? isOpen
                  ? `Pendaftaran TA ${activeYear.name} SEDANG DIBUKA`
                  : `Pendaftaran TA ${activeYear.name} Belum/Sudah Ditutup`
                : 'Belum ada tahun ajaran aktif'}
            </div>
          )}

          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Penerimaan Peserta<br />
            <span style={{ color: '#C9A84C' }}>Didik Baru (PPDB)</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'rgba(255,255,255,0.8)', maxWidth: 560, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            SD IT Iqra 2 Kota Bengkulu — Tahun Ajaran{' '}
            <strong style={{ color: '#F2D98A' }}>{activeYear?.name ?? '2026/2027'}</strong>.
            Daftar online, pantau status, dan terima pengumuman langsung dari portal ini.
          </p>

          {activeYear && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: '2rem' }}>
              <span className="material-symbols-outlined">event</span> {new Date(activeYear.registrationStart).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' — '}
              {new Date(activeYear.registrationEnd).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              {activeYear.quota > 0 && ` · Kuota: ${activeYear.quota} siswa`}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/ppdb/daftar" style={{
              background: '#C9A84C', color: '#fff', padding: '0.875rem 2rem',
              borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              Daftar Sekarang →
            </Link>
            <Link href="/ppdb/masuk" style={{
              background: 'rgba(255,255,255,0.12)', color: '#fff', padding: '0.875rem 2rem',
              borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              Sudah Punya Akun
            </Link>
          </div>
        </div>
      </section>

      {/* Biaya Pendaftaran */}
      <section style={{ background: '#fff', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #1B6B44, #2D9164)', borderRadius: 16, padding: '2rem', color: '#fff', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 36, color: '#F2D98A' }}>payments</span>
            <div style={{ fontSize: 28, fontWeight: 800 }}>Rp 300.000</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Biaya Pendaftaran</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem' }}>Dibayar melalui transfer bank, upload bukti di portal</div>
          </div>
          {[
            { icon: 'calendar_today', label: 'Periode Pendaftaran', val: activeYear ? `s.d. ${new Date(activeYear.registrationEnd).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}` : '-' },
            { icon: 'groups', label: 'Kuota Tersisa', val: activeYear?.quota ? `${activeYear.quota} siswa` : 'Lihat Admin' },
            { icon: 'school', label: 'Kelas Tersedia', val: '1A · 1B · 1C · 1D' },
          ].map(item => (
            <div key={item.label} style={{ background: '#F9FAFB', borderRadius: 16, padding: '2rem', border: '1px solid #E5E7EB' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#1B6B44' }}>{item.icon}</span>
              <div style={{ fontSize: 22, fontWeight: 700, margin: '0.5rem 0 0.25rem', color: '#111827' }}>{item.val}</div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Alur Pendaftaran */}
      <section style={{ background: '#F0F9F4', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ display: 'inline-block', background: '#E8F5EE', color: '#1B6B44', borderRadius: 100, padding: '0.35rem 1rem', fontSize: 13, fontWeight: 600, marginBottom: '0.75rem' }}>
              Alur Pendaftaran
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#111827' }}>7 Langkah Mudah</h2>
            <p style={{ color: '#6B7280', marginTop: '0.5rem' }}>Ikuti tahapan berikut secara berurutan untuk menyelesaikan pendaftaran</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {STEPS.map((step, i) => (
              <div key={step.no} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                {/* Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1B6B44, #2D9164)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 16, boxShadow: '0 4px 12px rgba(27,107,68,0.3)',
                    flexShrink: 0,
                  }}>
                    {step.no}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 32, background: 'linear-gradient(to bottom, #2D9164, #E8F5EE)', margin: '4px 0' }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ background: '#fff', borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '0.5rem', flex: 1, border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B6B44' }}>{step.icon}</span>
                    <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{step.title}</div>
                  </div>
                  <div style={{ color: '#6B7280', fontSize: 14 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Berkas yang Diperlukan */}
      <section style={{ background: '#fff', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: '#111827', marginBottom: '0.5rem' }}>Berkas yang Diperlukan</h2>
            <p style={{ color: '#6B7280' }}>Siapkan dokumen-dokumen berikut dalam format digital (scan/foto)</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {DOCS.map((doc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', background: '#F0F9F4', borderRadius: 12, padding: '1rem 1.25rem', border: '1px solid #D1E9DA' }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E8F5EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B6B44' }}>{doc.icon}</span>
                </div>
                <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{doc.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0F3D24, #1B6B44)', padding: '4rem 1.5rem', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: '1rem' }}>Siap Mendaftar?</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2rem', fontSize: 15 }}>
          Buat akun sekarang dan mulai proses pendaftaran secara online
        </p>
        <Link href="/ppdb/daftar" style={{
          display: 'inline-block', background: '#C9A84C', color: '#fff',
          padding: '1rem 2.5rem', borderRadius: 12, fontWeight: 700, fontSize: 16,
          textDecoration: 'none', boxShadow: '0 4px 20px rgba(201,168,76,0.4)',
        }}>
          Daftar Akun Sekarang →
        </Link>
        <div style={{ marginTop: '1.5rem', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          Sudah punya akun?{' '}
          <Link href="/ppdb/masuk" style={{ color: '#F2D98A', textDecoration: 'none', fontWeight: 600 }}>Masuk di sini</Link>
        </div>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
      `}</style>
    </div>
  );
}
