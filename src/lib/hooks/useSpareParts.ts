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
        let reasons: string[] = [];

        // Brand match (highest weight - 40 points)
        if (product.brand === currentProduct.brand) {
          score += 40;
          reasons.push('Isti brend');
        }

        // Application match (high weight - 30 points)
        if (product.application === currentProduct.application) {
          score += 30;
          reasons.push('Ista primjena');
        }

        // Model similarity (medium weight - 20 points)
        if (product.model === currentProduct.model) {
          score += 20;
          reasons.push('Isti model');
        }

        // Price range similarity (medium weight - up to 15 points)
        const priceDiff = Math.abs(product.priceWithVAT - currentProduct.priceWithVAT);
        const priceRange = Math.max(product.priceWithVAT, currentProduct.priceWithVAT) * 0.3; // 30% range
        if (priceDiff <= priceRange) {
          const priceScore = 15 - (priceDiff / priceRange) * 10;
          score += priceScore;
          reasons.push('Slična cijena');
        }

        // Availability bonus (small weight - 5 points)
        if (product.delivery === currentProduct.delivery) {
          score += 5;
          reasons.push('Ista dostupnost');
        }

        // Discount bonus (small weight - 3 points)
        if (product.discount > 0 && currentProduct.discount > 0) {
          score += 3;
          reasons.push('Na popustu');
        }

        // Popular brand bonus (small weight - 2 points)
        const popularBrands = ['Caterpillar', 'Komatsu', 'Volvo'];
        if (popularBrands.includes(product.brand) && popularBrands.includes(currentProduct.brand)) {
          score += 2;
          reasons.push('Premium brend');
        }

        // Technical specs similarity (medium weight - up to 10 points)
        let specMatches = 0;
        const currentSpecs = Object.values(currentProduct.technicalSpecs).filter(Boolean);
        const productSpecs = Object.values(product.technicalSpecs).filter(Boolean);

        currentSpecs.forEach(currentSpec => {
          productSpecs.forEach(productSpec => {
            if (currentSpec.toLowerCase().includes(productSpec.toLowerCase().slice(0, 10)) ||
                productSpec.toLowerCase().includes(currentSpec.toLowerCase().slice(0, 10))) {
              specMatches++;
            }
          });
        });

        if (specMatches > 0) {
          score += Math.min(specMatches * 3, 10);
          reasons.push('Slične specifikacije');
        }

        // Name similarity (small weight - up to 5 points)
        const currentWords = currentProduct.name.toLowerCase().split(' ');
        const productWords = product.name.toLowerCase().split(' ');
        const commonWords = currentWords.filter(word =>
          word.length > 3 && productWords.some(pWord => pWord.includes(word) || word.includes(pWord))
        );

        if (commonWords.length > 0) {
          score += Math.min(commonWords.length * 2, 5);
          reasons.push('Sličan naziv');
        }

        return { product, score, reasons };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({
        ...item.product,
        recommendationReasons: item.reasons
      }));

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