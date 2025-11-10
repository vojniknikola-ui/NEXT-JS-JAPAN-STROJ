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
      title: 'Popravka motora',
      description: 'Kompletna dijagnostika i popravka svih vrsta motora građevinskih strojeva.',
      icon: '🔧',
    },
    {
      title: 'Servis hidraulike',
      description: 'Popravka i održavanje hidrauličnih sistema i komponenti.',
      icon: '⚙️',
    },
    {
      title: 'Električni sistemi',
      description: 'Dijagnostika i popravka električnih sistema strojeva.',
      icon: '⚡',
    },
    {
      title: 'Zamjena dijelova',
      description: 'Brza i kvalitetna zamjena rezervnih dijelova sa garancijom.',
      icon: '🔄',
    },
    {
      title: 'Preventivno održavanje',
      description: 'Redovno servisiranje i održavanje strojeva po preporukama proizvođača.',
      icon: '📋',
    },
    {
      title: 'Dijagnostika',
      description: 'Profesionalna dijagnostika problema sa modernom opremom.',
      icon: '🔍',
    },
  ];

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-4">Naše usluge</h1>
            <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
              Pružamo profesionalne usluge popravke i održavanja građevinskih strojeva sa dugogodišnjim iskustvom.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-[#101010] border border-white/5 rounded-2xl p-8 hover:border-[#ff6b00]/50 transition-all duration-300">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
                <p className="text-neutral-400">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-[#101010] border border-white/5 rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-white mb-4">Kontaktirajte nas</h2>
              <p className="text-neutral-400 mb-6">
                Za sve informacije o našim uslugama i terminima, slobodno nas kontaktirajte.
              </p>
              <div className="space-y-2 text-left">
                <p className="text-neutral-300"><strong>Telefon:</strong> +387 12 345 678</p>
                <p className="text-neutral-300"><strong>Email:</strong> info@japanstroj.ba</p>
                <p className="text-neutral-300"><strong>Adresa:</strong> Ulica 123, Grad, BiH</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}