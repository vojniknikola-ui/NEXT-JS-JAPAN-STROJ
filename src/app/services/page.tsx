'use client';

import React from 'react';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page } from '@/types';

export default function ServicesPage() {

  const services = [
    {
      title: 'STROJNA OBRADA',
      description: 'Strojna obrada dijelova motora, radilica, blokova i glava. Kompletan servis glava motora, blokova motora, radilica i klipnjača na strojevima za obradu dijelova.',
      icon: '⚙️',
      features: ['Precizna obrada dijelova', 'Moderni CNC strojevi', 'Kvalitetni materijali', 'Brza isporuka'],
      image: 'https://picsum.photos/seed/machine-shop/600/400',
    },
    {
      title: 'REMONT MOTORA',
      description: 'Remont (obnova) industrijskih motora koji uključuje ugradnju visoko kvalitetnih zamjenskih ili original dijelova. Bavimo se svim poslovima vezanim uz strojnu obradu dijelova motora.',
      icon: '🔧',
      features: ['Kompletna obnova motora', 'Originalni dijelovi', 'Dugogodišnje iskustvo', 'Garancija na rad'],
      image: 'https://picsum.photos/seed/engine-repair/600/400',
    },
    {
      title: 'SERVIS HIDRAULIKE',
      description: 'Popravka i održavanje hidrauličnih sistema i komponenti. Dijagnostika curenja, zamjena pumpi, ventila i hidrauličnih cilindara.',
      icon: '💧',
      features: ['Dijagnostika curenja', 'Zamjena pumpi', 'Popravka ventila', 'Testiranje sistema'],
      image: 'https://picsum.photos/seed/hydraulics/600/400',
    },
    {
      title: 'ELEKTRIČNI SISTEMI',
      description: 'Dijagnostika i popravka električnih sistema strojeva. Popravka alternatora, startera, senzora i elektroničkih komponenti.',
      icon: '⚡',
      features: ['Popravka alternatora', 'Servis startera', 'Zamjena senzora', 'Dijagnostika elektronike'],
      image: 'https://picsum.photos/seed/electrical/600/400',
    },
    {
      title: 'PREVENTIVNO ODRŽAVANJE',
      description: 'Redovno servisiranje i održavanje strojeva po preporukama proizvođača. Zamjena filtera, ulja, remena i drugih potrošnih dijelova.',
      icon: '📋',
      features: ['Zamjena filtera', 'Servisiranje motora', 'Kontrola remena', 'Zamjena ulja'],
      image: 'https://picsum.photos/seed/maintenance/600/400',
    },
    {
      title: 'DIJAGNOSTIKA',
      description: 'Profesionalna dijagnostika problema sa modernom opremom. Identifikacija grešaka i preporuke za popravku.',
      icon: '🔍',
      features: ['Skeniranje grešaka', 'Mjerenje performansi', 'Analiza podataka', 'Izvještaji o stanju'],
      image: 'https://picsum.photos/seed/diagnostics/600/400',
    },
  ];

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pb-20 lg:pb-0">
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
          <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 sm:px-4 py-1 text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-neutral-300 mb-3 sm:mb-4 md:mb-6">
              Profesionalne usluge
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-3 sm:mb-4 md:mb-6 leading-tight px-2">
              Stručnost i preciznost u <span className="text-[#ff6b00]">svakom detalju</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-neutral-400 max-w-4xl mx-auto leading-relaxed px-4">
              Više od 20 godina iskustva u popravci i održavanju građevinskih strojeva.
              Koristimo najmoderniju opremu i originalne dijelove za maksimalnu pouzdanost vaših strojeva.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 md:gap-8 lg:gap-12 mb-8 sm:mb-12 md:mb-16">
            {services.map((service, index) => (
              <div key={index} className="bg-[#101010] border border-white/5 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl sm:hover:shadow-[0_25px_60px_-20px_rgba(255,107,0,0.4)] transition-all duration-500 group">
                <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover transform sm:group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">{service.icon}</div>
                  <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-3 sm:left-4 md:left-6 right-3 sm:right-4 md:right-6">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">{service.title}</h3>
                  </div>
                </div>
                <div className="p-4 sm:p-5 md:p-6 lg:p-8">
                  <p className="text-neutral-300 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-5 md:mb-6">{service.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 md:gap-3 mb-4 sm:mb-5 md:mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#ff6b00] rounded-full flex-shrink-0"></div>
                        <span className="text-xs sm:text-sm text-neutral-400">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-gradient-to-r from-[#ff6b00] to-[#ff8c33] active:from-[#ff7f1a] active:to-[#ffa04d] text-white font-semibold py-2.5 sm:py-3 md:py-4 px-4 sm:px-6 rounded-full transition-all duration-300 active:scale-95 sm:hover:scale-105 sm:hover:shadow-[0_10px_30px_rgba(255,107,0,0.4)] text-xs sm:text-sm md:text-base touch-manipulation">
                    Zatraži ponudu
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-20">
            <div className="bg-gradient-to-r from-[#ff6b00] via-[#ff7f1a] to-[#ff6b00] rounded-2xl sm:rounded-[24px] md:rounded-[32px] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-20 py-8 sm:py-10 md:py-12 lg:py-16 text-center shadow-[0_30px_80px_-30px_rgba(255,107,0,0.7)]">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-900 mb-3 sm:mb-4 md:mb-6 px-2">Spremni za servis vašeg stroja?</h2>
              <p className="text-sm sm:text-base md:text-lg text-neutral-900/80 max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-4">
                Kontaktirajte naše stručnjake za besplatnu procjenu i termin servisiranja.
                Garantujemo kvalitetan rad i konkurentne cijene.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-10">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6">
                  <div className="text-xl sm:text-2xl md:text-3xl mb-1.5 sm:mb-2 md:mb-3">📞</div>
                  <h3 className="font-semibold text-neutral-900 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">Telefon</h3>
                  <p className="text-neutral-800 text-xs sm:text-sm md:text-base">+387 61 924 848</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6">
                  <div className="text-xl sm:text-2xl md:text-3xl mb-1.5 sm:mb-2 md:mb-3">✉️</div>
                  <h3 className="font-semibold text-neutral-900 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">Email</h3>
                  <p className="text-neutral-800 text-xs sm:text-sm md:text-base">info@japanstroj.ba</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6">
                  <div className="text-xl sm:text-2xl md:text-3xl mb-1.5 sm:mb-2 md:mb-3">📍</div>
                  <h3 className="font-semibold text-neutral-900 mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">Lokacija</h3>
                  <p className="text-neutral-800 text-xs sm:text-sm md:text-base">Sarajevo, BiH</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4 justify-center px-2 sm:px-4">
                <a
                  href="tel:+38761924848"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-neutral-900 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg active:bg-black transition-all duration-300 active:scale-95 sm:hover:scale-105 touch-manipulation"
                >
                  <span>📞</span>
                  Pozovite odmah
                </a>
                <a
                  href="https://wa.me/38761924848?text=Pozdrav,%20zanima%20me%20servis%20za%20moj%20stroj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 sm:gap-3 bg-green-600 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-full font-semibold text-sm sm:text-base md:text-lg active:bg-green-700 transition-all duration-300 active:scale-95 sm:hover:scale-105 touch-manipulation"
                >
                  <span>💬</span>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}