export enum Availability {
  Available = 'available',
  FifteenDays = '15_days',
  OnRequest = 'on_request',
}

export interface TechnicalSpecs {
  spec1: string;
  spec2: string;
  spec3: string;
  spec4: string;
  spec5: string;
  spec6: string;
  spec7: string;
}

export interface SparePart {
  id: number;
  name: string;
  brand: string;
  model: string;
  catalogNumber: string;
  application: string;
  delivery: Availability;
  priceWithoutVAT: number;
  priceWithVAT: number;
  discount: number;
  imageUrl: string;
  technicalSpecs: TechnicalSpecs;
  recommendationReasons?: string[];
}

export type Product = SparePart;

export interface CartItem extends SparePart {
  quantity: number;
}

export interface Manual {
  id: number;
  title: string;
  description: string;
  url: string;
}

export type Page = 'home' | 'catalog' | 'services' | 'cart' | 'manuals' | 'admin' | 'productDetail';