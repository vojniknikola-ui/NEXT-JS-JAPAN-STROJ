import React, { useMemo, memo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CartIcon, CheckIcon } from '@/lib/icons';

interface PartData {
  id: number;
  sku: string;
  title: string;
  brand: string | null;
  model: string | null;
  catalogNumber: string | null;
  application: string | null;
  delivery: string | null;
  price: string;
  priceWithoutVAT: string | null;
  priceWithVAT: string | null;
  discount: string | null;
  currency: string;
  stock: number;
  categoryId: number;
  imageUrl: string | null;
  isActive: boolean;
  category: string;
  spec1?: string | null;
  spec2?: string | null;
  spec3?: string | null;
  spec4?: string | null;
  spec5?: string | null;
  spec6?: string | null;
  spec7?: string | null;
}

const AvailabilityBadge: React.FC<{ availability: string }> = memo(({ availability }) => {
  const baseClasses = 'px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full uppercase tracking-wide';
  switch (availability) {
    case 'available':
      return <div className={`${baseClasses} bg-emerald-500/90 text-white`}>Dostupno</div>;
    case '15_days':
      return <div className={`${baseClasses} bg-[#ff6b00] text-white`}>15 dana</div>;
    case 'on_request':
      return <div className={`${baseClasses} bg-red-500/90 text-white`}>Po dogovoru</div>;
    default:
      return null;
  }
});

AvailabilityBadge.displayName = 'AvailabilityBadge';

const ProductCard = memo<{ part: PartData; onAddToCart: (part: PartData) => void; isAdded: boolean }>(({ part, onAddToCart, isAdded }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [part.id]);

  const priceAfterDiscount = useMemo(() => {
    if (part.priceWithVAT && part.discount) {
      return parseFloat(part.priceWithVAT) * (1 - parseFloat(part.discount) / 100);
    }
    return parseFloat(part.priceWithVAT || part.price);
  }, [part.discount, part.price, part.priceWithVAT]);

  const productHref = useMemo(() => `/product/${part.id}`, [part.id]);

  return (
    <article className="group bg-[#101010] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden active:border-[#ff6b00]/30 transition-all duration-300 sm:hover:shadow-[0_10px_40px_-15px_rgba(255,107,0,0.3)] sm:hover:-translate-y-1">
      <Link
        href={productHref}
        className="relative block aspect-square bg-[#1a1a1a] overflow-hidden touch-manipulation"
      >
        {part.imageUrl && !imageError ? (
          <Image
            src={part.imageUrl}
            alt={part.title}
            fill
            className="object-cover sm:group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-600">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 bg-[#ff6b00]/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-[10px] sm:text-xs">Nema slike</p>
            </div>
          </div>
        )}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <AvailabilityBadge availability={part.delivery || 'available'} />
        </div>
        {part.discount && parseFloat(part.discount) > 0 && (
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-green-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold">
            -{part.discount}%
          </div>
        )}
      </Link>

      <div className="p-4 sm:p-5 md:p-6">
        <div className="mb-2 sm:mb-3">
          <div className="text-[10px] sm:text-xs text-neutral-400 mb-1 font-mono truncate">{part.sku}</div>
          <Link
            href={productHref}
            className="block text-sm sm:text-base font-semibold text-white mb-1 line-clamp-2 sm:group-hover:text-[#ff6b00] transition-colors"
          >
            {part.title}
          </Link>
          {(part.brand || part.model) && (
            <p className="text-xs sm:text-sm text-neutral-400 truncate">
              {part.brand}{part.brand && part.model && ' • '}{part.model}
            </p>
          )}
          {part.catalogNumber && (
            <p className="text-[10px] sm:text-xs text-neutral-400 mt-1 truncate">
              Kat. broj: {part.catalogNumber}
            </p>
          )}
        </div>

        <div className="space-y-1 sm:space-y-2 mb-3 sm:mb-4">
          {part.priceWithoutVAT && (
            <p className="text-xs sm:text-sm text-neutral-400">
              Bez PDV-a: {parseFloat(part.priceWithoutVAT).toFixed(2)} {part.currency}
            </p>
          )}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-[#ff6b00]">
              {priceAfterDiscount.toFixed(2)} {part.currency}
            </span>
            {part.discount && parseFloat(part.discount) > 0 && (
              <span className="text-xs sm:text-sm text-neutral-400 line-through">
                {parseFloat(part.priceWithVAT || part.price).toFixed(2)} {part.currency}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onAddToCart(part)}
          disabled={isAdded}
          className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-full font-semibold text-xs sm:text-sm uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
            isAdded
              ? 'bg-emerald-500 text-white shadow-emerald-500/70'
              : 'bg-gradient-to-br from-[#ff6b00] to-[#ff8c33] text-white active:scale-95 sm:hover:scale-105 shadow-[0_8px_25px_rgba(255,107,0,0.6)] sm:hover:shadow-[0_12px_35px_rgba(255,107,0,0.8)]'
          }`}
        >
          {isAdded ? (
            <>
              <CheckIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs">Dodano!</span>
            </>
          ) : (
            <>
              <CartIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs">Dodaj u košaricu</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}, (prev, next) => {
  const samePricing = prev.part.price === next.part.price && prev.part.priceWithVAT === next.part.priceWithVAT && prev.part.discount === next.part.discount;
  return prev.isAdded === next.isAdded && prev.part.id === next.part.id && samePricing;
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;