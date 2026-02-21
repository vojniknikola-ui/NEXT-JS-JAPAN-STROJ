'use client';

import { useState } from 'react';
import { CartItem } from '@/types';

export function useCartCount() {
  const [cartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('japanStrojCart');
      if (savedCart) {
        try {
          return JSON.parse(savedCart) as CartItem[];
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
    }
    return [];
  });

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return { cartItemCount };
}
