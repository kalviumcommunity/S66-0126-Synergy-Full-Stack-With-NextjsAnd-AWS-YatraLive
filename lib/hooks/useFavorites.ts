import { useState, useEffect, useCallback } from 'react';
import { Train } from '@/types';

interface FavoriteTrain {
    id: string;
    name: string;
    number: string;
    addedAt: number;
}

/**
 * Favorites hook for saving favorite trains
 *
 * ANALOGY: Like marking your regular trains in a pocket diary
 */
export function useFavorites() {
    const [favorites, setFavorites] = useState<FavoriteTrain[]>([]);

    // Load favorites from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('favoriteTrains');
        if (saved) {
            try {
                setFavorites(JSON.parse(saved));
            } catch (error) {
                console.error('Failed to load favorites:', error);
            }
        }
    }, []);

    // Save favorites to localStorage
    const saveFavorites = useCallback((newFavorites: FavoriteTrain[]) => {
        localStorage.setItem('favoriteTrains', JSON.stringify(newFavorites));
        setFavorites(newFavorites);
    }, []);

    const addFavorite = useCallback((train: Train) => {
        setFavorites(prev => {
            // Check if already exists
            if (prev.some(f => f.id === train.id)) {
                return prev;
            }
            const newFavorites = [
                ...prev,
                {
                    id: train.id,
                    name: train.name,
                    number: train.number,
                    addedAt: Date.now()
                }
            ];
            localStorage.setItem('favoriteTrains', JSON.stringify(newFavorites));
            return newFavorites;
        });
    }, []);

    const removeFavorite = useCallback((trainId: string) => {
        setFavorites(prev => {
            const newFavorites = prev.filter(f => f.id !== trainId);
            localStorage.setItem('favoriteTrains', JSON.stringify(newFavorites));
            return newFavorites;
        });
    }, []);

    const isFavorite = useCallback((trainId: string) => {
        return favorites.some(f => f.id === trainId);
    }, [favorites]);

    const clearFavorites = useCallback(() => {
        localStorage.removeItem('favoriteTrains');
        setFavorites([]);
    }, []);

    return {
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        clearFavorites
    };
}
