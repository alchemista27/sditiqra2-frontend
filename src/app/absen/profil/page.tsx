'use client';
// src/app/absen/profil/page.tsx - Profil User
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getToken, getUserFromToken, removeToken } from '@/lib/auth';
import { authApi } from '@/lib/api';

interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = async () => {
    try {
      const token = getToken();
      if (!token) { router.replace('/absen/login'); return; }

      // Try to get from API first, fallback to token decode
      try {
        const res = await authApi.me(token);
        setUser(res.data as UserData);
      } catch {
        const decoded = getUserFromToken(token);
        if (decoded) {
          setUser({ name: decoded.name || '-', email: decoded.email || '-', role: decoded.role || '-' });
        }
      }
    } catch (err: unknown) {
      console.error('Load profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      removeToken();
      router.replace('/absen/login');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#1B6B44' }}>
        <div style={{ fontSize: 14 }}>Memuat profil...</div>
      </div>
    );
  }

  const initial = user?.name?.[0]?.toUpperCase() || 'U';
  const roleName = user?.role?.replace(/_/g, ' ') || '-';

  return (
    <div style={{ padding: '1rem', maxWidth: 480, margin: '0 auto' }}>
      {/* Title */}
      <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 6 }}>person</span>
        Profil Saya
      </h1>

      {/* Profile Card */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '24px',
        border: '1px solid #E5E7EB',
        textAlign: 'center',
        marginBottom: '1rem',
      }}>
        {/* Avatar */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          background: '#1B6B44',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          color: '#fff',
          fontSize: 28,
          fontWeight: 800,
        }}>
          {initial}
        </div>

        {/* Name */}
        <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{user?.name || '-'}</div>

        {/* Email */}
        <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{user?.email || '-'}</div>

        {/* Role Badge */}
        <div style={{
          display: 'inline-block',
          padding: '4px 12px',
          borderRadius: 12,
          background: '#D1FAE5',
          color: '#065F46',
          fontSize: 12,
          fontWeight: 700,
          marginTop: 8,
          textTransform: 'uppercase',
        }}>
          {roleName}
        </div>
      </div>

      {/* Info Section */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
        marginBottom: '1rem',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid #F3F4F6',
        }}>
          <span style={{ fontSize: 14, color: '#374151' }}>Versi Aplikasi</span>
          <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>1.0.0 (Web)</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid #F3F4F6',
        }}>
          <span style={{ fontSize: 14, color: '#374151' }}>Platform</span>
          <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>Next.js / Web</span>
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '14px 16px',
        }}>
          <span style={{ fontSize: 14, color: '#374151' }}>Sekolah</span>
          <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>SD IT Iqra 2</span>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%',
          padding: '14px',
          background: '#FEE2E2',
          border: '1px solid #FECACA',
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 700,
          color: '#991B1B',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
        Keluar dari Akun
      </button>
    </div>
  );
}
