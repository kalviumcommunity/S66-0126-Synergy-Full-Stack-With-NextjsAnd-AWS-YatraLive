'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useFavorites } from '@/lib/hooks/useFavorites';
import Link from 'next/link';

/**
 * Favorites sidebar for quick access
 *
 * ANALOGY: Like a pocket card with your regular train times
 */
export function FavoritesSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { favorites, removeFavorite } = useFavorites();

    if (favorites.length === 0) return null;

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-yellow-400 text-white p-2 rounded-l-lg shadow-lg z-40"
            >
                {isOpen ? (
                    <ChevronRight className="w-5 h-5" />
                ) : (
                    <>
                        <ChevronLeft className="w-5 h-5" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {favorites.length}
                        </span>
                    </>
                )}
            </button>

            {/* Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-800 shadow-xl z-50 overflow-hidden"
                    >
                        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <h2 className="font-semibold">Favorite Trains</h2>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto h-full">
                            <div className="space-y-2">
                                {favorites.map((favorite) => (
                                    <motion.div
                                        key={favorite.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: 50 }}
                                        className="relative group"
                                    >
                                        <Link
                                            href={`/train/${favorite.id}`}
                                            className="block p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <div className="font-medium">{favorite.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {favorite.number}
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => removeFavorite(favorite.id)}
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                                        >
                                            <X className="w-4 h-4 text-red-500" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
