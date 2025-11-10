'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page, SparePart, Availability } from '@/types';
import { ShareIcon, FacebookIcon, CopyIcon, CheckIcon, CartIcon, SearchIcon, WhatsAppIcon, ViberIcon } from '@/lib/icons';
import { useCart } from '@/lib/hooks/useCart';

const AvailabilityBadge: React.FC<{ availability: Availability }> = ({ availability }) => {
  const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide text-white';
  switch (availability) {
    case Availability.Available:
      return <div className={`${baseClasses} bg-emerald-500/90`}>Dostupno odmah</div>;
    case Availability.FifteenDays:
      return <div className={`${baseClasses} bg-[#ff6b00] text-black`}>Rok isporuke 15 dana</div>;
    case Availability.OnRequest:
      return <div className={`${baseClasses} bg-red-500/90`}>Dostupnost po dogovoru</div>;
    default:
      return null;
  }
};

const ProductCard: React.FC<{
  product: SparePart;
  onAddToCart: (product: SparePart) => void;
  onSelectProduct: (product: SparePart) => void;
}> = ({ product, onAddToCart, onSelectProduct }) => {
  const [isAdded, setIsAdded] = useState(false);
  const priceAfterDiscount = product.priceWithVAT * (1 - product.discount / 100);

  const handleCardClick = () => {
    onSelectProduct(product);
  };

  const handleShareClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.id}` : '';
    const shareMessage = `Pogledaj ${product.name} (${product.catalogNumber}) za ${priceAfterDiscount.toFixed(2)} BAM: ${productUrl}`;

    // Open WhatsApp, Facebook, and copy link
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
    navigator.clipboard.writeText(productUrl);
  };

  const handleAddToCartClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const technicalHighlights = [
    product.technicalSpecs.spec1,
    product.technicalSpecs.spec2,
    product.technicalSpecs.spec3,
  ].filter(Boolean);

  return (
    <div
      className="bg-[#101010] border border-white/5 rounded-2xl shadow-xl shadow-black/20 overflow-hidden transition-all duration-300 flex flex-col group hover:-translate-y-2 hover:shadow-[0_25px_70px_-30px_rgba(255,107,0,0.8)] cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover transform group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent group-hover:via-black/30 transition-all duration-500" />
        <div className="absolute top-3 right-3">
          <button
            onClick={handleShareClick}
            className="p-2.5 rounded-full bg-black/80 backdrop-blur-sm text-white hover:bg-[#ff6b00] hover:text-black transition-all duration-300 shadow-lg hover:shadow-[#ff6b00]/50 hover:scale-110"
            aria-label="Podijeli proizvod"
          >
            <ShareIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex-grow space-y-2">
          <h3 className="text-lg font-semibold text-white">{product.name}</h3>
          <p className="text-sm text-neutral-400">
            <strong>Brend:</strong> {product.brand}
          </p>
          <p className="text-sm text-neutral-400">
            <strong>Model:</strong> {product.model}
          </p>
          <p className="text-sm text-neutral-400">
            <strong>Primjena:</strong> {product.application}
          </p>
          <p className="text-sm text-neutral-400">
            <strong>Kataloški broj:</strong> {product.catalogNumber}
          </p>
          <div className="mt-4">
            <AvailabilityBadge availability={product.delivery} />
          </div>
          <div className="mt-4 space-y-1 text-sm text-neutral-300">
            <p>
              <strong>Cijena bez PDV-a:</strong> {product.priceWithoutVAT.toFixed(2)} BAM
            </p>
            <p>
              <strong>Cijena sa PDV-om:</strong> {product.priceWithVAT.toFixed(2)} BAM
            </p>
            {product.discount > 0 && (
              <p className="text-[#ff6b00] font-semibold">
                Popust {product.discount.toFixed(2)}% • {priceAfterDiscount.toFixed(2)} BAM
              </p>
            )}
          </div>
          <div className="mt-6 flex justify-between items-center">
            <p className="text-2xl font-bold text-[#ff6b00]">{priceAfterDiscount.toFixed(2)} BAM</p>
          </div>
          {technicalHighlights.length > 0 && (
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-neutral-500 mb-1">Istaknute specifikacije</p>
              <ul className="text-sm text-neutral-300 space-y-1">
                {technicalHighlights.map((spec, idx) => (
                  <li key={idx}>• {spec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-between items-center">
          <p className="text-2xl font-bold text-[#ff6b00]">{priceAfterDiscount.toFixed(2)} BAM</p>
          <button
            onClick={handleAddToCartClick}
            disabled={isAdded}
            className={`px-6 py-3.5 rounded-full font-black text-base uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2.5 min-w-[200px] shadow-2xl ${
              isAdded
                ? 'bg-emerald-500 text-white shadow-emerald-500/70'
                : 'bg-gradient-to-br from-[#ff6b00] to-[#ff8c33] text-white hover:from-[#ff7f1a] hover:to-[#ffa04d] hover:scale-110 shadow-[0_10px_40px_rgba(255,107,0,0.7)] hover:shadow-[0_15px_50px_rgba(255,107,0,0.9)]'
            }`}
          >
            {isAdded ? (
              <>
                <CheckIcon className="w-5 h-5" />
                Dodano!
              </>
            ) : (
              <>
                <CartIcon className="w-5 h-5" />
                Dodaj u košaricu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterCheckbox: React.FC<{ id: string; label: string; checked: boolean; onChange: () => void }> = ({ id, label, checked, onChange }) => (
  <div className="flex items-center">
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-white/20 bg-[#0f0f0f] text-[#ff6b00] focus:ring-[#ff6b00] focus:ring-offset-0"
    />
    <label htmlFor={id} className="ml-3 text-sm text-neutral-300">
      {label}
    </label>
  </div>
);

export default function CatalogPage() {
  const [activePage, setActivePage] = useState<Page>('catalog');
  const { cartItemCount, addToCart } = useCart();
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    brands: new Set<string>(),
    models: new Set<string>(),
    applications: new Set<string>(),
    availabilities: new Set<Availability>(),
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    // Load spare parts from API
    fetch('/api/spare-parts')
      .then(res => res.json())
      .then(data => setSpareParts(data))
      .catch(error => console.error('Error loading spare parts:', error));
  }, []);

  const availableBrands = React.useMemo(() => [...new Set(spareParts.map((p) => p.brand))].sort(), [spareParts]);
  const availableModels = React.useMemo(() => [...new Set(spareParts.map((p) => p.model))].sort(), [spareParts]);
  const availableApplications = React.useMemo(() => [...new Set(spareParts.map((p) => p.application))].sort(), [spareParts]);

  const availabilityLabels: Record<Availability, string> = {
    [Availability.Available]: 'Dostupno odmah',
    [Availability.FifteenDays]: 'Rok isporuke 15 dana',
    [Availability.OnRequest]: 'Dostupnost po dogovoru',
  };

  const handleFilterChange = React.useCallback((filterType: keyof typeof filters, value: string | Availability) => {
    setFilters((prev) => {
      const newFilters = {
        brands: new Set(prev.brands),
        models: new Set(prev.models),
        applications: new Set(prev.applications),
        availabilities: new Set(prev.availabilities),
      };

      if (filterType === 'availabilities') {
        const entry = value as Availability;
        if (newFilters.availabilities.has(entry)) {
          newFilters.availabilities.delete(entry);
        } else {
          newFilters.availabilities.add(entry);
        }
      } else {
        const entry = value as string;
        const target = newFilters[filterType];
        if (target.has(entry)) {
          target.delete(entry);
        } else {
          target.add(entry);
        }
      }

      return newFilters;
    });
  }, []);

  const resetFilters = React.useCallback(() => {
    setFilters({
      brands: new Set<string>(),
      models: new Set<string>(),
      applications: new Set<string>(),
      availabilities: new Set<Availability>(),
    });
  }, []);

  const filteredProducts = React.useMemo(() => {
    let result = spareParts.filter((product) => {
      // Hide products with 0 stock
      if ((product.stock || 0) <= 0) {
        return false;
      }

      const brandMatch = filters.brands.size === 0 || filters.brands.has(product.brand);
      const modelMatch = filters.models.size === 0 || filters.models.has(product.model);
      const applicationMatch = filters.applications.size === 0 || filters.applications.has(product.application);
      const availabilityMatch = filters.availabilities.size === 0 || filters.availabilities.has(product.delivery);
      return brandMatch && modelMatch && applicationMatch && availabilityMatch;
    });

    if (searchTerm) {
      const lowercased = searchTerm.toLowerCase();
      result = result.filter((product) =>
        product.name.toLowerCase().includes(lowercased) ||
        product.brand.toLowerCase().includes(lowercased) ||
        product.model.toLowerCase().includes(lowercased) ||
        product.application.toLowerCase().includes(lowercased) ||
        product.catalogNumber.toLowerCase().includes(lowercased)
      );
    }

    return result;
  }, [searchTerm, spareParts, filters]);

  const activeFilterCount =
    filters.brands.size +
    filters.models.size +
    filters.applications.size +
    filters.availabilities.size;

  const handleAddToCart = (part: SparePart) => {
    addToCart(part);
  };

  const handleSelectProduct = (part: SparePart) => {
    window.location.href = `/product/${part.id}`;
  };

  const renderFilters = () => (
    <div className="bg-[#101010] border border-white/10 p-6 rounded-2xl shadow-xl shadow-black/20">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Filteri</h3>
        {activeFilterCount > 0 && (
          <button onClick={resetFilters} className="text-sm font-semibold text-[#ff6b00] hover:text-[#ff8c33] transition-colors">
            Resetiraj filtere
          </button>
        )}
      </div>
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-3 border-b border-white/10 pb-2 text-neutral-200">Brend</h4>
          <div className="space-y-2">
            {availableBrands.map((brand) => (
              <FilterCheckbox
                key={brand}
                id={`brand-${brand}`}
                label={brand}
                checked={filters.brands.has(brand)}
                onChange={() => handleFilterChange('brands', brand)}
              />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 border-b border-white/10 pb-2 text-neutral-200">Model</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {availableModels.map((model) => (
              <FilterCheckbox
                key={model}
                id={`model-${model}`}
                label={model}
                checked={filters.models.has(model)}
                onChange={() => handleFilterChange('models', model)}
              />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 border-b border-white/10 pb-2 text-neutral-200">Primjena</h4>
          <div className="space-y-2">
            {availableApplications.map((application) => (
              <FilterCheckbox
                key={application}
                id={`application-${application}`}
                label={application}
                checked={filters.applications.has(application)}
                onChange={() => handleFilterChange('applications', application)}
              />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3 border-b border-white/10 pb-2 text-neutral-200">Dostupnost</h4>
          <div className="space-y-2">
            {Object.values(Availability).map((availability) => (
              <FilterCheckbox
                key={availability}
                id={`availability-${availability}`}
                label={availabilityLabels[availability]}
                checked={filters.availabilities.has(availability)}
                onChange={() => handleFilterChange('availabilities', availability)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Rezervni dijelovi</h2>
            <p className="text-neutral-400">Pretražite i filtrirajte našu ponudu profesionalnih komponenti.</p>
          </div>

          <div className="lg:flex lg:gap-10">
            <aside className="hidden lg:block lg:w-1/4 xl:w-1/5">{renderFilters()}</aside>

            <div className="w-full lg:w-3/4 xl:w-4/5">
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="w-full flex justify-between items-center px-5 py-4 bg-[#101010] border border-white/10 rounded-2xl shadow-[0_20px_60px_-25px_rgba(0,0,0,0.8)] text-white font-semibold text-lg"
                >
                  <span>Filteri ({activeFilterCount})</span>
                  <svg
                    className={`w-5 h-5 transition-transform ${isFiltersOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isFiltersOpen && <div className="mt-4">{renderFilters()}</div>}
              </div>

              <div className="mb-10 sticky top-24 z-40">
                <div className="relative bg-[#0b0b0b] border border-white/10 rounded-2xl shadow-[0_20px_60px_-25px_rgba(0,0,0,0.8)]">
                  <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Pretraži po nazivu, brendu, modelu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent px-14 py-4 text-lg text-white placeholder:text-neutral-500 rounded-2xl focus:outline-none focus:ring-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onSelectProduct={handleSelectProduct} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <p className="text-xl text-neutral-500">Nema rezultata za vašu pretragu ili filtere.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}