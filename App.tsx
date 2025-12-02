
import React, { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { searchPhotobooths } from './services/geminiService';
import { SearchState, Coordinates, GroundingChunk } from './types';
import PlaceCard from './components/PlaceCard';
import SearchBar from './components/SearchBar';

const App: React.FC = () => {
  // Main Search State
  const [state, setState] = useState<SearchState>({
    query: '',
    summary: '',
    places: [],
    isLoading: false,
    error: null,
  });

  // Location State
  const [coords, setCoords] = useState<Coordinates | undefined>(undefined);

  // Favorites State
  const [favorites, setFavorites] = useState<GroundingChunk[]>(() => {
    try {
      const saved = localStorage.getItem('photospots_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load favorites", e);
      return [];
    }
  });

  // View Mode State
  const [viewMode, setViewMode] = useState<'search' | 'favorites'>('search');

  // Initialize Geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition((position) => {
            setCoords({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          });
        }
      });
    }
  }, []);

  // Persist Favorites
  useEffect(() => {
    localStorage.setItem('photospots_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleGeolocationRequest = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung Geolocation.");
      return;
    }

    // Ensure we switch back to search view when finding nearest
    setViewMode('search');
    setState(prev => ({ ...prev, isLoading: true }));
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(newCoords);
        performSearch('photobooth viral terdekat', newCoords);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Gagal mendeteksi lokasi. Pastikan GPS aktif." 
        }));
      }
    );
  };

  const performSearch = useCallback(async (query: string, location?: Coordinates) => {
    setViewMode('search');
    setState(prev => ({ ...prev, isLoading: true, error: null, query }));
    
    try {
      const { text, chunks } = await searchPhotobooths(query, location);
      setState(prev => ({
        ...prev,
        summary: text,
        places: chunks,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    }
  }, []);

  const toggleFavorite = (place: GroundingChunk) => {
    setFavorites(prev => {
      // Use placeId or title as unique identifier
      const placeId = place.maps?.placeId || place.maps?.place_id || place.maps?.title;
      const exists = prev.some(p => (p.maps?.placeId || p.maps?.place_id || p.maps?.title) === placeId);
      
      if (exists) {
        return prev.filter(p => (p.maps?.placeId || p.maps?.place_id || p.maps?.title) !== placeId);
      } else {
        return [...prev, place];
      }
    });
  };

  const isPlaceFavorite = (place: GroundingChunk) => {
    const placeId = place.maps?.placeId || place.maps?.place_id || place.maps?.title;
    return favorites.some(p => (p.maps?.placeId || p.maps?.place_id || p.maps?.title) === placeId);
  };

  // Determine which list to show
  const displayPlaces = viewMode === 'search' ? state.places : favorites;
  
  // Separate chunks into Maps (Places) and Web (Sources)
  // We only show Web sources in 'search' mode to provide context on where the "Viral" info came from
  const mapChunks = displayPlaces.filter(chunk => chunk.maps);
  const webChunks = viewMode === 'search' ? displayPlaces.filter(chunk => chunk.web) : [];

  return (
    <div className="min-h-screen font-sans bg-[#F5F5F4] text-gray-900 pb-20">
      
      {/* Navbar - Simplified */}
      <nav className="sticky top-0 w-full z-50 bg-[#F5F5F4]/90 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-md mx-auto px-6 h-14 flex items-center justify-center">
          <span className="font-bold text-lg tracking-tight text-black">PhotoSpots.</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 pt-8">
        
        {/* Hero Text */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-black">
            Mau foto dimana?
          </h1>
          <p className="text-gray-500 text-base font-medium">
            Temukan photobooth viral & aesthetic sekitar.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex justify-center mb-6">
            <div className="bg-gray-200/50 p-1 rounded-xl inline-flex relative">
                <button
                    onClick={() => setViewMode('search')}
                    className={`relative z-10 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                        viewMode === 'search' 
                        ? 'bg-white text-black shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Pencarian
                </button>
                <button
                    onClick={() => setViewMode('favorites')}
                    className={`relative z-10 px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                        viewMode === 'favorites' 
                        ? 'bg-white text-red-500 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <svg className={`w-3.5 h-3.5 ${viewMode === 'favorites' ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    <span>Disimpan {favorites.length > 0 && `(${favorites.length})`}</span>
                </button>
            </div>
        </div>

        {/* Search Section (Only visible in Search Mode) */}
        {viewMode === 'search' && (
            <div className="mb-8 sticky top-16 z-40 bg-[#F5F5F4] pb-4 pt-2 -mx-5 px-5 transition-all">
                <SearchBar onSearch={(q) => performSearch(q, coords)} isLoading={state.isLoading} />
                
                <div className="mt-3 flex justify-start">
                    <button 
                    onClick={handleGeolocationRequest}
                    disabled={state.isLoading}
                    className="group flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                    >
                    <div className="p-1 bg-blue-50 text-blue-600 rounded-md group-hover:bg-blue-100 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    Photobooth Terdekat
                    </button>
                </div>
            </div>
        )}

        {/* Error Feedback */}
        {state.error && viewMode === 'search' && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 text-sm font-semibold rounded-2xl border border-red-100 flex items-center gap-3">
             <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {state.error}
          </div>
        )}

        {/* Loading State */}
        {state.isLoading && viewMode === 'search' && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-5"></div>
            <span className="text-xs font-bold tracking-widest uppercase text-gray-500">Mencari Photobooth...</span>
          </div>
        )}

        {/* Results / Favorites List */}
        {!state.isLoading && (
          <div className="space-y-5"> 
            
            {/* Map Chunks (Places) */}
            {mapChunks.map((chunk, index) => (
               <PlaceCard 
                  key={`${chunk.maps?.placeId || index}-${viewMode}`} 
                  chunk={chunk} 
                  index={index}
                  isFavorite={isPlaceFavorite(chunk)}
                  onToggleFavorite={() => toggleFavorite(chunk)}
               />
            ))}
            
            {/* Web Chunks (Sources - Only in Search Mode and if exists) */}
            {webChunks.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-4 opacity-70">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         <h4 className="text-xs font-bold uppercase tracking-widest">Sumber Tren Viral</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {webChunks.map((chunk, i) => (
                            chunk.web?.uri && (
                                <a 
                                    key={i} 
                                    href={chunk.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:text-black hover:border-gray-300 transition-colors shadow-sm"
                                >
                                    {chunk.web.title || 'Sumber Web'}
                                </a>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State for Search */}
            {viewMode === 'search' && mapChunks.length === 0 && !state.error && !state.isLoading && (
                <div className="py-24 text-center opacity-60">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200/50 mb-4">
                        <span className="text-2xl">📸</span>
                    </div>
                    <p className="text-sm font-medium text-gray-400">Siap mencari spot photobooth?</p>
                </div>
            )}

             {/* Empty State for Favorites */}
             {viewMode === 'favorites' && favorites.length === 0 && (
                <div className="py-24 text-center opacity-60">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4 text-red-300">
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <p className="text-sm font-medium text-gray-400">Belum ada tempat favorit.</p>
                    <button 
                        onClick={() => setViewMode('search')}
                        className="mt-2 text-xs font-bold text-black border-b border-black pb-0.5 hover:opacity-70"
                    >
                        Cari photobooth
                    </button>
                </div>
            )}

            {/* Footer Text */}
            {viewMode === 'search' && mapChunks.length > 0 && (
                 <div className="pt-8 text-center">
                     <p className="text-xs text-gray-400 font-medium">Batas Pencarian Tercapai</p>
                 </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
