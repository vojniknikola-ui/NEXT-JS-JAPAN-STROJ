'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useDeferredValue } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page, SparePart, Availability } from '@/types';
import { useCart } from '@/lib/hooks/useCart';
import { SearchIcon, FilterIcon, CartIcon, CheckIcon, XIcon } from '@/lib/icons';
import { useToast } from '@/components/ui/ToastProvider';

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
  thumbUrl?: string | null;
  blurData?: string | null;
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

interface PartsApiResponse {
  items?: PartData[];
  nextCursor?: string | null;
  hasMore?: boolean;
}

const CATALOG_PAGE_SIZE = 16;
const CATALOG_MAX_PRICE = 10000;
type CatalogSortOption = 'newest' | 'price_asc' | 'price_desc' | 'relevance';

const AvailabilityBadge: React.FC<{ availability: string }> = ({ availability }) => {
  const baseClasses = 'px-1.5 sm:px-2 py-0.5 sm:py-1 text-[8px] sm:text-xs font-semibold rounded-full uppercase tracking-wide';
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

interface ProductCardProps {
  part: PartData;
  onAddToCart: (part: PartData) => void;
  isAdded: boolean;
}

const ProductCard = React.memo(function ProductCard({
  part,
  onAddToCart,
  isAdded,
}: ProductCardProps) {
  const displayImageUrl = part.thumbUrl || part.imageUrl;
  const priceAfterDiscount = part.priceWithVAT && part.discount
    ? parseFloat(part.priceWithVAT) * (1 - parseFloat(part.discount) / 100)
    : parseFloat(part.priceWithVAT || part.price);

  return (
    <article
      data-testid="product-card"
      className="group overflow-hidden rounded-lg border border-white/5 bg-[#101010] transition-all duration-200 active:border-[#ff6b00]/30 sm:rounded-2xl sm:hover:-translate-y-1 sm:hover:shadow-[0_10px_40px_-15px_rgba(255,107,0,0.3)] [contain-intrinsic-size:280px] [content-visibility:auto]"
    >
      <Link
        href={`/product/${part.id}`}
        data-testid="product-card-open"
        className="relative block aspect-[4/3] cursor-pointer overflow-hidden bg-[#1a1a1a] touch-manipulation sm:aspect-square"
      >
        {displayImageUrl ? (
          <Image
            src={displayImageUrl}
            alt={part.title}
            fill
            loading="lazy"
            quality={72}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            placeholder={part.blurData ? 'blur' : 'empty'}
            blurDataURL={part.blurData || undefined}
            className="h-full w-full object-cover transition-transform duration-300 sm:group-hover:scale-105"
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
          <div className="absolute left-2 top-2 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white sm:left-3 sm:top-3 sm:px-2 sm:py-1 sm:text-xs">
            -{part.discount}%
          </div>
        )}
      </Link>

      <div className="p-2.5 sm:p-5 md:p-6">
        <div className="mb-2 sm:mb-3">
          <Link href={`/product/${part.id}`} className="block">
            <h3 className="mb-1 min-h-[2.35rem] text-xs font-semibold leading-snug text-white line-clamp-2 transition-colors sm:min-h-0 sm:text-base sm:group-hover:text-[#ff6b00]">
              {part.title}
            </h3>
          </Link>
          {(part.brand || part.model) && (
            <p className="truncate text-[11px] text-neutral-400 sm:text-sm">
              {part.brand}{part.brand && part.model && ' • '}{part.model}
            </p>
          )}
          {part.catalogNumber && (
            <p className="mt-1 hidden truncate text-[10px] text-neutral-500 sm:block sm:text-xs">
              Kat. broj: {part.catalogNumber}
            </p>
          )}
        </div>

        <div className="mb-2 space-y-1 sm:mb-4 sm:space-y-2">
          {part.priceWithoutVAT && (
            <p className="hidden text-xs text-neutral-400 sm:block sm:text-sm">
              Bez PDV-a: {parseFloat(part.priceWithoutVAT).toFixed(2)} {part.currency}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-sm font-bold text-[#ff6b00] sm:text-lg">
              {priceAfterDiscount.toFixed(2)} {part.currency}
            </span>
            {part.discount && parseFloat(part.discount) > 0 && (
              <span className="text-[10px] text-neutral-500 line-through sm:text-sm">
                {parseFloat(part.priceWithVAT || part.price).toFixed(2)} {part.currency}
              </span>
            )}
          </div>
        </div>

        <button
          data-testid={`add-to-cart-${part.id}`}
          onClick={(event) => {
            event.stopPropagation();
            onAddToCart(part);
          }}
          disabled={isAdded}
          className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-[10px] font-bold uppercase tracking-wide transition-all duration-200 touch-manipulation sm:gap-2 sm:rounded-full sm:px-4 sm:py-3 sm:text-sm ${
            isAdded
              ? 'bg-emerald-500 text-white shadow-emerald-500/70'
              : 'bg-gradient-to-br from-[#ff6b00] to-[#ff8c33] text-black active:scale-95 sm:hover:scale-105 shadow-[0_8px_25px_rgba(255,107,0,0.6)] sm:hover:shadow-[0_12px_35px_rgba(255,107,0,0.8)]'
          }`}
        >
          {isAdded ? (
            <>
              <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Dodano</span>
            </>
          ) : (
            <>
              <CartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="sm:hidden">Dodaj</span>
              <span className="hidden sm:inline">Dodaj u košaricu</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}, (prev, next) => (
  prev.isAdded === next.isAdded &&
  prev.onAddToCart === next.onAddToCart &&
  prev.part.id === next.part.id &&
  prev.part.title === next.part.title &&
  prev.part.brand === next.part.brand &&
  prev.part.model === next.part.model &&
  prev.part.catalogNumber === next.part.catalogNumber &&
  prev.part.delivery === next.part.delivery &&
  prev.part.price === next.part.price &&
  prev.part.priceWithVAT === next.part.priceWithVAT &&
  prev.part.discount === next.part.discount &&
  prev.part.thumbUrl === next.part.thumbUrl &&
  prev.part.imageUrl === next.part.imageUrl
));

export default function CatalogPage() {
  const toast = useToast();
  const [activePage, setActivePage] = useState<Page>('catalog');
  const { cartItemCount, addToCart } = useCart();
  const [partsData, setPartsData] = useState<PartData[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<CatalogSortOption>('newest');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, CATALOG_MAX_PRICE]);
  const [showOnlyDiscount, setShowOnlyDiscount] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [addedToCart, setAddedToCart] = useState<Set<number>>(new Set());
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const deferredMinPrice = useDeferredValue(priceRange[0]);
  const deferredMaxPrice = useDeferredValue(priceRange[1]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const categoriesRes = await fetch('/api/categories', { signal: controller.signal });

        if (!categoriesRes.ok) {
          throw new Error(`Greška pri učitavanju kategorija: ${categoriesRes.status}`);
        }

        const cats = await categoriesRes.json();
        setCategories(cats);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Error fetching categories:', error);
      }
    };

    void fetchCategories();

    return () => controller.abort();
  }, []);

  const buildCatalogParams = useCallback(
    (cursorValue?: string | null) => {
      const params = new URLSearchParams();
      params.set('status', 'active');
      params.set('limit', String(CATALOG_PAGE_SIZE));

      if (sortOption === 'price_asc') {
        params.set('sort', 'priceWithVAT');
        params.set('order', 'asc');
      } else if (sortOption === 'price_desc') {
        params.set('sort', 'priceWithVAT');
        params.set('order', 'desc');
      } else if (sortOption === 'relevance' && deferredSearchQuery.trim()) {
        params.set('sort', 'relevance');
        params.set('order', 'desc');
      } else {
        params.set('sort', 'id');
        params.set('order', 'desc');
      }

      if (cursorValue) params.set('cursor', cursorValue);
      if (deferredSearchQuery.trim()) params.set('q', deferredSearchQuery.trim());
      if (selectedCategory !== null) params.set('categoryId', String(selectedCategory));
      if (selectedBrands.length) params.set('brand', selectedBrands.join(','));
      if (selectedAvailability.length) params.set('delivery', selectedAvailability.join(','));
      if (showOnlyDiscount) params.set('withDiscount', 'true');

      if (deferredMinPrice > 0) params.set('minPrice', String(deferredMinPrice));
      if (deferredMaxPrice < CATALOG_MAX_PRICE) params.set('maxPrice', String(deferredMaxPrice));

      return params;
    },
    [
      deferredSearchQuery,
      sortOption,
      selectedCategory,
      selectedBrands,
      selectedAvailability,
      showOnlyDiscount,
      deferredMinPrice,
      deferredMaxPrice,
    ]
  );

  const fetchCatalogPage = useCallback(
    async ({
      cursorValue,
      append,
      signal,
    }: {
      cursorValue?: string | null;
      append?: boolean;
      signal?: AbortSignal;
    }) => {
      const params = buildCatalogParams(cursorValue);
      const response = await fetch(`/api/parts?${params.toString()}`, { signal });

      if (!response.ok) {
        throw new Error(`Greška pri učitavanju dijelova: ${response.status}`);
      }

      const payload = (await response.json()) as PartsApiResponse | PartData[];
      const items = Array.isArray(payload) ? payload : payload.items ?? [];
      const newNextCursor = Array.isArray(payload) ? null : payload.nextCursor ?? null;
      const newHasMore = Array.isArray(payload) ? false : Boolean(payload.hasMore);

      setPartsData((prev) => {
        const merged = append ? [...prev, ...items] : items;
        const seenIds = new Set<number>();
        return merged.filter((item) => {
          if (seenIds.has(item.id)) return false;
          seenIds.add(item.id);
          return true;
        });
      });
      setNextCursor(newNextCursor);
      setHasMore(newHasMore);
    },
    [buildCatalogParams]
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchFirstPage = async () => {
      try {
        setLoading(true);
        setError(null);
        setLoadingMore(false);
        await fetchCatalogPage({ append: false, signal: controller.signal });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Error fetching catalog page:', error);
        setError(error instanceof Error ? error.message : 'Došlo je do greške pri učitavanju podataka');
        setPartsData([]);
        setNextCursor(null);
        setHasMore(false);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchFirstPage();

    return () => controller.abort();
  }, [fetchCatalogPage]);

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    partsData.forEach(part => {
      if (part.brand) brands.add(part.brand);
    });
    return Array.from(brands).sort();
  }, [partsData]);

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
      thumbUrl: part.thumbUrl || undefined,
      blurData: part.blurData || undefined,
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
    toast.success('Dodano u košaricu', `${part.title} je dodan.`);
  }, [addToCart, toast]);

  const clearFilters = () => {
    setSearchQuery('');
    setSortOption('newest');
    setSelectedCategory(null);
    setSelectedBrands([]);
    setSelectedAvailability([]);
    setShowOnlyDiscount(false);
    setPriceRange([0, CATALOG_MAX_PRICE]);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== null ||
    selectedBrands.length > 0 ||
    selectedAvailability.length > 0 ||
    showOnlyDiscount ||
    priceRange[1] !== CATALOG_MAX_PRICE ||
    sortOption !== 'newest';

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      await fetchCatalogPage({ cursorValue: nextCursor, append: true });
    } catch (error) {
      console.error('Error loading next catalog page:', error);
      toast.error('Učitavanje nije uspjelo', 'Pokušajte ponovo.');
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, nextCursor, fetchCatalogPage, toast]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          void loadMore();
        }
      },
      { rootMargin: '450px 0px', threshold: 0.01 }
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
  }, [hasMore, loading, loadingMore, loadMore]);

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />

      <main className="flex-grow safe-main-padding lg:pb-0">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-5 sm:mb-8">
              <h1 data-testid="catalog-title" className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                Katalog rezervnih dijelova
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-2xl">
                Pronađite savršene rezervne dijelove za vaše građevinske strojeve i mašine.
                Katalog se učitava po stranicama za brži rad na mobilnim uređajima.
              </p>
            </div>

            <div className="flex gap-4 lg:gap-6">
              <aside
                data-testid="catalog-filters-panel"
                className={`
                fixed lg:sticky lg:top-24 left-0 top-14 sm:top-16 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] lg:h-auto w-full sm:w-80 bg-[#0b0b0b] lg:bg-transparent
                border-r border-white/10 lg:border-0 p-4 sm:p-6 lg:p-0 z-[70] lg:z-auto overflow-y-auto pb-24 sm:pb-28 lg:pb-0
                transition-transform duration-300 lg:translate-x-0
                ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
              `}
              >
                <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between lg:hidden mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-white">Filteri</h2>
                    <button
                      data-testid="catalog-mobile-filters-close"
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2.5 text-neutral-400 hover:text-white active:scale-95 touch-manipulation rounded-lg hover:bg-white/5"
                    >
                      <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  <div className="relative">
                    <SearchIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400" />
                    <input
                      data-testid="catalog-search"
                      type="text"
                      placeholder="Pretraga proizvoda..."
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
                              setSelectedBrands((prev) =>
                                e.target.checked
                                  ? [...prev, brand]
                                  : prev.filter((b) => b !== brand)
                              );
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
                              setSelectedAvailability((prev) =>
                                e.target.checked
                                  ? [...prev, value]
                                  : prev.filter((a) => a !== value)
                              );
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
                        max={CATALOG_MAX_PRICE}
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
                      data-testid="catalog-clear-filters"
                      onClick={clearFilters}
                      className="w-full bg-red-500/10 active:bg-red-500/20 text-red-400 px-4 py-3 rounded-lg sm:rounded-xl font-semibold transition-all active:scale-95 touch-manipulation text-sm sm:text-base"
                    >
                      Poništi filtere
                    </button>
                  )}
                </div>
              </aside>

              {showMobileFilters && (
                <div
                  className="fixed inset-0 bg-black/70 backdrop-blur-[2px] z-[60] lg:hidden"
                  onClick={() => setShowMobileFilters(false)}
                />
              )}

              <div className="flex-1 min-w-0">
                <div className="sticky top-14 z-30 -mx-3 mb-4 flex items-center justify-between gap-2 border-b border-white/5 bg-[#0b0b0b]/95 px-3 py-3 backdrop-blur-md sm:static sm:mx-0 sm:mb-6 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
                    <button
                      data-testid="catalog-mobile-filters-open"
                      onClick={() => setShowMobileFilters(true)}
                      className="lg:hidden flex items-center gap-1.5 rounded-full border border-white/10 bg-[#101010] px-3 py-2 text-sm text-neutral-200 transition-all active:scale-95 active:border-[#ff6b00]/50"
                    >
                      <FilterIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Filteri</span>
                    </button>
                    <p className="truncate text-xs text-neutral-300 sm:text-sm">
                      {loading ? 'Učitavanje...' : `Prikazano ${partsData.length}${hasMore ? '+' : ''} rezultata`}
                    </p>
                  </div>
                  <div className="w-[132px] shrink-0 sm:w-[170px]">
                    <label htmlFor="catalog-sort" className="sr-only">Sortiranje</label>
                    <select
                      id="catalog-sort"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as CatalogSortOption)}
                      className="w-full rounded-lg border border-white/10 bg-[#101010] px-3 py-2 text-xs text-neutral-200 outline-none transition focus:border-[#ff6b00]/50 focus:ring-2 focus:ring-[#ff6b00]/25 sm:text-sm"
                    >
                      <option value="newest">Najnoviji</option>
                      <option value="price_asc">Cijena rastuće</option>
                      <option value="price_desc">Cijena opadajuće</option>
                      <option value="relevance" disabled={!searchQuery.trim()}>Relevantnost</option>
                    </select>
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
                ) : error ? null : partsData.length === 0 ? (
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
                    <div data-testid="catalog-grid" className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 lg:gap-6">
                      {partsData.map((part) => (
                        <ProductCard
                          key={part.id}
                          part={part}
                          onAddToCart={handleAddToCart}
                          isAdded={addedToCart.has(part.id)}
                        />
                      ))}
                    </div>

                    {hasMore && (
                      <div ref={observerTarget} className="text-center mt-8 sm:mt-10 md:mt-12 py-6 sm:py-8">
                        <div className="flex items-center justify-center gap-2 text-neutral-400 text-sm sm:text-base">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#ff6b00]/30 border-t-[#ff6b00] rounded-full animate-spin"></div>
                          <span>Učitavanje još dijelova...</span>
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
