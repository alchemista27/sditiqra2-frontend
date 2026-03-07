# Sistem Absensi GPS — Admin Dashboard (Frontend)

Sistem Informasi Manajemen Presensi dan Dashboard Admin berbasis antarmuka web interaktif untuk memantau performa kehadiran harian guru dan staf di SD Islam Terpadu Iqra 2 Kota Bengkulu.

Sistem ini terhubung langsung secara *real-time* dengan Core API Backend dan memberikan kontrol penuh kepada Kepala Sekolah serta tenaga administrasi (TU) untuk melihat grafik statistik mingguan maupun harian, mengelola persetujuan izin/cuti karyawan, mendefinisikan batas area radius lokasi absensi, serta mencatat daftar hari libur sekolah.

## Fitur Utama

- **Pusat Rekapitulasi (Dashboard):** Visualisasi langsung berupa *Card* ringkasan yang menunjukkan berapa banyak orang yg tepat waktu, izin, maupun mangkir di hari ini. Menampilkan tabel guru-guru yang hadir.
- **Geofencing Configurator:** Sebuah antarmuka kontrol pusat tempat Admin mendefinisikan koordinat persis letak titik pusat sekolah, toleransi jarak maksimal radius absen (dalam hitungan meter), hingga manajemen pembatasan rentang waktu batas "terlambat" (*Late Threshold*). 
- **Verifikasi Izin/Cuti:** Sebuah *workspace* tempat persetujuan (*approval*). Admin menerima foto surat/bukti izin yang diunggah karyawan dari *mobile app*, memeriksa alasannya, lalu menekan tombol Setuju atau Tolak secara dinamis.
- **Log Anomali Security:** Jika seorang karyawan terdeteksi melakukan penyimpangan keamanan aplikasi pendeteksi *Fake GPS Location* (mock GPS) melalui aplikasi HP-nya atau melakukan absensi di luar pagar/radius sekolah, namanya akan tertangkap basah di Log Inspeksi Anomali otomatis di dashboard admin ini.
- **CRUD Hari Libur Kalender:** Kontrol *National Holiday* & Libur spesifik internal sekolah agar aplikasi guru/karyawan mengetahui tanggal merah otomatis.
- **Ekspor Excel Canggih:** Generator instan Spreadsheet dengan 3 tab *sheet* lengkap per bulan yang menampilkan kalkulasi presensi total (hadir/terlambat), detail absen harian (tanggal 1-31), dan tab log peringatan inspeksi.

## Stack Teknologi (Frontend Vercel Ready)

- Framework Utama: Next.js (React Server Components minimal)
- Desain & Styling: Tailwind CSS & Material Symbols Icons (Google Font)
- Data Fetcher & Caching: Axios API Client terpisahkan
- Modul Kalender: Input HTML5 asli terakselerasi
- Navigasi: Sistem Tata Letak *Sidebar* modern yang ringkas

## Setup Developer (Lokal)

1. Syarat Utama: Sistem harus berjalan di node env v20-v24.
2. Akses folder ini di monorepo: `cd apps/frontend`
3. Ketik perintah wajib: `npm install`
4. Jalankan *hot-reloading* environment: `npm run dev`
5. Buka `http://localhost:3000` di *browser* Anda.

> Perhatian: Web ini secara bawaan (*default*) mengirim request AXIOS ke tautan `http://localhost:4000/api` sehingga Anda harus paralel menghidupkan repositori `sditiqra2-backend` terlebih dahulu agar tidak terjadi *infinite loading* pada pengambilan data grafik *dashboard*.
