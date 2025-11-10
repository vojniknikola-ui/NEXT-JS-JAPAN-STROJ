'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page } from '@/types';

export default function ServicesPage() {
  const [activePage, setActivePage] = React.useState<Page>('services');
  const [cartItems, setCartItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('japanStrojCart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
    }
  }, []);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

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
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-20">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm font-semibold uppercase tracking-[0.4em] text-neutral-300 mb-6">
              Profesionalne usluge
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
              Stručnost i preciznost u <span className="text-[#ff6b00]">svakom detalju</span>
            </h1>
            <p className="text-xl text-neutral-400 max-w-4xl mx-auto leading-relaxed">
              Više od 20 godina iskustva u popravci i održavanju građevinskih strojeva.
              Koristimo najmoderniju opremu i originalne dijelove za maksimalnu pouzdanost vaših strojeva.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {services.map((service, index) => (
              <div key={index} className="bg-[#101010] border border-white/5 rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_25px_60px_-20px_rgba(255,107,0,0.4)] transition-all duration-500 group">
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-6 left-6 text-5xl">{service.icon}</div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-neutral-300 text-lg leading-relaxed mb-6">{service.description}</p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#ff6b00] rounded-full"></div>
                        <span className="text-sm text-neutral-400">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-gradient-to-r from-[#ff6b00] to-[#ff8c33] hover:from-[#ff7f1a] hover:to-[#ffa04d] text-white font-semibold py-4 px-6 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_30px_rgba(255,107,0,0.4)]">
                    Zatraži ponudu
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20">
            <div className="bg-gradient-to-r from-[#ff6b00] via-[#ff7f1a] to-[#ff6b00] rounded-[32px] px-8 sm:px-12 lg:px-20 py-16 text-center shadow-[0_30px_80px_-30px_rgba(255,107,0,0.7)]">
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">Spremni za servis vašeg stroja?</h2>
              <p className="text-lg text-neutral-900/80 max-w-2xl mx-auto mb-10">
                Kontaktirajte naše stručnjake za besplatnu procjenu i termin servisiranja.
                Garantujemo kvalitetan rad i konkurentne cijene.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-3xl mb-3">📞</div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Telefon</h3>
                  <p className="text-neutral-800">+387 61 924 848</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-3xl mb-3">✉️</div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Email</h3>
                  <p className="text-neutral-800">info@japanstroj.ba</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-3xl mb-3">📍</div>
                  <h3 className="font-semibold text-neutral-900 mb-2">Lokacija</h3>
                  <p className="text-neutral-800">Sarajevo, BiH</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+38761924848"
                  className="inline-flex items-center justify-center gap-3 bg-neutral-900 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-black transition-all duration-300 hover:scale-105"
                >
                  <span>📞</span>
                  Pozovite odmah
                </a>
                <a
                  href="https://wa.me/38761924848?text=Pozdrav,%20zanima%20me%20servis%20za%20moj%20stroj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transition-all duration-300 hover:scale-105"
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