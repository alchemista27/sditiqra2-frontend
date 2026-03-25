'use client';
// src/components/profile/EditPasswordModal.tsx
// Modal form untuk mengubah password pengguna yang sedang login
import { useState } from 'react';
import { getToken, removeToken } from '@/lib/auth';
import { authApi } from '@/lib/api';

interface EditPasswordModalProps {
  open: boolean;
  onClose: () => void;
  /** Optional custom localStorage key to read the token from (e.g. PARENT_TOKEN_KEY for PPDB parent portal).
   *  When provided, the token is read lazily at submit time instead of using getToken(). */
  customTokenKey?: string;
}

export default function EditPasswordModal({ open, onClose, customTokenKey }: EditPasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Semua field wajib diisi.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password baru minimal 8 karakter.');
      return;
    }

    if (oldPassword === newPassword) {
      setError('Password baru tidak boleh sama dengan password lama.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      const token = customTokenKey ? localStorage.getItem(customTokenKey) : getToken();
      if (!token) {
        setError('Sesi telah berakhir. Silakan login ulang.');
        setLoading(false);
        return;
      }
      await authApi.changePassword(token, oldPassword, newPassword);
      setSuccess('Password berhasil diubah! Anda akan diminta login ulang...');
      // Biarkan loading tetap aktif sampai redirect selesai
      setTimeout(() => {
        handleClose();
        // Force re-login: hapus token dan redirect
        if (customTokenKey) {
          localStorage.removeItem(customTokenKey);
        } else {
          removeToken();
        }
        window.location.reload();
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengubah password.';
      setError(message);
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    }} onClick={handleClose}>
      <div
        className="modal-animate-in"
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440,
          margin: '0 1rem', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid #E5E7EB',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#1B6B44' }}>lock</span>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>Ubah Password</h3>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, borderRadius: 8, display: 'flex',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#6B7280' }}>close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              background: '#FEE2E2', color: '#991B1B', padding: '0.75rem 1rem',
              borderRadius: 10, fontSize: 13, marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: '#D1FAE5', color: '#065F46', padding: '0.75rem 1rem',
              borderRadius: 10, fontSize: 13, marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
              {success}
            </div>
          )}

          {/* Password Lama */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
              Password Lama
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="Masukkan password lama"
                style={{
                  width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                  border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#1B6B44'}
                onBlur={e => e.currentTarget.style.borderColor = '#D1D5DB'}
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#9CA3AF' }}>
                  {showOld ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Password Baru */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
              Password Baru
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru (min. 8 karakter)"
                style={{
                  width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                  border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#1B6B44'}
                onBlur={e => e.currentTarget.style.borderColor = '#D1D5DB'}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#9CA3AF' }}>
                  {showNew ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
              Konfirmasi Password Baru
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                style={{
                  width: '100%', padding: '0.65rem 2.5rem 0.65rem 0.85rem',
                  border: '1px solid #D1D5DB', borderRadius: 10, fontSize: 14,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#1B6B44'}
                onBlur={e => e.currentTarget.style.borderColor = '#D1D5DB'}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#9CA3AF' }}>
                  {showConfirm ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: 10, border: '1px solid #D1D5DB',
                background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none',
                background: loading ? '#9CA3AF' : '#1B6B44', color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-sm" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                  Simpan Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
