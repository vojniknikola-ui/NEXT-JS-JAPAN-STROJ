import React from 'react';
import { useRouter } from 'next/navigation';
import { Page } from '@/types';
import { HomeIcon, CatalogIcon, CartIcon, ManualIcon, CogIcon, FacebookIcon } from '@/lib/icons';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  cartItemCount: number;
}

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, cartItemCount: propCartItemCount }) => {
  const router = useRouter();

  const navItems = [
    { id: 'home', label: 'Početna', mobileLabel: 'Početna', icon: HomeIcon },
    { id: 'catalog', label: 'Rezervni dijelovi', mobileLabel: 'Dijelovi', icon: CatalogIcon },
    { id: 'services', label: 'Usluge', mobileLabel: 'Usluge', icon: CogIcon },
    { id: 'cart', label: 'Košarica', mobileLabel: 'Košarica', icon: CartIcon },
    { id: 'manuals', label: 'Priručnici', mobileLabel: 'Priruč.', icon: ManualIcon },
  ];

  const handleNavClick = (page: string) => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getCurrentPage = () => {
    if (pathname === '/') return 'home';
    if (pathname === '/catalog') return 'catalog';
    if (pathname === '/services') return 'services';
    if (pathname === '/cart') return 'cart';
    if (pathname === '/manuals') return 'manuals';
    return 'home';
  };

  return (
    <header className="bg-[#050505]/95 backdrop-blur-sm text-white shadow-lg shadow-black/20 sticky top-0 z-50 border-b border-white/5">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20">
          <div className="flex-shrink-0 min-w-0">
            <Link href="/" className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold tracking-tight text-[#ff6b00] truncate hover:text-[#ff8533] transition-colors">
              Japan<span className="text-white">Stroj</span>
            </Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as Page)}
                  className={`relative px-3 xl:px-4 py-2 rounded-full text-sm xl:text-base font-semibold uppercase tracking-wide transition-all duration-200 ${
                    activePage === item.id
                      ? 'bg-[#ff6b00] text-black shadow-[0_8px_24px_-12px_rgba(255,107,0,0.9)]'
                      : 'text-neutral-100 hover:text-[#ff6b00] hover:bg-white/10'
                  }`}
                >
                  {item.label}
                  {item.id === 'cart' && propCartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#ff3b3b] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {propCartItemCount}
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

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-1.5">
            <button
              onClick={toggleMobileMenu}
              className="p-2.5 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-black transition-all duration-300 active:scale-95 border border-white/10 hover:border-[#ff6b00] touch-manipulation"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-black transition-all duration-300 active:scale-95 border border-white/10 hover:border-[#ff6b00] touch-manipulation">
              <FacebookIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a href="https://olx.ba" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-black transition-all duration-300 active:scale-95 border border-white/10 hover:border-[#ff6b00] touch-manipulation flex items-center justify-center">
              <span className="text-xs font-semibold">OLX</span>
            </a>
          </div>
        </div>
      </div>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#050505] via-[#050505]/98 to-[#080808]/95 border-t border-white/15 flex justify-around items-center py-2 sm:py-2.5 px-2 z-[55] backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.8)] safe-nav-padding">
        {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as Page)}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 sm:py-2.5 px-1 sm:px-1.5 rounded-xl sm:rounded-2xl transition-all duration-300 min-w-0 group active:scale-95 touch-manipulation ${
                activePage === item.id
                  ? 'bg-[#ff6b00] text-black shadow-[0_8px_25px_-8px_rgba(255,107,0,0.6)]'
                  : 'text-neutral-200 active:text-[#ff6b00] active:bg-white/8'
              }`}
            >
              <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${
                activePage === item.id ? 'bg-black/20' : 'group-active:bg-[#ff6b00]/10'
              }`}>
                <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className="text-[10px] sm:text-[11px] mt-1 text-center font-semibold leading-tight max-w-full">
                {item.mobileLabel}
              </span>
              {item.id === 'cart' && propCartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-[#ff3b3b] text-white text-[9px] sm:text-[10px] rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold shadow-lg border-2 border-[#050505]">
                  {propCartItemCount > 9 ? '9+' : propCartItemCount}
                </span>
              )}
            </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;
