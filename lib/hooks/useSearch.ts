import { useState, useEffect, useCallback, useMemo } from 'react';
import { Train } from '@/types';
import Fuse from 'fuse.js'; // For fuzzy search
// Install: npm install fuse.js

interface SearchOptions {
    keys?: string[];
    threshold?: number;
    debounceMs?: number;
}

interface SearchResult<T> {
    items: T[];
    query: string;
    total: number;
    time: number;
}

/**
 * Advanced search hook with fuzzy matching and debouncing
 *
 * ANALOGY: Like a smart information kiosk that understands
 * misspelled station names
 */
export function useSearch<T extends Record<string, any>>(
    items: T[],
    options: SearchOptions = {}
) {
    const {
        keys = ['name', 'number', 'source', 'destination', 'route'],
        threshold = 0.3,
        debounceMs = 300
    } = options;

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState<SearchResult<T>>({
        items: [],
        query: '',
        total: 0,
        time: 0
    });

    // Initialize Fuse
    const fuse = useMemo(() => {
        return new Fuse(items, {
            keys,
            threshold,
            includeScore: true,
            shouldSort: true,
            minMatchCharLength: 2
        });
    }, [items, keys, threshold]);

    // Debounce query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, debounceMs);
        return () => clearTimeout(timer);
    }, [query, debounceMs]);

    // Perform search
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults({
                items: [],
                query: debouncedQuery,
                total: 0,
                time: 0
            });
            return;
        }

        const start = performance.now();
        const searchResults = fuse.search(debouncedQuery);
        const end = performance.now();

        setResults({
            items: searchResults.map(r => r.item),
            query: debouncedQuery,
            total: searchResults.length,
            time: end - start
        });
    }, [debouncedQuery, fuse]);

    const setQueryAndSearch = useCallback((newQuery: string) => {
        setQuery(newQuery);
    }, []);

    // Recent searches (localStorage)
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    const addToRecent = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) return;
        setRecentSearches(prev => {
            const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 5);
            localStorage.setItem('recentSearches', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const clearRecent = useCallback(() => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    }, []);

    return {
        query,
        setQuery: setQueryAndSearch,
        results: results.items,
        totalResults: results.total,
        searchTime: results.time,
        recentSearches,
        addToRecent,
        clearRecent
    };
}
