'use client';

import { useState, useEffect, useCallback } from 'react';
import { SparePart, CartItem } from '@/types';

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

  const addToCart = useCallback((sparePart: SparePart) => {
    console.log('Adding to cart:', sparePart);
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.part.id === sparePart.id);
      if (existingItem) {
        // Increase quantity if item already exists
        return prevItems.map(item =>
          item.part.id === sparePart.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        return [...prevItems, { part: sparePart, quantity: 1 }];
      }
    });
  }, []);

  const removeFromCart = useCallback((partId: number) => {
    console.log('Removing from cart:', partId);
    setCartItems(prevItems => prevItems.filter(item => item.part.id !== partId));
  }, []);

  const updateQuantity = useCallback((partId: number, quantity: number) => {
    console.log('Updating quantity:', partId, quantity);
    if (quantity <= 0) {
      removeFromCart(partId);
      return;
    }
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.part.id === partId ? { ...item, quantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(async () => {
    console.log('Clearing cart');
    setCartItems([]);
    try {
      await fetch('/api/cart', { method: 'DELETE' });
    } catch (error) {
      console.error('Error clearing cart from API:', error);
    }
  }, []);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.part.priceWithVAT * item.quantity), 0);

  return {
    cartItems,
    cartItemCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isLoaded,
  };
}