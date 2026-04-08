# SDIT Iqra 2 Kota Bengkulu — Frontend Web & Admin Dashboard

**Sistem Informasi Terpadu SD Islam Terpadu Iqra 2 Kota Bengkulu (Next.js Frontend)**

Proyek ekosistem web modern raksasa yang mewadahi tiga sistem vital instansi sekolah: Situs Profil Publik (CMS), Portal Aplikasi Penerimaan Siswa Baru (PPDB), dan *Dashboard* Terpusat Administrator Kepegawaian (Sistem Absensi).

## 🚀 Trilogi Sistem Frontend

Antarmuka web ini dikembangkan menggunakan **Next.js 14**, **Tailwind CSS**, dan berbagai komponen UI mutakhir dan terbagi dalam 3 pilar:

### 1. Website Publik (Web CMS)
Wajah digital instansi sekolah ke khalayak umum:
- **Halaman Beranda:** Katalog berita terbaru, sambutan kepala sekolah, dan struktur organisasi.
- **Portal Profil Sekolah:** Penyajian Visi, Misi, Sejarah, Kurikulum, dan informasi akademik secara statis dan dinamis.
- **Papan Informasi:** Agenda dan liputan acara sekolah.

### 2. Portal PPDB (Penerimaan Peserta Didik Baru)
Jalur utama pendaftaran calon peserta didik secara swadaya:
- **Alur Registrasi Interaktif:** Panduan pendaftaran tahap demi tahap yang ramah anak maupun wali murid.
- **Dashboard Calon Siswa:** Laman pribadi di mana wali murid dapat melengkapi formulir biodata lengkap, melacak progres tes seleksi, *upload* file KK/Akta, dan melaporkan konfirmasi pelunasan bank.
- **Sistem Cetak Kartu:** Auto-generasi nomer pendaftaran dan kartu ujian secara interaktif.
- **Pengumuman Kelulusan:** Penyiaran hasil seleksi secara transparan pada tanggal yang ditentukan.

### 3. Dashboard Admin & Operator 
Satu *super-dashboard* untuk mengelola seluruh aspek digital (CMS, PPDB, dan Absensi):
- **Admin CMS:** Memiliki *Rich Text Editor* tertanam yang sanggup melahirkan posting berita blog, mengelola galeri, kategori, dan profil web umum tanpa *coding*.
- **Admin PPDB:** Alat sortir untuk menyaring ribuan pendaftar, memvalidasi bukti tf pembayaran, meluluskan peserta, dan mengekspor rekapitulasi ke Dinas/Excel.
- **Admin Absensi (Sinkron dengan Mobile App):** Pusat *monitoring* jam kerja pegawai GPS. Menampilkan peta radius toleransi *Geofencing* absensi, meja persetujuan izin/sakit elektronik, dan sensor rekam histori pelanggaran koordinat (*Mock Location*) mapun gagal *Face Recognition*. Dilengkapi ekspor Excel per-bulan harian lengkap dengan status *Late* (Terlambat) dan Alasan Absen.

## 📸 Tampilan Aplikasi

### Website Publik

| Halaman | Screenshot |
|---------|------------|
| Halaman Beranda | ![Halaman Beranda](./screenshots/halaman-beranda.png) |
| Halaman Berita | ![Halaman Berita](./screenshots/halaman-berita.png) |
| Halaman Galeri | ![Halaman Galeri](./screenshots/halaman-galeri.png) |

### Portal PPDB

| Halaman | Screenshot |
|---------|------------|
| Portal Utama PPDB | ![PPDB Utama](./screenshots/halaman-ppdb.png) |
| Form Registrasi | ![Form Registrasi](./screenshots/halaman-ppdb-1.png) |
| Login PPDB | ![Login PPDB](./screenshots/halaman-ppdb-login.png) |
| Register PPDB | ![Register PPDB](./screenshots/halaman-ppdb-register.png) |
| Dashboard Orang Tua | ![Dashboard Orang Tua](./screenshots/halaman-ppdb-orang-tua.png) |

### Dashboard Admin

| Halaman | Screenshot |
|---------|------------|
| Login Admin | ![Login Admin](./screenshots/halaman-admin-login.png) |
| Dashboard Utama | ![Dashboard Admin](./screenshots/halaman-dashboard-admin.png) |
| Kelola Berita | ![Kelola Berita](./screenshots/halaman-dashboard-berita.png) |
| Edit Berita | ![Edit Berita](./screenshots/halaman-dashboard-edit-berita.png) |
| Kelola Halaman | ![Kelola Halaman](./screenshots/halaman-dashboard-halaman.png) |
| Editor Halaman | ![Editor Halaman](./screenshots/halaman-dashboard-editor-halaman.png) |
| Edit Menu | ![Edit Menu](./screenshots/halaman-edit-menu.png) |
| Kelola Kategori | ![Kelola Kategori](./screenshots/halaman-dashboard-kategori.png) |
| Kelola Galeri | ![Kelola Galeri](./screenshots/halaman-dashboard-galeri.png) |
| Media Library | ![Media Library](./screenshots/halaman-dashboard-media-library.png) |
| Homepage Editor | ![Homepage Editor](./screenshots/halaman-homepage-editor.png) |
| Pengaturan Umum | ![Pengaturan Umum](./screenshots/halaman-general-settings.png) |
| Kelola User | ![Kelola User](./screenshots/halaman-manage-user.png) |
| Kelola Tahun Ajaran Aktif | ![Tahun Ajaran Aktif](./screenshots/halaman-manage-tahun-ajaran-aktif.png) |
| Dashboard Tahun Ajaran | ![Dashboard TA](./screenshots/halaman-dashboard-manage-tahun-ajaran.png) |
| Kelola PPDB | ![Kelola PPDB](./screenshots/halaman-dashboard-manage-ppdb.png) |
| Jadwal Observasi | ![Jadwal Observasi](./screenshots/halaman-dashboard-jadwal-observasi.png) |
| Kelola Kehadiran | ![Kelola Kehadiran](./screenshots/halaman-dashboard-manage-kehadiran.png) |
| Kelola Lokasi Absensi | ![Kelola Lokasi](./screenshots/halaman-manage-lokasi.png) |
| Kelola Hari Libur | ![Hari Libur](./screenshots/halaman-dashboard-manage-hari-libur.png) |
| Kelola Kelas | ![Kelas](./screenshots/halaman-dashboard-manage-kelas.png) |
| Laporan Kehadiran | ![Laporan Kehadiran](./screenshots/halaman-laporan-kehadiran.png) |
| Auto Post Instagram | ![Auto Post IG](./screenshots/halaman-autopost-ig.png) |

## 💻 Panduan Menjalankan Frontend

1. Node.js minimal v20-v24 telah terinstal.
2. Jelajahi folder ini di dalam monorepo: `cd apps/frontend`
3. Pasang utilitas UI: `npm install`
4. Jalankan mode interaktif (*hot-reloading*): `npm run dev`
5. Aplikasi akan berjalan statis di *port* default `http://localhost:3000`.

> **PERHATIAN INTEGRASI API:** Tanpa menghidupkan repositori *backend* (`sditiqra2-backend`), tampilan metrik dasbor admin akan terpapar memuat tanpa ujung (*infinite loading*), karena antarmuka ini murni mengkonsumsi data AXIOS internal dari `http://localhost:4000/api`.