'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page } from '@/types';
import { SearchIcon, FilterIcon, CogIcon } from '@/lib/icons';

const mockManuals = [
  {
    id: 1,
    title: 'Servisni priručnik Caterpillar 320D',
    description: 'Kompletan priručnik za servis i održavanje bagera gusjeničara modela 320D.',
    url: '#',
    category: 'servis',
    brand: 'Caterpillar',
    type: 'bager',
    fileSize: '45.2 MB',
    language: 'Bosanski',
    icon: '🚜'
  },
  {
    id: 2,
    title: 'Katalog dijelova Komatsu PC200-8',
    description: 'Detaljan katalog rezervnih dijelova sa shemama za bager Komatsu PC200-8.',
    url: '#',
    category: 'dijelovi',
    brand: 'Komatsu',
    type: 'bager',
    fileSize: '28.7 MB',
    language: 'Bosanski',
    icon: '📋'
  },
  {
    id: 3,
    title: 'Upute za rukovanje Volvo EC210',
    description: 'Službene upute za sigurno i efikasno rukovanje bagerom Volvo EC210.',
    url: '#',
    category: 'upute',
    brand: 'Volvo',
    type: 'bager',
    fileSize: '15.3 MB',
    language: 'Bosanski',
    icon: '📖'
  },
  {
    id: 4,
    title: 'Shema hidraulike JCB 3CX',
    description: 'Dijagrami i sheme hidrauličnog sustava za kombinirani stroj JCB 3CX.',
    url: '#',
    category: 'sheme',
    brand: 'JCB',
    type: 'kombinirani',
    fileSize: '8.9 MB',
    language: 'Bosanski',
    icon: '🔧'
  },
  {
    id: 5,
    title: 'Priručnik za motor Cummins QSB6.7',
    description: 'Tehnički priručnik za popravak i održavanje Cummins QSB6.7 serije motora.',
    url: '#',
    category: 'motor',
    brand: 'Cummins',
    type: 'motor',
    fileSize: '22.1 MB',
    language: 'Engleski',
    icon: '⚙️'
  },
  {
    id: 6,
    title: 'Sigurnosne upute za građevinske strojeve',
    description: 'Kompletne sigurnosne procedure i protokoli za rad sa građevinskim strojevima.',
    url: '#',
    category: 'sigurnost',
    brand: 'Opći',
    type: 'sigurnost',
    fileSize: '12.4 MB',
    language: 'Bosanski',
    icon: '⚠️'
  }
];

const categories = [
  { id: 'all', name: 'Svi priručnici', icon: '📚' },
  { id: 'servis', name: 'Servisni priručnici', icon: '🔧' },
  { id: 'dijelovi', name: 'Katalozi dijelova', icon: '📋' },
  { id: 'upute', name: 'Upute za rukovanje', icon: '📖' },
  { id: 'sheme', name: 'Tehničke sheme', icon: '🔗' },
  { id: 'motor', name: 'Motori', icon: '⚙️' },
  { id: 'sigurnost', name: 'Sigurnost', icon: '⚠️' }
];

