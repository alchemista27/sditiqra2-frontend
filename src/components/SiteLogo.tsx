'use client';
// src/components/SiteLogo.tsx - Reusable logo component that fetches from settings
import { useState, useEffect } from 'react';
import { settingsApi } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface SiteLogoProps {
  size?: number;
  borderRadius?: number;
  showText?: boolean;
  textColor?: string;
  subTextColor?: string;
  className?: string;
}

export default function SiteLogo({ 
  size = 40, 
  borderRadius = 10, 
  showText = true,
  textColor = '#fff',
  subTextColor = 'rgba(255,255,255,0.6)',
  className = ''
}: SiteLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('SD IT Iqra 2');

  useEffect(() => {
    settingsApi.getAll()
      .then(res => {
        const settings = res.data;
        if (settings.site_name) setSiteName(settings.site_name);
        if (settings.site_logo) {
          const url = settings.site_logo.startsWith('http') 
            ? settings.site_logo 
            : `${API_BASE}${settings.site_logo}`;
          setLogoUrl(url);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className={className}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={logoUrl} 
          alt={siteName} 
          style={{ 
            width: size, 
            height: size, 
            borderRadius, 
            objectFit: 'contain',
            background: '#fff',
            padding: 2,
          }} 
        />
      ) : (
        <div style={{
          width: size,
          height: size,
          borderRadius,
          background: 'linear-gradient(135deg, #2D9164, #C9A84C)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: size * 0.4,
          color: '#fff',
        }}>
          I2
        </div>
      )}
      {showText && (
        <div>
          <div style={{ fontWeight: 700, fontSize: size * 0.35, lineHeight: 1.2, color: textColor }}>
            {siteName}
          </div>
          <div style={{ fontSize: size * 0.275, color: subTextColor }}>
            Kota Bengkulu
          </div>
        </div>
      )}
    </div>
  );
}

// Hook untuk mendapatkan logo URL dan site name
export function useSiteSettings() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [siteName, setSiteName] = useState('SD IT Iqra 2');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    settingsApi.getAll()
      .then(res => {
        const settings = res.data;
        if (settings.site_name) setSiteName(settings.site_name);
        if (settings.site_logo) {
          const url = settings.site_logo.startsWith('http') 
            ? settings.site_logo 
            : `${API_BASE}${settings.site_logo}`;
          setLogoUrl(url);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  return { logoUrl, siteName, loaded };
}
