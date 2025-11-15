import { CartItem } from '@/types';

export interface OrderData {
  items: CartItem[];
  pricing: {
    subtotal: number;
    vatAmount: number;
    totalBeforeDiscount: number;
    bulkDiscountPercent: number;
    bulkDiscountAmount: number;
    finalTotal: number;
  };
}

export class OrderService {
  private static phoneNumber = "38761924848";

  static generateOrderMessage(orderData: OrderData): string {
    const { items, pricing } = orderData;

    const itemsText = items.map(item =>
      `${item.part.name} (${item.part.catalogNumber}) - ${item.quantity} kom x ${item.part.priceWithVAT.toFixed(2)} BAM = ${(item.part.priceWithVAT * item.quantity).toFixed(2)} BAM`
    ).join('\n');

    return encodeURIComponent(
      `Narudžba:\n${itemsText}\n\nOsnovica: ${pricing.subtotal.toFixed(2)} BAM\nPDV (17%): ${pricing.vatAmount.toFixed(2)} BAM\nUkupno prije popusta: ${pricing.totalBeforeDiscount.toFixed(2)} BAM\n${pricing.bulkDiscountPercent > 0 ? `Popust (${pricing.bulkDiscountPercent}%): -${pricing.bulkDiscountAmount.toFixed(2)} BAM\n` : ''}UKUPNO: ${pricing.finalTotal.toFixed(2)} BAM\n\nMolimo da date ponudu.`
    );
  }

  static getWhatsAppUrl(orderMessage: string): string {
    return `https://wa.me/${this.phoneNumber}?text=${orderMessage}`;
  }

  static getViberUrl(orderMessage: string): string {
    return `viber://forward?text=${orderMessage}`;
  }

  static getPhoneNumber(): string {
    return this.phoneNumber;
  }

  static formatPrice(amount: number): string {
    return `${amount.toFixed(2)} BAM`;
  }

  static calculateBulkDiscount(total: number): { percent: number; amount: number } {
    let percent = 0;
    if (total >= 5000) {
      percent = 5;
    } else if (total >= 2000) {
      percent = 3;
    }

    const amount = total * (percent / 100);
    return { percent, amount };
  }
}