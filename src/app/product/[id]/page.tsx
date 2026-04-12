'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Page, SparePart, Availability } from '@/types';
import { ShareIcon, FacebookIcon, CopyIcon, CheckIcon, CartIcon, WhatsAppIcon } from '@/lib/icons';
import { useCart } from '@/lib/hooks/useCart';
import { useSpareParts } from '@/lib/hooks/useSpareParts';
import { useToast } from '@/components/ui/ToastProvider';
import ImageLightbox from '@/components/ui/ImageLightbox';
import ProductDetailLoadingScreen from '@/components/product/ProductDetailLoadingScreen';

const AvailabilityBadge: React.FC<{ availability: Availability }> = ({ availability }) => {
  const baseClasses = 'px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold rounded-full uppercase tracking-wide text-white';
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

const FALLBACK_PRODUCT_IMAGE = 'https://via.placeholder.com/1200x900?text=JapanStroj';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const productId = parseInt(params.id as string);

  const [activePage, setActivePage] = useState<Page>('productDetail');
  const { cartItemCount, addToCart } = useCart();
  const { getRecommendations } = useSpareParts();
  const [product, setProduct] = useState<SparePart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<SparePart[]>([]);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedBlur, setSelectedBlur] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const mainImageUrl = selectedImage || product?.thumbUrl || product?.imageUrl || FALLBACK_PRODUCT_IMAGE;
  const mainBlur = selectedBlur || product?.blurData || undefined;

  const allLightboxImages = product
    ? [
        {
          url: product.imageUrl || product.thumbUrl || FALLBACK_PRODUCT_IMAGE,
          thumbUrl: product.thumbUrl,
          blurData: product.blurData,
        },
        ...(product.images || []).map((img) => ({ url: img.url, thumbUrl: img.thumbUrl, blurData: img.blurData })),
      ]
    : [];

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setSelectedImage(null);
    setSelectedBlur(null);

    if (!Number.isFinite(productId) || productId <= 0) {
      if (isActive) {
        setProduct(null);
        setRecommendations([]);
        setIsLoading(false);
      }
      return;
    }

    const controller = new AbortController();

    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/parts/${productId}`, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json() as Record<string, unknown>;
        if (typeof data.id !== 'number' || typeof data.title !== 'string') {
          throw new Error('Neispravan odgovor za proizvod');
        }

        const sparePart: SparePart = {
          id: data.id,
          name: data.title,
          brand: typeof data.brand === 'string' ? data.brand : '',
          model: typeof data.model === 'string' ? data.model : '',
          catalogNumber: typeof data.catalogNumber === 'string' ? data.catalogNumber : '',
          application: typeof data.application === 'string' ? data.application : '',
          delivery: data.delivery === 'available'
            ? Availability.Available
            : data.delivery === '15_days'
              ? Availability.FifteenDays
              : Availability.OnRequest,
          priceWithoutVAT: parseFloat(String(data.priceWithoutVAT ?? data.price ?? 0)),
          priceWithVAT: parseFloat(String(data.priceWithVAT ?? data.price ?? 0)),
          discount: parseFloat(String(data.discount ?? 0)),
          imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
          thumbUrl: typeof data.thumbUrl === 'string' ? data.thumbUrl : undefined,
          blurData: typeof data.blurData === 'string' ? data.blurData : undefined,
          images: Array.isArray(data.images)
            ? data.images
                .filter((image): image is { url?: unknown; thumbUrl?: unknown; blurData?: unknown } => typeof image === 'object' && image !== null)
                .map((image) => ({
                  url: typeof image.url === 'string' ? image.url : '',
                  thumbUrl: typeof image.thumbUrl === 'string' ? image.thumbUrl : undefined,
                  blurData: typeof image.blurData === 'string' ? image.blurData : undefined,
                }))
                .filter((image) => image.url)
            : undefined,
          technicalSpecs: {
            spec1: typeof data.spec1 === 'string' ? data.spec1 : '',
            spec2: typeof data.spec2 === 'string' ? data.spec2 : '',
            spec3: typeof data.spec3 === 'string' ? data.spec3 : '',
            spec4: typeof data.spec4 === 'string' ? data.spec4 : '',
            spec5: typeof data.spec5 === 'string' ? data.spec5 : '',
            spec6: typeof data.spec6 === 'string' ? data.spec6 : '',
            spec7: typeof data.spec7 === 'string' ? data.spec7 : '',
          },
          stock: typeof data.stock === 'number' ? data.stock : 0,
        };

        if (!isActive) {
          return;
        }

        setProduct(sparePart);
        setRecommendations(getRecommendations(sparePart, 3));
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        if (!isActive) {
          return;
        }
        console.error('Error loading product:', error);
        setProduct(null);
        setRecommendations([]);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void loadProduct();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [productId, getRecommendations]);

  useEffect(() => {
    if (product && typeof window !== 'undefined') {
      const key = 'japanStrojRecentlyViewed';
      try {
        const currentStr = localStorage.getItem(key);
        const current = currentStr ? JSON.parse(currentStr) : [];
        const slimProduct = {
          id: product.id,
          name: product.name,
          brand: product.brand,
          model: product.model,
          imageUrl: product.imageUrl,
          priceWithVAT: product.priceWithVAT,
          discount: product.discount,
          thumbUrl: product.thumbUrl,
          blurData: product.blurData,
          currency: 'BAM',
        };
        const updated = [slimProduct, ...current.filter((p: any) => p.id !== product.id)].slice(0, 4);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving recently viewed:', e);
      }
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
    toast.success('Dodano u košaricu', `${product.name} je dodan.`);
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

  if (isLoading) {
    return <ProductDetailLoadingScreen />;
  }

  if (!product) {
    return (
      <div className="bg-[#0b0b0b] text-neutral-100 min-h-screen flex flex-col">
        <Header activePage={activePage} setActivePage={setActivePage} cartItemCount={cartItemCount} />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Proizvod nije pronađen</h1>
            <button
              onClick={() => {
                setActivePage('catalog');
                router.push('/catalog');
              }}
              className="bg-[#ff6b00] hover:bg-[#ff7f1a] text-black px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
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
      <main className="flex-grow safe-main-padding lg:pb-0">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10 lg:py-12">
          <div className="max-w-6xl mx-auto">
            <button
              type="button"
              data-testid="back-to-catalog"
              onClick={() => {
                setActivePage('catalog');
                router.push('/catalog');
              }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-neutral-200 transition-colors hover:border-[#ff6b00]/40 hover:text-[#ff6b00]"
            >
              Nazad na katalog
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
              {/* Product Image & Gallery */}
              <div className="space-y-4">
                <div className="relative h-64 sm:h-80 md:h-96">
                  <Image
                    src={mainImageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    placeholder={mainBlur ? "blur" : "empty"}
                    blurDataURL={mainBlur}
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl shadow-2xl transition-all duration-300"
                  />
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <button
                      onClick={handleShareToggle}
                      className="p-2 sm:p-2.5 md:p-3 rounded-full bg-black/80 backdrop-blur-sm text-white active:bg-[#ff6b00] active:text-black transition-all duration-300 shadow-lg active:scale-95 sm:hover:scale-110 touch-manipulation"
                      aria-label="Podijeli proizvod"
                    >
                      <ShareIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    {shareMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 sm:mt-3 w-48 sm:w-52 bg-[#101010] border border-white/10 rounded-lg sm:rounded-xl shadow-[0_25px_60px_-20px_rgba(0,0,0,0.9)] z-20 overflow-hidden">
                        <a
                          href={facebookShareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-neutral-200 active:bg-white/5 transition-colors touch-manipulation"
                          onClick={() => setShareMenuOpen(false)}
                        >
                          <FacebookIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> Facebook
                        </a>
                        <a
                          href={`https://wa.me/?text=${shareMessage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-neutral-200 active:bg-white/5 transition-colors touch-manipulation"
                          onClick={() => setShareMenuOpen(false)}
                        >
                          <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> WhatsApp
                        </a>
                        <button
                          onClick={handleCopyLink}
                          className="w-full text-left flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-neutral-200 active:bg-white/5 transition-colors touch-manipulation"
                        >
                          <CopyIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> {linkCopied ? 'Kopirano!' : 'Kopiraj link'}
                        </button>
                      </div>
                    )}
                  </div>
                  {/* Zoom Hint */}
                  <div className="absolute bottom-3 left-3 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">Klikni za zoom</span>
                    </div>
                  </div>
                  {/* Click Overlay */}
                  <button 
                    onClick={() => {
                      const idx = allLightboxImages.findIndex(img => img.url === mainImageUrl);
                      setLightboxIndex(idx >= 0 ? idx : 0);
                      setLightboxOpen(true);
                    }}
                    className="absolute inset-0 w-full h-full cursor-zoom-in"
                    aria-label="Povećaj sliku"
                  />
                </div>

                {/* Gallery Thumbnails */}
                {product.images && product.images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    <button 
                      onClick={() => { setSelectedImage(null); setSelectedBlur(null); }}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${!selectedImage ? 'border-[#ff6b00]' : 'border-transparent'}`}
                    >
                      <Image src={product.thumbUrl || product.imageUrl || FALLBACK_PRODUCT_IMAGE} alt="Main" fill className="object-cover" />
                    </button>
                    {product.images.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => { setSelectedImage(img.url); setSelectedBlur(img.blurData || null); }}
                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === img.url ? 'border-[#ff6b00]' : 'border-transparent'}`}
                      >
                        <Image src={img.thumbUrl || img.url} alt={`Gallery ${idx}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">{product.name}</h1>
                  <p className="text-neutral-400 text-sm sm:text-base md:text-lg">{product.brand} - {product.model}</p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <AvailabilityBadge availability={product.delivery} />
                  {isAdded && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                      <CheckIcon className="w-3.5 h-3.5" />
                      U košarici
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-neutral-400">
                    <strong>Kataloški broj:</strong> {product.catalogNumber}
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-400">
                    <strong>Primjena:</strong> {product.application}
                  </p>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <p className="text-xs sm:text-sm text-neutral-300">
                    <strong>Cijena bez PDV-a:</strong> {product.priceWithoutVAT.toFixed(2)} BAM
                  </p>
                  <p className="text-xs sm:text-sm text-neutral-300">
                    <strong>Cijena sa PDV-om:</strong> {product.priceWithVAT.toFixed(2)} BAM
                  </p>
                  {product.discount > 0 && (
                    <p className="text-[#ff6b00] font-semibold text-sm sm:text-base">
                      Popust {product.discount.toFixed(2)}% • {priceAfterDiscount.toFixed(2)} BAM
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    data-testid="product-add-to-cart"
                    onClick={handleAddToCart}
                    disabled={isAdded}
                    className={`w-full px-8 py-4 rounded-full font-black text-lg uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-3 ${
                      isAdded
                        ? 'bg-emerald-500 text-white shadow-emerald-500/70'
                        : 'bg-gradient-to-br from-[#ff6b00] to-[#ff8c33] text-black hover:from-[#ff7f1a] hover:to-[#ffa04d] hover:scale-105 shadow-[0_10px_40px_rgba(255,107,0,0.7)] hover:shadow-[0_15px_50px_rgba(255,107,0,0.9)]'
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
                      onClick={() => router.push(`/product/${recommendedProduct.id}`)}
                    >
                      <div className="relative h-32 overflow-hidden rounded-lg mb-3">
                      <Image
                          src={recommendedProduct.thumbUrl || recommendedProduct.imageUrl || FALLBACK_PRODUCT_IMAGE}
                          alt={recommendedProduct.name}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          placeholder={recommendedProduct.blurData ? 'blur' : 'empty'}
                          blurDataURL={recommendedProduct.blurData || undefined}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
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

      {lightboxOpen && (
        <ImageLightbox 
          images={allLightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
