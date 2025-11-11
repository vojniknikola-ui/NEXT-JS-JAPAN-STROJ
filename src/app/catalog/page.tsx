'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page, SparePart, Availability } from '@/types';
import { useCart } from '@/lib/hooks/useCart';
import { SearchIcon, FilterIcon, CartIcon, CheckIcon, XIcon } from '@/lib/icons';

interface PartData {
  id: number;
  sku: string;
  title: string;
  brand: string | null;
  model: string | null;
  catalogNumber: string | null;
  application: string | null;
  delivery: string | null;
  price: string;
  priceWithoutVAT: string | null;
  priceWithVAT: string | null;
  discount: string | null;
  currency: string;
  stock: number;
  categoryId: number;
  imageUrl: string | null;
  isActive: boolean;
  category: string;
  spec1?: string | null;
  spec2?: string | null;
  spec3?: string | null;
  spec4?: string | null;
  spec5?: string | null;
  spec6?: string | null;
  spec7?: string | null;
}

const AvailabilityBadge: React.FC<{ availability: string }> = ({ availability }) => {
  const baseClasses = 'px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full uppercase tracking-wide';
  switch (availability) {
    case 'available':
      return <div className={`${baseClasses} bg-emerald-500/90 text-white`}>Dostupno</div>;
    case '15_days':
      return <div className={`${baseClasses} bg-[#ff6b00] text-black`}>15 dana</div>;
    case 'on_request':
      return <div className={`${baseClasses} bg-red-500/90 text-white`}>Po dogovoru</div>;
    default:
      return null;
  }
};

