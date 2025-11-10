'use client';

import { useState, useEffect, useCallback } from 'react';
import { CartItem, SparePart } from '@/types';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
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
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('japanStrojCart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((part: SparePart) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === part.id);

      if (existingIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1
        };
        return updatedItems;
      } else {
        return [...prevItems, { ...part, quantity: 1 }];
      }
    });
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('japanStrojCart');
    }
  }, []);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calculate pricing
  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.priceWithoutVAT * item.quantity);
  }, 0);

  const vatAmount = subtotal * 0.17;
  const totalBeforeDiscount = subtotal + vatAmount;

  // Calculate bulk discount
  let bulkDiscountPercent = 0;
  if (totalBeforeDiscount >= 5000) {
    bulkDiscountPercent = 5;
  } else if (totalBeforeDiscount >= 2000) {
    bulkDiscountPercent = 3;
  }

  const bulkDiscountAmount = totalBeforeDiscount * (bulkDiscountPercent / 100);
  const subtotalAfterDiscount = totalBeforeDiscount - bulkDiscountAmount;

  // Calculate shipping
  const freeShippingThreshold = 200;
  const shippingCost = subtotalAfterDiscount >= freeShippingThreshold ? 0 : 12;
  const finalTotal = subtotalAfterDiscount + shippingCost;

  return {
    cartItems,
    cartItemCount,
    isLoaded,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    pricing: {
      subtotal,
      vatAmount,
      totalBeforeDiscount,
      bulkDiscountPercent,
      bulkDiscountAmount,
      subtotalAfterDiscount,
      shippingCost,
      freeShippingThreshold,
      finalTotal,
    },
  };
}