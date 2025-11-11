'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page } from '@/types';

const mockManuals = [
  { id: 1, title: 'Servisni priručnik Caterpillar 320D', description: 'Kompletan priručnik za servis i održavanje bagera gusjeničara modela 320D.', url: '#' },
  { id: 2, title: 'Katalog dijelova Komatsu PC200-8', description: 'Detaljan katalog rezervnih dijelova sa shemama za bager Komatsu PC200-8.', url: '#' },
  { id: 3, title: 'Upute za rukovanje Volvo EC210', description: 'Službene upute za sigurno i efikasno rukovanje bagerom Volvo EC210.', url: '#' },
  { id: 4, title: 'Shema hidraulike JCB 3CX', description: 'Dijagrami i sheme hidrauličnog sustava za kombinirani stroj JCB 3CX.', url: '#' },
  { id: 5, title: 'Priručnik za motor Cummins QSB6.7', description: 'Tehnički priručnik za popravak i održavanje Cummins QSB6.7 serije motora.', url: '#' },
];

export default function ManualsPage() {
  const [activePage, setActivePage] = React.useState<Page>('manuals');
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

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />
      <main className="flex-grow pb-20 lg:pb-0">
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2">Priručnici i dokumentacija</h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto px-4">
              Preuzmite tehničku dokumentaciju, servisne priručnike i upute za korištenje građevinskih strojeva.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {mockManuals.map((manual) => (
              <div key={manual.id} className="bg-[#101010] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 active:border-[#ff6b00]/50 transition-all duration-300">
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📚</div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2 sm:mb-3 line-clamp-2">{manual.title}</h3>
                <p className="text-sm sm:text-base text-neutral-400 mb-4 sm:mb-5 md:mb-6 line-clamp-3">{manual.description}</p>
                <button className="w-full bg-[#ff6b00] active:bg-[#ff7f1a] text-white py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-300 active:scale-95 sm:hover:scale-105 touch-manipulation text-sm sm:text-base">
                  Preuzmi priručnik
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 sm:mt-12 md:mt-16 text-center">
            <div className="bg-[#101010] border border-white/5 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 max-w-2xl mx-auto">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4">Dodatna dokumentacija</h2>
              <p className="text-sm sm:text-base text-neutral-400 mb-4 sm:mb-5 md:mb-6">
                Za specifične tehničke podatke ili dodatne priručnike, kontaktirajte našu tehničku podršku.
              </p>
              <div className="space-y-1.5 sm:space-y-2 text-left">
                <p className="text-xs sm:text-sm md:text-base text-neutral-300"><strong>Email:</strong> podrska@japanstroj.ba</p>
                <p className="text-xs sm:text-sm md:text-base text-neutral-300"><strong>Telefon:</strong> +387 12 345 678</p>
                <p className="text-xs sm:text-sm md:text-base text-neutral-300"><strong>Radno vrijeme:</strong> Pon-Pet 8:00-16:00</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}