const ProductCard: React.FC<{ part: PartData; onAddToCart: (part: PartData) => void; isAdded: boolean }> = ({ part, onAddToCart, isAdded }) => {
  const router = useRouter();
  const priceAfterDiscount = part.priceWithVAT && part.discount
    ? parseFloat(part.priceWithVAT) * (1 - parseFloat(part.discount) / 100)
    : parseFloat(part.priceWithVAT || part.price);

  return (
    <article className="group bg-[#101010] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden active:border-[#ff6b00]/30 transition-all duration-300 sm:hover:shadow-[0_10px_40px_-15px_rgba(255,107,0,0.3)] sm:hover:-translate-y-1">
      <div className="relative aspect-square bg-[#1a1a1a] overflow-hidden cursor-pointer touch-manipulation" onClick={() => router.push(`/product/${part.id}`)}>
        {part.imageUrl ? (
          <img
            src={part.imageUrl}
            alt={part.title}
            className="w-full h-full object-cover sm:group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-[#ff6b00]/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-[10px] sm:text-xs">Nema slike</p>
            </div>
          </div>
        )}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <AvailabilityBadge availability={part.delivery || 'available'} />
        </div>
        {part.discount && parseFloat(part.discount) > 0 && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
            -{part.discount}%
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        <div className="mb-2 sm:mb-3">
          <div className="text-[10px] sm:text-xs text-neutral-500 mb-1 font-mono truncate">{part.sku}</div>
          <h3 className="text-sm sm:text-base font-semibold text-white mb-1 line-clamp-2 sm:group-hover:text-[#ff6b00] transition-colors cursor-pointer" onClick={() => router.push(`/product/${part.id}`)}>
            {part.title}
          </h3>
          {(part.brand || part.model) && (
            <p className="text-xs sm:text-sm text-neutral-400 truncate">
              {part.brand}{part.brand && part.model && ' • '}{part.model}
            </p>
          )}
          {part.catalogNumber && (
            <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 truncate">
              Kat. broj: {part.catalogNumber}
            </p>
          )}
        </div>

        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          {part.priceWithoutVAT && (
            <p className="text-xs sm:text-sm text-neutral-400">
              Bez PDV-a: {parseFloat(part.priceWithoutVAT).toFixed(2)} {part.currency}
            </p>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-[#ff6b00]">
              {priceAfterDiscount.toFixed(2)} {part.currency}
            </span>
            {part.discount && parseFloat(part.discount) > 0 && (
              <span className="text-xs sm:text-sm text-neutral-500 line-through">
                {parseFloat(part.priceWithVAT || part.price).toFixed(2)} {part.currency}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onAddToCart(part)}
          disabled={isAdded}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
            isAdded
              ? 'bg-emerald-500 text-white shadow-emerald-500/70'
              : 'bg-gradient-to-br from-[#ff6b00] to-[#ff8c33] text-white active:scale-95 sm:hover:scale-105 shadow-[0_8px_25px_rgba(255,107,0,0.6)] sm:hover:shadow-[0_12px_35px_rgba(255,107,0,0.8)]'
          }`}
        >
          {isAdded ? (
            <>
              <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs">Dodano!</span>
            </>
          ) : (
            <>
              <CartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs">Dodaj u košaricu</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default function CatalogPage() {
  const [activePage, setActivePage] = useState<Page>('catalog');
  const { cartItemCount, addToCart } = useCart();
  const [partsData, setPartsData] = useState<PartData[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showOnlyDiscount, setShowOnlyDiscount] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState<Set<number>>(new Set());
  const [displayLimit, setDisplayLimit] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [partsRes, categoriesRes] = await Promise.all([
          fetch('/api/parts?active=true'),
          fetch('/api/categories')
        ]);

        if (!partsRes.ok) {
          throw new Error(`Greška pri učitavanju dijelova: ${partsRes.status}`);
        }

        if (!categoriesRes.ok) {
          throw new Error(`Greška pri učitavanju kategorija: ${categoriesRes.status}`);
        }

        const [partsResponse, cats] = await Promise.all([
          partsRes.json(),
          categoriesRes.json()
        ]);

        const parts = Array.isArray(partsResponse) ? partsResponse : (partsResponse.items || []);
        const activeParts = parts.filter((part: PartData) => part.isActive);

        setPartsData(activeParts);
        setCategories(cats);

        const maxPrice = Math.max(...activeParts.map((p: PartData) => parseFloat(p.priceWithVAT || p.price)));
        setPriceRange([0, Math.ceil(maxPrice / 100) * 100]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Došlo je do greške pri učitavanju podataka');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    partsData.forEach(part => {
      if (part.brand) brands.add(part.brand);
    });
    return Array.from(brands).sort();
  }, [partsData]);

  const filteredParts = useMemo(() => {
    return partsData.filter(part => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query ||
        part.title.toLowerCase().includes(query) ||
        part.brand?.toLowerCase().includes(query) ||
        part.model?.toLowerCase().includes(query) ||
        part.catalogNumber?.toLowerCase().includes(query) ||
        part.sku.toLowerCase().includes(query) ||
        part.application?.toLowerCase().includes(query);

      const matchesCategory = !selectedCategory || part.categoryId === selectedCategory;

      const matchesBrand = selectedBrands.length === 0 || (part.brand && selectedBrands.includes(part.brand));

      const matchesAvailability = selectedAvailability.length === 0 || (part.delivery && selectedAvailability.includes(part.delivery));

      const partPrice = parseFloat(part.priceWithVAT || part.price);
      const matchesPrice = partPrice >= priceRange[0] && partPrice <= priceRange[1];

      const matchesDiscount = !showOnlyDiscount || (part.discount && parseFloat(part.discount) > 0);

      return matchesSearch && matchesCategory && matchesBrand && matchesAvailability && matchesPrice && matchesDiscount;
    });
  }, [partsData, searchQuery, selectedCategory, selectedBrands, selectedAvailability, priceRange, showOnlyDiscount]);

  const handleAddToCart = useCallback((part: PartData) => {
    const sparePart: SparePart = {
      id: part.id,
      name: part.title,
      brand: part.brand || '',
      model: part.model || '',
      catalogNumber: part.catalogNumber || '',
      application: part.application || '',
      delivery: part.delivery === 'available' ? Availability.Available :
               part.delivery === '15_days' ? Availability.FifteenDays :
               Availability.OnRequest,
      priceWithoutVAT: parseFloat(part.priceWithoutVAT || part.price),
      priceWithVAT: parseFloat(part.priceWithVAT || part.price),
      discount: parseFloat(part.discount || '0'),
      imageUrl: part.imageUrl || '',
      technicalSpecs: {
        spec1: part.spec1 || '',
        spec2: part.spec2 || '',
        spec3: part.spec3 || '',
        spec4: part.spec4 || '',
        spec5: part.spec5 || '',
        spec6: part.spec6 || '',
        spec7: part.spec7 || '',
      },
      stock: part.stock,
    };

    addToCart(sparePart);
    setAddedToCart(prev => new Set(prev).add(part.id));
    setTimeout(() => {
      setAddedToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(part.id);
        return newSet;
      });
    }, 2000);

    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-[#ff6b00] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right-4';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span class="font-semibold">${part.title} dodan u košaricu!</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }, [addToCart]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedBrands([]);
    setSelectedAvailability([]);
    setShowOnlyDiscount(false);
    const maxPrice = Math.max(...partsData.map(p => parseFloat(p.priceWithVAT || p.price)));
    setPriceRange([0, Math.ceil(maxPrice / 100) * 100]);
    setDisplayLimit(12);
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedBrands.length > 0 || 
    selectedAvailability.length > 0 || showOnlyDiscount;

  const loadMore = useCallback(async () => {
    if (loadingMore || displayLimit >= filteredParts.length) return;
    
    setLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setDisplayLimit(prev => Math.min(prev + 12, filteredParts.length));
    setLoadingMore(false);
  }, [loadingMore, displayLimit, filteredParts.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && displayLimit < filteredParts.length) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, loadingMore, displayLimit, filteredParts.length]);

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />

      <main className="flex-grow pb-20 lg:pb-0">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                Katalog rezervnih dijelova
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-2xl">
                Pronađite savršene rezervne dijelove za vaše građevinske strojeve i mašine.
                Preko {partsData.length} artikala dostupnih odmah.
              </p>
            </div>

            <div className="flex gap-4 lg:gap-6">
              <aside className={`
                fixed lg:sticky lg:top-24 left-0 top-0 h-full lg:h-auto w-full sm:w-80 bg-[#0b0b0b] lg:bg-transparent
                border-r border-white/10 lg:border-0 p-4 sm:p-6 lg:p-0 z-40 overflow-y-auto
                transition-transform duration-300 lg:translate-x-0
                ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
              `}>
                <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between lg:hidden mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white">Filteri</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2.5 text-neutral-400 hover:text-white active:scale-95 touch-manipulation rounded-lg hover:bg-white/5"
                    >
                      <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  <div className="relative">
                    <SearchIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Pretraži..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-[#101010] border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-neutral-500 focus:border-[#ff6b00]/50 focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                    />
                  </div>

                  <div className="bg-[#101010] border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 uppercase tracking-wide">Kategorije</h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-all touch-manipulation ${
                          selectedCategory === null
                            ? 'bg-[#ff6b00] text-black font-semibold'
                            : 'text-neutral-300 active:bg-white/5'
                        }`}
                      >
                        Sve kategorije
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-all touch-manipulation ${
                            selectedCategory === category.id
                              ? 'bg-[#ff6b00] text-black font-semibold'
                              : 'text-neutral-300 active:bg-white/5'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#101010] border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 uppercase tracking-wide">Brend</h3>
                    <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto">
                      {availableBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer group touch-manipulation">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBrands([...selectedBrands, brand]);
                              } else {
                                setSelectedBrands(selectedBrands.filter(b => b !== brand));
                              }
                            }}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded border-white/20 bg-[#1a1a1a] text-[#ff6b00] focus:ring-[#ff6b00]/50 focus:ring-2"
                          />
                          <span className="text-xs sm:text-sm text-neutral-300 group-hover:text-white transition-colors">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#101010] border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 uppercase tracking-wide">Dostupnost</h3>
                    <div className="space-y-1.5 sm:space-y-2">
                      {[
                        { value: 'available', label: 'Dostupno odmah' },
                        { value: '15_days', label: 'Rok isporuke 15 dana' },
                        { value: 'on_request', label: 'Po dogovoru' }
                      ].map(({ value, label }) => (
                        <label key={value} className="flex items-center gap-2 cursor-pointer group touch-manipulation">
                          <input
                            type="checkbox"
                            checked={selectedAvailability.includes(value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAvailability([...selectedAvailability, value]);
                              } else {
                                setSelectedAvailability(selectedAvailability.filter(a => a !== value));
                              }
                            }}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded border-white/20 bg-[#1a1a1a] text-[#ff6b00] focus:ring-[#ff6b00]/50 focus:ring-2"
                          />
                          <span className="text-xs sm:text-sm text-neutral-300 group-hover:text-white transition-colors">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#101010] border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 uppercase tracking-wide">Cijena</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-400">
                        <span>{priceRange[0]} BAM</span>
                        <span>{priceRange[1]} BAM</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.max(...partsData.map(p => parseFloat(p.priceWithVAT || p.price)), 10000)}
                        step="50"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff6b00] touch-manipulation"
                      />
                    </div>
                  </div>

                  <div className="bg-[#101010] border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <label className="flex items-center gap-2 cursor-pointer group touch-manipulation">
                      <input
                        type="checkbox"
                        checked={showOnlyDiscount}
                        onChange={(e) => setShowOnlyDiscount(e.target.checked)}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded border-white/20 bg-[#1a1a1a] text-[#ff6b00] focus:ring-[#ff6b00]/50 focus:ring-2"
                      />
                      <span className="text-xs sm:text-sm text-neutral-300 group-hover:text-white transition-colors font-semibold">Samo sa popustom</span>
                    </label>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="w-full bg-red-500/10 active:bg-red-500/20 text-red-400 px-4 py-3 rounded-lg sm:rounded-xl font-semibold transition-all active:scale-95 touch-manipulation text-sm sm:text-base"
                    >
                      Očisti sve filtere
                    </button>
                  )}
                </div>
              </aside>

              {showMobileFilters && (
                <div
                  className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                  onClick={() => setShowMobileFilters(false)}
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                    <button
                      onClick={() => setShowMobileFilters(true)}
                      className="lg:hidden flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#101010] border border-white/10 rounded-lg sm:rounded-xl text-neutral-200 active:border-[#ff6b00]/50 transition-all active:scale-95 touch-manipulation text-sm sm:text-base"
                    >
                      <FilterIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Filteri</span>
                    </button>
                    <p className="text-neutral-400 text-xs sm:text-sm">
                      {loading ? 'Učitavanje...' : `${filteredParts.length} ${filteredParts.length === 1 ? 'rezultat' : filteredParts.length < 5 ? 'rezultata' : 'rezultata'}`}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="text-center py-20">
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
                )}

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-[#ff6b00]/30 border-t-[#ff6b00] rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-neutral-400">Učitavanje kataloga...</p>
                    </div>
                  </div>
                ) : error ? null : filteredParts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[#101010] rounded-full flex items-center justify-center">
                      <SearchIcon className="w-8 h-8 text-neutral-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Nema rezultata</h3>
                    <p className="text-neutral-400 mb-6">
                      Pokušajte promijeniti kriterije pretrage ili filtere.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="bg-[#ff6b00] hover:bg-[#ff7f1a] text-black px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
                    >
                      Prikaži sve dijelove
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                      {filteredParts.slice(0, displayLimit).map((part) => (
                        <ProductCard
                          key={part.id}
                          part={part}
                          onAddToCart={handleAddToCart}
                          isAdded={addedToCart.has(part.id)}
                        />
                      ))}
                    </div>

                    {filteredParts.length > displayLimit && (
                      <div ref={observerTarget} className="text-center mt-8 sm:mt-10 md:mt-12 py-6 sm:py-8">
                        <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm sm:text-base">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#ff6b00]/30 border-t-[#ff6b00] rounded-full animate-spin"></div>
                          <span>Učitavanje još {Math.min(12, filteredParts.length - displayLimit)} dijelova...</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
