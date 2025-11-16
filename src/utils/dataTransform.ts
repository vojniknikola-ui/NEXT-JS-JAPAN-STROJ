import { SparePart, Availability } from '@/types';

export interface PartData {
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

export function transformPartDataToSparePart(part: PartData): SparePart {
  return {
    id: part.id,
    name: part.title,
    brand: part.brand || '',
    model: part.model || '',
    catalogNumber: part.catalogNumber || '',
    application: part.application || '',
    delivery: part.delivery === 'available' ? Availability.Available :
             part.delivery === '15_days' ? Availability.FifteenDays :
             Availability.OnRequest,
    priceWithoutVAT: parseFloat(part.priceWithoutVAT || part.price) || 0,
    priceWithVAT: parseFloat(part.priceWithVAT || part.price) || 0,
    discount: parseFloat(part.discount || '0') || 0,
    imageUrl: part.imageUrl || '',
    technicalSpecs: {
      spec1: part.spec1 || '',
      spec2: part.spec2 || '',
      spec3: part.spec3 || '',
      spec4: part.spec4 || '',
      spec5: part.spec5 || '',
      spec6: part.spec6 || '',
      spec7: part.spec7 || '',
    },
    stock: part.stock,
  };
}