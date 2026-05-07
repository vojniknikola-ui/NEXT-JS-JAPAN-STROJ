'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page } from '@/types';
import { useCart } from '@/lib/hooks/useCart';
import { CONTACT_INFO } from '@/lib/constants';
import { FacebookIcon, OlxIcon, ViberIcon, WhatsAppIcon } from '@/lib/icons';

const orderMessage = encodeURIComponent('Pozdrav, želim naručiti dio preko JapanStroj stranice.');

const contactLinks = [
  {
    label: 'Mobitel',
    value: CONTACT_INFO.phone,
    href: `tel:${CONTACT_INFO.phoneClean}`,
  },
  {
    label: 'Telefon',
    value: CONTACT_INFO.secondaryPhone,
    href: `tel:${CONTACT_INFO.secondaryPhoneClean}`,
  },
  {
    label: 'Email',
    value: CONTACT_INFO.displayEmail,
    href: `mailto:${CONTACT_INFO.email}`,
  },
  {
    label: 'Lokacija',
    value: CONTACT_INFO.address,
    href: CONTACT_INFO.mapsUrl,
    external: true,
  },
];

export default function ContactPage() {
  const [activePage, setActivePage] = React.useState<Page>('contact');
  const { cartItemCount } = useCart();

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />

      <main className="flex-grow safe-main-padding lg:pb-0">
        <section className="border-b border-white/5 bg-[#0f0f0f]">
          <div className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#ffb27b]">
                Kontakt
              </p>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
                JapanStroj kontakt
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-300">
                Za narudžbu, dostupnost dijelova ili dolazak na lokaciju koristite jedan od direktnih kanala ispod.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-white/10 bg-[#111111] p-5 sm:p-6">
              <h2 className="text-xl font-bold text-white">Kontakt podaci</h2>
              <div className="mt-5 divide-y divide-white/10">
                {contactLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="block py-4 transition-colors hover:text-[#ffb27b]"
                  >
                    <span className="block text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-lg font-semibold text-white">
                      {item.value}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#ff6b00]/20 bg-[#15110e] p-5 sm:p-6">
              <h2 className="text-xl font-bold text-white">Naručivanje</h2>
              <p className="mt-3 text-sm leading-6 text-neutral-300">
                Pošaljite naziv dijela, kataloški broj ili fotografiju.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a
                  href={`https://wa.me/${CONTACT_INFO.phoneClean}?text=${orderMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-black transition-all hover:bg-[#ff7f1a]"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  WhatsApp
                </a>
                <a
                  href={`viber://chat?number=%2B${CONTACT_INFO.phoneClean}&text=${orderMessage}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition-all hover:border-[#ff6b00]/50 hover:text-[#ffb27b]"
                >
                  <ViberIcon className="h-5 w-5" />
                  Viber
                </a>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <a
                  href={CONTACT_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-[#ff6b00]/50 hover:text-[#ffb27b]"
                >
                  Google Maps
                </a>
                <a
                  href={CONTACT_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-sky-500/50 hover:text-sky-300"
                >
                  <FacebookIcon className="h-4 w-4" />
                  Facebook
                </a>
                <a
                  href={CONTACT_INFO.olxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-[#ff6b00]/50 hover:text-[#ffb27b]"
                >
                  <OlxIcon className="h-4 w-4" />
                  OLX
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
