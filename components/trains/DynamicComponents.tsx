'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import heavy components
export const JourneyTimeline = dynamic(
    () => import('./JourneyTimeline').then(mod => mod.JourneyTimeline),
    {
        loading: () => (
            <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        ),
        ssr: false // Don't render on server
    }
);

export const DelayHistoryChart = dynamic(
    () => import('./DelayHistoryChart').then(mod => mod.DelayHistoryChart),
    {
        loading: () => (
            <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
        ),
        ssr: false
    }
);

export const AdvancedFilters = dynamic(
    () => import('@/components/search/AdvancedFilters').then(mod => mod.AdvancedFilters),
    {
        loading: () => <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />,
        ssr: false
    }
);
