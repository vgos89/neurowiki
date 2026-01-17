
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'neurowiki:favorites:v1';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load favorites', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to storage whenever favorites change (skip initial empty render if not loaded)
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
      } catch (e) {
        console.warn('Failed to save favorites', e);
      }
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      if (isFav) {
        return prev.filter(fid => fid !== id);
      } else {
        return [...prev, id];
      }
    });
    return !favorites.includes(id); // Returns new state (isFavorited)
  }, [favorites]);

  const isFavorite = useCallback((id: string) => {
    return favorites.includes(id);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite, isLoaded };
};
