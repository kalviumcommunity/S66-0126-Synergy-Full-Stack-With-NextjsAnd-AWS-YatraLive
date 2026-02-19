'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrainStatus } from '@/types';
import { Filter, X, Clock, MapPin, Calendar } from 'lucide-react';

export interface FilterOptions {
    status?: TrainStatus[];
    station?: string;
    timeRange?: {
        start: string; // HH:MM
        end: string;
    };
    platform?: number[];
    minDelay?: number;
    maxDelay?: number;
}

interface AdvancedFiltersProps {
    onFilterChange: (filters: FilterOptions) => void;
    availableStations: string[];
}

/**
 * Advanced filter panel with multiple criteria
 *
 * ANALOGY: Like a multi-criteria search at the information desk
 */
export function AdvancedFilters({ onFilterChange, availableStations }: AdvancedFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({});

    const handleFilterChange = (key: keyof FilterOptions, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        setFilters({});
        onFilterChange({});
    };

    return (
        <div className="relative">
            {/* Filter button with active indicator */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${Object.keys(filters).length > 0
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
            >
                <Filter className="w-4 h-4" />
                Filters
                {Object.keys(filters).length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white text-blue-500 rounded-full text-xs">
                        {Object.keys(filters).length}
                    </span>
                )}
            </button>

            {/* Filter panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 p-4"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Advanced Filters</h3>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                Clear all
                            </button>
                        </div>

                        {/* Status filter */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <div className="flex gap-2 flex-wrap">
                                {(['ON_TIME', 'DELAYED', 'CANCELLED'] as TrainStatus[]).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            const current = filters.status || [];
                                            const newStatus = current.includes(status)
                                                ? current.filter(s => s !== status)
                                                : [...current, status];
                                            handleFilterChange('status', newStatus);
                                        }}
                                        className={`px-3 py-1 rounded-full text-xs transition-colors ${filters.status?.includes(status)
                                                ? status === 'ON_TIME'
                                                    ? 'bg-green-500 text-white'
                                                    : status === 'DELAYED'
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-red-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700'
                                            }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Station filter */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Station</label>
                            <select
                                value={filters.station || ''}
                                onChange={(e) => handleFilterChange('station', e.target.value || undefined)}
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="">Any station</option>
                                {availableStations.map((station) => (
                                    <option key={station} value={station}>
                                        {station}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Time range filter */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Time Range</label>
                            <div className="flex gap-2">
                                <input
                                    type="time"
                                    value={filters.timeRange?.start || ''}
                                    onChange={(e) => handleFilterChange('timeRange', {
                                        ...filters.timeRange,
                                        start: e.target.value
                                    })}
                                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Start"
                                />
                                <input
                                    type="time"
                                    value={filters.timeRange?.end || ''}
                                    onChange={(e) => handleFilterChange('timeRange', {
                                        ...filters.timeRange,
                                        end: e.target.value
                                    })}
                                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="End"
                                />
                            </div>
                        </div>

                        {/* Platform filter */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">Platform</label>
                            <div className="flex gap-2 flex-wrap">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((platform) => (
                                    <button
                                        key={platform}
                                        onClick={() => {
                                            const current = filters.platform || [];
                                            const newPlatform = current.includes(platform)
                                                ? current.filter(p => p !== platform)
                                                : [...current, platform];
                                            handleFilterChange('platform', newPlatform);
                                        }}
                                        className={`w-8 h-8 rounded-full text-sm transition-colors ${filters.platform?.includes(platform)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-100 dark:bg-gray-700'
                                            }`}
                                    >
                                        {platform}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Delay range */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Delay (minutes)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={filters.minDelay || ''}
                                    onChange={(e) => handleFilterChange('minDelay',
                                        e.target.value ? parseInt(e.target.value) : undefined
                                    )}
                                    className="w-20 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Min"
                                />
                                <span className="text-sm text-gray-500 self-center">to</span>
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={filters.maxDelay || ''}
                                    onChange={(e) => handleFilterChange('maxDelay',
                                        e.target.value ? parseInt(e.target.value) : undefined
                                    )}
                                    className="w-20 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="Max"
                                />
                            </div>
                        </div>

                        {/* Active filters summary */}
                        {Object.keys(filters).length > 0 && (
                            <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                <h4 className="text-xs font-medium text-gray-500 mb-2">Active Filters:</h4>
                                <div className="flex gap-2 flex-wrap">
                                    {filters.status?.map(status => (
                                        <span key={status} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                                            {status}
                                        </span>
                                    ))}
                                    {filters.station && (
                                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs">
                                            {filters.station}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
