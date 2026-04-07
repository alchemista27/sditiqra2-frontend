'use client';
// src/app/admin/users/page.tsx - User Management (Super Admin Only)
import { useEffect, useState } from 'react';
import { usersApi, type UserItem } from '@/lib/api';
import { getToken, getUserFromToken } from '@/lib/auth';

const ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Akses penuh ke semua fitur' },
  { value: 'KEPALA_SEKOLAH', label: 'Kepala Sekolah', desc: 'Akses penuh dengan权限 lebih tinggi' },
  { value: 'ADMIN_HUMAS', label: 'Admin humas', desc: 'Kelola konten CMS' },
  { value: 'ADMIN_PERSONALIA', label: 'Admin Personalia', desc: 'Kelola absensi & cuti' },
  { value: 'KARYAWAN', label: 'Karyawan/Guru', desc: 'Akses terbatas' },
];

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: '#7C3AED',
  KEPALA_SEKOLAH: '#DC2626',
  ADMIN_HUMAS: '#1B6B44',
  ADMIN_PERSONALIA: '#2563EB',
  KARYAWAN: '#6B7280',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('KARYAWAN');
  const [showResetPw, setShowResetPw] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const token = getToken();
    if (token) {
      const user = getUserFromToken(token);
      setCurrentUser(user);
      if (user?.role === 'SUPER_ADMIN') {
        fetchUsers();
      }
    }
  }, []);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    try {
      const token = getToken()!;
      const r = await usersApi.getAll(token);
      setUsers(r.data);
    } catch {
      showToast('Gagal memuat data user', 'err');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormName(''); setFormEmail(''); setFormPassword(''); setFormRole('KARYAWAN');
    setShowResetPw(false); setNewPassword('');
    setEditingUser(null); setShowForm(false);
  };

  const openEdit = (user: UserItem) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Nama dan email wajib diisi', 'err');
      return;
    }

    setSaving(true);
    try {
      const token = getToken()!;
      if (editingUser) {
        await usersApi.update(token, editingUser.id, { name: formName, role: formRole });
        showToast('User berhasil diperbarui');
      } else {
        if (!formPassword) { showToast('Password wajib diisi', 'err'); setSaving(false); return; }
        await usersApi.create(token, { name: formName, email: formEmail, password: formPassword, role: formRole });
        showToast('User berhasil dibuat');
      }
      fetchUsers();
      resetForm();
    } catch (err: any) {
      showToast(err.message || 'Gagal menyimpan', 'err');
    }
    setSaving(false);
  };

  const handleToggleActive = async (user: UserItem) => {
    try {
      const token = getToken()!;
      await usersApi.update(token, user.id, { isActive: !user.isActive });
      fetchUsers();
      showToast(`User ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
    } catch { showToast('Gagal update status', 'err'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus user ini?')) return;
    try {
      const token = getToken()!;
      await usersApi.delete(token, id);
      fetchUsers();
      showToast('User berhasil dihapus');
    } catch { showToast('Gagal menghapus user', 'err'); }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('Password minimal 6 karakter', 'err');
      return;
    }
    try {
      const token = getToken()!;
      await usersApi.resetPassword(token, editingUser!.id, newPassword);
      showToast('Password berhasil direset');
      setShowResetPw(false); setNewPassword('');
    } catch { showToast('Gagal reset password', 'err'); }
  };

  if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#6B7280' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 64, color: '#DC2626' }}>lock</span>
        <h2 style={{ fontSize: 20, color: '#111827', marginTop: '1rem' }}>Akses Ditolak</h2>
        <p>Halaman ini hanya dapat diakses oleh Super Admin.</p>
      </div>
    );
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#9CA3AF' }}>
      <span className="material-symbols-outlined" style={{ fontSize: 36, animation: 'spin 1s linear infinite' }}>sync</span>
    </div>
  );

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: toast.type === 'ok' ? '#111827' : '#DC2626', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 12, fontSize: 14, zIndex: 999 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Kelola User</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Kelola akun pengguna dan peran akses sistem.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          style={{ padding: '0.65rem 1.25rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
          Tambah User
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280' }}>Nama</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280' }}>Email</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280' }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280' }}>Dibuat</th>
              <th style={{ padding: '1rem', textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#6B7280' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <td style={{ padding: '1rem', fontSize: 14, fontWeight: 600, color: '#111827' }}>{user.name}</td>
                <td style={{ padding: '1rem', fontSize: 14, color: '#6B7280' }}>{user.email}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 20, fontSize: 12, fontWeight: 600, background: `${ROLE_COLORS[user.role] || '#6B7280'}20`, color: ROLE_COLORS[user.role] || '#6B7280' }}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <button onClick={() => handleToggleActive(user)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: user.isActive ? '#22C55E' : '#9CA3AF' }}>
                      {user.isActive ? 'check_circle' : 'cancel'}
                    </span>
                    <span style={{ fontSize: 13, color: user.isActive ? '#166534' : '#6B7280' }}>{user.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  </button>
                </td>
                <td style={{ padding: '1rem', fontSize: 13, color: '#6B7280' }}>{formatDate(user.createdAt)}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => openEdit(user)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#6B7280' }} title="Edit">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                  </button>
                  {user.id !== currentUser.id && (
                    <button onClick={() => handleDelete(user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#DC2626', marginLeft: '0.5rem' }} title="Hapus">
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 480 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: '1.25rem', color: '#111827' }}>
              {editingUser ? 'Edit User' : 'Tambah User Baru'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Nama Lengkap</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Contoh: Ahmad Fauzi"
                  style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
              </div>

              {!editingUser && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Email</label>
                  <input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@sekolah.sch.id" type="email"
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              )}

              {!editingUser && (
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Password</label>
                  <input value={formPassword} onChange={e => setFormPassword(e.target.value)} placeholder="Minimal 6 karakter" type="password"
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Role / Peran</label>
                <select value={formRole} onChange={e => setFormRole(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, background: '#fff', boxSizing: 'border-box' }}>
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: '0.25rem' }}>
                  {ROLES.find(r => r.value === formRole)?.desc}
                </div>
              </div>

              {editingUser && (
                <div>
                  {!showResetPw ? (
                    <button onClick={() => setShowResetPw(true)} style={{ background: 'none', border: 'none', color: '#1B6B44', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>lock_reset</span> Reset Password
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Password baru" type="password"
                        style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1.5px solid #E5E7EB', borderRadius: 8, fontSize: 13 }} />
                      <button onClick={handleResetPassword} style={{ padding: '0.5rem 1rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reset</button>
                      <button onClick={() => { setShowResetPw(false); setNewPassword(''); }} style={{ padding: '0.5rem', background: '#F3F4F6', border: 'none', borderRadius: 8, cursor: 'pointer' }}><span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span></button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={resetForm} style={{ padding: '0.65rem 1.25rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Batal</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '0.65rem 1.5rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{saving ? 'sync' : 'save'}</span>
                {saving ? 'Menyimpan...' : (editingUser ? 'Simpan' : 'Buat User')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}