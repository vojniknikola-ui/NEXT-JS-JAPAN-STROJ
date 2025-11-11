'use client';

import { useState, useEffect, useCallback } from 'react';
import { CartItem, SparePart } from '@/types';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from API on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        console.log('Loading cart from API...');
        const response = await fetch('/api/cart');
        if (response.ok) {
          const data = await response.json();
          console.log('Cart loaded from API:', data);
          setCartItems(data);
        } else {
          console.warn('API returned non-ok status:', response.status);
        }
      } catch (error) {
        console.error('Error loading cart from API:', error);
        // Fallback to localStorage if API fails
        if (typeof window !== 'undefined') {
          const savedCart = localStorage.getItem('japanStrojCart');
          if (savedCart) {
            try {
              console.log('Loading cart from localStorage:', savedCart);
              setCartItems(JSON.parse(savedCart));
            } catch (localError) {
              console.error('Error loading cart from localStorage:', localError);
            }
          }
        }
      } finally {
        setIsLoaded(true);
      }
    };

    loadCart();
  }, []);

  // Save cart to API whenever it changes
  useEffect(() => {
    if (isLoaded) {
      const saveCart = async () => {
        try {
          console.log('Saving cart to API:', cartItems);
          const response = await fetch('/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItems),
          });
          if (response.ok) {
            console.log('Cart saved successfully to API');
          } else {
            console.warn('Cart save failed with status:', response.status);
          }
        } catch (error) {
          console.error('Error saving cart to API:', error);
          // Fallback to localStorage if API fails
          if (typeof window !== 'undefined') {
            console.log('Saving cart to localStorage as fallback');
            localStorage.setItem('japanStrojCart', JSON.stringify(cartItems));
          }
        }
      };

      saveCart();
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

  const clearCart = useCallback(async () => {
    setCartItems([]);
    try {
      await fetch('/api/cart', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error clearing cart from API:', error);
      // Fallback to localStorage if API fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('japanStrojCart');
      }
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
  const shippingCost = subtotalAfterDiscount >= freeShippingThreshold ? 0 : 15;
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