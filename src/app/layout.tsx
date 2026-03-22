// src/app/layout.tsx - Root Layout
import type { Metadata } from 'next';
import './globals.css';
import { settingsApi } from '@/lib/api';

export async function generateMetadata(): Promise<Metadata> {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  let siteName = 'SD Islam Terpadu Iqra 2 Kota Bengkulu';
  let description = 'Website resmi SD Islam Terpadu Iqra 2 Kota Bengkulu. Sekolah dasar Islam terpadu yang berkomitmen menghadirkan pendidikan berkualitas berbasis nilai-nilai Islam.';
  let faviconUrl = '';

  try {
    const res = await settingsApi.getAll();
    const settings: Record<string, string> = res.data;
    if (settings.site_name) siteName = settings.site_name;
    if (settings.site_tagline) description = settings.site_tagline;
    if (settings.site_favicon) {
      faviconUrl = settings.site_favicon.startsWith('http') ? settings.site_favicon : `${API_BASE}${settings.site_favicon}`;
    }
  } catch (error) {
    console.error('Failed to fetch settings for metadata:', error);
  }

  const icons = faviconUrl ? { icon: faviconUrl, shortcut: faviconUrl, apple: faviconUrl } : undefined;

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: ['SD IT Iqra 2', 'Bengkulu', 'sekolah dasar Islam', 'PPDB', 'pendaftaran siswa baru'],
    icons,
  };
}

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
