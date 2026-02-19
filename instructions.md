YATRALIVE APP SHARED -1

📋 STEP 9 ROADMAP: What We're Building Today
Our railway system works perfectly, but now it's time to make it beautiful,
smooth, and delightful to use. Think of this as adding the polished finishes to
our train station - beautiful displays, helpful information kiosks, and those little
touches that make passengers smile.
Part 1: Animations & Transitions
9.1 Smooth train status updates with animations
9.2 Page transitions and loading states
9.3 Animated status indicators
9.4 Micro-interactions for better UX
Part 2: Advanced Search & Filters
9.5 Real-time search with debouncing
9.6 Advanced filters (by station, time, status)
9.7 Saved searches and recent searches
9.8 Keyboard navigation for search
Part 3: Train Details Page
9.9 Journey timeline visualization
9.10 Station-by-station breakdown
9.11 Delay propagation visualization
9.12 Historical delay charts
Part 4: Favorites System
9.13 Save favorite trains
9.14 Persistent storage with localStorage
9.15 Quick access sidebar
9.16 Notifications for favorite trains

YATRALIVE APP SHARED -1 1

Part 5: PWA & Offline Support
9.17 Service worker setup
9.18 Offline fallback page
9.19 Installable app manifest
9.20 Push notifications (optional)
Part 6: Theme & Responsiveness
9.21 Dark mode implementation
9.22 Mobile-responsive layouts
9.23 Touch-friendly interactions
9.24 Accessibility improvements
Part 7: Performance Optimization
9.25 Code splitting and lazy loading
9.26 Image optimization
9.27 Bundle size analysis
9.28 Caching strategies

🚂 Why Polish Matters
Analogy: A Well-Designed Railway Station
Feature Why It Matters
Smooth animations Like clear, readable displays - easy on the eyes
Advanced search Like information kiosks - find what you need fast
Train details Like platform displays - all information at a glance
Favorites Like marking your regular trains - saves time
Dark mode Like night-mode station lights - comfortable in darkness
Mobile responsive Like using the app on your phone while commuting
Fast loading Like trains running on time - no waiting

YATRALIVE APP SHARED -1 2

Part 1: Animations & Transitions
Step 9.1: Framer Motion Setup
bash
# Install animation library
npm install framer-motion@10.16.16

Step 9.2: Animated Train Row
File: components/trains/AnimatedTrainRow.tsx
typescript
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Train } from '@/types';
import { StatusBadge } from './StatusBadge';
import { useState, useEffect } from 'react';
interface AnimatedTrainRowProps {
train: Train;
index: number;
}
/**
* Animated train row with smooth updates
*
* ANALOGY: Like a digital display that smoothly updates
* instead of flickering - easy on the eyes
*/
export function AnimatedTrainRow({ train, index }: Animated
TrainRowProps) {
const [highlight, setHighlight] = useState(false);
const [prevTrain, setPrevTrain] = useState(train);
// Detect changes and trigger highlight animation

YATRALIVE APP SHARED -1 3

useEffect(() => {
if (train.lastUpdated > prevTrain.lastUpdated) {
setHighlight(true);
const timer = setTimeout(() => setHighlight(false), 2
000);
setPrevTrain(train);
return () => clearTimeout(timer);
}
}, [train, prevTrain]);
// Determine what changed for visual indicator
const getChangeIndicator = () => {
if (train.status !== prevTrain.status) {
return { type: 'status', from: prevTrain.status, to:
train.status };
}
if (train.delayMinutes !== prevTrain.delayMinutes) {
return { type: 'delay', from: prevTrain.delayMinutes,
to: train.delayMinutes };
}
if (train.platform !== prevTrain.platform) {
return { type: 'platform', from: prevTrain.platform,
to: train.platform };
}
return null;
};
const change = getChangeIndicator();
return (
<motion.tr
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05 }}
className={`transition-colors duration-500${
highlight ? 'bg-yellow-50 dark:bg-yellow-900/20' :
''
} hover:bg-gray-50 dark:hover:bg-gray-700/50`}

YATRALIVE APP SHARED -1 4

>
<td className="px-6 py-4">
<div className="font-medium text-gray-900 dark:text
-white">
{train.name}
</div>
<div className="text-sm text-gray-500 dark:text-gra
y-400">
{train.number}
</div>
</td>
<td className="px-6 py-4">
<div className="text-sm text-gray-900 dark:text-whi
te">
{train.source} → {train.destination}
</div>
<motion.div
className="text-xs text-gray-500 dark:text-gray-4
00 flex gap-1 flex-wrap"
animate={{ scale: change?.type === 'route' ? [1,
1.1, 1] : 1 }}
transition={{ duration: 0.3 }}
>
{train.route.map((station, i) => (
<span key={station}>
{station}
{i < train.route.length - 1 && (
<span className="mx-1 text-gray-400">→</spa
n>
)}
</span>
))}
</motion.div>
</td>
<td className="px-6 py-4 text-sm text-gray-900 dark:t
ext-white">

YATRALIVE APP SHARED -1 5

{train.scheduledArrival}
</td>
<td className="px-6 py-4">
<motion.div
animate={{
scale: change?.type === 'delay' ? [1, 1.2, 1] :
1,
color: change?.type === 'delay'
? ['#000', '#f59e0b', '#000']
: undefined
}}
transition={{ duration: 0.5 }}
className="text-sm text-gray-900 dark:text-white"
>
{train.expectedArrival}
</motion.div>
{train.delayMinutes > 0 && (
<motion.div
initial={{ opacity: 0, x: -10 }}
animate={{ opacity: 1, x: 0 }}
className="text-xs text-orange-600 dark:text-or
ange-400"
>
+{train.delayMinutes} min
</motion.div>
)}
</td>
<td className="px-6 py-4">
<motion.div
animate={{
scale: change?.type === 'platform' ? [1, 1.3,
1] : 1,
backgroundColor: change?.type === 'platform'
? ['transparent', '#3b82f6', 'transparent']
: undefined
}}

YATRALIVE APP SHARED -1 6

transition={{ duration: 0.5 }}
className="inline-flex items-center justify-cente
r w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 text-s
m"
>
{train.platform}
</motion.div>
</td>
<td className="px-6 py-4">
<AnimatePresence mode="wait">
<motion.div
key={train.status}
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.8, opacity: 0 }}
transition={{ duration: 0.2 }}
>
<StatusBadge status={train.status} />
</motion.div>
</AnimatePresence>
</td>
{/* Change indicator toast */}
<AnimatePresence>
{change && highlight && (
<motion.td
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: 20 }}
className="absolute right-0 bg-white dark:bg-gr
ay-800 shadow-lg rounded-lg p-2 text-xs"
style={{ position: 'absolute', marginLeft: '1re
m' }}
>
{change.type === 'status' && (
<>Status: {change.from} → {change.to}</>
)}

YATRALIVE APP SHARED -1 7

{change.type === 'delay' && (
<>Delay: {change.from} → {change.to} min</>
)}
{change.type === 'platform' && (
<>Platform: {change.from} → {change.to}</>
)}
</motion.td>
)}
</AnimatePresence>
</motion.tr>
);
}

