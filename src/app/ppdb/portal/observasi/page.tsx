'use client';
// src/app/ppdb/portal/observasi/page.tsx — Pilih jadwal observasi
import { useEffect, useState } from 'react';
import { ppdbParentApi } from '@/lib/api';

const PARENT_TOKEN_KEY = 'sditiqra2_parent_token';

export default function ObservasiPage() {
  const [registration, setRegistration] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(PARENT_TOKEN_KEY);
    if (!token) return;
    ppdbParentApi.getMyRegistration(token).then(r => setRegistration(r.data));
    ppdbParentApi.getAvailableSlots(token).then(r => setSlots(r.data || []));
  }, []);

  const status = registration?.status;
  const canBook = status === 'ADMIN_PASSED';
  const alreadyBooked = ['OBSERVATION_SCHEDULED', 'OBSERVATION_DONE', 'ACCEPTED'].includes(status);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true); setError('');
    try {
      const token = localStorage.getItem(PARENT_TOKEN_KEY)!;
      const res = await ppdbParentApi.bookSlot(token, selectedSlot) as any;
      if (res.success) {
        setSuccess('Jadwal observasi berhasil dipilih! Harap datang tepat waktu.');
        setRegistration(res.data); setShowConfirm(false);
      } else setError(res.message);
    } catch (e: any) { setError(e.message); }
    finally { setBooking(false); }
  };

  if (!canBook && !alreadyBooked) return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Jadwal Observasi</h2>
      <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 16, padding: '2rem', textAlign: 'center', marginTop: '1.5rem' }}>
        <div style={{ fontSize: 36, marginBottom: '0.75rem' }}><span className="material-symbols-outlined">lock</span></div>
        <div style={{ fontWeight: 700, color: '#92400E' }}>Belum Bisa Diakses</div>
        <div style={{ color: '#78350F', fontSize: 14, marginTop: '0.5rem' }}>
          Anda harus dinyatakan lulus seleksi administrasi terlebih dahulu untuk dapat memilih jadwal observasi.
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Jadwal Observasi</h2>
      <p style={{ color: '#6B7280', marginBottom: '2rem', fontSize: 14 }}>
        {alreadyBooked ? 'Jadwal observasi sudah dipilih.' : 'Pilih satu jadwal observasi yang sesuai.'}
      </p>

      {error && <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: '#DC2626', fontSize: 14 }}>{error}</div>}
      {success && <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: '#065F46', fontSize: 14 }}>{success}</div>}

      {/* Jadwal sudah dipilih */}
      {alreadyBooked && registration?.observationSlot && (
        <div style={{ background: 'linear-gradient(135deg, #0F3D24, #1B6B44)', borderRadius: 16, padding: '2rem', color: '#fff', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Jadwal Observasi Anda</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: '0.5rem' }}>
            {new Date(registration.observationSlot.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 18, color: '#F2D98A', fontWeight: 600 }}>
            <span className="material-symbols-outlined mr-1">schedule</span> {registration.observationSlot.startTime} – {registration.observationSlot.endTime} WIB
          </div>
          {registration.observationSlot.note && (
            <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.75rem', fontSize: 14 }}>
              <span className="material-symbols-outlined mr-1">assignment</span> {registration.observationSlot.note}
            </div>
          )}
          <div style={{ marginTop: '1rem', fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
            Harap datang 15 menit sebelum waktu yang dijadwalkan. Bawa kartu identitas orang tua.
          </div>
        </div>
      )}

      {/* Pilihan slot */}
      {canBook && (
        <>
          {slots.length === 0 && (
            <div style={{ background: '#F9FAFB', borderRadius: 16, padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
              <div style={{ fontSize: 40, marginBottom: '1rem' }}><span className="material-symbols-outlined">event</span></div>
              <div style={{ fontWeight: 600, marginBottom: '0.4rem' }}>Belum Ada Jadwal Tersedia</div>
              <div style={{ fontSize: 14 }}>Admin akan menambahkan jadwal observasi segera. Cek kembali nanti.</div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {slots.map(slot => {
              const isSelected = selectedSlot === slot.id;
              return (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  style={{
                    borderRadius: 14,
                    border: `2px solid ${isSelected ? '#1B6B44' : '#E5E7EB'}`,
                    padding: '1.25rem 1.5rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    transition: 'border-color 0.2s, background 0.2s',
                    background: isSelected ? '#F0F9F4' : '#fff',
                  } as React.CSSProperties}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${isSelected ? '#1B6B44' : '#D1D5DB'}`,
                    background: isSelected ? '#1B6B44' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                      {new Date(slot.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 14, color: '#6B7280', marginTop: '0.15rem' }}>
                      <span className="material-symbols-outlined mr-1">schedule</span> {slot.startTime} – {slot.endTime} WIB
                      {slot.note && ` · ${slot.note}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>Sisa kuota</div>
                    <div style={{ fontWeight: 700, color: slot.remaining <= 3 ? '#DC2626' : '#1B6B44' }}>{slot.remaining}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedSlot && !showConfirm && (
            <button id="book-slot-btn" onClick={() => setShowConfirm(true)} style={{
              marginTop: '1.5rem', width: '100%', padding: '0.875rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #1B6B44, #2D9164)', color: '#fff',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
            }}>
              Pilih Jadwal Ini →
            </button>
          )}

          {/* Modal konfirmasi */}
          {showConfirm && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
              <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', maxWidth: 400, width: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: '1rem' }}><span className="material-symbols-outlined">event</span></div>
                <h3 style={{ fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Konfirmasi Jadwal</h3>
                {(() => {
                  const slot = slots.find(s => s.id === selectedSlot);
                  return slot ? (
                    <div style={{ color: '#374151', marginBottom: '1.5rem', fontSize: 15 }}>
                      <strong>{new Date(slot.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</strong><br />
                      Pukul {slot.startTime} – {slot.endTime} WIB
                    </div>
                  ) : null;
                })()}
                <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: '1.5rem' }}>Jadwal tidak dapat diubah setelah konfirmasi.</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Batal</button>
                  <button id="confirm-book-btn" onClick={handleBook} disabled={booking} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: 'none', background: booking ? '#9CA3AF' : '#1B6B44', color: '#fff', cursor: booking ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                    {booking ? 'Memproses...' : 'Ya, Konfirmasi'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
