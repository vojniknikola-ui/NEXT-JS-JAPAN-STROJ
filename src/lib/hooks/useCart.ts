'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SparePart, CartItem } from '@/types';

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastSyncedCartRef = useRef<string>(JSON.stringify([]));

  // Load cart from API on mount
  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();

    const loadCart = async () => {
      let localCartItems: CartItem[] | null = null;
      if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('japanStrojCart');
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart) as CartItem[];
            if (Array.isArray(parsed) && isActive) {
              localCartItems = parsed;
              setCartItems(parsed);
              lastSyncedCartRef.current = savedCart;
            }
          } catch (error) {
            console.error('Error parsing cart from localStorage:', error);
          }
        }
      }

      try {
        const response = await fetch('/api/cart', { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        if (isActive) {
          if (!Array.isArray(data)) {
            throw new Error('Invalid cart payload');
          }

          const shouldKeepLocalCart =
            Array.isArray(localCartItems) &&
            localCartItems.length > 0 &&
            data.length === 0;

          if (shouldKeepLocalCart) {
            // Keep the local cart as source of truth when the API falls back to empty.
            // This also lets the save effect sync local state back to the server later.
            lastSyncedCartRef.current = JSON.stringify(data);
          } else {
            setCartItems(data);
            lastSyncedCartRef.current = JSON.stringify(data);
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('Error loading cart from API:', error);
      } finally {
        if (isActive) {
          setIsLoaded(true);
        }
      }
    };

    loadCart();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, []);

  // Save cart to API whenever it changes (but only after initial load)
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const serialized = JSON.stringify(cartItems);

    if (typeof window !== 'undefined') {
      localStorage.setItem('japanStrojCart', serialized);
    }

    if (lastSyncedCartRef.current === serialized) {
      return;
    }

    const controller = new AbortController();
    let hasStarted = false;

    const saveCart = async () => {
      hasStarted = true;
      try {
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: serialized,
          signal: controller.signal,
        });
        if (response.ok) {
          lastSyncedCartRef.current = serialized;
        } else {
          console.warn('Cart save failed with status:', response.status);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        console.error('Error saving cart to API:', error);
      }
    };

    const timeoutId = window.setTimeout(saveCart, 150);

    return () => {
      clearTimeout(timeoutId);
      if (hasStarted) {
        controller.abort();
      }
    };
  }, [cartItems, isLoaded]);

  const addToCart = useCallback((sparePart: SparePart) => {
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
    setCartItems(prevItems => prevItems.filter(item => item.part.id !== partId));
  }, []);

  const updateQuantity = useCallback((partId: number, quantity: number) => {
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
    setCartItems([]);
    try {
      await fetch('/api/cart', { method: 'DELETE' });
    } catch (error) {
      console.error('Error clearing cart from API:', error);
    }
  }, []);

  const cartItemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );
  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + (item.part.priceWithVAT * item.quantity), 0),
    [cartItems]
  );

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
