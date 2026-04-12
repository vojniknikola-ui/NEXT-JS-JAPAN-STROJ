'use client';

import React, { useEffect, useCallback, useState } from 'react';
import Image from 'next/image';

interface LightboxImage {
  url: string;
  thumbUrl?: string;
  blurData?: string;
}

interface ImageLightboxProps {
  images: LightboxImage[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [isAnimating, setIsAnimating] = useState(false);

  const prev = useCallback(() => {
    if (isAnimating || images.length <= 1) return;
    setIsAnimating(true);
    setCurrent((c) => (c - 1 + images.length) % images.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [images.length, isAnimating]);

  const next = useCallback(() => {
    if (isAnimating || images.length <= 1) return;
    setIsAnimating(true);
    setCurrent((c) => (c + 1) % images.length);
    setTimeout(() => setIsAnimating(false), 300);
  }, [images.length, isAnimating]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    // Lock scroll
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  const img = images[current];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/92 backdrop-blur-xl" />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all hover:scale-110"
        aria-label="Zatvori"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-black/60 border border-white/10 text-xs text-neutral-300 font-semibold tracking-widest">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Main Image */}
      <div
        className="relative z-10 max-w-5xl w-full mx-4 max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative w-full max-h-[85vh] transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
          style={{ aspectRatio: '4/3' }}
        >
          <Image
            key={img.url}
            src={img.url}
            alt={`Slika ${current + 1}`}
            fill
            className="object-contain"
            sizes="90vw"
            priority
            placeholder={img.blurData ? 'blur' : 'empty'}
            blurDataURL={img.blurData || undefined}
          />
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 z-10 w-12 h-12 rounded-full bg-black/60 hover:bg-[#ff6b00] border border-white/10 hover:border-[#ff6b00] flex items-center justify-center text-white transition-all duration-200 hover:scale-110 group"
            aria-label="Prethodna slika"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 z-10 w-12 h-12 rounded-full bg-black/60 hover:bg-[#ff6b00] border border-white/10 hover:border-[#ff6b00] flex items-center justify-center text-white transition-all duration-200 hover:scale-110 group"
            aria-label="Sljedeća slika"
          >
            <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 px-4 py-2 bg-black/60 rounded-2xl border border-white/10 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => { setIsAnimating(true); setCurrent(idx); setTimeout(() => setIsAnimating(false), 300); }}
              className={`relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${idx === current ? 'border-[#ff6b00] scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
              aria-label={`Slika ${idx + 1}`}
            >
              <Image
                src={img.thumbUrl || img.url}
                alt={`Thumb ${idx + 1}`}
                fill
                className="object-cover"
                sizes="48px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
