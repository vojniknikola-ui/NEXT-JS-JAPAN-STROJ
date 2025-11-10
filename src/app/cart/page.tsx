'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page } from '@/types';
import { useCart } from '@/lib/hooks/useCart';
import { WhatsAppIcon, ViberIcon } from '@/lib/icons';

export default function CartPage() {
  const [activePage, setActivePage] = useState<Page>('cart');
  const { cartItems, cartItemCount, updateQuantity, removeFromCart, clearCart, pricing } = useCart();

  // Generate order message for WhatsApp/Viber
  const generateOrderMessage = () => {
    const itemsText = cartItems.map(item =>
      `${item.name} (${item.catalogNumber}) - ${item.quantity} kom x ${item.priceWithVAT.toFixed(2)} BAM = ${(item.priceWithVAT * item.quantity).toFixed(2)} BAM`
    ).join('\n');

    return encodeURIComponent(
      `Narudžba:\n${itemsText}\n\nOsnovica: ${pricing.subtotal.toFixed(2)} BAM\nPDV (17%): ${pricing.vatAmount.toFixed(2)} BAM\nUkupno prije popusta: ${pricing.totalBeforeDiscount.toFixed(2)} BAM\n${pricing.bulkDiscountPercent > 0 ? `Popust (${pricing.bulkDiscountPercent}%): -${pricing.bulkDiscountAmount.toFixed(2)} BAM\n` : ''}${pricing.shippingCost > 0 ? `Poštarina: ${pricing.shippingCost.toFixed(2)} BAM\n` : 'Besplatna dostava\n'}UKUPNO: ${pricing.finalTotal.toFixed(2)} BAM\n\nMolimo da date ponudu.`
    );
  };

  const orderMessage = generateOrderMessage();
  const phoneNumber = "38761924848";

  if (cartItems.length === 0) {
    return (
      <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
        <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Vaša košarica je prazna</h1>
            <p className="text-neutral-400 mb-8">Dodajte proizvode u košaricu da biste započeli kupovinu.</p>
            <button
              onClick={() => setActivePage('catalog')}
              className="bg-[#ff6b00] hover:bg-[#ff7f1a] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105"
            >
              Pregledajte katalog
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
      <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">Vaša košarica</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {cartItems.map((item) => {
                const priceAfterDiscount = item.priceWithVAT * (1 - item.discount / 100);
                return (
                  <div key={item.id} className="bg-[#101010] border border-white/5 rounded-2xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-grow min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-white truncate">{item.name}</h3>
                        <p className="text-neutral-400 text-xs sm:text-sm">{item.brand} - {item.model}</p>
                        <p className="text-neutral-400 text-xs sm:text-sm">Kataloški broj: {item.catalogNumber}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-[#ff6b00] hover:bg-[#ff7f1a] text-white rounded-full flex items-center justify-center transition-colors text-sm"
                            >
                              -
                            </button>
                            <span className="text-white font-semibold min-w-[2rem] text-center text-sm sm:text-base">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-[#ff6b00] hover:bg-[#ff7f1a] text-white rounded-full flex items-center justify-center transition-colors text-sm"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <div className="text-neutral-400 text-xs sm:text-sm">
                              {item.priceWithoutVAT.toFixed(2)} BAM × {item.quantity}
                            </div>
                            <div className="text-[#ff6b00] font-bold text-sm sm:text-base">
                              {(item.priceWithoutVAT * item.quantity * 1.17).toFixed(2)} BAM
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="bg-[#101010] border border-white/5 rounded-2xl p-6 h-fit">
              <h2 className="text-xl font-bold text-white mb-6">Sažetak narudžbe</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-neutral-300">
                  <span>Osnovica:</span>
                  <span>{pricing.subtotal.toFixed(2)} BAM</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>PDV (17%):</span>
                  <span>{pricing.vatAmount.toFixed(2)} BAM</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Ukupno prije popusta:</span>
                  <span>{pricing.totalBeforeDiscount.toFixed(2)} BAM</span>
                </div>
                {pricing.bulkDiscountPercent > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Popust ({pricing.bulkDiscountPercent}%):</span>
                    <span>-{pricing.bulkDiscountAmount.toFixed(2)} BAM</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-300">
                  <span>Poštarina:</span>
                  <span className={pricing.shippingCost === 0 ? 'text-green-400' : ''}>
                    {pricing.shippingCost === 0 ? 'Besplatna' : `${pricing.shippingCost.toFixed(2)} BAM`}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>UKUPNO:</span>
                    <span>{pricing.finalTotal.toFixed(2)} BAM</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {pricing.bulkDiscountPercent === 0 && pricing.totalBeforeDiscount < 2000 && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-blue-400 text-sm">
                      💡 Dodajte još {(2000 - pricing.totalBeforeDiscount).toFixed(2)} BAM za 3% popusta, ili {(5000 - pricing.totalBeforeDiscount).toFixed(2)} BAM za 5% popusta!
                    </p>
                  </div>
                )}

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-amber-400 text-sm">
                    🚚 Besplatna dostava za narudžbe preko {pricing.freeShippingThreshold} BAM. Trenutno: {pricing.subtotalAfterDiscount.toFixed(2)} BAM
                    {pricing.subtotalAfterDiscount < pricing.freeShippingThreshold && (
                      <span className="block mt-1">
                        Dodajte još {(pricing.freeShippingThreshold - pricing.subtotalAfterDiscount).toFixed(2)} BAM za besplatnu dostavu!
                      </span>
                    )}
                  </p>
                </div>

                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-green-400 text-sm">
                    💰 Popusti: 3% za narudžbe preko 2000 BAM, 5% za narudžbe preko 5000 BAM
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <a
                    href={`https://wa.me/${phoneNumber}?text=${orderMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={`viber://forward?text=${orderMessage}`}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.4 0C9.473.028 5.333.344 3.02 2.467 1.302 4.187.696 6.7.633 9.817.57 12.933.488 18.774 6.12 20.36h.003l-.004 2.41s-.037.98.61 1.179c.777.242 1.234-.5 1.98-1.303.407-.44.972-1.086 1.397-1.58 3.85.323 6.812-.417 7.149-.525.776-.252 5.176-.815 5.888-6.644.734-6.022-.44-9.83-2.777-11.534C17.949-.01 14.027-.045 11.4 0zm.33 1.773c2.388-.02 5.831.026 8.092 1.554 2.03 1.487 2.703 4.746 2.045 9.97-.607 4.832-4.056 5.207-4.706 5.416-.29.093-2.944.737-6.243.42 0 0-2.463 2.97-3.234 3.74-.12.12-.26.167-.352.145-.13-.03-.166-.203-.166-.45l.01-4.123c-.002 0-.002 0 0 0-4.762-1.32-4.485-6.292-4.43-8.982.054-2.69.584-4.865 2.072-6.453C6.86 1.012 10.545.807 11.73 1.773zm.387 2.77s-.052.01-.104.026c-.198.055-.33.13-.437.262-.117.144-.218.32-.256.522-.04.22-.03.49.038.75.13.5.568 1.25.568 1.25s1.043 1.975 2.5 3.226c1.458 1.25 3.145 1.9 3.145 1.9s.257.09.543.118c.222.02.443-.02.632-.1.17-.076.32-.19.44-.337.126-.155.23-.34.288-.54.047-.166.06-.342.038-.515-.022-.15-.114-.35-.28-.448-.177-.1-.906-.428-1.07-.49-.168-.062-.383-.1-.543.023-.16.124-.557.67-.692.828-.133.16-.275.187-.5.078-.223-.11-.794-.323-1.558-.983-.752-.656-1.34-1.494-1.478-1.737-.138-.244-.014-.38.108-.504.11-.116.246-.303.37-.454.123-.15.178-.257.266-.424.09-.168.048-.32-.024-.45-.07-.13-.633-1.48-.868-2.014-.238-.537-.474-.476-.653-.487-.17-.01-.363-.012-.558-.012z"/>
                    </svg>
                    Viber
                  </a>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 bg-[#ff6b00] hover:bg-[#ff7f1a] text-white py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105">
                    Nastavi sa narudžbom
                  </button>
                  <button
                    onClick={clearCart}
                    className="px-6 py-4 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105"
                  >
                    Isprazni košaricu
                  </button>
                </div>
              </div>

              <p className="text-neutral-500 text-sm text-center mt-4">
                Kontaktirajte nas za detalje o dostavi i plaćanju
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}