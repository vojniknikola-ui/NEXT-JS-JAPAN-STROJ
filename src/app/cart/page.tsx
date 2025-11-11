'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page } from '@/types';
import { useCart } from '@/lib/hooks/useCart';
import { MinusIcon, PlusIcon, TrashIcon, ShoppingBagIcon, ArrowLeftIcon } from '@/lib/icons';

export default function CartPage() {
  const router = useRouter();
  const [activePage, setActivePage] = useState<Page>('cart');
  const { cartItems, cartItemCount, cartTotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isOrdering, setIsOrdering] = useState(false);

  const handleOrder = async () => {
    if (cartItems.length === 0) return;

    setIsOrdering(true);

    // Prepare order message for WhatsApp/Viber
    const orderItems = cartItems.map(item =>
      `${item.quantity}x ${item.part.name} (${item.part.brand} ${item.part.model}) - ${(item.part.priceWithVAT * item.quantity).toFixed(2)} BAM`
    ).join('\n');

    const totalMessage = `UKUPNO: ${cartTotal.toFixed(2)} BAM`;

    const fullMessage = `🚛 *JapanStroj Narudžba*\n\n${orderItems}\n\n${totalMessage}\n\n📞 Kontaktirajte nas za potvrdu narudžbe!`;

    // Encode message for WhatsApp
    const encodedMessage = encodeURIComponent(fullMessage);

    // Try WhatsApp first, fallback to Viber
    const whatsappUrl = `https://wa.me/38761234567?text=${encodedMessage}`;
    const viberUrl = `viber://chat?number=%2B38761234567&text=${encodedMessage}`;

    // Open WhatsApp, if not available try Viber
    window.open(whatsappUrl, '_blank');

    // Fallback to Viber after a short delay
    setTimeout(() => {
      if (!document.hasFocus()) {
        window.open(viberUrl, '_blank');
      }
    }, 2000);

    setIsOrdering(false);
  };

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push('/catalog')}
                className="inline-flex items-center gap-2 text-[#ff6b00] hover:text-[#ff7f1a] mb-4 transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Nastavi kupovinu
              </button>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Košarica
              </h1>
              <p className="text-neutral-400">
                {cartItems.length === 0
                  ? 'Vaša košarica je prazna'
                  : `${cartItemCount} ${cartItemCount === 1 ? 'artikl' : cartItemCount < 5 ? 'artikla' : 'artikala'} u košarici`
                }
              </p>
            </div>

            {cartItems.length === 0 ? (
              /* Empty Cart */
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-[#ff6b00]/10 rounded-full flex items-center justify-center">
                  <ShoppingBagIcon className="w-12 h-12 text-[#ff6b00]" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Košarica je prazna</h2>
                <p className="text-neutral-400 mb-8 max-w-md mx-auto">
                  Dodajte rezervne dijelove u košaricu i započnite svoju narudžbu.
                </p>
                <button
                  onClick={() => router.push('/catalog')}
                  className="bg-[#ff6b00] hover:bg-[#ff7f1a] text-black px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105"
                >
                  Pregledaj katalog
                </button>
              </div>
            ) : (
              /* Cart Items */
              <div className="space-y-8">
                {/* Cart Items List */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.part.id} className="bg-[#101010] border border-white/5 rounded-2xl p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {item.part.imageUrl ? (
                            <img
                              src={item.part.imageUrl}
                              alt={item.part.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                              <span className="text-neutral-600 text-sm">N/A</span>
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <h3 className="text-xl font-bold text-white mb-2">{item.part.name}</h3>
                          <div className="text-sm text-neutral-400 space-y-1">
                            {item.part.brand && <p>Brend: {item.part.brand}</p>}
                            {item.part.model && <p>Model: {item.part.model}</p>}
                            {item.part.catalogNumber && <p>Kat. broj: {item.part.catalogNumber}</p>}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.part.id, item.quantity - 1)}
                            className="w-8 h-8 bg-[#1a1a1a] hover:bg-[#ff6b00] text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-semibold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.part.id, item.quantity + 1)}
                            className="w-8 h-8 bg-[#1a1a1a] hover:bg-[#ff6b00] text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#ff6b00]">
                            {(item.part.priceWithVAT * item.quantity).toFixed(2)} BAM
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-neutral-400">
                              {item.part.priceWithVAT.toFixed(2)} BAM × {item.quantity}
                            </p>
                          )}
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.part.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="bg-[#101010] border border-white/5 rounded-2xl p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Ukupno</h3>
                      <p className="text-neutral-400">
                        {cartItemCount} {cartItemCount === 1 ? 'artikl' : cartItemCount < 5 ? 'artikla' : 'artikala'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-[#ff6b00] mb-2">
                        {cartTotal.toFixed(2)} BAM
                      </p>
                      <p className="text-sm text-neutral-400">PDV uključen</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      onClick={clearCart}
                      className="flex-1 border border-red-500/50 text-red-400 hover:bg-red-500/10 px-6 py-4 rounded-full font-semibold transition-all hover:scale-105"
                    >
                      Isprazni košaricu
                    </button>
                    <button
                      onClick={handleOrder}
                      disabled={isOrdering}
                      className="flex-1 bg-[#ff6b00] hover:bg-[#ff7f1a] text-black px-6 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isOrdering ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          Slanje narudžbe...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Naruči putem WhatsApp/Viber
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-[#101010] border border-[#ff6b00]/20 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Informacije o narudžbi</h3>
                  <div className="space-y-3 text-sm text-neutral-300">
                    <p>✅ <strong>Besplatna dostava</strong> za narudžbe preko 500 BAM</p>
                    <p>✅ <strong>Garancija kvaliteta</strong> na sve dijelove</p>
                    <p>✅ <strong>Brza obrada</strong> narudžbi u roku 24h</p>
                    <p>✅ <strong>24/7 podrška</strong> za sva pitanja</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}