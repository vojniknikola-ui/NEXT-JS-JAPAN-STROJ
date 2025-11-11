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

      <main className="flex-grow pb-20 lg:pb-0">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <button
                onClick={() => router.push('/catalog')}
                className="inline-flex items-center gap-1.5 sm:gap-2 text-[#ff6b00] active:text-[#ff7f1a] mb-3 sm:mb-4 transition-colors active:scale-95 touch-manipulation text-sm sm:text-base"
              >
                <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Nastavi kupovinu
              </button>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
                Košarica
              </h1>
              <p className="text-sm sm:text-base text-neutral-400">
                {cartItems.length === 0
                  ? 'Vaša košarica je prazna'
                  : `${cartItemCount} ${cartItemCount === 1 ? 'artikl' : cartItemCount < 5 ? 'artikla' : 'artikala'} u košarici`
                }
              </p>
            </div>

            {cartItems.length === 0 ? (
              /* Empty Cart */
              <div className="text-center py-12 sm:py-16 md:py-20">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-[#ff6b00]/10 rounded-full flex items-center justify-center">
                  <ShoppingBagIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#ff6b00]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Košarica je prazna</h2>
                <p className="text-sm sm:text-base text-neutral-400 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                  Dodajte rezervne dijelove u košaricu i započnite svoju narudžbu.
                </p>
                <button
                  onClick={() => router.push('/catalog')}
                  className="bg-[#ff6b00] active:bg-[#ff7f1a] text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
                >
                  Pregledaj katalog
                </button>
              </div>
            ) : (
              /* Cart Items */
              <div className="space-y-6 sm:space-y-8">
                {/* Cart Items List */}
                <div className="space-y-3 sm:space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.part.id} className="bg-[#101010] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6">
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0 self-start">
                          {item.part.imageUrl ? (
                            <img
                              src={item.part.imageUrl}
                              alt={item.part.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#1a1a1a] rounded-lg flex items-center justify-center">
                              <span className="text-neutral-600 text-xs sm:text-sm">N/A</span>
                            </div>
                          )}
                        </div>

                        {/* Product Details and Controls */}
                        <div className="flex-grow min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-grow min-w-0">
                              <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 line-clamp-2">{item.part.name}</h3>
                              <div className="text-xs sm:text-sm text-neutral-400 space-y-0.5 sm:space-y-1">
                                {item.part.brand && <p className="truncate">Brend: {item.part.brand}</p>}
                                {item.part.model && <p className="truncate">Model: {item.part.model}</p>}
                                {item.part.catalogNumber && <p className="truncate">Kat. broj: {item.part.catalogNumber}</p>}
                              </div>
                            </div>
                            
                            {/* Remove Button - Mobile Top Right */}
                            <button
                              onClick={() => removeFromCart(item.part.id)}
                              className="text-red-400 active:text-red-300 transition-colors p-1.5 active:scale-95 touch-manipulation"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Quantity and Price Row */}
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2 sm:gap-3">
                              <button
                                onClick={() => updateQuantity(item.part.id, item.quantity - 1)}
                                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1a1a1a] active:bg-[#ff6b00] text-white rounded-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                              >
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="w-10 sm:w-12 text-center font-semibold text-white text-base sm:text-lg">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.part.id, item.quantity + 1)}
                                className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1a1a1a] active:bg-[#ff6b00] text-white rounded-full flex items-center justify-center transition-colors active:scale-95 touch-manipulation"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#ff6b00]">
                                {(item.part.priceWithVAT * item.quantity).toFixed(2)} BAM
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs sm:text-sm text-neutral-400">
                                  {item.part.priceWithVAT.toFixed(2)} BAM × {item.quantity}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="bg-[#101010] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 sticky bottom-20 lg:relative lg:bottom-auto backdrop-blur-sm bg-[#101010]/95">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Ukupno</h3>
                      <p className="text-sm sm:text-base text-neutral-400">
                        {cartItemCount} {cartItemCount === 1 ? 'artikl' : cartItemCount < 5 ? 'artikla' : 'artikala'}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#ff6b00] mb-1 sm:mb-2">
                        {cartTotal.toFixed(2)} BAM
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-400">PDV uključen</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <button
                      onClick={clearCart}
                      className="flex-1 border border-red-500/50 text-red-400 active:bg-red-500/10 px-4 sm:px-6 py-3 sm:py-4 rounded-full font-semibold transition-all active:scale-95 sm:hover:scale-105 touch-manipulation text-sm sm:text-base"
                    >
                      Isprazni košaricu
                    </button>
                    <button
                      onClick={handleOrder}
                      disabled={isOrdering}
                      className="flex-1 bg-[#ff6b00] active:bg-[#ff7f1a] text-black px-4 sm:px-6 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all active:scale-95 sm:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
                    >
                      {isOrdering ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          <span className="text-sm sm:text-base">Slanje narudžbe...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-sm sm:text-base">Naruči putem WhatsApp/Viber</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-[#101010] border border-[#ff6b00]/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Informacije o narudžbi</h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-neutral-300">
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