Step 9.3: Animated Status Badge
File: components/trains/AnimatedStatusBadge.tsx
typescript
'use client';
import { motion } from 'framer-motion';
import { TrainStatus, TRAIN_STATUS_DISPLAY, TRAIN_STATUS_CO
LORS } from '@/types';
interface AnimatedStatusBadgeProps {
status: TrainStatus;
className?: string;
animate?: boolean;
}
/**
* Animated status badge with pulse effect
*/
export function AnimatedStatusBadge({
status,
className = '',
animate = true
}: AnimatedStatusBadgeProps) {

YATRALIVE APP SHARED -1 8

const colors = TRAIN_STATUS_COLORS[status];
const displayText = TRAIN_STATUS_DISPLAY[status];
return (
<motion.span
className={`inline-flex items-center px-2.5 py-0.5 ro
unded-full text-xs font-medium${colors.bg}${colors.text}${c
lassName}`}
animate={animate ? {
scale: [1, 1.05, 1],
transition: {
duration: 2,
repeat: Infinity,
repeatType: 'reverse'
}
} : {}}
whileHover={{ scale: 1.1 }}
whileTap={{ scale: 0.95 }}
>
{/* Pulsing dot for live trains */}
{status === 'ON_TIME' && (
<motion.span
className="w-1.5 h-1.5 bg-green-500 rounded-full
mr-1.5"
animate={{
scale: [1, 1.5, 1],
opacity: [1, 0.5, 1]
}}
transition={{
duration: 2,
repeat: Infinity
}}
/>
)}
{displayText}
</motion.span>
);
}

YATRALIVE APP SHARED -1 9

Step 9.4: Page Transition Wrapper
File: components/layout/PageTransition.tsx
typescript
'use client';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
interface PageTransitionProps {
children: ReactNode;
}
/**
* Page transition wrapper for smooth navigation
*
* ANALOGY: Like smooth escalators between platforms
*/
export function PageTransition({ children }: PageTransition
Props) {
return (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
transition={{ duration: 0.3 }}
>
{children}
</motion.div>
);
}

Part 2: Advanced Search & Filters
Step 9.5: Search Store with Debouncing

YATRALIVE APP SHARED -1 10

