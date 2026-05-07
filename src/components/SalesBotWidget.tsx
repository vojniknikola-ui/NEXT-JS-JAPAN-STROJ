'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { CartIcon, ContactIcon, ViberIcon, WhatsAppIcon, XIcon } from '@/lib/icons';
import { CONTACT_INFO } from '@/lib/constants';

type BotMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const starterQuestions = [
  'Imate li Kubota D1105 uložak dizne?',
  'Kako mogu naručiti dio?',
  'Trebam Yanmar dio, šta da pošaljem?',
];

const initialMessage: BotMessage = {
  id: 'initial',
  role: 'assistant',
  content:
    'Pozdrav, ja sam JapanStroj asistent za rezervne dijelove. Napišite brend, model motora, kataloški broj ili naziv dijela i provjerit ću bazu. Dostupnost i tačnost dijela obavezno potvrdite kontaktom prije narudžbe.',
};

function createMessage(role: BotMessage['role'], content: string): BotMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  };
}

export default function SalesBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<BotMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const orderMessage = useMemo(
    () => encodeURIComponent('Pozdrav, trebam pomoć oko rezervnog dijela preko JapanStroj stranice.'),
    []
  );

  const visibleApiMessages = messages
    .filter((message) => message.id !== 'initial')
    .map((message) => ({ role: message.role, content: message.content }));

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const userMessage = createMessage('user', trimmed);
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/sales-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...visibleApiMessages,
            { role: userMessage.role, content: userMessage.content },
          ],
        }),
      });

      const payload = (await response.json().catch(() => null)) as { reply?: string } | null;
      const reply = payload?.reply || 'Bot trenutno nije dostupan. Kontaktirajte nas direktno za provjeru dijela.';
      setMessages((prev) => [...prev, createMessage('assistant', reply)]);
    } catch {
      setMessages((prev) => [
        ...prev,
        createMessage(
          'assistant',
          'Došlo je do greške u slanju poruke. Za najbržu provjeru pošaljite fotografiju dijela ili kataloški broj preko WhatsAppa/Vibera.'
        ),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="fixed bottom-24 right-3 z-[90] sm:bottom-5 sm:right-5">
      {isOpen && (
        <section className="mb-3 flex h-[min(680px,calc(100dvh-8rem))] w-[calc(100vw-1.5rem)] max-w-[410px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] text-white shadow-[0_30px_90px_-35px_rgba(0,0,0,0.95)] sm:h-[620px]">
          <header className="flex items-center justify-between border-b border-white/10 bg-[#111111] px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-black text-white">JapanStroj bot</p>
              <p className="truncate text-xs text-neutral-400">Sales asistent za rezervne dijelove</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-neutral-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Zatvori chat"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'bg-[#ff6b00] text-black'
                      : 'border border-white/10 bg-white/5 text-neutral-100'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff6b00]" />
                Provjeravam dijelove...
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {starterQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => void sendMessage(question)}
                  disabled={isSending}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-200 transition hover:border-[#ff6b00]/50 hover:text-[#ffb27b] disabled:opacity-50"
                >
                  {question}
                </button>
              ))}
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Npr. Kubota V1902 karike..."
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white outline-none transition focus:border-[#ff6b00]/60"
              />
              <button
                type="submit"
                disabled={isSending || !input.trim()}
                className="rounded-full bg-[#ff6b00] px-4 py-3 text-sm font-black text-black transition hover:bg-[#ff7f1a] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pošalji
              </button>
            </form>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <a
                href={`https://wa.me/${CONTACT_INFO.phoneClean}?text=${orderMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-2 text-xs font-bold text-green-300"
              >
                <WhatsAppIcon className="h-4 w-4" />
                WA
              </a>
              <a
                href={`viber://chat?number=%2B${CONTACT_INFO.phoneClean}&text=${orderMessage}`}
                className="inline-flex items-center justify-center gap-1 rounded-full border border-[#7d3cff]/40 bg-[#7d3cff]/15 px-2 py-2 text-xs font-bold text-[#d5c6ff]"
              >
                <ViberIcon className="h-4 w-4" />
                Viber
              </a>
              <Link
                href="/cart"
                className="inline-flex items-center justify-center gap-1 rounded-full border border-[#ff6b00]/40 bg-[#ff6b00]/10 px-2 py-2 text-xs font-bold text-[#ffb27b]"
              >
                <CartIcon className="h-4 w-4" />
                Korpa
              </Link>
            </div>
          </div>
        </section>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex h-14 items-center gap-2 rounded-full bg-[#ff6b00] px-4 font-black text-black shadow-[0_18px_55px_-18px_rgba(255,107,0,0.95)] transition hover:bg-[#ff7f1a] active:scale-95"
          aria-label="Otvori JapanStroj bot"
        >
          <ContactIcon className="h-5 w-5" />
          <span className="hidden sm:inline">Pitaj bota</span>
        </button>
      )}
    </div>
  );
}
