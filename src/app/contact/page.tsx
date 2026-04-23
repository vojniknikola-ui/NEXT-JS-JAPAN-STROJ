'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page } from '@/types';
import { useCart } from '@/lib/hooks/useCart';
import { CONTACT_INFO } from '@/lib/constants';
import { FacebookIcon, OlxIcon, WhatsAppIcon } from '@/lib/icons';

const quickActions = [
  {
    title: 'Pozovite odmah',
    value: CONTACT_INFO.phone,
    href: `tel:${CONTACT_INFO.phoneClean}`,
    accent: 'from-[#ff6b00] to-[#ff9347]',
    icon: '📞',
  },
  {
    title: 'Pošaljite email',
    value: CONTACT_INFO.email,
    href: `mailto:${CONTACT_INFO.email}`,
    accent: 'from-white/15 to-white/5',
    icon: '✉️',
  },
  {
    title: 'Otvorite mapu',
    value: 'Google Maps',
    href: CONTACT_INFO.mapsUrl,
    accent: 'from-emerald-500/80 to-emerald-400/50',
    icon: '📍',
  },
];

const reasons = [
  {
    eyebrow: 'Upit za dio',
    title: 'Pošaljite naziv, SKU ili fotografiju dijela',
    body: 'Najbrže dolazimo do tačne ponude kada pošaljete što više detalja o mašini i dijelu koji tražite.',
  },
  {
    eyebrow: 'Provjera dostupnosti',
    title: 'Odmah provjeravamo stanje i rok isporuke',
    body: 'Ako dio nije trenutno raspoloživ, dobijate jasan odgovor o alternativi ili roku nabavke.',
  },
  {
    eyebrow: 'Ponuda i dogovor',
    title: 'Nastavljamo direktno na konkretan kontakt',
    body: 'Telefon, email, Facebook i OLX ostaju dostupni na jednom mjestu, bez lutanja kroz sajt.',
  },
];

export default function ContactPage() {
  const [activePage, setActivePage] = React.useState<Page>('contact');
  const { cartItemCount } = useCart();

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />

      <main className="flex-grow pb-24 lg:pb-0">
        <section className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(circle_at_top,_rgba(255,107,0,0.22),_rgba(11,11,11,0.94)_45%,_rgba(11,11,11,1)_72%)]">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-[#ff6b00]/20 blur-3xl" />
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[#ff6b00]/10 blur-3xl" />
          </div>

          <div className="container relative z-10 mx-auto px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ff6b00]/30 bg-[#ff6b00]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#ffb27b]">
                  Kontakt
                </div>
                <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Direktan kontakt bez viška koraka.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
                  Ako tražite rezervni dio, želite potvrdu dostupnosti ili trebate ponudu, ovdje su svi glavni kanali na jednom mjestu.
                  Stranica je namjerno čista: poziv, mail, mapa, Facebook i OLX.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href={`tel:${CONTACT_INFO.phoneClean}`}
                    className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#ff6b00] to-[#ff9347] px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-black transition-transform hover:scale-[1.02]"
                  >
                    Pozovite nas
                  </a>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all hover:border-[#ff6b00]/40 hover:text-[#ffb27b]"
                  >
                    Pošaljite email
                  </a>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_-40px_rgba(255,107,0,0.5)] backdrop-blur-sm sm:p-6">
                <div className="grid gap-3">
                  {quickActions.map((action) => (
                    <a
                      key={action.title}
                      href={action.href}
                      target={action.href.startsWith('http') ? '_blank' : undefined}
                      rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={`group rounded-[1.5rem] border border-white/10 bg-gradient-to-br ${action.accent} p-4 text-black transition-transform hover:scale-[1.01]`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-black/70">
                            {action.title}
                          </p>
                          <p className="mt-2 text-lg font-black text-black sm:text-xl">
                            {action.value}
                          </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/10 text-2xl">
                          {action.icon}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-white/8 bg-[#111111] p-6 shadow-[0_30px_70px_-50px_rgba(0,0,0,0.9)] sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-neutral-500">
                Kontakt Podaci
              </p>
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">Email</p>
                  <a href={`mailto:${CONTACT_INFO.email}`} className="mt-2 inline-block text-2xl font-bold text-white hover:text-[#ffb27b] transition-colors">
                    {CONTACT_INFO.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">Telefon</p>
                  <a href={`tel:${CONTACT_INFO.phoneClean}`} className="mt-2 inline-block text-2xl font-bold text-white hover:text-[#ffb27b] transition-colors">
                    {CONTACT_INFO.phone}
                  </a>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-neutral-500">Lokacija</p>
                  <a
                    href={CONTACT_INFO.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-white hover:text-[#ffb27b] transition-colors"
                  >
                    {CONTACT_INFO.address}
                  </a>
                </div>
              </div>

              <div className="mt-8 rounded-[1.5rem] border border-[#ff6b00]/20 bg-[#ff6b00]/8 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#ffb27b]">
                  Najbrži put
                </p>
                <p className="mt-3 text-sm leading-7 text-neutral-200">
                  Za rezervne dijelove pošaljite naziv mašine, serijski broj, kataloški broj ili fotografiju dijela.
                  Tako izbjegavamo nagađanje i vraćamo tačniji odgovor.
                </p>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-3">
                {reasons.map((reason) => (
                  <article
                    key={reason.title}
                    className="rounded-[1.75rem] border border-white/8 bg-[linear-gradient(180deg,_rgba(255,255,255,0.06),_rgba(255,255,255,0.02))] p-5"
                  >
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[#ffb27b]">
                      {reason.eyebrow}
                    </p>
                    <h2 className="mt-3 text-xl font-bold text-white">
                      {reason.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-neutral-400">
                      {reason.body}
                    </p>
                  </article>
                ))}
              </div>

              <div className="rounded-[2rem] border border-white/8 bg-[#121212] p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-neutral-500">
                      Društvene Mreže I Oglasi
                    </p>
                    <h2 className="mt-3 text-3xl font-black text-white">
                      Kontaktirajte nas i preko kanala koje već koristite.
                    </h2>
                  </div>
                  <a
                    href={CONTACT_INFO.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-all hover:border-[#ff6b00]/40 hover:text-[#ffb27b]"
                  >
                    Otvori mapu
                  </a>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <a
                    href={`https://wa.me/${CONTACT_INFO.phoneClean}?text=Pozdrav,%20treba%20mi%20informacija%20o%20dijelu.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition-all hover:border-green-500/40 hover:bg-green-500/10"
                  >
                    <WhatsAppIcon className="h-8 w-8 text-green-400" />
                    <h3 className="mt-4 text-lg font-bold text-white">WhatsApp</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      Za brze fotografije, upit i direktan razgovor.
                    </p>
                  </a>
                  <a
                    href={CONTACT_INFO.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition-all hover:border-sky-500/40 hover:bg-sky-500/10"
                  >
                    <FacebookIcon className="h-8 w-8 text-sky-400" />
                    <h3 className="mt-4 text-lg font-bold text-white">Facebook</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      Otvorite profil i javite se preko objava ili poruka.
                    </p>
                  </a>
                  <a
                    href={CONTACT_INFO.olxUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-[1.5rem] border border-white/10 bg-white/5 p-5 transition-all hover:border-[#ff6b00]/40 hover:bg-[#ff6b00]/10"
                  >
                    <OlxIcon className="h-8 w-8 text-[#ffb27b]" />
                    <h3 className="mt-4 text-lg font-bold text-white">OLX</h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-400">
                      Pregledajte oglase i javite se direktno preko profila.
                    </p>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