File: lib/hooks/useSearch.ts
typescript
import { useState, useEffect, useCallback, useMemo } from
'react';
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
keys = ['name', 'number', 'source', 'destination', 'rou
te'],
threshold = 0.3,
debounceMs = 300

YATRALIVE APP SHARED -1 11

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

YATRALIVE APP SHARED -1 12

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
const setQueryAndSearch = useCallback((newQuery: string)
=> {
setQuery(newQuery);
}, []);
// Recent searches (localStorage)
const [recentSearches, setRecentSearches] = useState<stri
ng[]>([]);
useEffect(() => {
const saved = localStorage.getItem('recentSearches');
if (saved) {
setRecentSearches(JSON.parse(saved));
}
}, []);
const addToRecent = useCallback((searchQuery: string) =>
{
if (!searchQuery.trim()) return;
setRecentSearches(prev => {

YATRALIVE APP SHARED -1 13

const updated = [searchQuery, ...prev.filter(s => s !
== searchQuery)].slice(0, 5);
localStorage.setItem('recentSearches', JSON.stringify
(updated));
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

Step 9.6: Advanced Filter Component
File: components/search/AdvancedFilters.tsx
typescript
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrainStatus } from '@/types';

import { Filter, X, Clock, MapPin, Calendar } from 'lucide-
react';

YATRALIVE APP SHARED -1 14

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
* ANALOGY: Like a multi-criteria search at the information
desk
*/
export function AdvancedFilters({ onFilterChange, available
Stations }: AdvancedFiltersProps) {
const [isOpen, setIsOpen] = useState(false);
const [filters, setFilters] = useState<FilterOptions>
({});
const handleFilterChange = (key: keyof FilterOptions, val
ue: any) => {
const newFilters = { ...filters, [key]: value };
setFilters(newFilters);
onFilterChange(newFilters);
};
const clearFilters = () => {
setFilters({});

YATRALIVE APP SHARED -1 15

onFilterChange({});
};
return (
<div className="relative">
{/* Filter button with active indicator */}
<button
onClick={() => setIsOpen(!isOpen)}
className={`flex items-center gap-2 px-4 py-2 round
ed-lg transition-colors${
Object.keys(filters).length > 0
? 'bg-blue-500 text-white'
: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-2
00 dark:hover:bg-gray-700'
}`}
>
<Filter className="w-4 h-4" />
Filters
{Object.keys(filters).length > 0 && (
<span className="ml-1 px-1.5 py-0.5 bg-white text
-blue-500 rounded-full text-xs">
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
className="absolute right-0 mt-2 w-80 bg-white
dark:bg-gray-800 rounded-lg shadow-xl z-50 p-4"
>
<div className="flex justify-between items-cent
er mb-4">

YATRALIVE APP SHARED -1 16

<h3 className="font-semibold">Advanced Filter
s</h3>
<button
onClick={clearFilters}
className="text-sm text-gray-500 hover:text
-gray-700 dark:hover:text-gray-300"
>
Clear all
</button>
</div>
{/* Status filter */}
<div className="mb-4">
<label className="block text-sm font-medium m
b-2">Status</label>
<div className="flex gap-2 flex-wrap">
{(['ON_TIME', 'DELAYED', 'CANCELLED'] as Tr
ainStatus[]).map((status) => (
<button
key={status}
onClick={() => {
const current = filters.status || [];
const newStatus = current.includes(st

atus)
? current.filter(s => s !== status)

: [...current, status];

handleFilterChange('status', newStatu
s);
}}
className={`px-3 py-1 rounded-full text
-xs transition-colors${
filters.status?.includes(status)
? status === 'ON_TIME'
? 'bg-green-500 text-white'
: status === 'DELAYED'
? 'bg-orange-500 text-white'
: 'bg-red-500 text-white'
: 'bg-gray-100 dark:bg-gray-700'

YATRALIVE APP SHARED -1 17

}`}
>
{status}
</button>
))}
</div>
</div>
{/* Station filter */}
<div className="mb-4">
<label className="block text-sm font-medium m
b-2">Station</label>
<select
value={filters.station || ''}
onChange={(e) => handleFilterChange('statio
n', e.target.value || undefined)}
className="w-full p-2 border rounded-lg dar
k:bg-gray-700 dark:border-gray-600"
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
<label className="block text-sm font-medium m
b-2">Time Range</label>
<div className="flex gap-2">
<input
type="time"
value={filters.timeRange?.start || ''}
onChange={(e) => handleFilterChange('time
Range', {

YATRALIVE APP SHARED -1 18

...filters.timeRange,
start: e.target.value
})}
className="flex-1 p-2 border rounded-lg d
ark:bg-gray-700 dark:border-gray-600"
placeholder="Start"
/>
<input
type="time"
value={filters.timeRange?.end || ''}
onChange={(e) => handleFilterChange('time
Range', {
...filters.timeRange,
end: e.target.value
})}
className="flex-1 p-2 border rounded-lg d
ark:bg-gray-700 dark:border-gray-600"
placeholder="End"
/>
</div>
</div>
{/* Platform filter */}
<div className="mb-4">
<label className="block text-sm font-medium m
b-2">Platform</label>
<div className="flex gap-2 flex-wrap">
{[1, 2, 3, 4, 5, 6, 7, 8].map((platform) =>
(
<button
key={platform}
onClick={() => {
const current = filters.platform ||
[];
const newPlatform = current.includes
(platform)
? current.filter(p => p !== platfor
m)

YATRALIVE APP SHARED -1 19

: [...current, platform];
handleFilterChange('platform', newPla
tform);
}}
className={`w-8 h-8 rounded-full text-s
m transition-colors${
filters.platform?.includes(platform)
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
<label className="block text-sm font-medium m
b-2">
Delay (minutes)
</label>
<div className="flex gap-2">
<input
type="number"
min="0"
max="30"
value={filters.minDelay || ''}
onChange={(e) => handleFilterChange('minD
elay',
e.target.value ? parseInt(e.target.valu
e) : undefined
)}
className="w-20 p-2 border rounded-lg dar
k:bg-gray-700 dark:border-gray-600"
placeholder="Min"
/>

YATRALIVE APP SHARED -1 20

<span className="text-sm text-gray-500 self
-center">to</span>
<input
type="number"
min="0"
max="30"
value={filters.maxDelay || ''}
onChange={(e) => handleFilterChange('maxD
elay',
e.target.value ? parseInt(e.target.valu
e) : undefined
)}
className="w-20 p-2 border rounded-lg dar
k:bg-gray-700 dark:border-gray-600"
placeholder="Max"
/>
</div>
</div>
{/* Active filters summary */}
{Object.keys(filters).length > 0 && (
<div className="mt-4 pt-4 border-t dark:borde
r-gray-700">
<h4 className="text-xs font-medium text-gra
y-500 mb-2">Active Filters:</h4>
<div className="flex gap-2 flex-wrap">
{filters.status?.map(status => (
<span key={status} className="px-2 py-1
bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blu
e-400 rounded-full text-xs">
{status}
</span>
))}
{filters.station && (
<span className="px-2 py-1 bg-blue-100
dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounde
d-full text-xs">
{filters.station}

YATRALIVE APP SHARED -1 21

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

Step 9.7: Search Bar with Autocomplete
File: components/search/SearchBar.tsx
typescript
'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp } from 'lucide-reac
t';
import { useSearch } from '@/lib/hooks/useSearch';
import { Train } from '@/types';
interface SearchBarProps {
onSearch: (query: string) => void;
trains: Train[];
placeholder?: string;
}
/**
* Search bar with autocomplete and recent searches
*
* ANALOGY: Like a smart search box that learns from previo
us queries
*/

YATRALIVE APP SHARED -1 22

export function SearchBar({ onSearch, trains, placeholder =
'Search trains...' }: SearchBarProps) {
const [isFocused, setIsFocused] = useState(false);
const [showSuggestions, setShowSuggestions] = useState(fa
lse);
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
if (suggestionsRef.current && !suggestionsRef.curren
t.contains(event.target as Node)) {
setShowSuggestions(false);
}
};
document.addEventListener('mousedown', handleClickOutsi
de);
return () => document.removeEventListener('mousedown',
handleClickOutside);
}, []);
const handleSearch = (searchQuery: string) => {
setQuery(searchQuery);

YATRALIVE APP SHARED -1 23

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
const firstSuggestion = document.querySelector('[data
-suggestion-index="0"]') as HTMLElement;
firstSuggestion?.focus();
}
};
return (
<div className="relative w-full max-w-md" ref={suggesti
onsRef}>
{/* Search input */}
<div className="relative">
<Search className="absolute left-3 top-1/2 transfor
m -translate-y-1/2 w-4 h-4 text-gray-400" />
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

YATRALIVE APP SHARED -1 24

placeholder={placeholder}
className="w-full pl-10 pr-10 py-2 border rounded
-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-non
e focus:ring-2 focus:ring-blue-500"
/>
{query && (
<button
onClick={() => {
setQuery('');
onSearch('');
}}
className="absolute right-3 top-1/2 transform -
translate-y-1/2"
>

<X className="w-4 h-4 text-gray-400 hover:text-
gray-600" />

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
className="absolute z-50 w-full mt-2 bg-white d
ark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
>
{/* Recent searches */}
{!query && recentSearches.length > 0 && (
<div className="p-2 border-b dark:border-gray
-700">

<div className="flex items-center gap-2 px-
2 py-1 text-xs text-gray-500">

<Clock className="w-3 h-3" />
Recent searches

YATRALIVE APP SHARED -1 25

</div>
{recentSearches.map((search, index) => (
<button
key={index}
onClick={() => handleSearch(search)}
className="w-full px-2 py-1 text-left h
over:bg-gray-100 dark:hover:bg-gray-700 rounded"
>
{search}
</button>
))}
</div>
)}
{/* Search results */}
{query && (
<div className="p-2">
<div className="flex items-center justify-b
etween px-2 py-1 text-xs text-gray-500">
<div className="flex items-center gap-2">
<TrendingUp className="w-3 h-3" />
Search results
</div>
<span>{totalResults} results in {searchTi
me.toFixed(0)}ms</span>
</div>
{results.slice(0, 5).map((train, index) =>
(
<button
key={train.id}
data-suggestion-index={index}
onClick={() => handleSearch(train.numbe
r)}
className="w-full px-2 py-2 text-left h
over:bg-gray-100 dark:hover:bg-gray-700 rounded"
onKeyDown={(e) => {
if (e.key === 'ArrowDown') {

YATRALIVE APP SHARED -1 26

e.preventDefault();

const next = document.querySelector
(`[data-suggestion-index="${index + 1}"]`) as HTMLElement;
next?.focus();
} else if (e.key === 'ArrowUp') {
e.preventDefault();
if (index === 0) {

inputRef.current?.focus();
} else {
const prev = document.querySelect
or(`[data-suggestion-index="${index - 1}"]`) as HTMLElemen
t;
prev?.focus();
}
} else if (e.key === 'Enter') {
handleSearch(train.number);
}
}}
>
<div className="font-medium">{train.nam
e}</div>
<div className="text-sm text-gray-500">
{train.number} • {train.source} → {tr
ain.destination}
</div>
</button>
))}
{results.length === 0 && (
<div className="px-2 py-4 text-center tex
t-gray-500">
No trains found
</div>
)}
</div>
)}
</motion.div>
)}

YATRALIVE APP SHARED -1 27

</AnimatePresence>
</div>
);
}

Part 3: Train Details Page
Step 9.8: Journey Timeline Component
File: components/trains/JourneyTimeline.tsx
typescript
'use client';
import { motion } from 'framer-motion';
import { Train } from '@/types';
import { CheckCircle, Clock, MapPin, AlertTriangle } from
'lucide-react';
interface JourneyTimelineProps {
train: Train;
}
/**
* Journey timeline showing train's progress along route
*
* ANALOGY: Like the track diagram showing where the train
is
*/
export function JourneyTimeline({ train }: JourneyTimelineP
rops) {
const stations = train.route;
const currentIndex = train.currentStationIndex;
// Calculate if train is delayed at each station
const getStationDelay = (index: number) => {
if (index <= currentIndex) {

YATRALIVE APP SHARED -1 28

// Stations passed - show actual vs scheduled
return {
delayed: train.delayMinutes > 0,
time: train.expectedArrival
};
} else {
// Future stations - show estimated
// Simple propagation: each station adds 5 minutes if
delayed
const estimatedDelay = train.delayMinutes > 0
? train.delayMinutes + (index - currentIndex) * 5
: 0;
return {
delayed: estimatedDelay > 0,
time: addMinutesToTime(train.scheduledArrival, esti
matedDelay)
};
}
};
return (
<div className="py-6">
<h3 className="text-lg font-semibold mb-4">Journey Ti
meline</h3>
<div className="relative">
{/* Vertical line */}
<div className="absolute left-4 top-0 bottom-0 w-0.
5 bg-gray-300 dark:bg-gray-600" />
{/* Stations */}
<div className="space-y-6">
{stations.map((station, index) => {
const isPassed = index < currentIndex;
const isCurrent = index === currentIndex;
const isFuture = index > currentIndex;
const stationDelay = getStationDelay(index);

YATRALIVE APP SHARED -1 29

return (
<motion.div
key={station}
initial={{ opacity: 0, x: -20 }}
animate={{ opacity: 1, x: 0 }}
transition={{ delay: index * 0.1 }}
className="relative flex items-start gap-4"
>
{/* Station marker */}
<div className="relative z-10">
{isPassed ? (
<div className="w-8 h-8 rounded-full bg
-green-500 flex items-center justify-center">

<CheckCircle className="w-4 h-4 text-
white" />

</div>
) : isCurrent ? (
<motion.div
animate={{
scale: [1, 1.2, 1],
boxShadow: [

'0 0 0 0 rgba(59, 130, 246, 0.
7)',
'0 0 0 10px rgba(59, 130, 246,
0)',
'0 0 0 0 rgba(59, 130, 246, 0)'
]
}}

transition={{ duration: 2, repeat: In

finity }}
className="w-8 h-8 rounded-full bg-bl
ue-500 flex items-center justify-center"
>
<MapPin className="w-4 h-4 text-whit
e" />
</motion.div>
) : (
<div className="w-8 h-8 rounded-full bg

YATRALIVE APP SHARED -1 30

-gray-300 dark:bg-gray-600 flex items-center justify-cente
r">
<Clock className="w-4 h-4 text-gray-6
00 dark:text-gray-300" />
</div>
)}
</div>
{/* Station info */}
<div className="flex-1 pb-6">
<div className="flex justify-between item
s-start">
<div>
<h4 className="font-medium">
{station}
{isCurrent && (

<span className="ml-2 text-xs bg-
blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-4

00 px-2 py-0.5 rounded-full">
CURRENT
</span>
)}
</h4>

<p className="text-sm text-gray-500">

{getStationName(station)}
</p>
</div>
<div className="text-right">
<div className="text-sm">
Scheduled: {train.scheduledArrival}
</div>

<div className={`text-sm font-medium

${
stationDelay.delayed
? 'text-orange-600 dark:text-oran
ge-400'
: 'text-green-600 dark:text-green

YATRALIVE APP SHARED -1 31

-400'
}`}>
Expected: {stationDelay.time}
{stationDelay.delayed && isFuture &

& (
<span className="ml-2 text-xs tex
t-orange-500">
(est.)
</span>
)}
</div>
</div>
</div>
{/* Delay indicator */}
{stationDelay.delayed && (
<motion.div
initial={{ opacity: 0, height: 0 }}
animate={{ opacity: 1, height: 'auto'

}}
className="mt-2 flex items-center gap
-2 text-xs text-orange-600 dark:text-orange-400"
>
<AlertTriangle className="w-3 h-3" />

<span>
{isPassed
? `Departed${train.delayMinutes}
min late`
: isCurrent

? `Currently${train.delayMinutes}

min late`
: `Expected delay:${train.delayMi
nutes + (index - currentIndex) * 5} min`}
</span>
</motion.div>
)}
</div>
</motion.div>

YATRALIVE APP SHARED -1 32

);
})}
</div>
</div>
</div>
);
}
// Helper functions
function addMinutesToTime(time: string, minutes: number): s
tring {
const [hours, mins] = time.split(':').map(Number);
const totalMinutes = hours * 60 + mins + minutes;
const newHours = Math.floor(totalMinutes / 60) % 24;
const newMins = totalMinutes % 60;
return `${newHours.toString().padStart(2, '0')}:${newMin
s.toString().padStart(2, '0')}`;
}
function getStationName(code: string): string {
const stations: Record<string, string> = {
NDLS: 'New Delhi',
HWH: 'Howrah',
MMCT: 'Mumbai Central',
SBC: 'KSR Bengaluru',
CNB: 'Kanpur Central',
BCT: 'Mumbai Central',
MAS: 'Chennai Central',
PURI: 'Puri',
GAYA: 'Gaya',
ALD: 'Prayagraj'
};
return stations[code] || code;
}

YATRALIVE APP SHARED -1 33

Step 9.9: Delay History Chart
bash
# Install chart library
npm install recharts@2.10.3
File: components/trains/DelayHistoryChart.tsx
typescript
'use client';
import { useEffect, useState } from 'react';
import {
LineChart,
Line,
XAxis,
YAxis,
CartesianGrid,
Tooltip,
ResponsiveContainer
} from 'recharts';
import { TrainEvent } from '@/types';
interface DelayHistoryChartProps {
trainId: string;
}
/**
* Chart showing delay history over time
*
* ANALOGY: Like a graph showing train's punctuality record
*/
export function DelayHistoryChart({ trainId }: DelayHistory
ChartProps) {
const [data, setData] = useState<Array<{ time: string; de
lay: number }>>([]);
const [loading, setLoading] = useState(true);

YATRALIVE APP SHARED -1 34

useEffect(() => {
const fetchDelayHistory = async () => {
try {
const response = await fetch(`/api/trains/${trainI
d}/events?type=DELAY`);
const result = await response.json();
if (result.success) {
// Transform events into chart data
const chartData = result.data
.filter((event: TrainEvent) =>
event.type === 'TRAIN_DELAY' || event.type ==
= 'TRAIN_RECOVERY'
)
.map((event: any) => ({
time: new Date(event.timestamp).toLocaleTimeS
tring(),
delay: event.type === 'TRAIN_DELAY'
? event.newDelayMinutes
: event.newDelayMinutes
}));
setData(chartData);
}
} catch (error) {
console.error('Failed to fetch delay history:', err
or);
} finally {
setLoading(false);
}
};
fetchDelayHistory();
}, [trainId]);
if (loading) {
return (

YATRALIVE APP SHARED -1 35

<div className="h-64 flex items-center justify-cente
r">
<div className="animate-spin rounded-full h-8 w-8 b
order-b-2 border-blue-500" />
</div>
);
}
if (data.length === 0) {
return (
<div className="h-64 flex items-center justify-center
text-gray-500">
No delay data available
</div>
);
}
return (
<div className="h-64">
<ResponsiveContainer width="100%" height="100%">
<LineChart data={data}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis
dataKey="time"
tick={{ fontSize: 12 }}
interval="preserveStartEnd"
/>
<YAxis
label={{ value: 'Delay (min)', angle: -90, posi
tion: 'insideLeft' }}
tick={{ fontSize: 12 }}
/>
<Tooltip />
<Line
type="monotone"
dataKey="delay"
stroke="#f59e0b"
strokeWidth={2}

YATRALIVE APP SHARED -1 36

dot={{ r: 4 }}
activeDot={{ r: 6 }}
/>
</LineChart>
</ResponsiveContainer>
</div>
);
}

Step 9.10: Train Details Page
File: app/train/[id]/page.tsx
typescript
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Train } from '@/types';
import { AnimatedStatusBadge } from '@/components/trains/An
imatedStatusBadge';
import { JourneyTimeline } from '@/components/trains/Journe
yTimeline';
import { DelayHistoryChart } from '@/components/trains/Dela
yHistoryChart';
import { PageTransition } from '@/components/layout/PageTra
nsition';
import { ArrowLeft, Clock, MapPin, Calendar, Activity } fro
m 'lucide-react';
import { motion } from 'framer-motion';
export default function TrainDetailPage() {
const params = useParams();
const router = useRouter();
const [train, setTrain] = useState<Train | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [activeTab, setActiveTab] = useState<'timeline' |

YATRALIVE APP SHARED -1 37

'history' | 'stats'>('timeline');
useEffect(() => {
fetchTrain();
}, [params.id]);
const fetchTrain = async () => {
try {
const response = await fetch(`/api/trains/${params.i
d}`);
const data = await response.json();
if (data.success) {
setTrain(data.data);
} else {
setError(data.error);
}
} catch (err) {
setError('Failed to fetch train details');
} finally {
setLoading(false);
}
};
if (loading) {
return (
<div className="min-h-screen flex items-center justif
y-center">
<div className="animate-spin rounded-full h-12 w-12
border-b-2 border-blue-500" />
</div>
);
}
if (error || !train) {
return (
<div className="min-h-screen flex items-center justif
y-center">

YATRALIVE APP SHARED -1 38

<div className="text-center">
<h1 className="text-2xl font-bold text-red-600 mb
-4">Error</h1>
<p className="text-gray-600">{error || 'Train not
found'}</p>
<button
onClick={() => router.push('/')}
className="mt-4 px-4 py-2 bg-blue-500 text-whit
e rounded-lg hover:bg-blue-600"
>
Go Back
</button>
</div>
</div>
);
}
return (
<PageTransition>

<div className="min-h-screen bg-gray-50 dark:bg-gray-
900">

<div className="container mx-auto px-4 py-8">
{/* Back button */}
<button
onClick={() => router.back()}
className="flex items-center gap-2 text-gray-60
0 dark:text-gray-400 hover:text-gray-900 dark:hover:text-wh
ite mb-6"
>
<ArrowLeft className="w-4 h-4" />
Back
</button>
{/* Train header */}
<div className="bg-white dark:bg-gray-800 rounded
-lg shadow-lg p-6 mb-6">
<div className="flex flex-wrap justify-between
items-start gap-4">

YATRALIVE APP SHARED -1 39

<div>
<h1 className="text-3xl font-bold text-gray
-900 dark:text-white">
{train.name}
</h1>

<p className="text-gray-500 dark:text-gray-
400 mt-1">

{train.number} • {train.source} → {train.
destination}
</p>
</div>
<AnimatedStatusBadge status={train.status} an
imate={true} />
</div>
{/* Quick stats */}
<div className="grid grid-cols-2 md:grid-cols-4
gap-4 mt-6">
<StatCard
icon={<Clock />}
label="Current Delay"
value={train.delayMinutes > 0 ? `${train.de
layMinutes} min` : 'On Time'}
color={train.delayMinutes > 0 ? 'orange' :
'green'}
/>
<StatCard
icon={<MapPin />}
label="Platform"
value={train.platform.toString()}
color="blue"
/>
<StatCard
icon={<Calendar />}
label="Scheduled"
value={train.scheduledArrival}
color="gray"

YATRALIVE APP SHARED -1 40

/>
<StatCard
icon={<Activity />}
label="Expected"
value={train.expectedArrival}
color={train.delayMinutes > 0 ? 'orange' :
'green'}
/>
</div>
</div>
{/* Tabs */}
<div className="bg-white dark:bg-gray-800 rounded
-lg shadow-lg overflow-hidden">
<div className="border-b dark:border-gray-700">
<nav className="flex">
<TabButton
active={activeTab === 'timeline'}
onClick={() => setActiveTab('timeline')}
label="Journey Timeline"
/>
<TabButton
active={activeTab === 'history'}
onClick={() => setActiveTab('history')}
label="Delay History"
/>
<TabButton
active={activeTab === 'stats'}
onClick={() => setActiveTab('stats')}
label="Statistics"
/>
</nav>
</div>
<div className="p-6">
{activeTab === 'timeline' && <JourneyTimeline
train={train} />}

YATRALIVE APP SHARED -1 41

{activeTab === 'history' && (
<div>

<h3 className="text-lg font-semibold mb-
4">Delay History</h3>

<DelayHistoryChart trainId={train.id} />
</div>
)}
{activeTab === 'stats' && (
<div>

<h3 className="text-lg font-semibold mb-
4">Train Statistics</h3>

<div className="grid grid-cols-1 md:grid-
cols-2 gap-6">

<div className="bg-gray-50 dark:bg-gray
-900 p-4 rounded-lg">
<h4 className="font-medium mb-2">Perf
ormance</h4>
<div className="space-y-2">
<StatRow
label="On-time performance"
value={`${Math.max(0, 100 - trai

n.delayMinutes * 3)}%`}
/>
<StatRow

label="Average delay"

value={`${train.delayMinutes} min

`}
/>
<StatRow

label="Total distance"

value={`${train.route.length * 10

0} km`}
/>
</div>
</div>
<div className="bg-gray-50 dark:bg-gray

YATRALIVE APP SHARED -1 42

-900 p-4 rounded-lg">
<h4 className="font-medium mb-2">Rout
e Info</h4>
<div className="space-y-2">
<StatRow
label="Stations"

value={train.route.length.toStrin

g()}
/>
<StatRow

label="Current position"

value={`Station${train.currentSta

tionIndex + 1} of${train.route.length}`}
/>
<StatRow

label="Progress"

value={`${Math.round((train.curre

ntStationIndex + 1) / train.route.length * 100)}%`}
/>
</div>
</div>
</div>
</div>
)}
</div>
</div>
</div>
</div>
</PageTransition>
);
}
interface StatCardProps {
icon: React.ReactNode;
label: string;
value: string;
color: 'green' | 'orange' | 'blue' | 'gray' | 'red';
}

YATRALIVE APP SHARED -1 43

function StatCard({ icon, label, value, color }: StatCardPr
ops) {
const colorClasses = {
green: 'bg-green-50 dark:bg-green-900/20 text-green-700
dark:text-green-400',
orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange
-700 dark:text-orange-400',
blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dar
k:text-blue-400',
red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:te
xt-red-400',
gray: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:t
ext-gray-300'
};
return (
<motion.div
whileHover={{ scale: 1.05 }}
className={`p-4 rounded-lg${colorClasses[color]}`}
>
<div className="flex items-center gap-2 mb-1">
<div className="w-4 h-4">{icon}</div>
<span className="text-sm opacity-75">{label}</span>
</div>
<p className="text-xl font-semibold">{value}</p>
</motion.div>
);
}
interface TabButtonProps {
active: boolean;
onClick: () => void;
label: string;
}
function TabButton({ active, onClick, label }: TabButtonPro
ps) {

YATRALIVE APP SHARED -1 44

return (
<button
onClick={onClick}
className={`px-6 py-3 font-medium transition-colors r
elative${
active
? 'text-blue-600 dark:text-blue-400'
: 'text-gray-500 hover:text-gray-700 dark:hover:t
ext-gray-300'
}`}
>
{label}
{active && (
<motion.div
layoutId="activeTab"
className="absolute bottom-0 left-0 right-0 h-0.5
bg-blue-500"
/>
)}
</button>
);
}
function StatRow({ label, value }: { label: string; value:
string }) {
return (
<div className="flex justify-between text-sm">
<span className="text-gray-500">{label}</span>
<span className="font-medium">{value}</span>
</div>
);
}

Part 4: Favorites System
Step 9.11: Favorites Store

YATRALIVE APP SHARED -1 45

File: lib/hooks/useFavorites.ts
typescript
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
* ANALOGY: Like marking your regular trains in a pocket di
ary
*/
export function useFavorites() {
const [favorites, setFavorites] = useState<FavoriteTrain
[]>([]);
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
const saveFavorites = useCallback((newFavorites: Favorite
Train[]) => {

YATRALIVE APP SHARED -1 46

localStorage.setItem('favoriteTrains', JSON.stringify(n
ewFavorites));
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
localStorage.setItem('favoriteTrains', JSON.stringify
(newFavorites));
return newFavorites;
});
}, []);
const removeFavorite = useCallback((trainId: string) => {
setFavorites(prev => {
const newFavorites = prev.filter(f => f.id !== trainI
d);
localStorage.setItem('favoriteTrains', JSON.stringify
(newFavorites));
return newFavorites;
});
}, []);

YATRALIVE APP SHARED -1 47

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

Step 9.12: Favorite Button Component
File: components/trains/FavoriteButton.tsx
typescript
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

YATRALIVE APP SHARED -1 48

*/
export function FavoriteButton({ train, size = 'md', showLa
bel = false }: FavoriteButtonProps) {
const { isFavorite, addFavorite, removeFavorite } = useFa
vorites();
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
onClick={() => favorite ? removeFavorite(train.id) :
addFavorite(train)}
className={`${sizes[size]} rounded-full flex items-ce
nter justify-center transition-colors${
favorite
? 'bg-yellow-400 text-white'
: 'bg-gray-100 dark:bg-gray-700 text-gray-400 hov
er:text-yellow-400'
}`}
title={favorite ? 'Remove from favorites' : 'Add to f
avorites'}
>
<Star
className={iconSizes[size]}
fill={favorite ? 'currentColor' : 'none'}

YATRALIVE APP SHARED -1 49

/>
{showLabel && (
<span className="ml-2 text-sm">
{favorite ? 'Favorited' : 'Add to favorites'}
</span>
)}
</motion.button>
);
}

Step 9.13: Favorites Sidebar
File: components/layout/FavoritesSidebar.tsx
typescript
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Star, X, ChevronRight, ChevronLeft } from 'lucide-
react';

import { useFavorites } from '@/lib/hooks/useFavorites';
import Link from 'next/link';
/**
* Favorites sidebar for quick access
*
* ANALOGY: Like a pocket card with your regular train time
s
*/
export function FavoritesSidebar() {
const [isOpen, setIsOpen] = useState(false);
const { favorites, removeFavorite } = useFavorites();
if (favorites.length === 0) return null;
return (
<>

YATRALIVE APP SHARED -1 50

{/* Toggle button */}
<button
onClick={() => setIsOpen(!isOpen)}
className="fixed right-0 top-1/2 transform -transla
te-y-1/2 bg-yellow-400 text-white p-2 rounded-l-lg shadow-l
g z-40"
>
{isOpen ? (
<ChevronRight className="w-5 h-5" />
) : (
<>
<ChevronLeft className="w-5 h-5" />
<span className="absolute -top-2 -right-2 bg-re
d-500 text-white text-xs w-5 h-5 rounded-full flex items-ce
nter justify-center">
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
className="fixed right-0 top-0 bottom-0 w-80 bg
-white dark:bg-gray-800 shadow-xl z-50 overflow-hidden"
>
<div className="p-4 border-b dark:border-gray-7
00 flex justify-between items-center">
<div className="flex items-center gap-2">
<Star className="w-5 h-5 text-yellow-400 fi
ll-current" />
<h2 className="font-semibold">Favorite Trai

YATRALIVE APP SHARED -1 51

ns</h2>
</div>
<button
onClick={() => setIsOpen(false)}
className="p-1 hover:bg-gray-100 dark:hove
r:bg-gray-700 rounded"
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
className="block p-3 bg-gray-50 dark:
bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray
-600 transition-colors"
onClick={() => setIsOpen(false)}
>
<div className="font-medium">{favorit
e.name}</div>
<div className="text-sm text-gray-500
dark:text-gray-400">
{favorite.number}
</div>
</Link>
<button
onClick={() => removeFavorite(favorit

YATRALIVE APP SHARED -1 52

e.id)}
className="absolute top-2 right-2 opa
city-0 group-hover:opacity-100 transition-opacity p-1 hove
r:bg-red-100 dark:hover:bg-red-900/20 rounded"
>
<X className="w-4 h-4 text-red-500" /
>
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

Part 5: PWA & Offline Support
Step 9.14: PWA Manifest
File: public/manifest.json
json
{
"name": "Real-Time Train Tracker",
"short_name": "TrainTracker",
"description": "Live train schedules, delays, and status
updates",
"start_url": "/",
"display": "standalone",
"background_color": "#ffffff",
"theme_color": "#3b82f6",
"icons": [
{

YATRALIVE APP SHARED -1 53

"src": "/icons/icon-72x72.png",
"sizes": "72x72",
"type": "image/png"
},
{
"src": "/icons/icon-96x96.png",
"sizes": "96x96",
"type": "image/png"
},
{
"src": "/icons/icon-128x128.png",
"sizes": "128x128",
"type": "image/png"
},
{
"src": "/icons/icon-144x144.png",
"sizes": "144x144",
"type": "image/png"
},
{
"src": "/icons/icon-152x152.png",
"sizes": "152x152",
"type": "image/png"
},
{
"src": "/icons/icon-192x192.png",
"sizes": "192x192",
"type": "image/png"
},
{
"src": "/icons/icon-384x384.png",
"sizes": "384x384",
"type": "image/png"
},
{
"src": "/icons/icon-512x512.png",
"sizes": "512x512",
"type": "image/png"

YATRALIVE APP SHARED -1 54

}
]
}

Step 9.15: Service Worker
File: public/sw.js
javascript
// Service Worker for offline support
const CACHE_NAME = 'train-tracker-v1';
const API_CACHE_NAME = 'train-tracker-api-v1';
// Assets to cache on install
const STATIC_ASSETS = [
'/',
'/manifest.json',
'/icons/icon-192x192.png',
'/icons/icon-512x512.png'
];
// Install event - cache static assets
self.addEventListener('install', (event) => {
event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return cache.addAll(STATIC_ASSETS);
})
);
});
// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
event.waitUntil(
caches.keys().then((keys) => {
return Promise.all(
keys
.filter((key) => key !== CACHE_NAME && key !== AP
I_CACHE_NAME)

YATRALIVE APP SHARED -1 55

.map((key) => caches.delete(key))
);
})
);
});
// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
const url = new URL(event.request.url);
// API requests - network first, cache fallback
if (url.pathname.startsWith('/api/')) {
event.respondWith(
fetch(event.request)
.then((response) => {
// Cache successful API responses
if (response.status === 200) {
const responseClone = response.clone();
caches.open(API_CACHE_NAME).then((cache) => {
cache.put(event.request, responseClone);
});
}
return response;
})
.catch(() => {
// Fallback to cache
return caches.match(event.request);
})
);
} else {
// Static assets - cache first, network fallback
event.respondWith(
caches.match(event.request).then((response) => {
return response || fetch(event.request);
})
);
}
});

YATRALIVE APP SHARED -1 56

// Background sync for offline events
self.addEventListener('sync', (event) => {
if (event.tag === 'sync-favorites') {
event.waitUntil(syncFavorites());
}
});
async function syncFavorites() {
// Implement sync logic if needed
console.log('Syncing favorites...');
}

Step 9.16: PWA Install Prompt
File: components/layout/PWAInstallPrompt.tsx
typescript
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
interface BeforeInstallPromptEvent extends Event {
prompt: () => Promise<void>;
userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }
>;
}
/**
* PWA install prompt component
*
* Shows when the app is installable
*/
export function PWAInstallPrompt() {
const [deferredPrompt, setDeferredPrompt] = useState<Befo
reInstallPromptEvent | null>(null);

YATRALIVE APP SHARED -1 57

const [showPrompt, setShowPrompt] = useState(false);
useEffect(() => {
const handler = (e: Event) => {
// Prevent Chrome 67 and earlier from automatically s
howing the prompt
e.preventDefault();
// Stash the event so it can be triggered later
setDeferredPrompt(e as BeforeInstallPromptEvent);
// Show our custom install prompt
setShowPrompt(true);
};
window.addEventListener('beforeinstallprompt', handle
r);
return () => {
window.removeEventListener('beforeinstallprompt', han
dler);
};
}, []);
const handleInstall = async () => {
if (!deferredPrompt) return;
// Show the install prompt
deferredPrompt.prompt();
// Wait for the user to respond to the prompt
const { outcome } = await deferredPrompt.userChoice;
if (outcome === 'accepted') {
console.log('User accepted the install prompt');
}
// Clear the saved prompt
setDeferredPrompt(null);
setShowPrompt(false);

YATRALIVE APP SHARED -1 58

};
return (
<AnimatePresence>
{showPrompt && (
<motion.div
initial={{ opacity: 0, y: 50 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 50 }}

className="fixed bottom-4 left-4 right-4 md:left-
auto md:right-4 md:w-96 bg-white dark:bg-gray-800 rounded-l

g shadow-xl p-4 z-50"
>
<div className="flex justify-between items-start
mb-2">
<div className="flex items-center gap-2">
<Download className="w-5 h-5 text-blue-500" /
>
<h3 className="font-semibold">Install Train T
racker</h3>
</div>
<button
onClick={() => setShowPrompt(false)}
className="p-1 hover:bg-gray-100 dark:hover:b
g-gray-700 rounded"
>
<X className="w-4 h-4" />
</button>
</div>
<p className="text-sm text-gray-600 dark:text-gra
y-400 mb-4">
Install this app on your device for quick acces
s to live train updates, even offline.
</p>
<div className="flex gap-2">
<button

YATRALIVE APP SHARED -1 59

onClick={handleInstall}

className="flex-1 px-4 py-2 bg-blue-500 text-
white rounded-lg hover:bg-blue-600 transition-colors"

>
Install
</button>
<button
onClick={() => setShowPrompt(false)}
className="px-4 py-2 border border-gray-300 d
ark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:
bg-gray-700 transition-colors"
>
Not now
</button>
</div>
</motion.div>
)}
</AnimatePresence>
);
}

Part 6: Theme & Responsiveness
Step 9.17: Dark Mode Toggle
File: components/layout/ThemeToggle.tsx
typescript
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
/**
* Dark mode toggle with animation
*/

YATRALIVE APP SHARED -1 60

export function ThemeToggle() {
const [isDark, setIsDark] = useState(false);
useEffect(() => {
// Check initial theme
const isDarkMode = localStorage.getItem('theme') === 'd
ark' ||
(!localStorage.getItem('theme') && window.matchMedia
('(prefers-color-scheme: dark)').matches);
setIsDark(isDarkMode);
if (isDarkMode) {
document.documentElement.classList.add('dark');
} else {
document.documentElement.classList.remove('dark');
}
}, []);
const toggleTheme = () => {
setIsDark(!isDark);
if (isDark) {
document.documentElement.classList.remove('dark');
localStorage.setItem('theme', 'light');
} else {
document.documentElement.classList.add('dark');
localStorage.setItem('theme', 'dark');
}
};
return (
<motion.button
whileTap={{ scale: 0.9 }}
onClick={toggleTheme}
className="p-2 rounded-lg bg-gray-100 dark:bg-gray-80
0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-color
s"
aria-label="Toggle theme"

YATRALIVE APP SHARED -1 61

>
<motion.div
initial={false}
animate={{ rotate: isDark ? 360 : 0 }}
transition={{ duration: 0.3 }}
>
{isDark ? (
<Moon className="w-5 h-5 text-blue-500" />
) : (
<Sun className="w-5 h-5 text-yellow-500" />
)}
</motion.div>
</motion.button>
);
}

Step 9.18: Mobile Navigation
File: components/layout/MobileNav.tsx
typescript
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Home, Train, Settings, Star } from 'lucid
e-react';
import Link from 'next/link';
/**
* Mobile navigation menu
*/
export function MobileNav() {
const [isOpen, setIsOpen] = useState(false);
return (
<>
{/* Menu button */}

YATRALIVE APP SHARED -1 62

<button
onClick={() => setIsOpen(true)}
className="md:hidden p-2 rounded-lg bg-gray-100 dar
k:bg-gray-800"
>
<Menu className="w-6 h-6" />
</button>
{/* Overlay */}
<AnimatePresence>
{isOpen && (
<>
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
onClick={() => setIsOpen(false)}
className="fixed inset-0 bg-black/50 z-50 md:
hidden"
/>
{/* Menu panel */}
<motion.div
initial={{ x: '-100%' }}
animate={{ x: 0 }}
exit={{ x: '-100%' }}
transition={{ type: 'spring', damping: 20 }}
className="fixed left-0 top-0 bottom-0 w-64 b
g-white dark:bg-gray-800 z-50 md:hidden"
>
<div className="p-4 border-b dark:border-gray
-700 flex justify-between items-center">
<h2 className="font-semibold">Menu</h2>
<button
onClick={() => setIsOpen(false)}
className="p-1 hover:bg-gray-100 dark:hov
er:bg-gray-700 rounded"
>

YATRALIVE APP SHARED -1 63

<X className="w-5 h-5" />
</button>
</div>
<nav className="p-4">
<MobileNavItem
href="/"
icon={<Home />}
label="Home"
onClick={() => setIsOpen(false)}
/>
<MobileNavItem
href="/trains"
icon={<Train />}
label="All Trains"
onClick={() => setIsOpen(false)}
/>
<MobileNavItem
href="/favorites"
icon={<Star />}
label="Favorites"
onClick={() => setIsOpen(false)}
/>
<MobileNavItem
href="/admin"
icon={<Settings />}
label="Admin"
onClick={() => setIsOpen(false)}
/>
</nav>
</motion.div>
</>
)}
</AnimatePresence>
</>
);
}

YATRALIVE APP SHARED -1 64

interface MobileNavItemProps {
href: string;
icon: React.ReactNode;
label: string;
onClick: () => void;
}
function MobileNavItem({ href, icon, label, onClick }: Mobi
leNavItemProps) {
return (
<Link
href={href}
onClick={onClick}

className="flex items-center gap-3 px-4 py-3 rounded-
lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colo

rs"
>
<span className="w-5 h-5">{icon}</span>
<span>{label}</span>
</Link>
);
}

Part 7: Performance Optimization
Step 9.19: Code Splitting with Dynamic Imports
File: components/trains/DynamicComponents.tsx
typescript
'use client';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
// Dynamically import heavy components
export const JourneyTimeline = dynamic(

YATRALIVE APP SHARED -1 65

() => import('./JourneyTimeline').then(mod => mod.Journey
Timeline),
{
loading: () => (
<div className="h-64 flex items-center justify-cente
r">
<div className="animate-spin rounded-full h-8 w-8 b
order-b-2 border-blue-500" />
</div>
),
ssr: false // Don't render on server
}
);
export const DelayHistoryChart = dynamic(
() => import('./DelayHistoryChart').then(mod => mod.Delay
HistoryChart),
{
loading: () => (
<div className="h-64 flex items-center justify-cente
r">
<div className="animate-spin rounded-full h-8 w-8 b
order-b-2 border-blue-500" />
</div>
),
ssr: false
}
);
export const AdvancedFilters = dynamic(
() => import('@/components/search/AdvancedFilters').then
(mod => mod.AdvancedFilters),
{
loading: () => <div className="h-10 w-32 bg-gray-200 ro
unded animate-pulse" />,
ssr: false
}
);

YATRALIVE APP SHARED -1 66

Step 9.20: Image Optimization Component
File: components/ui/OptimizedImage.tsx
typescript
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
export function OptimizedImage({ src, alt, width, height, c
lassName }: OptimizedImageProps) {
const [isLoading, setIsLoading] = useState(true);
return (
<div className={`relative overflow-hidden${className}`}
style={{ width, height }}>
{isLoading && (
<div className="absolute inset-0 bg-gray-200 dark:b
g-gray-700 animate-pulse" />
)}
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: isLoading ? 0 : 1 }}
transition={{ duration: 0.3 }}

YATRALIVE APP SHARED -1 67

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

✅ STEP 9 COMPLETION CHECKLIST
Animations
components/trains/AnimatedTrainRow.tsx
components/trains/AnimatedStatusBadge.tsx
components/layout/PageTransition.tsx
Search & Filters
lib/hooks/useSearch.ts - Fuzzy search
components/search/AdvancedFilters.tsx
components/search/SearchBar.tsx
Train Details
components/trains/JourneyTimeline.tsx
components/trains/DelayHistoryChart.tsx
app/train/[id]/page.tsx
Favorites

YATRALIVE APP SHARED -1 68

lib/hooks/useFavorites.ts
components/trains/FavoriteButton.tsx
components/layout/FavoritesSidebar.tsx
PWA
public/manifest.json
public/sw.js
components/layout/PWAInstallPrompt.tsx
Theme
components/layout/ThemeToggle.tsx
components/layout/MobileNav.tsx
Performance
components/trains/DynamicComponents.tsx
components/ui/OptimizedImage.tsx