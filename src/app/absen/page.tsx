'use client';
// src/app/absen/page.tsx - Dashboard Absensi Utama
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';
import { attendanceApi, authApi } from '@/lib/api';

// Simple haversine formula (Client-side fail-safe)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp / 2) * Math.sin(dp / 2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function AbsenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // GPS & Camera states
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [locError, setLocError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [clockAction, setClockAction] = useState<'in' | 'out'>('in');
  const [submitting, setSubmitting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadData = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return router.replace('/absen/login');
      
      const [uRes, sRes] = await Promise.all([
        authApi.me(token),
        attendanceApi.getMyStatus(token)
      ]);
      setUser(uRes.data);
      setStatus(sRes.data);
    } catch (err: any) {
      console.error('Failed to load data:', err);
      if (err.status === 401) router.replace('/absen/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
    getLocation();
    return () => stopCamera();
  }, [loadData]);

  const getLocation = () => {
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('GPS tidak didukung browser ini.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => setLocError(err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert('Gagal mengakses kamera. Mohon izinkan akses kamera di browser Anda.');
      setShowCamera(false);
    }
  };

  const handleClockAction = (action: 'in' | 'out') => {
    if (!location) {
      alert('Mohon tunggu lokasi GPS ditemukan atau refresh lokasi.');
      return;
    }

    if (status?.config) {
      const dist = getDistance(
        location.latitude, location.longitude, 
        status.config.schoolLatitude, status.config.schoolLongitude
      );
      if (dist > status.config.radiusMeters) {
        if (!window.confirm(`Anda berada ${dist}m dari sekolah (Batas: ${status.config.radiusMeters}m). Absensi akan tercatat sebagai anomali. Lanjutkan?`)) {
          return;
        }
      }
    }

    setClockAction(action);
    setShowCamera(true);
    setTimeout(startCamera, 100);
  };

  const captureAndSubmit = async () => {
    if (!videoRef.current || !canvasRef.current || !location) return;
    setSubmitting(true);

    try {
      // 1. Draw to canvas
      const w = videoRef.current.videoWidth;
      const h = videoRef.current.videoHeight;
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.scale(-1, 1); // mirror
        ctx.drawImage(videoRef.current, -w, 0, w, h);
      }

      // 2. To File
      const blob = await new Promise<Blob | null>(res => canvasRef.current!.toBlob(res, 'image/jpeg', 0.8));
      if (!blob) throw new Error('Gagal memproses gambar');
      const file = new File([blob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });

      // 3. Upload File
      const token = getToken();
      if (!token) throw new Error('Unauthenticated');
      
      const uploadRes = await attendanceApi.uploadSelfie(token, file);
      const selfieUrl = uploadRes.data?.url;

      // 4. Submit Clock
      const payload = {
        latitude: location.latitude,
        longitude: location.longitude,
        selfieUrl
      };

      if (clockAction === 'in') {
        await attendanceApi.clockIn(token, payload);
      } else {
        await attendanceApi.clockOut(token, payload);
      }

      alert(`Berhasil Clock ${clockAction === 'in' ? 'In' : 'Out'}!`);
      setShowCamera(false);
      stopCamera();
      loadData();

    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (t: string | null) => t ? new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--';

  return (
    <div style={{ padding: '1rem', maxWidth: 480, margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header Info */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: 13, color: '#6B7280' }}>{dateStr}</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginTop: '0.25rem' }}>Halo, {user?.name}</div>
        <div style={{ fontSize: 13, color: '#1B6B44', fontWeight: 600, marginTop: '0.25rem' }}>{user?.role.replace('_', ' ')}</div>
      </div>

      {/* Holiday Banner */}
      {status?.isHoliday && (
        <div style={{ background: '#FEF3C7', padding: '1rem', borderRadius: 12, marginBottom: '1rem', color: '#92400E', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="material-symbols-outlined">celebration</span>
          Hari ini libur: {status.holidayName}
        </div>
      )}

      {/* GPS Info */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', marginBottom: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <span className="material-symbols-outlined" style={{ fontSize: 18 }}>location_on</span> Status Lokasi
          </div>
          <button onClick={getLocation} style={{ background: 'none', border: 'none', color: '#1B6B44', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Refresh</button>
        </div>
        
        {locError ? (
          <div style={{ color: '#DC2626', fontSize: 13 }}>{locError}</div>
        ) : location ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: '0.25rem' }}>
               <span style={{ color: '#6B7280' }}>Koordinat</span>
               <span style={{ fontWeight: 500 }}>{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</span>
            </div>
            {status?.config && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: '#6B7280' }}>Jarak</span>
                {(() => {
                  const d = getDistance(location.latitude, location.longitude, status.config.schoolLatitude, status.config.schoolLongitude);
                  const inRadius = d <= status.config.radiusMeters;
                  return (
                    <span style={{ fontWeight: 600, color: inRadius ? '#059669' : '#DC2626' }}>
                      {d}m {inRadius ? '(Aman)' : '(Luar Area)'}
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#6B7280' }}>Mencari lokasi...</div>
        )}
      </div>

      {/* Status Today */}
      <div style={{ background: '#fff', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: '1rem', textAlign: 'center' }}>Waktu Kehadiran</div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: '0.25rem' }}>Clock In</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: status?.hasClockIn ? '#059669' : '#9CA3AF' }}>{formatTime(status?.clockIn)}</div>
          </div>
          <div style={{ width: 1, height: 40, background: '#E5E7EB' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: '0.25rem' }}>Clock Out</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: status?.hasClockOut ? '#DC2626' : '#9CA3AF' }}>{formatTime(status?.clockOut)}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!status?.isHoliday && (
        <div>
          {!status?.hasClockIn ? (
            <button 
              onClick={() => handleClockAction('in')} 
              style={{ width: '100%', padding: '1.25rem', background: '#1B6B44', color: 'white', borderRadius: 16, border: 'none', fontSize: 18, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(27,107,68,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>login</span>
              CLOCK IN
            </button>
          ) : !status?.hasClockOut ? (
            <button 
              onClick={() => handleClockAction('out')} 
              style={{ width: '100%', padding: '1.25rem', background: '#DC2626', color: 'white', borderRadius: 16, border: 'none', fontSize: 18, fontWeight: 800, cursor: 'pointer', boxShadow: '0 8px 20px rgba(220,38,38,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>logout</span>
              CLOCK OUT
            </button>
          ) : (
            <div style={{ background: '#D1FAE5', border: '1px solid #34D399', padding: '1.25rem', borderRadius: 16, textAlign: 'center', color: '#065F46' }}>
               <span className="material-symbols-outlined" style={{ fontSize: 32, marginBottom: '0.5rem' }}>check_circle</span>
               <div style={{ fontWeight: 700, fontSize: 16 }}>Absensi Selesai</div>
               <div style={{ fontSize: 13, marginTop: '0.25rem' }}>Terima kasih atas kerja keras Anda hari ini.</div>
            </div>
          )}
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
             <button onClick={() => { setShowCamera(false); stopCamera(); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span className="material-symbols-outlined">close</span>
             </button>
          </div>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} // mirror
            />
            {/* Overlay Frame */}
            <div style={{ position: 'absolute', width: 250, height: 320, border: '2px solid rgba(255,255,255,0.5)', borderRadius: '150px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', boxSizing: 'border-box' }} />
          </div>
          <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
             <button 
                disabled={submitting}
                onClick={captureAndSubmit} 
                style={{ width: 72, height: 72, borderRadius: 36, background: submitting ? '#9CA3AF' : '#fff', border: '4px solid #D1D5DB', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
               {submitting && <div style={{ width: 24, height: 24, border: '3px solid #1B6B44', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
             </button>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
        </div>
      )}
    </div>
  );
}
