// src/app/admin/menu/page.tsx
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { menuApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

// Expanded type to handle parent/children in UI
export interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
  isActive: boolean;
  openInNewTab: boolean;
  parentId: string | null;
  children?: MenuItem[];
}

// Flattened item for dnd-kit representation
interface FlattenedItem extends MenuItem {
  parentId: string | null;
  depth: number;
  index: number;
}

// ─── Helpers ─────────────────────────────────────
function flattenTree(items: MenuItem[], parentId: string | null = null, depth = 0): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flattenTree(item.children || [], item.id, depth + 1),
    ];
  }, []);
}

function buildTree(flattenedItems: FlattenedItem[]): MenuItem[] {
  const rootItems: MenuItem[] = [];
  const lookup: Record<string, MenuItem> = {};

  for (const item of flattenedItems) {
    lookup[item.id] = { ...item, children: [] };
  }

  for (const item of flattenedItems) {
    if (item.parentId && lookup[item.parentId]) {
      lookup[item.parentId].children!.push(lookup[item.id]);
    } else {
      rootItems.push(lookup[item.id]);
    }
  }

  return rootItems;
}

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

// ─── Sortable Item Component ───────────────────────
function SortableMenuItem({ 
  item, 
  onEdit, 
  onDelete, 
  onMoveUp,
  onMoveDown,
  onIndent,
  onDedent,
  canMoveUp,
  canMoveDown,
  canIndent,
  canDedent
}: { 
  item: FlattenedItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onIndent: (id: string) => void;
  onDedent: (id: string) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canIndent: boolean;
  canDedent: boolean;
}) {
  const {
    attributes,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    paddingLeft: `${item.depth * 2}rem`, // Indentation based on depth
  };

  return (
    <div
      ref={setDroppableNodeRef}
      style={style}
      className={`relative mb-2 ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <div 
        ref={setDraggableNodeRef}
        className={`flex items-center gap-3 p-3 bg-white border-2 rounded-xl transition-all ${isDragging ? 'border-green-700 shadow-xl' : 'border-gray-200 shadow-sm'}`}
        style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}
      >
        {/* Drag Handle */}
        <button 
          {...attributes} 
          {...listeners} 
          className="p-1 cursor-grab text-gray-400 hover:text-gray-600 rounded"
        >
          <span className="material-symbols-outlined text-xl pointer-events-none">drag_indicator</span>
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 font-semibold text-sm text-gray-900">
            {item.label}
            {item.openInNewTab && (
              <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-bold">NEW TAB</span>
            )}
            {!item.isActive && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">NONAKTIF</span>
            )}
          </div>
          <div className="text-xs text-gray-500 font-mono mt-0.5">{item.url}</div>
        </div>

        {/* Position & Hierarchy Actions */}
        <div className="flex gap-1">
          <button 
            onClick={() => onMoveUp(item.id)} 
            disabled={!canMoveUp}
            title="Pindahkan ke atas"
            className="p-1.5 rounded-lg transition-colors"
            style={{ 
              backgroundColor: canMoveUp ? '#E8F5EE' : '#F3F4F6',
              color: canMoveUp ? '#1B6B44' : '#D1D5DB',
              cursor: canMoveUp ? 'pointer' : 'not-allowed'
            }}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
          </button>
          <button 
            onClick={() => onMoveDown(item.id)} 
            disabled={!canMoveDown}
            title="Pindahkan ke bawah"
            className="p-1.5 rounded-lg transition-colors"
            style={{ 
              backgroundColor: canMoveDown ? '#E8F5EE' : '#F3F4F6',
              color: canMoveDown ? '#1B6B44' : '#D1D5DB',
              cursor: canMoveDown ? 'pointer' : 'not-allowed'
            }}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
          </button>
          <button 
            onClick={() => onIndent(item.id)} 
            disabled={!canIndent}
            title="Jadikan submenu (pindahkan ke kanan)"
            className="p-1.5 rounded-lg transition-colors"
            style={{ 
              backgroundColor: canIndent ? '#E8F5EE' : '#F3F4F6',
              color: canIndent ? '#1B6B44' : '#D1D5DB',
              cursor: canIndent ? 'pointer' : 'not-allowed'
            }}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button 
            onClick={() => onDedent(item.id)} 
            disabled={!canDedent}
            title="Pindahkan ke parent menu (pindahkan ke kiri)"
            className="p-1.5 rounded-lg transition-colors"
            style={{ 
              backgroundColor: canDedent ? '#E8F5EE' : '#F3F4F6',
              color: canDedent ? '#1B6B44' : '#D1D5DB',
              cursor: canDedent ? 'pointer' : 'not-allowed'
            }}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </button>
        </div>

        {/* Edit & Delete Actions */}
        <div className="flex gap-2">
          <button onClick={() => onEdit(item)} className="p-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors" style={{ padding: '6px', backgroundColor: '#F0FDF4' }}>
            <span className="material-symbols-outlined text-[18px]">edit</span>
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" style={{ padding: '6px', backgroundColor: '#FEF2F2' }}>
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Form Tambah/Edit ────────────────────────
function MenuItemForm({
  initial, onSave, onClose, saving,
}: {
  initial: FlattenedItem | null;
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>{initial ? 'Edit Item Menu' : 'Tambah Item Menu'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6B7280' }}>✕</button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ label, url, isActive, openInNewTab, parentId: initial?.parentId }); }}
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

// ─── Main Page ───────────────────────────────────────
export default function AdminMenuPage() {
  const [rawItems, setRawItems] = useState<MenuItem[]>([]);
  const [flattenedItems, setFlattenedItems] = useState<FlattenedItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reordered, setReordered] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<FlattenedItem | null>(null);
  const [toast, setToast] = useState('');

  const indentationWidth = 32; // 2rem

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchMenu = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Backend should return nested (children) by default
      const r = await menuApi.getAll();
      setRawItems(r.data);
      setFlattenedItems(flattenTree(r.data));
    } catch {
      showToast('❌ Gagal memuat data menu');
    }
    setLoading(false);
  };

  useEffect(() => {
    menuApi.getAll()
      .then(r => {
        setRawItems(r.data);
        setFlattenedItems(flattenTree(r.data));
        setLoading(false);
      })
      .catch(() => {
        showToast('❌ Gagal memuat data menu');
        setLoading(false);
      });
  }, []);

  // Compute active item for drag overlay
  const activeItem = useMemo(
    () => flattenedItems.find(({ id }) => id === activeId),
    [activeId, flattenedItems]
  );

  // ── Drag & Drop Handlers ──
  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
    setOverId(active.id as string);

    // Calculate initial depth based on current state to snap correctly
    const item = flattenedItems.find((i) => i.id === active.id);
    if (item) setOffsetLeft(item.depth * indentationWidth);
  }

  function handleDragMove({ delta, over }: DragMoveEvent) {
    setOffsetLeft(delta.x);
    if (over) setOverId(over.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    setOverId(null);
    setOffsetLeft(0);

    if (over && active.id !== over.id) {
      const activeIndex = flattenedItems.findIndex(({ id }) => id === active.id);
      const overIndex = flattenedItems.findIndex(({ id }) => id === over.id);

      // Determine new depth and parent
      const activeItem = flattenedItems[activeIndex];
      const getNewDepth = () => {
         const dragDepth = getDragDepth(offsetLeft, indentationWidth);
         const minDepth = 0;
         const maxDepth = overIndex > 0 ? flattenedItems[overIndex - 1].depth + 1 : 0;
         return Math.max(minDepth, Math.min(dragDepth + activeItem.depth, maxDepth));
      }

      const newDepth = getNewDepth();
      let parentId: string | null = null;
      
      // Look back to find the parent at newDepth - 1
      for (let i = overIndex; i >= 0; i--) {
        if (flattenedItems[i].depth === newDepth - 1) {
            parentId = flattenedItems[i].id;
            break;
        }
      }

      const newItems = arrayMove(flattenedItems, activeIndex, overIndex);
      const updatedItems = newItems.map((item, idx) => {
        if (item.id === active.id) {
            return { ...item, depth: newDepth, parentId };
        }
        // Force siblings update logic can go here, simplified for display:
        return item;
      });

      // Quick re-flatten to fix depths downwards based on parent, 
      // easiest way is to build tree then reflatten
      const reFlatten = flattenTree(buildTree(updatedItems));
      
      setFlattenedItems(reFlatten);
      setReordered(true);
    }
  }

  function handleDragCancel() {
    setActiveId(null);
    setOverId(null);
    setOffsetLeft(0);
  }

  // ── Save Actions ──
  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const token = getToken();
      // Format payload for backend API
      const payload = flattenedItems.map((item, i) => ({
          id: item.id,
          order: i,
          parentId: item.parentId
      }));
      
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL + '/cms/menu/reorder', {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ items: payload })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Server error');
      }

      setReordered(false);
      showToast('✅ Urutan menu hierarki berhasil disimpan.');
      await fetchMenu();
    } catch (err) {
      console.error('handleSaveOrder error:', err);
      showToast('❌ Gagal menyimpan urutan.');
    }
    setSaving(false);
  };

  const handleSaveItem = async (data: Partial<MenuItem>) => {
    setSaving(true);
    try {
      const token = getToken();
      
      if (editingItem && editingItem.id) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/menu/${editingItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        showToast('✅ Item berhasil diperbarui.');
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
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
    if (!confirm('Hapus item menu ini? Semua submenu (jika ada) juga akan menjadi yatim/terhapus.')) return;
    try {
      const token = getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cms/menu/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
      });
      showToast('✅ Item dihapus.');
      await fetchMenu();
    } catch {
      showToast('❌ Gagal menghapus item.');
    }
  };

  const handleMoveUp = (id: string) => {
    const index = flattenedItems.findIndex(item => item.id === id);
    if (index <= 0) return;
    
    const newItems = [...flattenedItems];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    
    // Rebuild tree untuk memastikan parentId konsisten
    const rebuiltItems = flattenTree(buildTree(newItems));
    setFlattenedItems(rebuiltItems);
    setReordered(true);
  };

  const handleMoveDown = (id: string) => {
    const index = flattenedItems.findIndex(item => item.id === id);
    if (index >= flattenedItems.length - 1) return;
    
    const newItems = [...flattenedItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    
    // Rebuild tree untuk memastikan parentId konsisten
    const rebuiltItems = flattenTree(buildTree(newItems));
    setFlattenedItems(rebuiltItems);
    setReordered(true);
  };

  const handleIndent = (id: string) => {
    const index = flattenedItems.findIndex(item => item.id === id);
    if (index === 0) return;
    
    const item = flattenedItems[index];
    const prevItem = flattenedItems[index - 1];
    
    // Dapat di-indent jika prev item depth >= current item depth
    // (artinya prev item adalah sibling atau ancestor - bisa jadi parent baru)
    if (prevItem.depth < item.depth) return;
    
    const newItems = flattenedItems.map((it) => {
      if (it.id === id) {
        return { ...it, depth: item.depth + 1, parentId: prevItem.id };
      }
      return it;
    });
    
    // Rebuild tree untuk memastikan semua parentId konsisten dengan depth
    const rebuiltItems = flattenTree(buildTree(newItems));
    setFlattenedItems(rebuiltItems);
    setReordered(true);
  };

  const handleDedent = (id: string) => {
    const index = flattenedItems.findIndex(item => item.id === id);
    const item = flattenedItems[index];
    
    // Cek apakah dapat di-dedent (depth harus > 0)
    if (item.depth === 0) return;
    
    // Cari parent untuk mendapatkan parentId yang baru
    let newParentId: string | null = null;
    if (item.depth > 1) {
      // Cari item pada depth item.depth - 2
      for (let i = index - 1; i >= 0; i--) {
        if (flattenedItems[i].depth === item.depth - 2) {
          newParentId = flattenedItems[i].id;
          break;
        }
      }
    }
    
    const newItems = flattenedItems.map((it) => {
      if (it.id === id) {
        return { ...it, depth: it.depth - 1, parentId: newParentId };
      }
      return it;
    });
    
    // Rebuild tree untuk memastikan semua parentId konsisten dengan depth
    const rebuiltItems = flattenTree(buildTree(newItems));
    setFlattenedItems(rebuiltItems);
    setReordered(true);
  };

  // Helper functions untuk conditional button states
  const getCanMoveUp = (id: string): boolean => {
    const index = flattenedItems.findIndex(item => item.id === id);
    if (index <= 0) return false;
    return true;
  };

  const getCanMoveDown = (id: string): boolean => {
    const index = flattenedItems.findIndex(item => item.id === id);
    if (index >= flattenedItems.length - 1) return false;
    return true;
  };

  const getCanIndent = (id: string): boolean => {
    const index = flattenedItems.findIndex(item => item.id === id);
    if (index === 0) return false;
    const item = flattenedItems[index];
    const prevItem = flattenedItems[index - 1];
    // Dapat indent jika prev item ada di posisi sebelumnya dan current depth belum terlalu dalam
    // Prev item akan jadi parent, depth akan bertambah 1
    // Hanya bisa indent jika prev item depth >= current item depth (saudara atau lebih dangkal)
    return prevItem.depth >= item.depth;
  };

  const getCanDedent = (id: string): boolean => {
    const index = flattenedItems.findIndex(item => item.id === id);
    const item = flattenedItems[index];
    return item.depth > 0;
  };

  return (
    <div className="p-8 lg:p-12">
      <div className="max-w-4xl mx-auto max-h-screen overflow-y-auto pb-32">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Menu Navigasi Publik</h1>
            <p className="text-sm text-gray-500">
              Gunakan tombol atas/bawah untuk menggeser urutan. Gunakan tombol kiri/kanan untuk mengubah hirarki menu.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSaveOrder} 
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
              style={{ padding: '10px 20px', borderRadius: '12px' }}
            >
              <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'save'}</span>
              {saving ? 'Loading...' : 'Simpan'}
            </button>
            <button 
              onClick={() => { setEditingItem(null); setShowForm(true); }}
              className="px-5 py-2.5 bg-[#1B6B44] text-white rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-[#0F3D24] transition-colors"
              style={{ padding: '10px 20px', borderRadius: '12px' }}
            >
              <span className="material-symbols-outlined text-[18px]">add</span> Tambah Item
            </button>
          </div>
        </div>

      {/* Save Reorder Warning - simplified, removed since save button is always visible */}
      {reordered && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 mb-6 flex items-center gap-2 text-sm text-blue-800 font-medium shadow-sm">
          <span className="material-symbols-outlined text-[20px]">info</span>
          Tata letak menu telah diubah. Klik tombol &quot;Simpan&quot; untuk menyimpan perubahan.
        </div>
      )}

      {/* Editor List */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-inner min-h-[500px]">
        {loading ? (
          <div className="py-12 text-center text-gray-400 font-medium animate-pulse">Menyiapkan editor hirarki...</div>
        ) : flattenedItems.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-30 block">menu_book</span>
            Belum ada menu satupun.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={flattenedItems.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {flattenedItems.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  item={item}
                  onEdit={(i) => { setEditingItem(i as FlattenedItem); setShowForm(true); }}
                  onDelete={handleDelete}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onIndent={handleIndent}
                  onDedent={handleDedent}
                  canMoveUp={getCanMoveUp(item.id)}
                  canMoveDown={getCanMoveDown(item.id)}
                  canIndent={getCanIndent(item.id)}
                  canDedent={getCanDedent(item.id)}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeItem ? (
                <SortableMenuItem
                  item={activeItem}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onMoveUp={() => {}}
                  onMoveDown={() => {}}
                  onIndent={() => {}}
                  onDedent={() => {}}
                  canMoveUp={false}
                  canMoveDown={false}
                  canIndent={false}
                  canDedent={false}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <MenuItemForm
          initial={editingItem}
          onSave={handleSaveItem}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
          saving={saving}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 20, right: 20, background: '#fff', padding: '1rem 1.5rem',
          borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', fontSize: 14, maxWidth: 300,
          animation: 'slideUp 0.3s ease', zIndex: 100
        }}>
          {toast}
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      </div>
    </div>
  );
}
