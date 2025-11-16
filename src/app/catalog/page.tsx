'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page, SparePart, Availability } from '@/types';
import { useCart } from '@/lib/hooks/useCart';
import { SearchIcon, FilterIcon } from '@/lib/icons';
import ProductCard from '@/components/catalog/ProductCard';
import FilterPanel from '@/components/catalog/FilterPanel';
import { PartData, transformPartDataToSparePart } from '@/utils/dataTransform';



const computeRoundedMaxPrice = (parts: PartData[]) => {
  if (!parts.length) return 0;
  try {
    const prices = parts
      .map(part => {
        const price = parseFloat(part.priceWithVAT || part.price);
        return isNaN(price) ? 0 : price;
      })
      .filter(price => price > 0);
    if (!prices.length) return 10000; // fallback
    const maxValue = Math.max(...prices);
    return Math.ceil(maxValue / 100) * 100;
  } catch (error) {
    console.error('Error computing max price:', error);
    return 10000; // fallback
  }
};


export default function CatalogPage() {
  const { addToCart } = useCart();
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const roundedMaxPrice = useMemo(() => computeRoundedMaxPrice(partsData), [partsData]);
  const priceSliderMax = roundedMaxPrice > 0 ? Math.max(roundedMaxPrice, 10000) : 10000;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.time('Catalog data fetch');
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
        if (!parts || parts.length === 0) {
          throw new Error('Nema dostupnih dijelova za prikaz.');
        }
        const activeParts = parts.filter((part: PartData) => part.isActive);

        console.timeEnd('Catalog data fetch');
        console.log('Catalog loaded parts:', activeParts.length, 'items');

        setPartsData(activeParts);
        setCategories(cats);

        const roundedMax = computeRoundedMaxPrice(activeParts);
        setPriceRange([0, roundedMax]);
      } catch (error) {
        console.timeEnd('Catalog data fetch');
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
      const matchesPrice = !isNaN(partPrice) && partPrice >= priceRange[0] && partPrice <= priceRange[1];

      const matchesDiscount = !showOnlyDiscount || (part.discount && parseFloat(part.discount) > 0);

      return matchesSearch && matchesCategory && matchesBrand && matchesAvailability && matchesPrice && matchesDiscount;
    });
  }, [partsData, searchQuery, selectedCategory, selectedBrands, selectedAvailability, priceRange, showOnlyDiscount]);

  const handleAddToCart = useCallback((part: PartData) => {
    const sparePart = transformPartDataToSparePart(part);

    addToCart(sparePart);
    setAddedToCart(prev => new Set(prev).add(part.id));
    setTimeout(() => {
      setAddedToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(part.id);
        return newSet;
      });
    }, 2000);

    setToastMessage(`${part.title} dodan u košaricu!`);
    setTimeout(() => setToastMessage(null), 3000);
  }, [addToCart]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedBrands([]);
    setSelectedAvailability([]);
    setShowOnlyDiscount(false);
    const resetMax = roundedMaxPrice || priceSliderMax;
    setPriceRange([0, resetMax]);
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
    <div className="bg-secondary-950 text-neutral-100 min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow pb-20 lg:pb-0">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 sm:mb-8 animate-fade-in">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                Katalog rezervnih dijelova
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-2xl">
                Pronađite savršene rezervne dijelove za vaše građevinske strojeve i mašine.
                Preko {partsData.length} artikala dostupnih odmah.
              </p>
            </div>

            <div className="flex gap-4 lg:gap-6">
              <FilterPanel
                showMobileFilters={showMobileFilters}
                setShowMobileFilters={setShowMobileFilters}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                availableBrands={availableBrands}
                selectedBrands={selectedBrands}
                setSelectedBrands={setSelectedBrands}
                selectedAvailability={selectedAvailability}
                setSelectedAvailability={setSelectedAvailability}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                priceSliderMax={priceSliderMax}
                showOnlyDiscount={showOnlyDiscount}
                setShowOnlyDiscount={setShowOnlyDiscount}
                hasActiveFilters={!!hasActiveFilters}
                clearFilters={clearFilters}
              />

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
                      className="lg:hidden flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-secondary-800/50 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl text-neutral-200 hover:bg-secondary-700/50 active:border-primary-500/50 transition-all active:scale-95 touch-manipulation text-sm sm:text-base focus-ring shadow-lg"
                      aria-label="Open filters"
                    >
                      <FilterIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Filteri</span>
                      {hasActiveFilters && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                      )}
                    </button>
                    <div className="flex items-center gap-2">
                      <p className="text-neutral-400 text-xs sm:text-sm">
                        {loading ? 'Učitavanje...' : `${filteredParts.length} ${filteredParts.length === 1 ? 'rezultat' : filteredParts.length < 5 ? 'rezultata' : 'rezultata'}`}
                      </p>
                      {hasActiveFilters && (
                        <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-1 rounded-full">
                          Filtrirano
                        </span>
                      )}
                    </div>
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

      {toastMessage && (
        <div className="fixed top-4 right-4 bg-[#ff6b00] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
