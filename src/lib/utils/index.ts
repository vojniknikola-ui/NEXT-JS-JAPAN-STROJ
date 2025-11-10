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

export function generateOrderMessage(items: any[], pricing: any): string {
  const itemsText = items.map(item =>
    `${item.name} (${item.catalogNumber}) - ${item.quantity} kom x ${item.priceWithVAT.toFixed(2)} BAM = ${(item.priceWithVAT * item.quantity).toFixed(2)} BAM`
  ).join('\n');

  return encodeURIComponent(
    `Narudžba:\n${itemsText}\n\nOsnovica: ${pricing.subtotal.toFixed(2)} BAM\nPDV (17%): ${pricing.vatAmount.toFixed(2)} BAM\nUkupno prije popusta: ${pricing.totalBeforeDiscount.toFixed(2)} BAM\n${pricing.bulkDiscountPercent > 0 ? `Popust (${pricing.bulkDiscountPercent}%): -${pricing.bulkDiscountAmount.toFixed(2)} BAM\n` : ''}UKUPNO: ${pricing.finalTotal.toFixed(2)} BAM\n\nMolimo da date ponudu.`
  );
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}