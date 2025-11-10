'use client';

import { useState, useEffect, useCallback } from 'react';
import { SparePart } from '@/types';

export function useSpareParts() {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpareParts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/spare-parts');
      if (!response.ok) {
        throw new Error('Failed to fetch spare parts');
      }
      const data = await response.json();
      setSpareParts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching spare parts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSparePart = useCallback(async (sparePart: Omit<SparePart, 'id'>) => {
    try {
      const response = await fetch('/api/spare-parts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sparePart),
      });

      if (!response.ok) {
        throw new Error('Failed to create spare part');
      }

      const newSparePart = await response.json();
      setSpareParts(prev => [...prev, newSparePart]);
      return newSparePart;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create spare part');
      throw err;
    }
  }, []);

  const updateSparePart = useCallback(async (id: number, updates: Partial<SparePart>) => {
    try {
      const response = await fetch('/api/spare-parts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update spare part');
      }

      const updatedSparePart = await response.json();
      setSpareParts(prev =>
        prev.map(part => part.id === id ? updatedSparePart : part)
      );
      return updatedSparePart;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update spare part');
      throw err;
    }
  }, []);

  const deleteSparePart = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/spare-parts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete spare part');
      }

      setSpareParts(prev => prev.filter(part => part.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete spare part');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchSpareParts();
  }, [fetchSpareParts]);

  const getRecommendations = useCallback((currentProduct: SparePart, limit: number = 3): SparePart[] => {
    if (!spareParts.length) return [];

    // Calculate similarity scores for each product
    const recommendations = spareParts
      .filter(product => product.id !== currentProduct.id)
      .map(product => {
        let score = 0;

        // Brand match (highest weight - 40 points)
        if (product.brand === currentProduct.brand) {
          score += 40;
        }

        // Application match (high weight - 30 points)
        if (product.application === currentProduct.application) {
          score += 30;
        }

        // Model similarity (medium weight - 20 points)
        if (product.model === currentProduct.model) {
          score += 20;
        }

        // Price range similarity (medium weight - up to 15 points)
        const priceDiff = Math.abs(product.priceWithVAT - currentProduct.priceWithVAT);
        const priceRange = Math.max(product.priceWithVAT, currentProduct.priceWithVAT) * 0.3; // 30% range
        if (priceDiff <= priceRange) {
          score += 15 - (priceDiff / priceRange) * 10; // Higher score for closer prices
        }

        // Availability bonus (small weight - 5 points)
        if (product.delivery === currentProduct.delivery) {
          score += 5;
        }

        // Discount bonus (small weight - 3 points)
        if (product.discount > 0 && currentProduct.discount > 0) {
          score += 3;
        }

        // Popular brand bonus (small weight - 2 points)
        const popularBrands = ['Caterpillar', 'Komatsu', 'Volvo'];
        if (popularBrands.includes(product.brand) && popularBrands.includes(currentProduct.brand)) {
          score += 2;
        }

        return { product, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.product);

    return recommendations;
  }, [spareParts]);

  return {
    spareParts,
    loading,
    error,
    refetch: fetchSpareParts,
    createSparePart,
    updateSparePart,
    deleteSparePart,
    getRecommendations,
  };
}