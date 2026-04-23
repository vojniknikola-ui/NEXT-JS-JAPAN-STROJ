import React from 'react';
import { FacebookIcon } from '@/lib/icons';
import { CONTACT_INFO } from '@/lib/constants';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] text-neutral-100 mt-auto border-t border-white/5">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#ff6b00] mb-3 sm:mb-4 tracking-tight">
              Japan<span className="text-white">Stroj</span>
            </h3>
            <p className="text-neutral-300">
              Vaš pouzdan partner za dijelove građevinskih strojeva.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Kontakt</h3>
            <ul className="text-neutral-300 space-y-2">
              <li>Adresa: {CONTACT_INFO.address}</li>
              <li>
                Telefon:{' '}
                <a href={`tel:${CONTACT_INFO.phoneClean}`} className="hover:text-[#ff6b00] transition-colors">
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li>
                Email:{' '}
                <a href={`mailto:${CONTACT_INFO.email}`} className="hover:text-[#ff6b00] transition-colors">
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li>
                <a
                  href={CONTACT_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#ff6b00] hover:text-[#ff7f1a] transition-colors"
                >
                  Google Maps
                </a>
              </li>
            </ul>
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Pratite nas</h3>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center md:justify-start">
              <a href={CONTACT_INFO.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-black transition-all duration-300 hover:scale-105 border border-white/10 hover:border-[#ff6b00] text-sm sm:text-base">
                <FacebookIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="font-semibold">Facebook</span>
              </a>
              <a href={CONTACT_INFO.olxUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/5 hover:bg-[#ff6b00] hover:text-black transition-all duration-300 hover:scale-105 border border-white/10 hover:border-[#ff6b00] text-sm sm:text-base">
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
