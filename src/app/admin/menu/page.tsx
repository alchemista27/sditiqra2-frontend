'use client';
// src/app/admin/menu/page.tsx
// Editor Menu Navigasi ala WordPress — drag to reorder, add/edit/delete items
import { useEffect, useRef, useState, useCallback } from 'react';
import { menuApi } from '@/lib/api';
import type { MenuItem } from '@/lib/api';
import { getToken } from '@/lib/auth';

// ─── Helper: Reorder array setelah drag ──────────────────────
function reorderList<T>(list: T[], from: number, to: number): T[] {
  const result = [...list];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}

// ─── Komponen Item Draggable ──────────────────────────────────
function MenuItemRow({
  item, index, onEdit, onDelete, onDragStart, onDragOver, onDrop, dragging,
}: {
  item: MenuItem; index: number;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: () => void;
  dragging: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={onDrop}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: dragging ? '#F0FDF4' : '#fff',
        border: '1.5px solid',
        borderColor: dragging ? '#1B6B44' : '#E5E7EB',
        borderRadius: 12, marginBottom: '0.5rem',
        cursor: 'grab', transition: 'all 0.15s',
        boxShadow: dragging ? '0 4px 20px rgba(27,107,68,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
        opacity: dragging ? 0.8 : 1,
      }}
    >
      {/* Drag Handle */}
      <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#9CA3AF', cursor: 'grab', flexShrink: 0 }}>drag_indicator</span>

      {/* Order badge */}
      <div style={{ width: 28, height: 28, background: '#F3F4F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#6B7280', flexShrink: 0 }}>
        {index + 1}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {item.label}
          {item.openInNewTab && (
            <span style={{ fontSize: 10, background: '#E0F2FE', color: '#0369A1', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 600 }}>NEW TAB</span>
          )}
          {!item.isActive && (
            <span style={{ fontSize: 10, background: '#FEF3C7', color: '#92400E', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 600 }}>NONAKTIF</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: '0.1rem', fontFamily: 'monospace' }}>{item.url}</div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
        <button onClick={() => onEdit(item)}
          style={{ padding: '0.35rem 0.7rem', background: '#E8F5EE', color: '#1B6B44', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>edit</span>
        </button>
        <button onClick={() => onDelete(item.id)}
          style={{ padding: '0.35rem 0.7rem', background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>
        </button>
      </div>
    </div>
  );
}

// ─── Modal Form Tambah/Edit ───────────────────────────────────
function MenuItemForm({
  initial, onSave, onClose, saving,
}: {
  initial?: MenuItem | null;
  onSave: (data: Partial<MenuItem>) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [label, setLabel] = useState(initial?.label || '');
  const [url, setUrl] = useState(initial?.url || '');
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [openInNewTab, setOpenInNewTab] = useState(initial?.openInNewTab || false);

  const inputStyle = { width: '100%', padding: '0.7rem 1rem', border: '1.5px solid #E5E7EB', borderRadius: 10, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' as const };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{initial ? 'Edit Item Menu' : 'Tambah Item Menu'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6B7280' }}>✕</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ label, url, isActive, openInNewTab }); }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Label Tampil *</label>
            <input value={label} onChange={e => setLabel(e.target.value)} required
              placeholder="Contoh: Tentang Kami" style={inputStyle} />
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: '0.25rem' }}>Teks yang muncul di menu navigasi</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>URL / Path *</label>
            <input value={url} onChange={e => setUrl(e.target.value)} required
              placeholder="/tentang atau https://..." style={inputStyle} />
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: '0.25rem' }}>Gunakan path relatif (/tentang) atau URL penuh (https://...)</div>
          </div>

          {/* Quick URL Suggestions */}
          <div>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: '0.4rem' }}>Pintasan URL:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {['/', '/berita', '/ppdb', '/galeri'].map(u => (
                <button key={u} type="button" onClick={() => setUrl(u)}
                  style={{ padding: '0.2rem 0.6rem', background: url === u ? '#1B6B44' : '#F3F4F6', color: url === u ? '#fff' : '#374151', border: 'none', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#1B6B44', cursor: 'pointer' }} />
              <span><strong>Tampilkan</strong> di navbar publik</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: 14 }}>
              <input type="checkbox" checked={openInNewTab} onChange={e => setOpenInNewTab(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: '#1B6B44', cursor: 'pointer' }} />
              <span>Buka di <strong>tab baru</strong> (target=_blank)</span>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '0.65rem 1.25rem', background: '#F3F4F6', color: '#374151', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>
              Batal
            </button>
            <button type="submit" disabled={saving}
              style={{ padding: '0.65rem 1.5rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{saving ? 'sync' : 'save'}</span>
              {saving ? 'Menyimpan...' : initial ? 'Simpan Perubahan' : 'Tambah Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Halaman Utama Menu Editor ────────────────────────────────
export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordered, setReordered] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [toast, setToast] = useState('');
  const dragFrom = useRef<number>(-1);
  const dragTo = useRef<number>(-1);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    try {
      const r = await menuApi.getAll();
      setItems(r.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // ── Drag handlers ─────────────────────────────────────────
  const handleDragStart = (index: number) => {
    dragFrom.current = index;
    setDraggingIdx(index);
  };
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragTo.current = index;
  };
  const handleDrop = () => {
    if (dragFrom.current === dragTo.current) { setDraggingIdx(null); return; }
    const reordered = reorderList(items, dragFrom.current, dragTo.current);
    setItems(reordered);
    setDraggingIdx(null);
    setReordered(true);
  };

  // ── Save reorder ke backend ───────────────────────────────
  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const token = getToken()!;
      const payload = items.map((item, i) => ({ id: item.id, order: i }));
      await menuApi.reorder(token, payload);
      setReordered(false);
      showToast('✅ Urutan menu berhasil disimpan.');
    } catch {
      showToast('❌ Gagal menyimpan urutan.');
    }
    setSaving(false);
  };

  // ── Tambah / Edit ─────────────────────────────────────────
  const handleSaveItem = async (data: Partial<MenuItem>) => {
    setSaving(true);
    try {
      const token = getToken()!;
      if (editingItem) {
        await menuApi.update(token, editingItem.id, data);
        showToast('✅ Item berhasil diperbarui.');
      } else {
        await menuApi.create(token, data);
        showToast('✅ Item berhasil ditambahkan.');
      }
      setShowForm(false);
      setEditingItem(null);
      await fetchMenu();
    } catch {
      showToast('❌ Gagal menyimpan item.');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus item menu ini?')) return;
    try {
      await menuApi.remove(getToken()!, id);
      showToast('✅ Item dihapus.');
      await fetchMenu();
    } catch {
      showToast('❌ Gagal menghapus item.');
    }
  };

  return (
    <div>
      {/* ─── Header ─────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#111827', marginBottom: '0.25rem' }}>Menu Navigasi</h1>
          <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Drag &amp; drop untuk mengubah urutan. Perubahan urutan disimpan setelah klik &quot;Simpan Urutan&quot;.</p>
        </div>
        <button onClick={() => { setEditingItem(null); setShowForm(true); }}
          style={{ padding: '0.65rem 1.25rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> Tambah Item
        </button>
      </div>

      {/* ─── Toast ──────────────────────────────────────── */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#111827', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: 12, fontSize: 14, zIndex: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', animation: 'fadeIn 0.2s ease' }}>
          {toast}
        </div>
      )}

      {/* ─── Preview Navbar ─────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Preview Navbar Publik</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#0F3D24', padding: '0.75rem 1.25rem', borderRadius: 10, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: 14 }}>SD IT Iqra 2</div>
          <div style={{ display: 'flex', gap: '0.25rem', flex: 1, flexWrap: 'wrap' }}>
            {items.filter(m => m.isActive).map(m => (
              <span key={m.id} style={{ padding: '0.3rem 0.75rem', color: 'rgba(255,255,255,0.85)', fontSize: 13, borderRadius: 6, background: 'rgba(255,255,255,0.08)' }}>
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Save Order Bar ─────────────────────────────── */}
      {reordered && (
        <div style={{ background: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: 12, padding: '0.875rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 14, color: '#92400E', fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>
            Urutan menu telah berubah. Klik &quot;Simpan Urutan&quot; untuk menerapkan.
          </div>
          <button onClick={handleSaveOrder} disabled={saving}
            style={{ padding: '0.55rem 1.25rem', background: '#F97316', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{saving ? 'sync' : 'save'}</span>
            {saving ? 'Menyimpan...' : 'Simpan Urutan'}
          </button>
        </div>
      )}

      {/* ─── Daftar Menu Items ──────────────────────────── */}
      <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 16, padding: '1.25rem' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          {items.length} Item Menu {items.filter(m => !m.isActive).length > 0 && `(${items.filter(m => !m.isActive).length} nonaktif)`}
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Memuat menu...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, display: 'block', marginBottom: '0.75rem', opacity: 0.4 }}>menu</span>
            Belum ada item menu. Tambahkan item pertama.
          </div>
        ) : (
          <div>
            {items.map((item, index) => (
              <MenuItemRow
                key={item.id} item={item} index={index}
                onEdit={(i) => { setEditingItem(i); setShowForm(true); }}
                onDelete={handleDelete}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                dragging={draggingIdx === index}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Info Box ───────────────────────────────────── */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 12, padding: '1rem 1.25rem', marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#3B82F6', flexShrink: 0, marginTop: '0.1rem' }}>info</span>
        <div style={{ fontSize: 13, color: '#1E40AF', lineHeight: 1.6 }}>
          <strong>Cara menggunakan:</strong> Drag item ke atas/bawah untuk mengurutkan, lalu klik <strong>Simpan Urutan</strong>. Item yang dinonaktifkan tidak akan muncul di navbar publik tapi tetap tersimpan.
        </div>
      </div>

      {/* ─── Form Modal ─────────────────────────────────── */}
      {showForm && (
        <MenuItemForm
          initial={editingItem}
          onSave={handleSaveItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          saving={saving}
        />
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
