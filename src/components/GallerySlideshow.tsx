"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
// Swiper React components and styles
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Lightbox components and styles
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { galleryApi, type GalleryItem } from "@/lib/api";

export default function GallerySlideshow() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [index, setIndex] = useState(-1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    galleryApi.getAll().then(r => {
      setImages(r.data.filter(i => i.isActive));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || images.length === 0) return null;

  return (
    <div className="w-full relative group rounded-2xl overflow-hidden shadow-2xl bg-gray-900 aspect-video md:aspect-[21/9]">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect={"fade"}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        loop={true}
        className="w-full h-full"
      >
        {images.map((img, i) => (
          <SwiperSlide key={img.id} className="relative w-full h-full cursor-pointer" onClick={() => setIndex(i)}>
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 transition-opacity duration-300" />
            
            <Image
              src={img.imageUrl}
              alt={img.title}
              fill
              className="object-cover transition-transform duration-[10000ms] ease-linear hover:scale-110"
              sizes="(max-width: 768px) 100vw, 80vw"
              priority={i === 0}
              unoptimized={img.imageUrl.startsWith('https://res.cloudinary.com')}
            />
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20">
              <h3 className="text-white text-xl md:text-2xl font-bold tracking-tight drop-shadow-lg">{img.title}</h3>
              {img.description && (
                <p className="text-gray-300 text-sm md:text-base mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 hidden md:block">{img.description}</p>
              )}
            </div>
            
            {/* View Icon Hint */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 text-white">
               <span className="material-symbols-outlined text-3xl">zoom_in</span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Fullscreen Lightbox Modal */}
      <Lightbox
        index={index}
        open={index >= 0}
        close={() => setIndex(-1)}
        slides={images.map(img => ({ src: img.imageUrl, alt: img.title }))}
        plugins={[Zoom]}
        controller={{ closeOnBackdropClick: true }}
      />
    </div>
  );
}
