'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page, SparePart, Availability } from '@/types';
import { ShareIcon, FacebookIcon, CopyIcon, CheckIcon, CartIcon, WhatsAppIcon, ViberIcon } from '@/lib/icons';
import { useCart } from '@/lib/hooks/useCart';
import { useSpareParts } from '@/lib/hooks/useSpareParts';

const AvailabilityBadge: React.FC<{ availability: Availability }> = ({ availability }) => {
  const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wide text-white';
  switch (availability) {
    case Availability.Available:
      return <div className={`${baseClasses} bg-emerald-500/90`}>Dostupno odmah</div>;
    case Availability.FifteenDays:
      return <div className={`${baseClasses} bg-[#ff6b00] text-black`}>Rok isporuke 15 dana</div>;
    case Availability.OnRequest:
      return <div className={`${baseClasses} bg-red-500/90`}>Dostupnost po dogovoru</div>;
    default:
      return null;
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = parseInt(params.id as string);

  const [activePage, setActivePage] = useState<Page>('productDetail');
  const { cartItemCount, addToCart } = useCart();
  const { getRecommendations } = useSpareParts();
  const [product, setProduct] = useState<SparePart | null>(null);
  const [recommendations, setRecommendations] = useState<SparePart[]>([]);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    // Load product from API
    if (productId) {
      fetch(`/api/parts/${productId}`)
        .then(res => res.json())
        .then(data => {
          // Convert PartData to SparePart format
          const sparePart: SparePart = {
            id: data.id,
            name: data.title,
            brand: data.brand || '',
            model: data.model || '',
            catalogNumber: data.catalogNumber || '',
            application: data.application || '',
            delivery: data.delivery === 'available' ? Availability.Available :
                     data.delivery === '15_days' ? Availability.FifteenDays :
                     Availability.OnRequest,
            priceWithoutVAT: parseFloat(data.priceWithoutVAT || data.price),
            priceWithVAT: parseFloat(data.priceWithVAT || data.price),
            discount: parseFloat(data.discount || '0'),
            imageUrl: data.imageUrl || '',
            technicalSpecs: {
              spec1: data.spec1 || '',
              spec2: data.spec2 || '',
              spec3: data.spec3 || '',
              spec4: data.spec4 || '',
              spec5: data.spec5 || '',
              spec6: data.spec6 || '',
              spec7: data.spec7 || '',
            },
            stock: data.stock,
          };

          setProduct(sparePart);

          // Generate recommendations after product is loaded
          if (sparePart) {
            const recommendedProducts = getRecommendations(sparePart, 3);
            setRecommendations(recommendedProducts);
          }
        })
        .catch(error => {
          console.error('Error loading product:', error);
          setProduct(null);
        });
    }
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;

    console.log('Adding product to cart from detail page:', product); // Debug log

    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);

    // Show toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-[#ff6b00] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-right-4';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span class="font-semibold">${product.name} dodan u košaricu!</span>
      </div>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const handleShareToggle = () => {
    setShareMenuOpen((prev) => !prev);
  };

  const handleCopyLink = () => {
    const productUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (!productUrl) return;
    navigator.clipboard.writeText(productUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => {
        setLinkCopied(false);
        setShareMenuOpen(false);
      }, 2000);
    });
  };

  const productUrl = typeof window !== 'undefined' ? window.location.href : '';
  const priceAfterDiscount = product ? product.priceWithVAT * (1 - product.discount / 100) : 0;
  const shareMessage = encodeURIComponent(`Pogledaj ${product?.name} (${product?.catalogNumber}) za ${priceAfterDiscount.toFixed(2)} BAM: ${productUrl}`);
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;

  if (!product) {
    return (
      <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
        <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Proizvod nije pronađen</h1>
            <button
              onClick={() => setActivePage('catalog')}
              className="bg-[#ff6b00] hover:bg-[#ff7f1a] text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
            >
              Povratak na katalog
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
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Image */}
              <div className="relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleShareToggle}
                    className="p-3 rounded-full bg-black/80 backdrop-blur-sm text-white hover:bg-[#ff6b00] hover:text-black transition-all duration-300 shadow-lg hover:shadow-[#ff6b00]/50 hover:scale-110"
                    aria-label="Podijeli proizvod"
                  >
                    <ShareIcon className="w-6 h-6" />
                  </button>
                  {shareMenuOpen && (
                    <div className="absolute top-full right-0 mt-3 w-52 bg-[#101010] border border-white/10 rounded-xl shadow-[0_25px_60px_-20px_rgba(0,0,0,0.9)] z-20 overflow-hidden">
                      <a
                        href={facebookShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-sm text-neutral-200 hover:bg-white/5 transition-colors"
                        onClick={() => setShareMenuOpen(false)}
                      >
                        <FacebookIcon className="w-5 h-5 mr-3" /> Facebook
                      </a>
                      <a
                        href={`https://wa.me/?text=${shareMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-4 py-2 text-sm text-neutral-200 hover:bg-white/5 transition-colors"
                        onClick={() => setShareMenuOpen(false)}
                      >
                        <WhatsAppIcon className="w-5 h-5 mr-3" /> WhatsApp
                      </a>
                      <a
                        href={`viber://forward?text=${shareMessage}`}
                        className="flex items-center px-4 py-2 text-sm text-neutral-200 hover:bg-white/5 transition-colors"
                        onClick={() => setShareMenuOpen(false)}
                      >
                        <ViberIcon className="w-5 h-5 mr-3" /> Viber
                      </a>
                      <button
                        onClick={handleCopyLink}
                        className="w-full text-left flex items-center px-4 py-2 text-sm text-neutral-200 hover:bg-white/5 transition-colors"
                      >
                        <CopyIcon className="w-5 h-5 mr-3" /> {linkCopied ? 'Kopirano!' : 'Kopiraj link'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{product.name}</h1>
                  <p className="text-neutral-400 text-lg">{product.brand} - {product.model}</p>
                </div>

                <div className="flex items-center gap-4">
                  <AvailabilityBadge availability={product.delivery} />
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-neutral-400">
                    <strong>Kataloški broj:</strong> {product.catalogNumber}
                  </p>
                  <p className="text-sm text-neutral-400">
                    <strong>Primjena:</strong> {product.application}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-neutral-300">
                    <strong>Cijena bez PDV-a:</strong> {product.priceWithoutVAT.toFixed(2)} BAM
                  </p>
                  <p className="text-sm text-neutral-300">
                    <strong>Cijena sa PDV-om:</strong> {product.priceWithVAT.toFixed(2)} BAM
                  </p>
                  {product.discount > 0 && (
                    <p className="text-[#ff6b00] font-semibold">
                      Popust {product.discount.toFixed(2)}% • {priceAfterDiscount.toFixed(2)} BAM
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`w-full px-8 py-4 rounded-full font-black text-lg uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-3 ${
                      isAdded
                        ? 'bg-emerald-500 text-white shadow-emerald-500/70'
                        : 'bg-gradient-to-br from-[#ff6b00] to-[#ff8c33] text-white hover:from-[#ff7f1a] hover:to-[#ffa04d] hover:scale-105 shadow-[0_10px_40px_rgba(255,107,0,0.7)] hover:shadow-[0_15px_50px_rgba(255,107,0,0.9)]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckIcon className="w-6 h-6" />
                        Dodano u košaricu!
                      </>
                    ) : (
                      <>
                        <CartIcon className="w-6 h-6" />
                        Dodaj u košaricu - {priceAfterDiscount.toFixed(2)} BAM
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-white mb-8">Tehnička specifikacija</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(product.technicalSpecs).map(([key, value], index) => (
                  value && (
                    <div key={key} className="bg-[#101010] border border-white/5 rounded-xl p-6">
                      <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                        Specifikacija {index + 1}
                      </h3>
                      <p className="text-white">{value}</p>
                    </div>
                  )
                ))}
              </div>
            </div>

            {/* Recommended Products */}
            {recommendations.length > 0 && (
              <div className="mt-12 sm:mt-16">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Preporučeni proizvodi</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {recommendations.map((recommendedProduct) => (
                    <div
                      key={recommendedProduct.id}
                      className="bg-[#101010] border border-white/5 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-15px_rgba(255,107,0,0.5)] group"
                      onClick={() => window.location.href = `/product/${recommendedProduct.id}`}
                    >
                      <div className="relative overflow-hidden rounded-lg mb-3">
                        <img
                          src={recommendedProduct.imageUrl}
                          alt={recommendedProduct.name}
                          className="w-full h-32 object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#ff6b00] transition-colors">
                          {recommendedProduct.name}
                        </h3>
                        <p className="text-xs text-neutral-400">
                          {recommendedProduct.brand} • {recommendedProduct.model}
                        </p>

                        {/* Recommendation Reasons */}
                        {recommendedProduct.recommendationReasons && recommendedProduct.recommendationReasons.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {recommendedProduct.recommendationReasons.slice(0, 2).map((reason, idx) => (
                              <span key={idx} className="text-[10px] bg-[#ff6b00]/20 text-[#ff6b00] px-2 py-0.5 rounded-full">
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#ff6b00]">
                            {(recommendedProduct.priceWithVAT * (1 - recommendedProduct.discount / 100)).toFixed(2)} BAM
                          </span>
                          {recommendedProduct.discount > 0 && (
                            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                              -{recommendedProduct.discount}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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