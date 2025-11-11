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
   const [showClearConfirm, setShowClearConfirm] = useState(false);

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
    <div className="bg-gradient-to-br from-[#0b0b0b] via-[#0a0a0a] to-[#080808] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />

      <main className="flex-grow pb-20 lg:pb-0 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,107,0,0.1)_0%,_transparent_50%)] animate-pulse"></div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10 lg:py-12 relative z-10">
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
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
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
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-[#ff6b00]/20 to-[#ff6b00]/5 rounded-full flex items-center justify-center animate-pulse">
                    <ShoppingBagIcon className="w-12 h-12 sm:w-16 sm:h-16 text-[#ff6b00]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#ff6b00] rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-black font-bold text-sm">+</span>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Košarica je prazna</h2>
                <p className="text-sm sm:text-base text-neutral-400 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                  Dodajte rezervne dijelove u košaricu i započnite svoju narudžbu.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <button
                    onClick={() => router.push('/catalog')}
                    className="bg-[#ff6b00] active:bg-[#ff7f1a] text-black px-8 sm:px-10 py-4 sm:py-5 rounded-full font-bold text-base sm:text-lg transition-all active:scale-95 sm:hover:scale-105 touch-manipulation shadow-lg hover:shadow-xl"
                  >
                    Pregledaj katalog
                  </button>
                  <button
                    onClick={() => router.push('/services')}
                    className="border border-[#ff6b00]/50 text-[#ff6b00] active:bg-[#ff6b00]/10 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base transition-all active:scale-95 sm:hover:scale-105 touch-manipulation"
                  >
                    Naše usluge
                  </button>
                </div>
              </div>
            ) : (
              /* Cart Items */
              <div className="space-y-6 sm:space-y-8">
                {/* Cart Items List */}
                <div className="space-y-3 sm:space-y-4">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.part.id}
                      className="bg-[#101010] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-[#ff6b00]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#ff6b00]/5"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0 self-start relative">
                          {item.part.imageUrl ? (
                            <img
                              src={item.part.imageUrl}
                              alt={item.part.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shadow-md"
                            />
                          ) : (
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-lg flex items-center justify-center border border-white/5">
                              <span className="text-neutral-500 text-xs sm:text-sm font-medium">N/A</span>
                            </div>
                          )}
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#ff6b00] rounded-full flex items-center justify-center text-xs font-bold text-black">
                            {item.quantity}
                          </div>
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
                            <div className="flex items-center gap-2 sm:gap-3 bg-[#0a0a0a] rounded-full p-1">
                              <button
                                onClick={() => updateQuantity(item.part.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-[#1a1a1a] hover:bg-[#ff6b00] disabled:bg-[#0f0f0f] disabled:text-neutral-600 text-white rounded-full flex items-center justify-center transition-all active:scale-95 touch-manipulation disabled:cursor-not-allowed"
                              >
                                <MinusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <span className="w-10 sm:w-12 text-center font-semibold text-white text-base sm:text-lg min-w-[2.5rem]">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.part.id, item.quantity + 1)}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-[#1a1a1a] hover:bg-[#ff6b00] text-white rounded-full flex items-center justify-center transition-all active:scale-95 touch-manipulation"
                              >
                                <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#ff6b00] animate-pulse">
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
                <div className="bg-gradient-to-r from-[#101010] to-[#0f0f0f] border border-[#ff6b00]/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 sticky bottom-20 lg:relative lg:bottom-auto backdrop-blur-sm shadow-2xl shadow-[#ff6b00]/10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Ukupno</h3>
                      <p className="text-sm sm:text-base text-neutral-400">
                        {cartItemCount} {cartItemCount === 1 ? 'artikl' : cartItemCount < 5 ? 'artikla' : 'artikala'}
                      </p>
                      {cartTotal >= 500 && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-400 font-medium">Besplatna dostava!</span>
                        </div>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#ff6b00] mb-1 sm:mb-2 animate-pulse">
                        {cartTotal.toFixed(2)} BAM
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-400">PDV uključen</p>
                      {cartTotal < 500 && (
                        <p className="text-xs text-neutral-500 mt-1">
                          Još {(500 - cartTotal).toFixed(2)} BAM za besplatnu dostavu
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6 sm:mt-8">
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="flex-1 border border-red-500/50 text-red-400 active:bg-red-500/10 px-4 sm:px-6 py-3 sm:py-4 rounded-full font-semibold transition-all active:scale-95 sm:hover:scale-105 touch-manipulation text-sm sm:text-base"
                    >
                      Isprazni košaricu
                    </button>
                    <button
                      onClick={handleOrder}
                      disabled={isOrdering}
                      className="flex-1 bg-gradient-to-r from-[#ff6b00] to-[#ff8533] hover:from-[#ff8533] hover:to-[#ff6b00] active:bg-[#ff7f1a] text-black px-4 sm:px-6 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all active:scale-95 sm:hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation shadow-lg hover:shadow-xl relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      {isOrdering ? (
                        <>
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                          <span className="text-sm sm:text-base relative z-10">Slanje narudžbe...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-sm sm:text-base relative z-10">Naruči putem WhatsApp/Viber</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-gradient-to-br from-[#101010] to-[#0a0a0a] border border-[#ff6b00]/20 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:border-[#ff6b00]/40 transition-all duration-300">
                  <h3 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-[#ff6b00] rounded-full animate-pulse"></div>
                    Informacije o narudžbi
                  </h3>
                  <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-neutral-300">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <p><strong className="text-white">Besplatna dostava</strong> za narudžbe preko 500 BAM</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <p><strong className="text-white">Garancija kvaliteta</strong> na sve dijelove</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <p><strong className="text-white">Brza obrada</strong> narudžbi u roku 24h</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <p><strong className="text-white">24/7 podrška</strong> za sva pitanja</p>
                    </div>
                  </div>
                </div>

                {/* Clear Cart Confirmation Modal */}
                {showClearConfirm && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#101010] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-auto">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <TrashIcon className="w-8 h-8 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Isprazniti košaricu?</h3>
                        <p className="text-neutral-400 text-sm mb-6">
                          Ova akcija će ukloniti sve artikle iz vaše košarice. Ova akcija se ne može poništiti.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowClearConfirm(false)}
                            className="flex-1 px-4 py-3 border border-white/20 text-white rounded-full font-semibold transition-all active:scale-95 touch-manipulation"
                          >
                            Odustani
                          </button>
                          <button
                            onClick={() => {
                              clearCart();
                              setShowClearConfirm(false);
                            }}
                            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-full font-semibold transition-all active:scale-95 touch-manipulation"
                          >
                            Isprazni
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}