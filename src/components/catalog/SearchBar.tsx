import React from 'react';
import { SearchIcon, XIcon } from '@/lib/icons';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="relative group">
      <SearchIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-neutral-400 group-focus-within:text-primary-400 transition-colors" />
      <input
        type="text"
        placeholder="Pretraži proizvode..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-secondary-800/50 border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-neutral-500 focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all backdrop-blur-sm focus:bg-secondary-800/70"
        aria-label="Search products"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
          aria-label="Clear search"
        >
          <XIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

SearchBar.displayName = 'SearchBar';

export default SearchBar;