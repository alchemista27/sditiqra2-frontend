"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { postsApi } from "@/lib/api";

interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export default function NewsTicker() {
  const [newsList, setNewsList] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [locationName, setLocationName] = useState<string>("Bengkulu"); // Default location
  const [loadingPrayer, setLoadingPrayer] = useState<boolean>(true);

  // 1. Fetch Latest News
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await postsApi.getAll({ limit: "5", status: "PUBLISHED" });
        if (res?.data) setNewsList(res.data);
      } catch (error) {
        console.error("Failed to fetch news ticker data", error);
      }
    };
    fetchNews();
  }, []);

  // 2. Fetch Geolocation and Prayer Times
  useEffect(() => {
    // Parameter default Bengkulu Coordinates (SDIT Iqra 2) if geolocation fails/denied
    const defaultLat = -3.8004; 
    const defaultLng = 102.2562;

    const fetchPrayerTimes = async (lat: number, lng: number) => {
      try {
        setLoadingPrayer(true);
        // Using Aladhan API for accurate Muslim prayer times
        const date = new Date();
        const apiStr = `https://api.aladhan.com/v1/timings/${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}?latitude=${lat}&longitude=${lng}&method=11`; // Method 11 is Majlis Ugama Islam Singapura, close enough to Muhammadiyah/Kemenag
        
        const response = await fetch(apiStr);
        const data = await response.json();
        
        if (data && data.data && data.data.timings) {
          setPrayerTimes({
            Fajr: data.data.timings.Fajr,
            Dhuhr: data.data.timings.Dhuhr,
            Asr: data.data.timings.Asr,
            Maghrib: data.data.timings.Maghrib,
            Isha: data.data.timings.Isha,
          });
        }
      } catch (error) {
        console.error("Error fetching prayer times:", error);
      } finally {
        setLoadingPrayer(false);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success getting user location
          setLocationName("Lokasi Anda");
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          // Fallback to Bengkulu if denied or error
          console.warn("Geolocation denied or error, fallback to Bengkulu.", error);
          setLocationName("Bengkulu");
          fetchPrayerTimes(defaultLat, defaultLng);
        },
        { timeout: 10000 }
      );
    } else {
      // Browser doesn't support geolocation
      setLocationName("Bengkulu");
      fetchPrayerTimes(defaultLat, defaultLng);
    }
  }, []);

  // Getting next prayer time to highlight it
  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const schedule = [
      { name: 'Subuh', time: parseTime(prayerTimes.Fajr), display: prayerTimes.Fajr },
      { name: 'Dzuhur', time: parseTime(prayerTimes.Dhuhr), display: prayerTimes.Dhuhr },
      { name: 'Ashar', time: parseTime(prayerTimes.Asr), display: prayerTimes.Asr },
      { name: 'Maghrib', time: parseTime(prayerTimes.Maghrib), display: prayerTimes.Maghrib },
      { name: 'Isya', time: parseTime(prayerTimes.Isha), display: prayerTimes.Isha },
    ];

    for (let i = 0; i < schedule.length; i++) {
        if (currentTime < schedule[i].time) {
            return schedule[i];
        }
    }
    // If it's past Isha, next is Fajr tomorrow
    return { name: 'Subuh', time: parseTime(prayerTimes.Fajr), display: prayerTimes.Fajr, isTomorrow: true };
  };

  const nextPrayer = getNextPrayer();

  return (
    <div className="fixed bottom-0 left-0 w-full z-[9999] flex flex-col md:flex-row bg-[#0F3D24] text-white shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
      
      {/* LEFT SIDE: Running Text News Ticker */}
      <div className="flex-1 flex items-center overflow-hidden border-b md:border-b-0 md:border-r border-white/10 h-9 md:h-10">
        <div className="bg-[#C9A84C] text-[#0F3D24] px-4 py-2 h-full flex items-center justify-center font-bold text-xs whitespace-nowrap z-10 uppercase tracking-wider shadow-lg shrink-0" style={{ padding: '0 12px' }}>
          <span className="material-symbols-outlined text-[18px] mr-1" style={{ marginRight: '4px' }}>campaign</span>
          Info
        </div>
        
        {/* The Marquee Container */}
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
            {newsList.length > 0 ? (
                <div className="animate-marquee hover:[animation-play-state:paused] whitespace-nowrap flex items-center gap-10 absolute left-0 pr-10">
                    {newsList.map((news, idx) => (
                    <Link key={idx} href={`/berita/${news.slug}`} className="hover:text-[#F2D98A] transition-colors flex items-center text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#C9A84C] mr-3 inline-block shadow-sm" style={{ marginRight: '8px' }}></span>
                        {news.title}
                    </Link>
                    ))}
                    {/* Duplicate for seamless looping marquee */}
                    {newsList.map((news, idx) => (
                    <Link key={`dup-${idx}`} href={`/berita/${news.slug}`} className="hover:text-[#F2D98A] transition-colors flex items-center text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-[#C9A84C] mr-3 inline-block shadow-sm" style={{ marginRight: '8px' }}></span>
                        {news.title}
                    </Link>
                    ))}
                </div>
            ) : (
                <span className="text-gray-400 text-base ml-6 italic">Memuat berita terbaru...</span>
            )}
        </div>
      </div>

      {/* RIGHT SIDE: Prayer Times */}
      <div className="px-4 py-2 md:py-0 md:h-10 flex flex-row items-center justify-center md:justify-start gap-4 md:gap-5 w-full md:w-auto overflow-x-auto hide-scrollbar whitespace-nowrap border-t md:border-t-0 border-white/5">
        
        <div className="flex items-center text-[#F2D98A] shrink-0 opacity-90">
          <span className="material-symbols-outlined text-[16px] mr-1">location_on</span>
          <span className="font-medium text-xs tracking-wide">{locationName}</span>
        </div>

        <div className="hidden md:block w-px h-4 bg-white/20 mx-1"></div> {/* Subtle divider */}

        {loadingPrayer ? (
          <span className="text-white/50 italic px-2 text-xs">Memuat jadwal...</span>
        ) : prayerTimes ? (
          <>
            <PrayerTimeBlock name="Subuh" time={prayerTimes.Fajr} isNext={nextPrayer?.name === 'Subuh'} />
            <PrayerTimeBlock name="Dzuhur" time={prayerTimes.Dhuhr} isNext={nextPrayer?.name === 'Dzuhur'} />
            <PrayerTimeBlock name="Ashar" time={prayerTimes.Asr} isNext={nextPrayer?.name === 'Ashar'} />
            <PrayerTimeBlock name="Maghrib" time={prayerTimes.Maghrib} isNext={nextPrayer?.name === 'Maghrib'} />
            <PrayerTimeBlock name="Isya" time={prayerTimes.Isha} isNext={nextPrayer?.name === 'Isya'} />
          </>
        ) : (
          <span className="text-red-300 text-xs">Gagal memuat jadwal</span>
        )}

      </div>
    </div>
  );
}

// Subcomponent for individual prayer times
function PrayerTimeBlock({ name, time, isNext }: { name: string; time: string; isNext: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 shrink-0 transition-colors ${isNext ? 'text-[#F2D98A]' : 'text-white/70'}`}>
      <span className={`text-[10px] uppercase font-bold tracking-wider ${isNext ? 'text-[#F2D98A]/90' : 'text-white/40'}`}>{name}</span>
      <span className={`text-sm ${isNext ? 'font-bold' : 'font-medium'}`}>{time}</span>
      {isNext && <span className="w-1.5 h-1.5 rounded-full bg-[#F2D98A] animate-pulse ml-0.5 shadow-[0_0_8px_rgba(242,217,138,0.8)]" />}
    </div>
  );
}
