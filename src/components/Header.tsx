import React from 'react';
import Link from 'next/link';
import { Page } from '@/types';
import { HomeIcon, CatalogIcon, CartIcon, ContactIcon, FacebookIcon } from '@/lib/icons';
import { CONTACT_INFO } from '@/lib/constants';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  cartItemCount: number;
}

const navItems = [
  { id: 'home', label: 'Početna', mobileLabel: 'Početna', icon: HomeIcon },
  { id: 'catalog', label: 'Rezervni dijelovi', mobileLabel: 'Dijelovi', icon: CatalogIcon },
  { id: 'contact', label: 'Kontakt', mobileLabel: 'Kontakt', icon: ContactIcon },
  { id: 'cart', label: 'Košarica', mobileLabel: 'Košarica', icon: CartIcon },
] as const;

const getPageHref = (page: Page) => (page === 'home' ? '/' : `/${page}`);

const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, cartItemCount: propCartItemCount }) => {
  return (
    <>
      <header className="bg-[#050505]/95 backdrop-blur-sm text-white shadow-lg shadow-black/20 sticky top-0 z-50 border-b border-white/5">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-18 lg:h-20">
            <div className="flex-shrink-0 min-w-0">
              <Link
                href="/"
                onClick={() => setActivePage('home')}
                data-testid="brand-logo"
                className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold tracking-tight cursor-pointer text-[#ff6b00] truncate block"
              >
                Japan<span className="text-white">Stroj</span>
              </Link>
            </div>
            <span data-testid="cart-count" className="sr-only">
              {propCartItemCount}
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={getPageHref(item.id)}
                    data-testid={`nav-${item.id}`}
                    aria-current={activePage === item.id ? 'page' : undefined}
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
                  </Link>
                ))}
              </nav>
              <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 ml-6 xl:ml-8 pl-6 xl:pl-8 border-l border-white/10">
                <a href={CONTACT_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-black transition-all duration-300 hover:scale-105 border border-white/10 hover:border-[#ff6b00]">
                  <FacebookIcon className="h-5 w-5" />
                  <span className="text-sm font-semibold">Facebook</span>
                </a>
                <a href={CONTACT_INFO.olxUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-black transition-all duration-300 hover:scale-105 border border-white/10 hover:border-[#ff6b00]">
                  <span className="text-sm font-semibold">OLX</span>
                </a>
              </div>
            </div>
            <div className="lg:hidden flex items-center gap-2">
              <a
                href={`tel:${CONTACT_INFO.phoneClean}`}
                className="inline-flex h-9 items-center justify-center rounded-full border border-[#ff6b00]/35 bg-[#ff6b00]/10 px-3 text-xs font-bold text-[#ffb27b] active:scale-95"
              >
                Poziv
              </a>
            </div>
          </div>
        </div>
      </header>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[55] border-t border-white/10 bg-[#050505]/95 px-2 pt-2 backdrop-blur-xl shadow-[0_-18px_50px_rgba(0,0,0,0.75)] safe-nav-padding">
        <div className="grid grid-cols-4 gap-1">
        {navItems.map((item) => (
            <Link
              key={item.id}
              href={getPageHref(item.id)}
              data-testid={`nav-${item.id}-mobile`}
              aria-current={activePage === item.id ? 'page' : undefined}
              className={`relative flex min-h-[56px] flex-col items-center justify-center rounded-2xl px-1 py-2 transition-all duration-200 active:scale-95 ${
                activePage === item.id
                  ? 'bg-[#ff6b00] text-black shadow-[0_10px_28px_-14px_rgba(255,107,0,0.95)]'
                  : 'text-neutral-300 active:bg-white/8 active:text-[#ffb27b]'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="mt-1 text-center text-[10px] font-bold leading-tight">
                {item.mobileLabel}
              </span>
              {item.id === 'cart' && propCartItemCount > 0 && (
                <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#050505] bg-[#ff3b3b] px-1 text-[10px] font-black text-white shadow-lg">
                  {propCartItemCount > 9 ? '9+' : propCartItemCount}
                </span>
              )}
            </Link>
        ))}
        </div>
      </nav>
    </>
  );
};

export default Header;
