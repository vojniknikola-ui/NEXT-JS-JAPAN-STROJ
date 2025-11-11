'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page, SparePart, CartItem } from '@/types';

export default function Home() {
  const [activePage, setActivePage] = useState<Page>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage?.getItem('japanStrojCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }

    // Load spare parts from API
    console.log('Loading spare parts from home page...');
    fetch('/api/parts?active=true')
      .then(res => {
        console.log('Home page parts response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Home page loaded parts:', data);
        setSpareParts(data);
      })
      .catch(error => console.error('Error loading spare parts:', error));
  }, []);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleSelectProduct = (part: SparePart) => {
    window.location.href = `/product/${part.id}`;
  };

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden pb-20 lg:pb-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black/50 z-10" />
        <img
          src="/hero.jpg"
          alt="JapanStroj Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="relative z-20 text-center px-3 sm:px-4 max-w-5xl mx-auto">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[#ff6b00]/20 backdrop-blur-sm border border-[#ff6b00]/30 rounded-full text-[#ff6b00] text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Profesionalni servis
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white mb-3 sm:mb-4 md:mb-6 tracking-tight leading-tight">
            Japan<span className="text-[#ff6b00]">Stroj</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-neutral-200 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Vaš pouzdan partner za rezervne dijelove građevinskih strojeva.
            Kvalitet, pouzdanost i brz servis na jednom mjestu.
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 justify-center items-stretch sm:items-center px-2">
            <button
              onClick={() => setActivePage('catalog')}
              className="group bg-[#ff6b00] active:bg-[#ff7f1a] text-white px-5 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 md:py-4 lg:py-5 rounded-full font-bold text-xs sm:text-sm md:text-base lg:text-lg transition-all duration-300 active:scale-95 sm:hover:scale-105 shadow-2xl sm:hover:shadow-[#ff6b00]/50 flex items-center justify-center gap-2 touch-manipulation w-full sm:w-auto"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-active:rotate-12 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Pregledajte katalog</span>
            </button>
            <button
              onClick={() => setActivePage('services')}
              className="group border-2 border-white/80 text-white active:bg-white active:text-black px-5 sm:px-6 md:px-8 lg:px-10 py-3 sm:py-3.5 md:py-4 lg:py-5 rounded-full font-bold text-xs sm:text-sm md:text-base lg:text-lg transition-all duration-300 active:scale-95 sm:hover:scale-105 backdrop-blur-sm bg-white/5 flex items-center justify-center gap-2 touch-manipulation w-full sm:w-auto"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-active:rotate-12 transition-transform flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Naše usluge</span>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden sm:block">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <div className="group p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#ff6b00] mb-1 sm:mb-2 group-active:scale-110 transition-transform">500+</div>
              <div className="text-neutral-400 uppercase tracking-wide text-xs sm:text-sm leading-tight">Proizvoda</div>
            </div>
            <div className="group p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#ff6b00] mb-1 sm:mb-2 group-active:scale-110 transition-transform">50+</div>
              <div className="text-neutral-400 uppercase tracking-wide text-xs sm:text-sm leading-tight">Brendova</div>
            </div>
            <div className="group p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#ff6b00] mb-1 sm:mb-2 group-active:scale-110 transition-transform">10+</div>
              <div className="text-neutral-400 uppercase tracking-wide text-xs sm:text-sm leading-tight">Godina iskustva</div>
            </div>
            <div className="group p-3 sm:p-4">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-[#ff6b00] mb-1 sm:mb-2 group-active:scale-110 transition-transform">24/7</div>
              <div className="text-neutral-400 uppercase tracking-wide text-xs sm:text-sm leading-tight">Podrška</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {spareParts.length > 0 && (
        <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-[#050505] pb-24 lg:pb-20">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
              <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[#ff6b00]/20 border border-[#ff6b00]/30 rounded-full text-[#ff6b00] text-xs sm:text-sm font-semibold uppercase tracking-wider mb-3 sm:mb-4">
                Premium kvaliteta
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 px-2">Istaknuti proizvodi</h2>
              <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto px-4">
                Otkrijte našu selekciju vrhunskih rezervnih dijelova za građevinske strojeve
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {spareParts.slice(0, 4).map((part) => (
                <div
                  key={part.id}
                  className="group bg-[#101010] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden active:border-[#ff6b00]/50 transition-all duration-300 cursor-pointer active:scale-95 sm:hover:scale-105 sm:hover:shadow-2xl sm:hover:shadow-[#ff6b00]/10 touch-manipulation"
                  onClick={() => handleSelectProduct(part)}
                >
                  <div className="relative overflow-hidden aspect-square sm:aspect-auto sm:h-40 md:h-48">
                    <img
                      src={part.imageUrl}
                      alt={part.name}
                      className="w-full h-full object-cover sm:group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-[#ff6b00] text-white p-1.5 sm:p-2 rounded-full">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 md:p-6">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1.5 sm:mb-2 sm:group-hover:text-[#ff6b00] transition-colors line-clamp-2">{part.name}</h3>
                    <p className="text-neutral-400 text-xs sm:text-sm mb-2 sm:mb-3 truncate">{part.brand} - {part.model}</p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2">
                      <span className="text-xl sm:text-2xl font-black text-[#ff6b00]">{part.priceWithVAT ? Number(part.priceWithVAT).toFixed(2) : '0.00'} BAM</span>
                      <div className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-wide">PDV uključen</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8 sm:mt-10 md:mt-12 px-4">
              <button
                onClick={() => setActivePage('catalog')}
                className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-transparent border-2 border-[#ff6b00] text-[#ff6b00] active:bg-[#ff6b00] active:text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 active:scale-95 sm:hover:scale-105 touch-manipulation w-full sm:w-auto"
              >
                <span>Pogledajte sve proizvode</span>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-[#0a0a0a] pb-24 lg:pb-20">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 sm:mb-4 px-2">Zašto JapanStroj?</h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto px-4">
              Više od deset godina pružamo vrhunske usluge i rezervne dijelove za građevinske strojeve
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-6 md:gap-8">
            <div className="text-center group p-4 sm:p-6">
              <div className="bg-[#ff6b00]/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-active:bg-[#ff6b00]/20 transition-colors">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Garancija kvaliteta</h3>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">Svi naši dijelovi dolaze sa garancijom i sertifikatima kvaliteta</p>
            </div>

            <div className="text-center group p-4 sm:p-6">
              <div className="bg-[#ff6b00]/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-active:bg-[#ff6b00]/20 transition-colors">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Brza dostava</h3>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">Ekspresna dostava dijelova širom Bosne i Hercegovine</p>
            </div>

            <div className="text-center group p-4 sm:p-6">
              <div className="bg-[#ff6b00]/10 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 group-active:bg-[#ff6b00]/20 transition-colors">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">Stručna podrška</h3>
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">Naš tim stručnjaka vam stoji na raspolaganju 24/7</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
