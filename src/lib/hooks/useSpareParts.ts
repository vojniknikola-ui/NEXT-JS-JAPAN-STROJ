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

  return {
    spareParts,
    loading,
    error,
    refetch: fetchSpareParts,
    createSparePart,
    updateSparePart,
    deleteSparePart,
  };
}