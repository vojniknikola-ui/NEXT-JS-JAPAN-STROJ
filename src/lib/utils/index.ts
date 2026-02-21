import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} BAM`;
}

export function calculateVAT(amount: number, rate: number = 0.17): number {
  return amount * rate;
}

export function calculateBulkDiscount(total: number): { percent: number; amount: number } {
  let percent = 0;
  if (total >= 5000) {
    percent = 5;
  } else if (total >= 2000) {
    percent = 3;
  }

  const amount = total * (percent / 100);
  return { percent, amount };
}

interface OrderMessageItem {
  name: string;
  catalogNumber: string;
  quantity: number;
  priceWithVAT: number;
}

interface OrderPricing {
  subtotal: number;
  vatAmount: number;
  totalBeforeDiscount: number;
  bulkDiscountPercent: number;
  bulkDiscountAmount: number;
  finalTotal: number;
}

export function generateOrderMessage(items: OrderMessageItem[], pricing: OrderPricing): string {
  const itemsText = items.map(item =>
    `${item.name} (${item.catalogNumber}) - ${item.quantity} kom x ${item.priceWithVAT.toFixed(2)} BAM = ${(item.priceWithVAT * item.quantity).toFixed(2)} BAM`
  ).join('\n');

  return encodeURIComponent(
    `Narudžba:\n${itemsText}\n\nOsnovica: ${pricing.subtotal.toFixed(2)} BAM\nPDV (17%): ${pricing.vatAmount.toFixed(2)} BAM\nUkupno prije popusta: ${pricing.totalBeforeDiscount.toFixed(2)} BAM\n${pricing.bulkDiscountPercent > 0 ? `Popust (${pricing.bulkDiscountPercent}%): -${pricing.bulkDiscountAmount.toFixed(2)} BAM\n` : ''}UKUPNO: ${pricing.finalTotal.toFixed(2)} BAM\n\nMolimo da date ponudu.`
  );
}

export function debounce<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait: number
): (...args: TArgs) => void {
  let timeout: NodeJS.Timeout;
  return (...args: TArgs) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  limit: number
): (...args: TArgs) => void {
  let inThrottle = false;
  return (...args: TArgs) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}
