import React from 'react';
import { FacebookIcon } from '@/lib/icons';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] text-neutral-200 mt-auto border-t border-white/5">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#ff6b00] mb-3 sm:mb-4 tracking-tight">
              Japan<span className="text-white">Stroj</span>
            </h3>
            <p className="text-neutral-400 text-sm sm:text-base">
              Vaš pouzdan partner za dijelove građevinskih strojeva.
            </p>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Kontakt</h3>
            <ul className="text-neutral-400 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
              <li>Adresa: Ulica 123, Grad, Država</li>
              <li>Telefon: +387 12 345 678</li>
              <li>Email: info@japanstroj.ba</li>
            </ul>
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Pratite nas</h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center md:justify-start">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-white transition-all duration-300 hover:scale-105 border border-white/10 hover:border-[#ff6b00] text-sm sm:text-base">
                <FacebookIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold">Facebook</span>
              </a>
              <a href="https://olx.ba" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-white transition-all duration-300 hover:scale-105 border border-white/10 hover:border-[#ff6b00] text-sm sm:text-base">
                <span className="font-semibold">OLX</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 sm:mt-10 md:mt-12 border-t border-white/10 pt-6 sm:pt-8 text-center text-neutral-500">
          <p className="text-sm sm:text-base">&copy; {currentYear} JapanStroj. Sva prava pridržana.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;