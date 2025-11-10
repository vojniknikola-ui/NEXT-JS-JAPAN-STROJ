import React, { useState, useEffect } from 'react';
import { FacebookIcon, OlxIcon } from '@/lib/icons';

const Footer: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number>(2024);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-[#050505] text-neutral-200 mt-auto hidden md:block border-t border-white/5">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-xl font-semibold text-[#ff6b00] mb-4 tracking-tight">
              Japan<span className="text-white">Stroj</span>
            </h3>
            <p className="text-neutral-400">
              Vaš pouzdan partner za dijelove građevinskih strojeva.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Kontakt</h3>
            <ul className="text-neutral-400 space-y-2">
              <li>Adresa: Ulica 123, Grad, Država</li>
              <li>Telefon: +387 12 345 678</li>
              <li>Email: info@japanstroj.ba</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Pratite nas</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#ff6b00] transition-all duration-300 hover:scale-110">
                <FacebookIcon className="h-6 w-6" />
              </a>
              <a href="https://olx.ba" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#ff6b00] transition-all duration-300 hover:scale-110 flex items-center gap-2">
                <OlxIcon className="h-6 w-6" />
                <span className="text-sm">OLX</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-neutral-500">
          <p>&copy; {currentYear} JapanStroj. Sva prava pridržana.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;