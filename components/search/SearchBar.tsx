'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useSearch } from '@/lib/hooks/useSearch';
import { formatStationLabel } from '@/lib/utils/stations';
import { Train } from '@/types';

interface SearchBarProps {
    onSearch: (query: string) => void;
    trains: Train[];
    placeholder?: string;
}

/**
 * Search bar with autocomplete and recent searches
 *
 * ANALOGY: Like a smart search box that learns from previous queries
 */
export function SearchBar({ onSearch, trains, placeholder = 'Search trains...' }: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const {
        query,
        setQuery,
        results,
        totalResults,
        searchTime,
        recentSearches,
        addToRecent
    } = useSearch(trains, {
        keys: ['name', 'number', 'source', 'destination'],
        threshold: 0.2
    });

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (searchQuery: string) => {
        setQuery(searchQuery);
        onSearch(searchQuery);
        addToRecent(searchQuery);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && query) {
            handleSearch(query);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        } else if (e.key === 'ArrowDown' && showSuggestions) {
            // Focus first suggestion
            const firstSuggestion = document.querySelector('[data-suggestion-index="0"]') as HTMLElement;
            firstSuggestion?.focus();
        }
    };

    return (
        <div className="relative w-full max-w-md" ref={suggestionsRef}>
            {/* Search input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => {
                        setIsFocused(true);
                        setShowSuggestions(true);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            onSearch('');
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                        <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
                {showSuggestions && (isFocused || query) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
                    >
                        {/* Recent searches */}
                        {!query && recentSearches.length > 0 && (
                            <div className="p-2 border-b dark:border-gray-700">
                                <div className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    Recent searches
                                </div>
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSearch(search)}
                                        className="w-full px-2 py-1 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Search results */}
                        {query && (
                            <div className="p-2">
                                <div className="flex items-center justify-between px-2 py-1 text-xs text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-3 h-3" />
                                        Search results
                                    </div>
                                    <span>{totalResults} results in {searchTime.toFixed(0)}ms</span>
                                </div>
                                {results.slice(0, 5).map((train, index) => (
                                    <button
                                        key={train.id}
                                        data-suggestion-index={index}
                                        onClick={() => handleSearch(train.number)}
                                        className="w-full px-2 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                        onKeyDown={(e) => {
                                            if (e.key === 'ArrowDown') {
                                                e.preventDefault();
                                                const next = document.querySelector(`[data-suggestion-index="${index + 1}"]`) as HTMLElement;
                                                next?.focus();
                                            } else if (e.key === 'ArrowUp') {
                                                e.preventDefault();
                                                if (index === 0) {
                                                    inputRef.current?.focus();
                                                } else {
                                                    const prev = document.querySelector(`[data-suggestion-index="${index - 1}"]`) as HTMLElement;
                                                    prev?.focus();
                                                }
                                            } else if (e.key === 'Enter') {
                                                handleSearch(train.number);
                                            }
                                        }}
                                        >
                                            <div className="font-medium">{train.name}</div>
                                            <div className="text-sm text-gray-500">
                                            {train.number} • {formatStationLabel(train.source)} → {formatStationLabel(train.destination)}
                                            </div>
                                        </button>
                                ))}
                                {results.length === 0 && (
                                    <div className="px-2 py-4 text-center text-gray-500">
                                        No trains found
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
