import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Page } from '@/types';
import { HomeIcon, CatalogIcon, CartIcon, ManualIcon, CogIcon, FacebookIcon, OlxIcon, AdminIcon } from '@/lib/icons';
import { useCart } from '@/lib/hooks/useCart';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, cartItemCount: propCartItemCount }) => {
  const router = useRouter();
  const { cartItemCount } = useCart();

  const navItems = [
    { id: 'home', label: 'Početna', icon: HomeIcon },
    { id: 'catalog', label: 'Rezervni dijelovi', icon: CatalogIcon },
    { id: 'services', label: 'Usluge', icon: CogIcon },
    { id: 'cart', label: 'Košarica', icon: CartIcon },
    { id: 'manuals', label: 'Priručnici', icon: ManualIcon },
  ];

  const handleNavClick = (page: Page) => {
    setActivePage(page);
    router.push(page === 'home' ? '/' : `/${page}`);
  };

  return (
    <header className="bg-[#050505]/95 backdrop-blur-sm text-white shadow-lg shadow-black/20 sticky top-0 z-50 border-b border-white/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20">
          <div className="flex-shrink-0">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight cursor-pointer text-[#ff6b00]" onClick={() => handleNavClick('home')}>
              Japan<span className="text-white">Stroj</span>
            </h1>
          </div>
          <div className="flex items-center">
            <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as Page)}
                  className={`relative px-3 xl:px-4 py-2 rounded-full text-sm xl:text-base font-semibold uppercase tracking-wide transition-all duration-200 ${
                    activePage === item.id
                      ? 'bg-[#ff6b00] text-black shadow-[0_8px_24px_-12px_rgba(255,107,0,0.9)]'
                      : 'text-neutral-200 hover:text-[#ff6b00] hover:bg-white/10'
                  }`}
                >
                  {item.label}
                  {item.id === 'cart' && cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#ff3b3b] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 ml-6 xl:ml-8 pl-6 xl:pl-8 border-l border-white/10">
                 <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-black transition-all duration-300 hover:scale-105 border border-white/10 hover:border-[#ff6b00]">
                     <FacebookIcon className="h-5 w-5" />
                     <span className="text-sm font-semibold">Facebook</span>
                 </a>
                 <a href="https://olx.ba" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-black transition-all duration-300 hover:scale-105 border border-white/10 hover:border-[#ff6b00]">
                     <span className="text-sm font-semibold">OLX</span>
                 </a>
            </div>
          </div>
          <div className="lg:hidden">
            {/* Mobile menu button could go here if needed */}
          </div>
        </div>
      </div>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#050505] via-[#050505]/98 to-[#050505]/95 border-t border-white/10 flex justify-around items-center py-4 px-3 z-50 backdrop-blur-sm shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as Page)}
              className={`relative flex flex-col items-center justify-center flex-1 py-3 px-2 rounded-2xl transition-all duration-300 min-w-0 group ${
                activePage === item.id
                  ? 'bg-[#ff6b00] text-black shadow-[0_8px_25px_-8px_rgba(255,107,0,0.6)] scale-105'
                  : 'text-neutral-300 hover:text-[#ff6b00] hover:bg-white/8 hover:scale-105'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                activePage === item.id ? 'bg-black/20' : 'group-hover:bg-[#ff6b00]/10'
              }`}>
                <item.icon className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <span className="text-[10px] sm:text-[11px] mt-1.5 text-center font-bold leading-tight truncate max-w-full uppercase tracking-wide">
                {item.label.length > 10 ? item.label.substring(0, 10) + '...' : item.label}
              </span>
              {item.id === 'cart' && cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#ff3b3b] text-white text-[10px] sm:text-[11px] rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center font-bold shadow-lg border-2 border-[#050505]">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;