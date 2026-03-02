// src/app/layout.tsx - Root Layout
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SD Islam Terpadu Iqra 2 Kota Bengkulu',
    template: '%s | SD IT Iqra 2 Bengkulu',
  },
  description: 'Website resmi SD Islam Terpadu Iqra 2 Kota Bengkulu. Sekolah dasar Islam terpadu yang berkomitmen menghadirkan pendidikan berkualitas berbasis nilai-nilai Islam.',
  keywords: ['SD IT Iqra 2', 'Bengkulu', 'sekolah dasar Islam', 'PPDB', 'pendaftaran siswa baru'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
