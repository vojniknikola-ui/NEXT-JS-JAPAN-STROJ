'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page, SparePart, Availability } from '@/types';
import { useCart } from '@/lib/hooks/useCart';
import { useSpareParts } from '@/lib/hooks/useSpareParts';
import { SearchIcon, FilterIcon, CartIcon, CheckIcon } from '@/lib/icons';

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
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full uppercase tracking-wide';
  switch (availability) {
    case 'available':
      return <div className={`${baseClasses} bg-emerald-500/90 text-white`}>Dostupno odmah</div>;
    case '15_days':
      return <div className={`${baseClasses} bg-[#ff6b00] text-black`}>Rok isporuke 15 dana</div>;
    case 'on_request':
      return <div className={`${baseClasses} bg-red-500/90 text-white`}>Dostupnost po dogovoru</div>;
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
    <article className="group bg-[#101010] border border-white/5 rounded-2xl overflow-hidden hover:border-[#ff6b00]/30 transition-all duration-300 hover:shadow-[0_10px_40px_-15px_rgba(255,107,0,0.3)] hover:-translate-y-1">
      <div className="relative aspect-square bg-[#1a1a1a] overflow-hidden cursor-pointer" onClick={() => router.push(`/product/${part.id}`)}>
        {part.imageUrl ? (
          <img
            src={part.imageUrl}
            alt={part.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 bg-[#ff6b00]/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-xs">Nema slike</p>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <AvailabilityBadge availability={part.delivery || 'available'} />
        </div>
        {part.discount && parseFloat(part.discount) > 0 && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{part.discount}%
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="mb-3">
          <div className="text-xs text-neutral-500 mb-1 font-mono">{part.sku}</div>
          <h3 className="font-semibold text-white mb-1 line-clamp-2 group-hover:text-[#ff6b00] transition-colors cursor-pointer" onClick={() => router.push(`/product/${part.id}`)}>
            {part.title}
          </h3>
          {(part.brand || part.model) && (
            <p className="text-sm text-neutral-400">
              {part.brand}{part.brand && part.model && ' • '}{part.model}
            </p>
          )}
          {part.catalogNumber && (
            <p className="text-xs text-neutral-500 mt-1">
              Kat. broj: {part.catalogNumber}
            </p>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {part.priceWithoutVAT && (
            <p className="text-sm text-neutral-400">
              Bez PDV-a: {parseFloat(part.priceWithoutVAT).toFixed(2)} {part.currency}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#ff6b00]">
              {priceAfterDiscount.toFixed(2)} {part.currency}
            </span>
            {part.discount && parseFloat(part.discount) > 0 && (
              <span className="text-sm text-neutral-500 line-through">
                {parseFloat(part.priceWithVAT || part.price).toFixed(2)} {part.currency}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onAddToCart(part)}
          disabled={isAdded}
          className={`w-full px-4 py-3 rounded-full font-semibold text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2 ${
            isAdded
              ? 'bg-emerald-500 text-white shadow-emerald-500/70'
              : 'bg-gradient-to-br from-[#ff6b00] to-[#ff8c33] text-white hover:from-[#ff7f1a] hover:to-[#ffa04d] hover:scale-105 shadow-[0_8px_25px_rgba(255,107,0,0.6)] hover:shadow-[0_12px_35px_rgba(255,107,0,0.8)]'
          }`}
        >
          {isAdded ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Dodano!
            </>
          ) : (
            <>
              <CartIcon className="w-4 h-4" />
              Dodaj u košaricu
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
  const [showFilters, setShowFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState<Set<number>>(new Set());
  const [displayLimit, setDisplayLimit] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);

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

        const [parts, cats] = await Promise.all([
          partsRes.json(),
          categoriesRes.json()
        ]);

        // Filter only active parts
        const activeParts = parts.filter((part: PartData) => part.isActive);
        setPartsData(activeParts);
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Došlo je do greške pri učitavanju podataka');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

      return matchesSearch && matchesCategory;
    });
  }, [partsData, searchQuery, selectedCategory]);

  const handleAddToCart = useCallback((part: PartData) => {
    console.log('Adding to cart:', part); // Debug log

    // Convert PartData to SparePart format for cart
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

    console.log('Converted SparePart:', sparePart); // Debug log

    addToCart(sparePart);
    setAddedToCart(prev => new Set(prev).add(part.id));
    setTimeout(() => {
      setAddedToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(part.id);
        return newSet;
      });
    }, 2000);

    // Show toast notification
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

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Katalog rezervnih dijelova
              </h1>
              <p className="text-lg text-neutral-400 max-w-2xl">
                Pronađite savršene rezervne dijelove za vaše građevinske strojeve i mašine.
                Preko {partsData.length} artikala dostupnih odmah.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Pretražite po nazivu, marki, modelu ili katalog broju..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#101010] border border-white/10 rounded-2xl text-white placeholder-neutral-500 focus:border-[#ff6b00]/50 focus:ring-2 focus:ring-[#ff6b00]/20 outline-none transition-all"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-6 py-4 bg-[#101010] border border-white/10 rounded-2xl text-neutral-200 hover:border-[#ff6b00]/50 transition-all"
                >
                  <FilterIcon className="w-5 h-5" />
                  Filteri
                </button>
              </div>

              {/* Category Filters */}
              {showFilters && (
                <div className="bg-[#101010] border border-white/10 rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Kategorije</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === null
                          ? 'bg-[#ff6b00] text-black'
                          : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      Sve kategorije
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          selectedCategory === category.id
                            ? 'bg-[#ff6b00] text-black'
                            : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results Count */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-neutral-400">
                  {loading ? 'Učitavanje...' : `Prikazano ${Math.min(displayLimit, filteredParts.length)} od ${filteredParts.length} ${filteredParts.length === 1 ? 'dio' : filteredParts.length < 5 ? 'dijela' : 'dijelova'}`}
                </p>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                      setDisplayLimit(12);
                    }}
                    className="text-[#ff6b00] hover:text-[#ff7f1a] text-sm font-medium transition-colors self-start sm:self-auto"
                  >
                    Očisti filtere
                  </button>
                )}
              </div>
            </div>

            {/* Error State */}
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

            {/* Products Grid */}
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
                  {searchQuery || selectedCategory
                    ? 'Pokušajte promijeniti kriterije pretrage ili filtere.'
                    : 'Trenutno nema dostupnih dijelova.'}
                </p>
                {(searchQuery || selectedCategory) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                    className="bg-[#ff6b00] hover:bg-[#ff7f1a] text-black px-6 py-3 rounded-full font-semibold transition-all hover:scale-105"
                  >
                    Prikaži sve dijelove
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredParts.slice(0, displayLimit).map((part) => (
                    <ProductCard
                      key={part.id}
                      part={part}
                      onAddToCart={handleAddToCart}
                      isAdded={addedToCart.has(part.id)}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {filteredParts.length > displayLimit && (
                  <div className="text-center mt-12">
                    <button
                      onClick={async () => {
                        setLoadingMore(true);
                        // Simulate loading delay for better UX
                        await new Promise(resolve => setTimeout(resolve, 500));
                        setDisplayLimit(prev => Math.min(prev + 12, filteredParts.length));
                        setLoadingMore(false);
                      }}
                      disabled={loadingMore}
                      className="bg-[#101010] border border-white/10 hover:border-[#ff6b00]/50 text-neutral-200 hover:text-[#ff6b00] px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      {loadingMore ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#ff6b00]/30 border-t-[#ff6b00] rounded-full animate-spin"></div>
                          Učitavanje...
                        </>
                      ) : (
                        <>
                          Učitaj još dijelova ({filteredParts.length - displayLimit} preostalo)
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
