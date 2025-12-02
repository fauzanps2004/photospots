import React, { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { searchPhotobooths } from './services/geminiService';
import { SearchState, Coordinates, GroundingChunk } from './types';
import PlaceCard from './components/PlaceCard';
import SearchBar from './components/SearchBar';

// Illustration Components
const StrawberryIcon = () => (
  <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce">
    <path d="M12 2C13 1 14.5 1 15 2.5C15.5 1 17 1 18 2.5C19 4 18 6 16.5 7" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 6C7 6 5 9 5 14C5 19 8 22 12 22C16 22 19 19 19 14C19 9 17 6 12 6Z" fill="#FB7185" stroke="#F43F5E" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M9 11H9.01" stroke="#FCE7F3" strokeWidth="3" strokeLinecap="round"/>
    <path d="M14 12H14.01" stroke="#FCE7F3" strokeWidth="3" strokeLinecap="round"/>
    <path d="M11 16H11.01" stroke="#FCE7F3" strokeWidth="3" strokeLinecap="round"/>
    <path d="M16 15H16.01" stroke="#FCE7F3" strokeWidth="3" strokeLinecap="round"/>
    <path d="M8 15H8.01" stroke="#FCE7F3" strokeWidth="3" strokeLinecap="round"/>
    <path d="M12 6C11 4.5 10 4 9 4C8 4 7.5 4.5 7.5 5.5" stroke="#4ADE80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BowIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 13C12.8 13 14.5 14.5 15.5 15.5C16.5 16.5 18 16 18 14.5C18 13 16 11 13 11H11C8 11 6 13 6 14.5C6 16 7.5 16.5 8.5 15.5C9.5 14.5 11.2 13 12 13Z" fill="#FBCFE8" stroke="#F472B6" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M12 13V18" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 18L10.5 21" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 18L13.5 21" stroke="#F472B6" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

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

  const displayPlaces = viewMode === 'search' ? state.places : favorites;
  const mapChunks = displayPlaces.filter(chunk => chunk.maps);
  const webChunks = viewMode === 'search' ? displayPlaces.filter(chunk => chunk.web) : [];

  return (
    <div className="min-h-screen font-sans bg-pastel-pink text-gray-800 pb-20 selection:bg-pink-200 selection:text-pink-900">
      
      {/* Navbar - Pastel */}
      <nav className="sticky top-0 w-full z-50 bg-pastel-pink/95 backdrop-blur-md border-b border-pink-200/50">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-center relative">
          <div className="flex items-center gap-2">
            <BowIcon className="w-5 h-5 text-pink-400" />
            <span className="font-bold text-xl tracking-tight text-gray-800">PhotoSpots.</span>
             <BowIcon className="w-5 h-5 text-pink-400 transform scale-x-[-1]" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-5 pt-8">
        
        {/* Hero Text */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-3 text-gray-900 drop-shadow-sm">
            Mau foto dimana?
          </h1>
          <p className="text-gray-500 text-sm font-medium">
            Temukan photobooth viral & aesthetic ✨
          </p>
        </div>

        {/* View Switcher Tabs - Cute Pills */}
        <div className="flex justify-center mb-8">
            <div className="bg-white/60 p-1.5 rounded-2xl inline-flex relative border border-white shadow-soft">
                <button
                    onClick={() => setViewMode('search')}
                    className={`relative z-10 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                        viewMode === 'search' 
                        ? 'bg-melon-green text-green-900 shadow-sm' 
                        : 'text-gray-400 hover:text-pink-400'
                    }`}
                >
                    Pencarian
                </button>
                <button
                    onClick={() => setViewMode('favorites')}
                    className={`relative z-10 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                        viewMode === 'favorites' 
                        ? 'bg-pink-100 text-pink-600 shadow-sm' 
                        : 'text-gray-400 hover:text-pink-400'
                    }`}
                >
                    <svg className={`w-4 h-4 ${viewMode === 'favorites' ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    <span>{favorites.length > 0 && `(${favorites.length})`}</span>
                </button>
            </div>
        </div>

        {/* Search Section */}
        {viewMode === 'search' && (
            <div className="mb-8 sticky top-16 z-40 bg-pastel-pink pb-4 pt-2 -mx-5 px-5 transition-all">
                <SearchBar onSearch={(q) => performSearch(q, coords)} isLoading={state.isLoading} />
                
                <div className="mt-4 flex justify-start">
                    <button 
                    onClick={handleGeolocationRequest}
                    disabled={state.isLoading}
                    className="group flex items-center gap-2 text-xs font-bold text-pink-500 bg-white hover:bg-pink-50 border-2 border-white hover:border-pink-100 px-5 py-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50 shadow-soft"
                    >
                    <div className="p-1 bg-pink-100 text-pink-500 rounded-lg group-hover:bg-pink-200 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    Photobooth Terdekat
                    </button>
                </div>
            </div>
        )}

        {/* Error Feedback */}
        {state.error && viewMode === 'search' && (
          <div className="mb-8 p-4 bg-red-50 text-red-500 text-sm font-bold rounded-2xl border border-red-100 flex items-center gap-3">
             <span>⚠️</span>
            {state.error}
          </div>
        )}

        {/* Loading State with Strawberry & Ribbon */}
        {state.isLoading && viewMode === 'search' && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
             <StrawberryIcon />
             <div className="mt-6 flex items-center gap-2">
                 <BowIcon className="w-5 h-5 text-pink-300 animate-pulse" />
                 <span className="text-xs font-bold tracking-widest uppercase text-pink-400 animate-pulse">Sedang Mencari...</span>
                 <BowIcon className="w-5 h-5 text-pink-300 animate-pulse transform scale-x-[-1]" />
             </div>
          </div>
        )}

        {/* Results */}
        {!state.isLoading && (
          <div className="space-y-6"> 
            
            {mapChunks.map((chunk, index) => (
               <PlaceCard 
                  key={`${chunk.maps?.placeId || index}-${viewMode}`} 
                  chunk={chunk} 
                  index={index}
                  isFavorite={isPlaceFavorite(chunk)}
                  onToggleFavorite={() => toggleFavorite(chunk)}
               />
            ))}
            
            {/* Viral Sources */}
            {webChunks.length > 0 && (
                <div className="mt-10 pt-6 border-t border-pink-200/50">
                    <div className="flex items-center gap-2 mb-4">
                         <BowIcon className="w-4 h-4 text-pink-400" />
                         <h4 className="text-xs font-bold uppercase tracking-widest text-pink-400">Trending Source</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {webChunks.map((chunk, i) => (
                            chunk.web?.uri && (
                                <a 
                                    key={i} 
                                    href={chunk.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block px-3 py-1.5 rounded-lg bg-white border border-pink-100 text-[10px] font-bold text-pink-400 hover:text-pink-600 hover:border-pink-300 transition-colors shadow-sm"
                                >
                                    {chunk.web.title || 'Link'} ➜
                                </a>
                            )
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {viewMode === 'search' && mapChunks.length === 0 && !state.error && !state.isLoading && (
                <div className="py-20 text-center opacity-70">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white mb-4 shadow-soft">
                        <span className="text-4xl filter hue-rotate-15">🍓</span>
                    </div>
                    <p className="text-sm font-bold text-pink-300">Siap mencari spot lucu?</p>
                </div>
            )}

             {/* Empty State Favorites */}
             {viewMode === 'favorites' && favorites.length === 0 && (
                <div className="py-20 text-center opacity-70">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-100 mb-4 text-pink-300">
                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <p className="text-sm font-medium text-pink-400">Belum ada tempat favorit.</p>
                </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;