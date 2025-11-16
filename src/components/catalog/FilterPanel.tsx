import React from 'react';
import { XIcon } from '@/lib/icons';
import SearchBar from './SearchBar';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface FilterPanelProps {
  showMobileFilters: boolean;
  setShowMobileFilters: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: Category[];
  selectedCategory: number | null;
  setSelectedCategory: (category: number | null) => void;
  availableBrands: string[];
  selectedBrands: string[];
  setSelectedBrands: (brands: string[]) => void;
  selectedAvailability: string[];
  setSelectedAvailability: (availability: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  priceSliderMax: number;
  showOnlyDiscount: boolean;
  setShowOnlyDiscount: (show: boolean) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

const availabilityFilters = [
  { value: 'available', label: 'Dostupno odmah', inputClasses: 'text-success focus:ring-success/50' },
  { value: '15_days', label: 'Rok isporuke 15 dana', inputClasses: 'text-primary focus:ring-primary/50' },
  { value: 'on_request', label: 'Po dogovoru', inputClasses: 'text-error focus:ring-error/50' },
] as const;

const FilterPanel: React.FC<FilterPanelProps> = ({
  showMobileFilters,
  setShowMobileFilters,
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  setSelectedCategory,
  availableBrands,
  selectedBrands,
  setSelectedBrands,
  selectedAvailability,
  setSelectedAvailability,
  priceRange,
  setPriceRange,
  priceSliderMax,
  showOnlyDiscount,
  setShowOnlyDiscount,
  hasActiveFilters,
  clearFilters,
}) => {
  return (
    <aside className={`
      fixed lg:sticky lg:top-24 left-0 top-0 h-full lg:h-auto w-full sm:w-80 bg-secondary-900/95 backdrop-blur-xl lg:bg-transparent
      border-r border-white/10 lg:border-0 p-4 sm:p-6 lg:p-0 z-40 overflow-y-auto
      transition-all duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none
      ${showMobileFilters ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="lg:sticky lg:top-24 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between lg:hidden mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            Filteri
          </h2>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-2.5 text-neutral-400 hover:text-white active:scale-95 touch-manipulation rounded-lg hover:bg-white/5 transition-colors focus-ring"
            aria-label="Close filters"
          >
            <XIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="bg-secondary-800/50 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-primary-500/30 transition-all duration-300">
          <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 uppercase tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
            Kategorije
          </h3>
          <div className="space-y-1.5 sm:space-y-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-all touch-manipulation focus-ring ${
                selectedCategory === null
                  ? 'bg-primary-500 text-black font-semibold shadow-lg'
                  : 'text-neutral-300 hover:bg-white/5 active:bg-white/10'
              }`}
              aria-pressed={selectedCategory === null}
            >
              Sve kategorije
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm transition-all touch-manipulation focus-ring ${
                  selectedCategory === category.id
                    ? 'bg-primary-500 text-black font-semibold shadow-lg'
                    : 'text-neutral-300 hover:bg-white/5 active:bg-white/10'
                }`}
                aria-pressed={selectedCategory === category.id}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-secondary-800/50 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-accent-500/30 transition-all duration-300">
          <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 uppercase tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent-500 rounded-full"></div>
            Brend
          </h3>
          <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {availableBrands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer group touch-manipulation p-1 rounded-lg hover:bg-white/5 transition-colors">
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
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-white/20 bg-secondary-700 text-primary-500 focus:ring-primary-500/50 focus:ring-2 focus-ring"
                />
                <span className="text-xs sm:text-sm text-neutral-300 group-hover:text-white transition-colors">{brand}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-secondary-800/50 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-success/30 transition-all duration-300">
          <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 uppercase tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
            Dostupnost
          </h3>
          <div className="space-y-1.5 sm:space-y-2">
            {availabilityFilters.map(({ value, label, inputClasses }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer group touch-manipulation p-1 rounded-lg hover:bg-white/5 transition-colors">
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
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded border-white/20 bg-secondary-700 ${inputClasses} focus:ring-2 focus-ring`}
                />
                <span className="text-xs sm:text-sm text-neutral-300 group-hover:text-white transition-colors">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-secondary-800/50 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-secondary-400/30 transition-all duration-300">
          <h3 className="text-xs sm:text-sm font-semibold text-white mb-2 sm:mb-3 uppercase tracking-wide flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-secondary-400 rounded-full"></div>
            Cijena
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-400">
              <span className="font-medium">{priceRange[0]} BAM</span>
              <span className="font-medium">{priceRange[1]} BAM</span>
            </div>
            <input
              type="range"
              min="0"
              max={priceSliderMax}
              step="50"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500 touch-manipulation focus-ring"
              aria-label="Maximum price filter"
            />
            <div className="text-xs text-neutral-500 text-center">
              Pomerite klizač za postavljanje maksimalne cijene
            </div>
          </div>
        </div>

        <div className="bg-secondary-800/50 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-warning/30 transition-all duration-300">
          <label className="flex items-center gap-2 cursor-pointer group touch-manipulation p-1 rounded-lg hover:bg-white/5 transition-colors">
            <input
              type="checkbox"
              checked={showOnlyDiscount}
              onChange={(e) => setShowOnlyDiscount(e.target.checked)}
              className="w-4 h-4 sm:w-5 sm:h-5 rounded border-white/20 bg-secondary-700 text-warning focus:ring-warning/50 focus:ring-2 focus-ring"
            />
            <span className="text-xs sm:text-sm text-neutral-300 group-hover:text-white transition-colors font-semibold flex items-center gap-2">
              <span className="text-warning">%</span>
              Samo sa popustom
            </span>
          </label>
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full bg-error/10 hover:bg-error/20 active:bg-error/30 text-error border border-error/20 hover:border-error/40 px-4 py-3 rounded-lg sm:rounded-xl font-semibold transition-all active:scale-95 touch-manipulation text-sm sm:text-base focus-ring shadow-lg hover:shadow-error/20"
            aria-label="Clear all filters"
          >
            Očisti sve filtere
          </button>
        )}
      </div>
    </aside>
  );
};

FilterPanel.displayName = 'FilterPanel';

export default FilterPanel;