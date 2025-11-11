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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-black/50 z-10" />
        <img
          src="/hero.jpg"
          alt="JapanStroj Hero"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <div className="mb-8">
            <span className="inline-block px-4 py-2 bg-[#ff6b00]/20 backdrop-blur-sm border border-[#ff6b00]/30 rounded-full text-[#ff6b00] text-sm font-semibold uppercase tracking-wider mb-6">
              Profesionalni servis
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            Japan<span className="text-[#ff6b00]">Stroj</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-neutral-200 mb-8 max-w-3xl mx-auto leading-relaxed">
            Vaš pouzdan partner za rezervne dijelove građevinskih strojeva.
            Kvalitet, pouzdanost i brz servis na jednom mjestu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center">
            <button
              onClick={() => setActivePage('catalog')}
              className="group bg-[#ff6b00] hover:bg-[#ff7f1a] text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-[#ff6b00]/50 flex items-center gap-2 sm:gap-3"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Pregledajte katalog</span>
              <span className="sm:hidden">Katalog</span>
            </button>
            <button
              onClick={() => setActivePage('services')}
              className="group border-2 border-white/80 text-white hover:bg-white hover:text-black px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/5 flex items-center gap-2 sm:gap-3"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">Naše usluge</span>
              <span className="sm:hidden">Usluge</span>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-4xl font-black text-[#ff6b00] mb-2 group-hover:scale-110 transition-transform">500+</div>
              <div className="text-neutral-400 uppercase tracking-wide text-sm">Proizvoda</div>
            </div>
            <div className="group">
              <div className="text-4xl font-black text-[#ff6b00] mb-2 group-hover:scale-110 transition-transform">50+</div>
              <div className="text-neutral-400 uppercase tracking-wide text-sm">Brendova</div>
            </div>
            <div className="group">
              <div className="text-4xl font-black text-[#ff6b00] mb-2 group-hover:scale-110 transition-transform">10+</div>
              <div className="text-neutral-400 uppercase tracking-wide text-sm">Godina iskustva</div>
            </div>
            <div className="group">
              <div className="text-4xl font-black text-[#ff6b00] mb-2 group-hover:scale-110 transition-transform">24/7</div>
              <div className="text-neutral-400 uppercase tracking-wide text-sm">Podrška</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {spareParts.length > 0 && (
        <section className="py-20 bg-[#050505]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-2 bg-[#ff6b00]/20 border border-[#ff6b00]/30 rounded-full text-[#ff6b00] text-sm font-semibold uppercase tracking-wider mb-4">
                Premium kvaliteta
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Istaknuti proizvodi</h2>
              <p className="text-neutral-400 max-w-2xl mx-auto">
                Otkrijte našu selekciju vrhunskih rezervnih dijelova za građevinske strojeve
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {spareParts.slice(0, 4).map((part) => (
                <div
                  key={part.id}
                  className="group bg-[#101010] border border-white/5 rounded-2xl overflow-hidden hover:border-[#ff6b00]/50 transition-all duration-500 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-[#ff6b00]/10"
                  onClick={() => handleSelectProduct(part)}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={part.imageUrl}
                      alt={part.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-[#ff6b00] text-white p-2 rounded-full">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#ff6b00] transition-colors">{part.name}</h3>
                    <p className="text-neutral-400 text-sm mb-3">{part.brand} - {part.model}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-[#ff6b00]">{part.priceWithVAT ? part.priceWithVAT.toFixed(2) : '0.00'} BAM</span>
                      <div className="text-xs text-neutral-500 uppercase tracking-wide">PDV uključen</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => setActivePage('catalog')}
                className="inline-flex items-center gap-3 bg-transparent border-2 border-[#ff6b00] text-[#ff6b00] hover:bg-[#ff6b00] hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105"
              >
                <span>Pogledajte sve proizvode</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Zašto JapanStroj?</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Više od deset godina pružamo vrhunske usluge i rezervne dijelove za građevinske strojeve
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-[#ff6b00]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#ff6b00]/20 transition-colors">
                <svg className="w-10 h-10 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Garancija kvaliteta</h3>
              <p className="text-neutral-400">Svi naši dijelovi dolaze sa garancijom i sertifikatima kvaliteta</p>
            </div>

            <div className="text-center group">
              <div className="bg-[#ff6b00]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#ff6b00]/20 transition-colors">
                <svg className="w-10 h-10 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Brza dostava</h3>
              <p className="text-neutral-400">Ekspresna dostava dijelova širom Bosne i Hercegovine</p>
            </div>

            <div className="text-center group">
              <div className="bg-[#ff6b00]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#ff6b00]/20 transition-colors">
                <svg className="w-10 h-10 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Stručna podrška</h3>
              <p className="text-neutral-400">Naš tim stručnjaka vam stoji na raspolaganju 24/7</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
