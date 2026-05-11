'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftRight, CalendarDays, LocateFixed, Search } from 'lucide-react';
import { formatStationLabel } from '@/lib/utils/stations';
import { Train } from '@/types';
import { TrainRow } from './TrainRows';
import { LiveIndicator } from '../layout/LiveIndicator';
import { useTrains } from '@/lib/hooks/useTrains';

/**
 * Train Table Component
 * 
 * Displays all trains with real-time updates
 * 
 * ANALOGY: Like the main departure board at a major station
 */
export function TrainTable() {
  const TRAINS_PER_PAGE = 8;
  const router = useRouter();
  const {
    trains,
    loading,
    error,
    connectionStatus,
    connectionHealth,
    getTrainsByStatus
  } = useTrains();
  
  const [filter, setFilter] = useState<'all' | 'ON_TIME' | 'DELAYED' | 'CANCELLED'>('all');
  const [search, setSearch] = useState('');
  const [boardingInput, setBoardingInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [journeyDate, setJourneyDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [trackQuery, setTrackQuery] = useState('');
  const [trackError, setTrackError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<'find' | 'track'>('find');
  const [currentPage, setCurrentPage] = useState(1);

  const stationOptions = useMemo(() => {
    return Array.from(new Set(trains.flatMap((train) => [train.source, train.destination, ...train.route]))).sort();
  }, [trains]);

  const stationRecords = useMemo(() => {
    return stationOptions.map((code) => ({
      code,
      label: formatStationLabel(code),
    }));
  }, [stationOptions]);

  const suggestedRoutes = useMemo(() => {
    const uniqueRoutes = new Map<string, { source: string; destination: string }>();

    for (const train of trains) {
      const key = `${train.source}-${train.destination}`;

      if (!uniqueRoutes.has(key)) {
        uniqueRoutes.set(key, {
          source: train.source,
          destination: train.destination,
        });
      }

      if (uniqueRoutes.size === 3) {
        break;
      }
    }

    return Array.from(uniqueRoutes.values()).map(({ source, destination }) => ({
      source,
      destination,
      sourceLabel: formatStationLabel(source),
      destinationLabel: formatStationLabel(destination),
    }));
  }, [trains]);

  const suggestedTracks = useMemo(() => {
    return trains.slice(0, 3).map((train) => ({
      id: train.id,
      number: train.number,
      name: train.name,
    }));
  }, [trains]);

  const resolveStationCode = (value: string) => {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return '';
    }

    const match = stationRecords.find((station) =>
      station.code.toLowerCase() === normalized || station.label.toLowerCase() === normalized
    );

    return match?.code ?? '';
  };

  const boardingStation = useMemo(() => resolveStationCode(boardingInput), [boardingInput, stationRecords]);
  const destinationStation = useMemo(() => resolveStationCode(destinationInput), [destinationInput, stationRecords]);

  const stationValidationError = useMemo(() => {
    if (boardingStation && destinationStation && boardingStation === destinationStation) {
      return 'Boarding and destination stations cannot be the same.';
    }

    if (boardingInput && !boardingStation) {
      return 'Choose a valid boarding station from the suggestions.';
    }

    if (destinationInput && !destinationStation) {
      return 'Choose a valid destination station from the suggestions.';
    }

    return null;
  }, [boardingInput, boardingStation, destinationInput, destinationStation]);

  const routeMatchesSelection = useMemo(() => {
    return (route: string[]) => {
      if (!boardingStation && !destinationStation) {
        return true;
      }

      if (boardingStation && !destinationStation) {
        return route.includes(boardingStation);
      }

      if (!boardingStation && destinationStation) {
        return route.includes(destinationStation);
      }

      const sourceIndex = route.indexOf(boardingStation);
      const destinationIndex = route.indexOf(destinationStation);

      return sourceIndex !== -1 && destinationIndex !== -1 && sourceIndex < destinationIndex;
    };
  }, [boardingStation, destinationStation]);

  const trackingMatches = useMemo(() => {
    const query = trackQuery.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return trains.filter((train) =>
      train.id.toLowerCase() === query ||
      train.number.toLowerCase() === query ||
      train.name.toLowerCase().includes(query)
    );
  }, [trackQuery, trains]);
  
  // Filter trains
  const filteredTrains = useMemo(() => {
    let filtered = trains;

    if (!stationValidationError) {
      filtered = filtered.filter((train) => routeMatchesSelection(train.route));
    }
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.status === filter);
    }
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.number.toLowerCase().includes(searchLower) ||
        t.source.toLowerCase().includes(searchLower) ||
        t.destination.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by expected arrival
    return filtered.sort((a, b) => 
      a.expectedArrival.localeCompare(b.expectedArrival)
    );
  }, [trains, filter, search, routeMatchesSelection, stationValidationError]);

  const totalPages = Math.max(1, Math.ceil(filteredTrains.length / TRAINS_PER_PAGE));
  const paginatedTrains = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * TRAINS_PER_PAGE;
    return filteredTrains.slice(startIndex, startIndex + TRAINS_PER_PAGE);
  }, [currentPage, filteredTrains, totalPages]);
  
  // Get counts for each status
  const counts = {
    all: trains.length,
    ON_TIME: getTrainsByStatus('ON_TIME').length,
    DELAYED: getTrainsByStatus('DELAYED').length,
    CANCELLED: getTrainsByStatus('CANCELLED').length
  };

  const handleTrackTrain = () => {
    const query = trackQuery.trim().toLowerCase();

    if (!query) {
      setTrackError('Enter a train number, name, or live train id');
      return;
    }

    const match = trains.find((train) =>
      train.id.toLowerCase() === query || train.number.toLowerCase() === query
    ) ?? trackingMatches[0];

    if (!match) {
      setTrackError('No matching train found');
      return;
    }

    setTrackError(null);
    router.push(`/train/${match.id}`);
  };

  const swapStations = () => {
    setBoardingInput(destinationInput);
    setDestinationInput(boardingInput);
    setCurrentPage(1);
  };

  const applySuggestedRoute = (source: string, destination: string) => {
    setBoardingInput(formatStationLabel(source));
    setDestinationInput(formatStationLabel(destination));
    setCurrentPage(1);
  };

  const applySuggestedTrack = (value: string) => {
    setTrackQuery(value);
    setTrackError(null);
  };

  const noRouteResults = !stationValidationError && boardingStation && destinationStation && filteredTrains.length === 0;

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white dark:border-slate-800">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-300">Live Rail Search</p>
              <h1 className="text-2xl font-semibold">YatraLive</h1>
              <p className="text-sm text-slate-300">
                Find trains between stations or track a train live by number or id.
              </p>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur">
              <LiveIndicator 
                status={connectionStatus} 
                health={connectionHealth}
              />
            </div>
          </div>

          <div className="inline-flex rounded-xl bg-white/10 p-1">
            <button
              type="button"
              onClick={() => setActiveMode('find')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeMode === 'find'
                  ? 'bg-white text-slate-950'
                  : 'text-slate-200'
              }`}
            >
              Find Trains
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('track')}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                activeMode === 'track'
                  ? 'bg-white text-slate-950'
                  : 'text-slate-200'
              }`}
            >
              Track Train
            </button>
          </div>
        </div>

        <div className="p-5">
        {activeMode === 'find' ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-3">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Find Available Trains</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Type station name or code, pick a journey date, and see trains on that route.
              </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {suggestedRoutes.map((route) => (
                <button
                  key={`${route.source}-${route.destination}`}
                  type="button"
                  onClick={() => applySuggestedRoute(route.source, route.destination)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-300 dark:hover:text-amber-300"
                >
                  {route.sourceLabel} to {route.destinationLabel}
                </button>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_220px]">
              <div>
                <input
                  list="boarding-stations"
                  value={boardingInput}
                  onChange={(event) => {
                    setBoardingInput(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Boarding station"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-amber-300"
                />
                <datalist id="boarding-stations">
                  {stationRecords.map((station) => (
                    <option key={`boarding-${station.code}`} value={station.label} />
                  ))}
                </datalist>
              </div>

              <button
                type="button"
                onClick={swapStations}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-amber-300 dark:hover:text-amber-300"
                aria-label="Swap stations"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>

              <div>
                <input
                  list="destination-stations"
                  value={destinationInput}
                  onChange={(event) => {
                    setDestinationInput(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Destination station"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-amber-300"
                />
                <datalist id="destination-stations">
                  {stationRecords.map((station) => (
                    <option key={`destination-${station.code}`} value={station.label} />
                  ))}
                </datalist>
              </div>

              <label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <CalendarDays className="h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={journeyDate}
                  onChange={(event) => setJourneyDate(event.target.value)}
                  className="w-full bg-transparent outline-none"
                />
              </label>
            </div>

            <div className="mt-3 space-y-2">
              {stationValidationError && (
                <p className="text-sm text-amber-600 dark:text-amber-300">{stationValidationError}</p>
              )}

              {noRouteResults && (
                <p className="text-sm text-amber-600 dark:text-amber-300">
                  No trains found between {formatStationLabel(boardingStation)} and {formatStationLabel(destinationStation)} on the current dataset.
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span>
                  {filteredTrains.length} matching trains{journeyDate ? ` for ${journeyDate}` : ''}
                </span>
                {(boardingInput || destinationInput) && (
                <button
                  type="button"
                  onClick={() => {
                    setBoardingInput('');
                    setDestinationInput('');
                    setCurrentPage(1);
                  }}
                  className="rounded-full bg-slate-200 px-3 py-1 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  Clear route filter
                </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-3">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Track A Train</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter a train number, name, or live train id to open its tracking page.
              </p>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {suggestedTracks.map((train) => (
                <button
                  key={train.id}
                  type="button"
                  onClick={() => applySuggestedTrack(train.number)}
                  className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-300 dark:hover:text-amber-300"
                >
                  {train.number} • {train.name}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={trackQuery}
                onChange={(event) => {
                  setTrackQuery(event.target.value);
                  setTrackError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleTrackTrain();
                  }
                }}
                placeholder="e.g. 12301 or train_..."
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-amber-300"
              />
              <button
                type="button"
                onClick={handleTrackTrain}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 font-medium text-white transition-colors hover:bg-slate-800 dark:bg-amber-300 dark:text-slate-950 dark:hover:bg-amber-200"
              >
                <LocateFixed className="h-4 w-4" />
                Track
              </button>
            </div>

            {trackError && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-300">{trackError}</p>
            )}

            {trackingMatches.length > 0 && (
              <div className="mt-3 space-y-2">
                {trackingMatches.slice(0, 3).map((train) => (
                  <button
                    key={train.id}
                    type="button"
                    onClick={() => router.push(`/train/${train.id}`)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-slate-950 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-300 dark:hover:bg-slate-800"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{train.name}</div>
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {train.number} • {train.id}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Header with live indicator */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Live Train Status</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Click any train row to open its full live tracking page.
          </p>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterButton
            active={filter === 'all'}
            onClick={() => {
              setFilter('all');
              setCurrentPage(1);
            }}
            count={counts.all}
            label="All"
          />
          <FilterButton
            active={filter === 'ON_TIME'}
            onClick={() => {
              setFilter('ON_TIME');
              setCurrentPage(1);
            }}
            count={counts.ON_TIME}
            label="On Time"
            color="green"
          />
          <FilterButton
            active={filter === 'DELAYED'}
            onClick={() => {
              setFilter('DELAYED');
              setCurrentPage(1);
            }}
            count={counts.DELAYED}
            label="Delayed"
            color="orange"
          />
          <FilterButton
            active={filter === 'CANCELLED'}
            onClick={() => {
              setFilter('CANCELLED');
              setCurrentPage(1);
            }}
            count={counts.CANCELLED}
            label="Cancelled"
            color="red"
          />
        </div>
        
        <input
          type="text"
          placeholder="Search trains..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-amber-300"
        />
      </div>
      
      {/* Train table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-950">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Train
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Route
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Scheduled
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Expected
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {paginatedTrains.map((train) => (
              <TrainRow key={train.id} train={train} onSelect={() => router.push(`/train/${train.id}`)} />
            ))}
          </tbody>
        </table>
        
        {/* Empty state */}
        {filteredTrains.length === 0 && (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">
            No trains found matching your criteria
          </div>
        )}
      </div>

      {filteredTrains.length > TRAINS_PER_PAGE && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {Math.min(currentPage, totalPages)} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Footer with update info */}
      <div className="text-right text-xs text-slate-500 dark:text-slate-400">
        {paginatedTrains.length} of {filteredTrains.length} trains shown • Updates in real-time
      </div>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  count: number;
  label: string;
  color?: 'green' | 'orange' | 'red';
}

function FilterButton({ active, onClick, count, label, color }: FilterButtonProps) {
  const colorClasses = {
    green: 'bg-slate-950 text-white dark:bg-amber-300 dark:text-slate-950',
    orange: 'bg-amber-100 text-amber-700 dark:bg-amber-300 dark:text-slate-950',
    red: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  };
  
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? color
            ? colorClasses[color]
            : 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
      }`}
    >
      {label} <span className="ml-1 text-xs opacity-75">({count})</span>
    </button>
  );
}
