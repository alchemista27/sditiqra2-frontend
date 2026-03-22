'use client';
// src/app/ppdb/portal/formulir/page.tsx
// Formulir biodata siswa (Tab 1) dan biodata orang tua (Tab 2)
import { useEffect, useState } from 'react';
import { ppdbParentApi } from '@/lib/api';

const PARENT_TOKEN_KEY = 'sditiqra2_parent_token';

const TRANSPORT_OPTIONS = ['Jalan Kaki', 'Sepeda', 'Sepeda Motor', 'Mobil', 'Antar Jemput Sekolah', 'Angkutan Umum', 'Lainnya'];
const RELIGION_OPTIONS = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
const INCOME_OPTIONS = [
  { val: '<1000000', label: 'Di bawah Rp 1.000.000' },
  { val: '1000000-3000000', label: 'Rp 1.000.000 – Rp 3.000.000' },
  { val: '3000000-5000000', label: 'Rp 3.000.000 – Rp 5.000.000' },
  { val: '5000000-10000000', label: 'Rp 5.000.000 – Rp 10.000.000' },
  { val: '>10000000', label: 'Di atas Rp 10.000.000' },
];

export default function FormulirPage() {
  const [activeTab, setActiveTab] = useState<'siswa' | 'ortu'>('siswa');
  const [registration, setRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [student, setStudent] = useState({
    studentName: '', nickName: '', gender: '', birthPlace: '', birthDate: '',
    nisn: '', religion: '', address: '', transport: '', siblingCount: '',
    hobby: '', aspiration: '', hasSpecialNeeds: false, specialNeedsDesc: '',
  });

  const [parentData, setParentData] = useState({
    fatherName: '', fatherNik: '', fatherJob: '', fatherIncome: '', fatherPhone: '', fatherAddress: '',
    motherName: '', motherNik: '', motherJob: '', motherIncome: '', motherPhone: '', motherAddress: '',
    guardianName: '', guardianNik: '', guardianJob: '', guardianIncome: '', guardianPhone: '', guardianRelation: '',
  });

  const [showGuardian, setShowGuardian] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(PARENT_TOKEN_KEY);
    if (!token) return;
    setLoading(true);
    ppdbParentApi.getMyRegistration(token).then(r => {
      const reg = r.data;
      setRegistration(reg);
      if (reg) {
        setStudent({
          studentName: reg.studentName || '', nickName: reg.nickName || '',
          gender: reg.gender || '', birthPlace: reg.birthPlace || '',
          birthDate: reg.birthDate ? reg.birthDate.split('T')[0] : '',
          nisn: reg.nisn || '', religion: reg.religion || '', address: reg.address || '',
          transport: reg.transport || '', siblingCount: reg.siblingCount ?? '',
          hobby: reg.hobby || '', aspiration: reg.aspiration || '',
          hasSpecialNeeds: reg.hasSpecialNeeds || false, specialNeedsDesc: reg.specialNeedsDesc || '',
        });
        setParentData({
          fatherName: reg.fatherName || '', fatherNik: reg.fatherNik || '',
          fatherJob: reg.fatherJob || '', fatherIncome: reg.fatherIncome || '',
          fatherPhone: reg.fatherPhone || '', fatherAddress: reg.fatherAddress || '',
          motherName: reg.motherName || '', motherNik: reg.motherNik || '',
          motherJob: reg.motherJob || '', motherIncome: reg.motherIncome || '',
          motherPhone: reg.motherPhone || '', motherAddress: reg.motherAddress || '',
          guardianName: reg.guardianName || '', guardianNik: reg.guardianNik || '',
          guardianJob: reg.guardianJob || '', guardianIncome: reg.guardianIncome || '',
          guardianPhone: reg.guardianPhone || '', guardianRelation: reg.guardianRelation || '',
        });
        if (reg.guardianName) setShowGuardian(true);
      }
    }).finally(() => setLoading(false));
  }, []);

  const isLocked = registration && ['FORM_SUBMITTED', 'ADMIN_REVIEW', 'ADMIN_PASSED',
    'CLINIC_LETTER_UPLOADED', 'OBSERVATION_SCHEDULED', 'OBSERVATION_DONE', 'ACCEPTED'].includes(registration.status);

  const canFill = registration && ['PAYMENT_VERIFIED'].includes(registration.status);

  const saveStudent = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem(PARENT_TOKEN_KEY)!;
      const res = await ppdbParentApi.saveStudentForm(token, { ...student, siblingCount: student.siblingCount ? Number(student.siblingCount) : undefined }) as any;
      if (res.success) { setSuccess('Biodata siswa berhasil disimpan.'); setRegistration(res.data); }
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const saveParent = async () => {
    setSaving(true); setError(''); setSuccess('');
    try {
      const token = localStorage.getItem(PARENT_TOKEN_KEY)!;
      const res = await ppdbParentApi.saveParentForm(token, parentData) as any;
      if (res.success) { setSuccess('Biodata orang tua berhasil disimpan.'); setRegistration(res.data); }
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const inputStyle = (disabled = false): React.CSSProperties => ({
    width: '100%', padding: '0.7rem 1rem', borderRadius: 10,
    border: '1.5px solid #E5E7EB', fontSize: 14, outline: 'none', boxSizing: 'border-box',
    background: disabled ? '#F9FAFB' : '#fff', color: disabled ? '#9CA3AF' : '#111827',
    cursor: disabled ? 'not-allowed' : 'text',
  });

  const Field = ({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) => (
    <div>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
        {label} {req && <span style={{ color: '#DC2626' }}>*</span>}
      </label>
      {children}
    </div>
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#1B6B44', fontWeight: 600 }}>Memuat formulir...</div>;

  if (!canFill && !isLocked) return (
    <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 16, padding: '2rem', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: '1rem' }}>🔒</div>
      <div style={{ fontWeight: 700, color: '#92400E', fontSize: 17 }}>Formulir Belum Bisa Diakses</div>
      <div style={{ color: '#78350F', fontSize: 14, marginTop: '0.5rem' }}>
        Selesaikan pembayaran dan tunggu verifikasi admin terlebih dahulu.
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '0.35rem' }}>Formulir Pendaftaran</h2>
      <p style={{ color: '#6B7280', marginBottom: '1.5rem', fontSize: 14 }}>
        {isLocked ? 'Formulir sudah disubmit dan tidak dapat diubah.' : 'Isi semua data yang diperlukan lalu simpan setiap tab sebelum upload berkas.'}
      </p>

      {isLocked && (
        <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 12, padding: '0.875rem 1.25rem', marginBottom: '1.5rem', color: '#065F46', fontSize: 14 }}>
          ✅ Formulir berhasil disubmit. Data tidak dapat diubah.
        </div>
      )}

      {success && <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: '#065F46', fontSize: 14 }}>{success}</div>}
      {error && <div style={{ background: '#FEF2F2', borderRadius: 10, padding: '0.875rem', marginBottom: '1rem', color: '#DC2626', fontSize: 14 }}>{error}</div>}

      {/* Tab */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#F3F4F6', borderRadius: 12, padding: '0.35rem' }}>
        {(['siswa', 'ortu'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '0.65rem', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: activeTab === tab ? '#fff' : 'transparent',
            fontWeight: activeTab === tab ? 700 : 400, fontSize: 14,
            color: activeTab === tab ? '#111827' : '#6B7280',
            boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s',
          }}>
            {tab === 'siswa' ? '👦 Biodata Calon Siswa' : '👨‍👩‍👧 Biodata Orang Tua / Wali'}
          </button>
        ))}
      </div>

      {/* Tab Siswa */}
      {activeTab === 'siswa' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Nama Lengkap" req><input id="f-studentName" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={student.studentName} onChange={e => setStudent(s => ({ ...s, studentName: e.target.value }))} placeholder="Nama lengkap sesuai akte" /></Field>
            <Field label="Nama Panggilan" req><input id="f-nickName" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={student.nickName} onChange={e => setStudent(s => ({ ...s, nickName: e.target.value }))} placeholder="Nama panggilan" /></Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Jenis Kelamin" req>
              <select id="f-gender" style={{ ...inputStyle(!!isLocked), appearance: 'none' }} disabled={!!isLocked} value={student.gender} onChange={e => setStudent(s => ({ ...s, gender: e.target.value }))}>
                <option value="">Pilih...</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </Field>
            <Field label="Agama" req>
              <select id="f-religion" style={{ ...inputStyle(!!isLocked), appearance: 'none' }} disabled={!!isLocked} value={student.religion} onChange={e => setStudent(s => ({ ...s, religion: e.target.value }))}>
                <option value="">Pilih...</option>
                {RELIGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Tempat Lahir" req><input id="f-birthPlace" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={student.birthPlace} onChange={e => setStudent(s => ({ ...s, birthPlace: e.target.value }))} placeholder="Kota/kabupaten" /></Field>
            <Field label="Tanggal Lahir" req><input id="f-birthDate" type="date" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={student.birthDate} onChange={e => setStudent(s => ({ ...s, birthDate: e.target.value }))} /></Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="NISN"><input id="f-nisn" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={student.nisn} onChange={e => setStudent(s => ({ ...s, nisn: e.target.value }))} placeholder="Nomor Induk Siswa Nasional" /></Field>
            <Field label="Jumlah Saudara Kandung"><input id="f-siblings" type="number" min="0" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={student.siblingCount} onChange={e => setStudent(s => ({ ...s, siblingCount: e.target.value }))} placeholder="0" /></Field>
          </div>

          <Field label="Alamat Lengkap" req>
            <textarea id="f-address" rows={3} style={{ ...inputStyle(!!isLocked), resize: 'vertical' }} disabled={!!isLocked} value={student.address} onChange={e => setStudent(s => ({ ...s, address: e.target.value }))} placeholder="Alamat lengkap tempat tinggal siswa" />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Field label="Alat Transportasi">
              <select id="f-transport" style={{ ...inputStyle(!!isLocked), appearance: 'none' }} disabled={!!isLocked} value={student.transport} onChange={e => setStudent(s => ({ ...s, transport: e.target.value }))}>
                <option value="">Pilih...</option>
                {TRANSPORT_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Hobi"><input id="f-hobby" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={student.hobby} onChange={e => setStudent(s => ({ ...s, hobby: e.target.value }))} placeholder="Hobi siswa" /></Field>
          </div>

          <Field label="Cita-cita">
            <input id="f-aspiration" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={student.aspiration} onChange={e => setStudent(s => ({ ...s, aspiration: e.target.value }))} placeholder="Cita-cita siswa" />
          </Field>

          <div style={{ background: '#F9FAFB', borderRadius: 12, padding: '1rem 1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
              <input id="f-specialNeeds" type="checkbox" checked={student.hasSpecialNeeds} disabled={!!isLocked} onChange={e => setStudent(s => ({ ...s, hasSpecialNeeds: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#1B6B44' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#374151' }}>Siswa berkebutuhan khusus (ABK)</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Centang jika calon siswa memiliki kebutuhan khusus</div>
              </div>
            </label>
            {student.hasSpecialNeeds && (
              <textarea id="f-specialDesc" rows={2} style={{ ...inputStyle(!!isLocked), marginTop: '0.75rem', resize: 'none' }} disabled={!!isLocked} value={student.specialNeedsDesc} onChange={e => setStudent(s => ({ ...s, specialNeedsDesc: e.target.value }))} placeholder="Jelaskan kebutuhan khusus siswa..." />
            )}
          </div>

          {!isLocked && (
            <button id="save-student-btn" onClick={saveStudent} disabled={saving} style={{
              padding: '0.875rem', borderRadius: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #1B6B44, #2D9164)',
              color: '#fff', fontWeight: 700, fontSize: 15,
            }}>
              {saving ? 'Menyimpan...' : 'Simpan Biodata Siswa'}
            </button>
          )}
        </div>
      )}

      {/* Tab Orang Tua */}
      {activeTab === 'ortu' && (
        <div style={{ background: '#fff', borderRadius: 16, padding: '1.75rem', border: '1px solid #E5E7EB' }}>
          {/* Ayah */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontWeight: 700, color: '#1B6B44', fontSize: 15, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              👨 Data Ayah
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Nama Lengkap" req><input id="f-fatherName" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.fatherName} onChange={e => setParentData(p => ({ ...p, fatherName: e.target.value }))} placeholder="Nama lengkap ayah" /></Field>
                <Field label="NIK" req><input id="f-fatherNik" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.fatherNik} onChange={e => setParentData(p => ({ ...p, fatherNik: e.target.value }))} placeholder="16 digit NIK" maxLength={16} /></Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Pekerjaan" req><input id="f-fatherJob" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.fatherJob} onChange={e => setParentData(p => ({ ...p, fatherJob: e.target.value }))} placeholder="Pekerjaan ayah" /></Field>
                <Field label="Penghasilan">
                  <select id="f-fatherIncome" style={{ ...inputStyle(!!isLocked), appearance: 'none' }} disabled={!!isLocked} value={parentData.fatherIncome} onChange={e => setParentData(p => ({ ...p, fatherIncome: e.target.value }))}>
                    <option value="">Pilih range...</option>
                    {INCOME_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="No. HP"><input id="f-fatherPhone" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.fatherPhone} onChange={e => setParentData(p => ({ ...p, fatherPhone: e.target.value }))} placeholder="08xxxxxxxxxx" /></Field>
                <Field label="Alamat"><input id="f-fatherAddr" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.fatherAddress} onChange={e => setParentData(p => ({ ...p, fatherAddress: e.target.value }))} placeholder="Alamat ayah (jika berbeda)" /></Field>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #F3F4F6', margin: '0 0 2rem' }} />

          {/* Ibu */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontWeight: 700, color: '#1B6B44', fontSize: 15, marginBottom: '1rem' }}>👩 Data Ibu</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Nama Lengkap" req><input id="f-motherName" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.motherName} onChange={e => setParentData(p => ({ ...p, motherName: e.target.value }))} placeholder="Nama lengkap ibu" /></Field>
                <Field label="NIK" req><input id="f-motherNik" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.motherNik} onChange={e => setParentData(p => ({ ...p, motherNik: e.target.value }))} placeholder="16 digit NIK" maxLength={16} /></Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Pekerjaan" req><input id="f-motherJob" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.motherJob} onChange={e => setParentData(p => ({ ...p, motherJob: e.target.value }))} placeholder="Pekerjaan ibu" /></Field>
                <Field label="Penghasilan">
                  <select id="f-motherIncome" style={{ ...inputStyle(!!isLocked), appearance: 'none' }} disabled={!!isLocked} value={parentData.motherIncome} onChange={e => setParentData(p => ({ ...p, motherIncome: e.target.value }))}>
                    <option value="">Pilih range...</option>
                    {INCOME_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="No. HP"><input id="f-motherPhone" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.motherPhone} onChange={e => setParentData(p => ({ ...p, motherPhone: e.target.value }))} placeholder="08xxxxxxxxxx" /></Field>
                <Field label="Alamat"><input id="f-motherAddr" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.motherAddress} onChange={e => setParentData(p => ({ ...p, motherAddress: e.target.value }))} placeholder="Alamat ibu (jika berbeda)" /></Field>
              </div>
            </div>
          </div>

          {/* Wali opsional */}
          <div style={{ marginBottom: '1.5rem' }}>
            {!showGuardian ? (
              <button onClick={() => setShowGuardian(true)} disabled={!!isLocked} style={{ background: '#F3F4F6', border: 'none', borderRadius: 10, padding: '0.65rem 1.25rem', cursor: 'pointer', fontSize: 14, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ➕ Tambah Data Wali (Opsional)
              </button>
            ) : (
              <>
                <div style={{ fontWeight: 700, color: '#1B6B44', fontSize: 15, marginBottom: '1rem' }}>👤 Data Wali (Opsional)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="Nama Wali"><input id="f-guardianName" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.guardianName} onChange={e => setParentData(p => ({ ...p, guardianName: e.target.value }))} placeholder="Nama lengkap wali" /></Field>
                    <Field label="Hubungan"><input id="f-guardianRel" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.guardianRelation} onChange={e => setParentData(p => ({ ...p, guardianRelation: e.target.value }))} placeholder="Kakak, paman, bibi, dll." /></Field>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field label="NIK Wali"><input id="f-guardianNik" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.guardianNik} onChange={e => setParentData(p => ({ ...p, guardianNik: e.target.value }))} placeholder="NIK wali" /></Field>
                    <Field label="Pekerjaan Wali"><input id="f-guardianJob" style={inputStyle(!!isLocked)} disabled={!!isLocked} value={parentData.guardianJob} onChange={e => setParentData(p => ({ ...p, guardianJob: e.target.value }))} placeholder="Pekerjaan wali" /></Field>
                  </div>
                </div>
              </>
            )}
          </div>

          {!isLocked && (
            <button id="save-parent-btn" onClick={saveParent} disabled={saving} style={{
              width: '100%', padding: '0.875rem', borderRadius: 12, border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              background: saving ? '#9CA3AF' : 'linear-gradient(135deg, #1B6B44, #2D9164)',
              color: '#fff', fontWeight: 700, fontSize: 15,
            }}>
              {saving ? 'Menyimpan...' : 'Simpan Biodata Orang Tua / Wali'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
