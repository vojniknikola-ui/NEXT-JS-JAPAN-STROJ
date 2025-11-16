'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page, SparePart } from '@/types';

export default function Home() {
  const router = useRouter();
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Start hero image load timer
    console.time('Hero image load');

    // Load spare parts from API
    console.log('Loading spare parts from home page...');
    console.time('Home page data fetch');
    setLoading(true);
    setError(null);
    fetch('/api/parts?active=true')
      .then(res => {
        console.log('Home page parts response status:', res.status);
        if (!res.ok) {
          throw new Error(`Greška pri učitavanju dijelova: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.timeEnd('Home page data fetch');
        console.log('Home page loaded parts:', data.length, 'items');
        setSpareParts(data);
        setLoading(false);
      })
      .catch(error => {
        console.timeEnd('Home page data fetch');
        console.error('Error loading spare parts:', error);
        setError(error instanceof Error ? error.message : 'Došlo je do greške pri učitavanju podataka');
        setLoading(false);
      });
  }, []);

  const handleSelectProduct = (part: SparePart) => {
    router.push(`/product/${part.id}`);
  };

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden pb-20 lg:pb-0">
        {/* Background with blur placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-900 via-secondary-800 to-secondary-900 z-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40 z-10" />

        {/* Hero Image with blur placeholder */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.jpg"
            alt="JapanStroj Hero - Professional machinery parts"
            fill
            className="object-cover object-center transform hover:scale-105 transition-transform duration-[8000ms] ease-out"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
            onLoad={() => console.timeEnd('Hero image load')}
            onError={() => console.timeEnd('Hero image load')}
          />
        </div>

        <div className="relative z-20 text-center px-3 sm:px-4 max-w-5xl mx-auto animate-fade-in">
          <div className="mb-4 sm:mb-6 md:mb-8 animate-slide-in-up">
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500/20 backdrop-blur-sm border border-primary-500/30 rounded-full text-primary-400 text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-lg">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
              Profesionalni servis
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white mb-3 sm:mb-4 md:mb-6 tracking-tight leading-tight animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
            Japan<span className="text-primary-500 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">Stroj</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-neutral-200 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
            Vaš pouzdan partner za rezervne dijelove građevinskih strojeva.
            Kvalitet, pouzdanost i brz servis na jednom mjestu.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 justify-center items-stretch sm:items-center px-2 animate-slide-in-up" style={{ animationDelay: '0.6s' }}>
            <button
              onClick={() => router.push('/catalog')}
              className="group bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 active:from-primary-700 active:to-primary-800 text-white px-5 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 md:py-4 lg:py-5 rounded-full font-bold text-xs sm:text-sm md:text-base lg:text-lg transition-all duration-300 active:scale-95 sm:hover:scale-105 shadow-glow sm:hover:shadow-glow-lg flex items-center justify-center gap-2 touch-manipulation w-full sm:w-auto focus-ring"
              aria-label="Browse catalog"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-active:rotate-12 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Pregledajte katalog</span>
            </button>
            <button
              onClick={() => router.push('/services')}
              className="group border-2 border-white/80 text-white hover:bg-white hover:text-secondary-900 active:bg-white active:text-secondary-900 px-5 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 md:py-4 lg:py-5 rounded-full font-bold text-xs sm:text-sm md:text-base lg:text-lg transition-all duration-300 active:scale-95 sm:hover:scale-105 backdrop-blur-sm bg-white/5 hover:bg-white flex items-center justify-center gap-2 touch-manipulation w-full sm:w-auto focus-ring"
              aria-label="View our services"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-active:rotate-12 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Naše usluge</span>
            </button>
          </div>
        </div>

        {/* Enhanced scroll indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block animate-bounce-subtle">
          <div className="flex flex-col items-center gap-2">
            <span className="text-white/60 text-xs font-medium uppercase tracking-wider">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-secondary-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,107,0,0.1)_0%,_transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(6,182,212,0.1)_0%,_transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <div className="group p-3 sm:p-4 glass rounded-2xl hover:bg-white/10 transition-all duration-300 animate-slide-in-up">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500/20 rounded-full flex items-center justify-center mr-2 sm:mr-3 group-hover:bg-primary-500/30 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-400 mb-1 sm:mb-2 group-hover:text-primary-300 transition-colors animate-pulse-glow">500+</div>
              <div className="text-neutral-400 uppercase tracking-wide text-xs sm:text-sm leading-tight font-medium">Proizvoda</div>
            </div>

            <div className="group p-3 sm:p-4 glass rounded-2xl hover:bg-white/10 transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent-500/20 rounded-full flex items-center justify-center mr-2 sm:mr-3 group-hover:bg-accent-500/30 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-accent-400 mb-1 sm:mb-2 group-hover:text-accent-300 transition-colors">50+</div>
              <div className="text-neutral-400 uppercase tracking-wide text-xs sm:text-sm leading-tight font-medium">Brendova</div>
            </div>

            <div className="group p-3 sm:p-4 glass rounded-2xl hover:bg-white/10 transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary-600/50 rounded-full flex items-center justify-center mr-2 sm:mr-3 group-hover:bg-secondary-500/50 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-secondary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-secondary-300 mb-1 sm:mb-2 group-hover:text-secondary-200 transition-colors">10+</div>
              <div className="text-neutral-400 uppercase tracking-wide text-xs sm:text-sm leading-tight font-medium">Godina iskustva</div>
            </div>

            <div className="group p-3 sm:p-4 glass rounded-2xl hover:bg-white/10 transition-all duration-300 animate-slide-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-success/20 rounded-full flex items-center justify-center mr-2 sm:mr-3 group-hover:bg-success/30 transition-colors">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-success mb-1 sm:mb-2 group-hover:text-green-300 transition-colors">24/7</div>
              <div className="text-neutral-400 uppercase tracking-wide text-xs sm:text-sm leading-tight font-medium">Podrška</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {loading ? (
        <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-secondary-950">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#ff6b00]/30 border-t-[#ff6b00] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-400">Učitavanje proizvoda...</p>
            </div>
          </div>
        </section>
      ) : error ? (
        <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-secondary-950">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Greška pri učitavanju</h3>
              <p className="text-neutral-400 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-[#ff6b00] hover:bg-[#ff7f1a] text-black px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
              >
                Pokušaj ponovo
              </button>
            </div>
          </div>
        </section>
      ) : spareParts.length > 0 && (
        <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-secondary-950 pb-24 lg:pb-20 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-3 sm:px-4 relative z-10">
            <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 animate-slide-in-up">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-500/20 border border-primary-500/30 rounded-full text-primary-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4 shadow-lg">
                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                Premium kvaliteta
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 px-2">Istaknuti proizvodi</h2>
              <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto px-4">
                Otkrijte našu selekciju vrhunskih rezervnih dijelova za građevinske strojeve
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {spareParts.slice(0, 4).map((part, index) => (
                <div
                  key={part.id}
                  className="group bg-secondary-900/50 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden hover:border-primary-500/30 transition-all duration-500 cursor-pointer active:scale-95 sm:hover:scale-105 shadow-soft sm:hover:shadow-large touch-manipulation animate-slide-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleSelectProduct(part)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${part.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectProduct(part);
                    }
                  }}
                >
                  <div className="relative overflow-hidden aspect-square sm:aspect-auto sm:h-40 md:h-48 bg-secondary-800">
                    <Image
                      src={part.imageUrl}
                      alt={part.name}
                      fill
                      className="object-cover sm:group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 sm:group-hover:opacity-100 transition-all duration-500 transform translate-y-2 sm:group-hover:translate-y-0">
                      <div className="bg-primary-500 text-white p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-primary-600 transition-colors">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                    {/* Hover overlay with quick info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 transform translate-y-full sm:group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/90 to-transparent">
                      <div className="text-white text-xs sm:text-sm font-medium truncate">{part.brand}</div>
                      <div className="text-neutral-300 text-xs truncate">{part.model}</div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 md:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2 sm:group-hover:text-primary-400 transition-colors line-clamp-2 leading-tight">{part.name}</h3>
                    <p className="text-neutral-400 text-xs sm:text-sm mb-2 sm:mb-3 truncate">{part.brand} • {part.model}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2">
                      <span className="text-xl sm:text-2xl font-black text-primary-400 group-hover:text-primary-300 transition-colors">
                        {part.priceWithVAT ? Number(part.priceWithVAT).toFixed(2) : '0.00'} BAM
                      </span>
                      <div className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wide bg-neutral-800/50 px-2 py-1 rounded-full">PDV uključen</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 sm:mt-10 md:mt-12 px-4 animate-slide-in-up" style={{ animationDelay: '0.5s' }}>
              <button
                onClick={() => router.push('/catalog')}
                className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-transparent border-2 border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-white active:bg-primary-600 active:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 active:scale-95 sm:hover:scale-105 touch-manipulation w-full sm:w-auto shadow-lg hover:shadow-glow focus-ring"
                aria-label="View all products"
              >
                <span>Pogledajte sve proizvode</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-secondary-900 pb-24 lg:pb-20 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,_rgba(255,107,0,0.05)_25%,_transparent_25%),_linear-gradient(-45deg,_rgba(255,107,0,0.05)_25%,_transparent_25%),_linear-gradient(45deg,_transparent_75%,_rgba(255,107,0,0.05)_75%),_linear-gradient(-45deg,_transparent_75%,_rgba(255,107,0,0.05)_75%)] bg-[length:20px_20px]"></div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 relative z-10">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16 animate-slide-in-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 px-2">Zašto JapanStroj?</h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto px-4">
              Više od deset godina pružamo vrhunske usluge i rezervne dijelove za građevinske strojeve
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6 md:gap-8">
            <div className="text-center group p-4 sm:p-6 glass rounded-2xl hover:bg-white/10 transition-all duration-500 animate-slide-in-left">
              <div className="relative mb-4 sm:mb-6">
                <div className="bg-primary-500/20 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary-500/30 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-glow">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-primary-400 group-hover:text-primary-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-primary-400 transition-colors">Garancija kvaliteta</h3>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">Svi naši dijelovi dolaze sa garancijom i sertifikatima kvaliteta</p>
            </div>

            <div className="text-center group p-4 sm:p-6 glass rounded-2xl hover:bg-white/10 transition-all duration-500 animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative mb-4 sm:mb-6">
                <div className="bg-accent-500/20 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto group-hover:bg-accent-500/30 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-accent-400 group-hover:text-accent-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-accent-400 transition-colors">Brza dostava</h3>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">Ekspresna dostava dijelova širom Bosne i Hercegovine</p>
            </div>

            <div className="text-center group p-4 sm:p-6 glass rounded-2xl hover:bg-white/10 transition-all duration-500 animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
              <div className="relative mb-4 sm:mb-6">
                <div className="bg-secondary-600/50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto group-hover:bg-secondary-500/50 transition-all duration-300 group-hover:scale-110 shadow-lg">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-secondary-300 group-hover:text-secondary-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-secondary-200 transition-colors">Stručna podrška</h3>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed group-hover:text-neutral-300 transition-colors">Naš tim stručnjaka vam stoji na raspolaganju 24/7</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
