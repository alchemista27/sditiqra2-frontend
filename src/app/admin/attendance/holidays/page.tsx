'use client';
import { useState, useEffect } from 'react';
import { holidayApi } from '@/lib/api';
import { getToken } from '@/lib/auth';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ date: '', name: '', type: 'SCHOOL' as string, isRecurring: false });
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => { fetchHolidays(); }, [yearFilter]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await holidayApi.getAll(getToken() || '', { year: yearFilter });
      setHolidays(res.data);
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.date || !form.name) { alert('Tanggal dan nama wajib diisi'); return; }
    setSaving(true);
    try {
      if (editId) {
        await holidayApi.update(getToken() || '', editId, form);
      } else {
        await holidayApi.create(getToken() || '', form);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ date: '', name: '', type: 'SCHOOL', isRecurring: false });
      fetchHolidays();
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus hari libur ini?')) return;
    try {
      await holidayApi.remove(getToken() || '', id);
      fetchHolidays();
    } catch (err: any) { alert(err.message); }
  };

  const handleEdit = (h: any) => {
    setEditId(h.id);
    setForm({ date: h.date.split('T')[0], name: h.name, type: h.type, isRecurring: h.isRecurring });
    setShowForm(true);
  };

  const handleSeedNational = async () => {
    if (!confirm(`Seed hari libur nasional Indonesia tahun ${yearFilter}?`)) return;
    setSeeding(true);
    try {
      await holidayApi.seedNational(getToken() || '', yearFilter);
      fetchHolidays();
    } catch (err: any) { alert(err.message); }
    finally { setSeeding(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const inputStyle = { width: '100%', padding: '0.65rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, background: '#fff', outline: 'none' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>Hari Libur</h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginTop: '0.25rem' }}>Kelola hari libur nasional dan libur sekolah</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14 }}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={handleSeedNational} disabled={seeding} style={{ padding: '0.5rem 1rem', background: '#EDE9FE', color: '#5B21B6', border: '1px solid #C4B5FD', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            {seeding ? '...' : '🇮🇩 Seed Libur Nasional'}
          </button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ date: '', name: '', type: 'SCHOOL', isRecurring: false }); }} style={{ padding: '0.5rem 1rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            + Tambah Libur
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 420 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>{editId ? 'Edit Hari Libur' : 'Tambah Hari Libur'}</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div><label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: '0.35rem', display: 'block' }}>Tanggal</label>
                <input type="date" style={inputStyle} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div><label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: '0.35rem', display: 'block' }}>Nama</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Contoh: Libur Semester 1" /></div>
              <div><label style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: '0.35rem', display: 'block' }}>Tipe</label>
                <select style={inputStyle} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="SCHOOL">Libur Sekolah</option>
                  <option value="NATIONAL">Libur Nasional</option>
                </select></div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowForm(false)} style={{ padding: '0.5rem 1.25rem', background: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Batal</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '0.5rem 1.25rem', background: '#1B6B44', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Memuat data...</div>
      ) : holidays.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280', background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#D1D5DB' }}>event_busy</span>
          <p style={{ marginTop: '0.5rem' }}>Belum ada hari libur untuk tahun {yearFilter}</p>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>Klik &quot;Seed Libur Nasional&quot; untuk mengimpor otomatis</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <tr>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Tanggal</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#6B7280', fontWeight: 600 }}>Nama</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Tipe</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#6B7280', fontWeight: 600 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 500 }}>{formatDate(h.date)}</td>
                  <td style={{ padding: '0.85rem 1rem', color: '#374151' }}>{h.name}</td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: 11, fontWeight: 600, background: h.type === 'NATIONAL' ? '#DBEAFE' : '#FEF3C7', color: h.type === 'NATIONAL' ? '#1E40AF' : '#92400E' }}>
                      {h.type === 'NATIONAL' ? '🇮🇩 Nasional' : '🏫 Sekolah'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(h)} style={{ padding: '0.3rem 0.6rem', background: '#EDE9FE', color: '#5B21B6', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDelete(h.id)} style={{ padding: '0.3rem 0.6rem', background: '#FEE2E2', color: '#991B1B', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #E5E7EB', fontSize: 12, color: '#6B7280' }}>Total: {holidays.length} hari libur</div>
        </div>
      )}
    </div>
  );
}