export default function ManualsPage() {
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedCategory, setSelectedCategory] = useState('all');
   const [filteredManuals, setFilteredManuals] = useState(mockManuals);

  // Filter manuals based on search and category
  React.useEffect(() => {
    let filtered = mockManuals;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(manual => manual.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(manual =>
        manual.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manual.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        manual.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredManuals(filtered);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="bg-gradient-to-br from-[#0b0b0b] via-[#0a0a0a] to-[#080808] text-neutral-100 min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pb-20 lg:pb-0 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,107,0,0.1)_0%,_transparent_50%)] animate-pulse"></div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16 relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-2 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
              Priručnici i dokumentacija
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto px-4">
              Preuzmite tehničku dokumentaciju, servisne priručnike i upute za korištenje građevinskih strojeva.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 sm:mb-12">
            <div className="max-w-4xl mx-auto">
              {/* Search Bar */}
              <div className="relative mb-6 sm:mb-8">
                <div className="relative">
                  <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Pretražite priručnike po nazivu, brendu ili opisu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#101010] border border-white/10 rounded-2xl text-white placeholder-neutral-400 focus:outline-none focus:border-[#ff6b00] focus:ring-2 focus:ring-[#ff6b00]/20 transition-all duration-300 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
                      selectedCategory === category.id
                        ? 'bg-[#ff6b00] text-black shadow-lg shadow-[#ff6b00]/25'
                        : 'bg-[#101010] border border-white/10 text-neutral-300 hover:border-[#ff6b00]/50 hover:text-[#ff6b00]'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-center mb-6 sm:mb-8">
            <p className="text-sm sm:text-base text-neutral-400">
              {filteredManuals.length === 0
                ? 'Nema pronađenih priručnika'
                : `Pronađeno ${filteredManuals.length} ${filteredManuals.length === 1 ? 'priručnik' : filteredManuals.length < 5 ? 'priručnika' : 'priručnika'}`
              }
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {filteredManuals.map((manual, index) => (
              <div
                key={manual.id}
                className="bg-gradient-to-br from-[#101010] to-[#0f0f0f] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-[#ff6b00]/30 hover:shadow-lg hover:shadow-[#ff6b00]/5 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">
                    {manual.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-[#ff6b00]/10 text-[#ff6b00] text-xs font-medium rounded-full">
                        {manual.brand}
                      </span>
                      <span className="px-2 py-1 bg-neutral-700/50 text-neutral-300 text-xs font-medium rounded-full">
                        {manual.language}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>{manual.fileSize}</span>
                      <span>•</span>
                      <span className="capitalize">{manual.type}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-2 sm:mb-3 line-clamp-2 group-hover:text-[#ff6b00] transition-colors duration-300">
                  {manual.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-400 mb-4 sm:mb-5 md:mb-6 line-clamp-3">
                  {manual.description}
                </p>

                <button className="w-full bg-gradient-to-r from-[#ff6b00] to-[#ff8533] hover:from-[#ff8533] hover:to-[#ff6b00] text-black py-3 sm:py-4 rounded-full font-semibold transition-all duration-300 active:scale-95 sm:hover:scale-105 touch-manipulation shadow-lg hover:shadow-xl relative overflow-hidden group/btn text-sm sm:text-base">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Preuzmi priručnik
                  </span>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 sm:mt-12 md:mt-16 text-center">
            <div className="bg-gradient-to-br from-[#101010] to-[#0a0a0a] border border-[#ff6b00]/20 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 max-w-2xl mx-auto hover:border-[#ff6b00]/40 transition-all duration-300 shadow-2xl shadow-[#ff6b00]/10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#ff6b00]/10 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Dodatna dokumentacija</h2>
              </div>
              <p className="text-sm sm:text-base text-neutral-400 mb-6 sm:mb-8">
                Za specifične tehničke podatke ili dodatne priručnike, kontaktirajte našu tehničku podršku.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#ff6b00]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white">Email</p>
                  <p className="text-xs text-neutral-400">podrska@japanstroj.ba</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-[#ff6b00]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white">Telefon</p>
                  <p className="text-xs text-neutral-400">+387 12 345 678</p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-[#ff6b00]/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-[#ff6b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-white">Radno vrijeme</p>
                  <p className="text-xs text-neutral-400">Pon-Pet 8:00-16:00</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-[#ff6b00] hover:bg-[#ff7f1a] text-black px-6 py-3 rounded-full font-semibold transition-all duration-300 active:scale-95 sm:hover:scale-105 touch-manipulation shadow-lg hover:shadow-xl">
                  Kontaktirajte nas
                </button>
                <button className="border border-[#ff6b00]/50 text-[#ff6b00] hover:bg-[#ff6b00]/10 px-6 py-3 rounded-full font-semibold transition-all duration-300 active:scale-95 sm:hover:scale-105 touch-manipulation">
                  Zakažite poziv
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}