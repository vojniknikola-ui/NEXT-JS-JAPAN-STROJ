'use client';

import { useState, useEffect } from 'react';
import { CartItem } from '@/types';

export function useCartCount() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('japanStrojCart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Error loading cart:', error);
        }
      }
    }
  }, []);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return { cartItemCount };
}