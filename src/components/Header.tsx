import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CatalogIcon, CartIcon, ManualIcon, CogIcon, FacebookIcon, MenuIcon, XIcon } from '@/lib/icons';
import { useCartCount } from '@/hooks/useCartCount';

const Header: React.FC = () => {
  const pathname = usePathname();
  const { cartItemCount } = useCartCount();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      id: 'home', 
      label: 'Početna', 
      icon: HomeIcon,
      href: '/'
    },
    { 
      id: 'catalog', 
      label: 'Rezervni dijelovi', 
      icon: CatalogIcon,
      href: '/catalog'
    },
    { 
      id: 'services', 
      label: 'Usluge', 
      icon: CogIcon,
      href: '/services'
    },
    { 
      id: 'cart', 
      label: 'Košarica', 
      icon: CartIcon,
      href: '/cart'
    },
    { 
      id: 'manuals', 
      label: 'Priručnici', 
      icon: ManualIcon,
      href: '/manuals'
    },
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
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-3 xl:px-4 py-2 rounded-full text-sm xl:text-base font-semibold uppercase tracking-wide transition-all duration-200 ${
                  getCurrentPage() === item.id
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
              </Link>
            ))}
          </nav>
          
          {/* Desktop Social Links */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4 ml-6 xl:ml-8 pl-6 xl:pl-8 border-l border-white/10">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-black transition-all duration-300 hover:scale-105 border border-white/10 hover:border-[#ff6b00]">
              <FacebookIcon className="h-5 w-5" />
              <span className="text-sm font-semibold">Facebook</span>
            </a>
            <a href="https://olx.ba" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-black transition-all duration-300 hover:scale-105 border border-white/10 hover:border-[#ff6b00]">
              <span className="text-sm font-semibold">OLX</span>
            </a>
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed inset-0 right-0 top-0 h-full w-full max-w-sm bg-[#050505] shadow-2xl transform transition-transform duration-300 ease-in-out" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-[#ff6b00]">JapanStroj</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    getCurrentPage() === item.id
                      ? 'bg-[#ff6b00] text-black'
                      : 'text-neutral-200 hover:text-[#ff6b00] hover:bg-white/10'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'cart' && cartItemCount > 0 && (
                    <span className="ml-auto bg-[#ff3b3b] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

Header.displayName = 'Header';

export default Header;