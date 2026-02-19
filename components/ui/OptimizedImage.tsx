'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
}

/**
 * Optimized image with loading states
 */
export function OptimizedImage({ src, alt, width, height, className }: OptimizedImageProps) {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
            )}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoading ? 0 : 1 }}
                transition={{ duration: 0.3 }}
            >
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                    onLoadingComplete={() => setIsLoading(false)}
                    className="object-cover"
                />
            </motion.div>
        </div>
    );
}
