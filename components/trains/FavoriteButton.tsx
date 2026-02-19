'use client';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useFavorites } from '@/lib/hooks/useFavorites';
import { Train } from '@/types';

interface FavoriteButtonProps {
    train: Train;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

/**
 * Favorite button with animation
 */
export function FavoriteButton({ train, size = 'md', showLabel = false }: FavoriteButtonProps) {
    const { isFavorite, addFavorite, removeFavorite } = useFavorites();
    const favorite = isFavorite(train.id);

    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => favorite ? removeFavorite(train.id) : addFavorite(train)}
            className={`${sizes[size]} rounded-full flex items-center justify-center transition-colors ${favorite
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-yellow-400'
                }`}
            title={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Star
                className={iconSizes[size]}
                fill={favorite ? 'currentColor' : 'none'}
            />
            {showLabel && (
                <span className="ml-2 text-sm">
                    {favorite ? 'Favorited' : 'Add to favorites'}
                </span>
            )}
        </motion.button>
    );
}
