import React, { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { searchPhotobooths } from './services/geminiService';
import { SearchState, Coordinates, GroundingChunk } from './types';
import PlaceCard from './components/PlaceCard';
import SearchBar from './components/SearchBar';

// Illustration Components with 3D Vibe
const StrawberryIcon = () => (
  <div className="relative w-24 h-24 animate-float">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
        <path d="M12 2C13.5 1 15.5 1 16.5 3C17 2 18.5 2 19.5 3.5C20.5 5 19.5 7 18 8" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 6C6 6 4 10 4 15C4 20 8 23 12 23C16 23 20 20 20 15C20 10 18 6 12 6Z" fill="#FB7185" stroke="#F43F5E" strokeWidth="2.5" strokeLinejoin="round"/>
        <circle cx="9" cy="11" r="0.5" fill="#FCE7F3" stroke="#FCE7F3" strokeWidth="1"/>
        <circle cx="14" cy="12" r="0.5" fill="#FCE7F3" stroke="#FCE7F3" strokeWidth="1"/>
        <circle cx="11" cy="16" r="0.5" fill="#FCE7F3" stroke="#FCE7F3" strokeWidth="1"/>
        <circle cx="16" cy="15" r="0.5" fill="#FCE7F3" stroke="#FCE7F3" strokeWidth="1"/>
        <circle cx="8" cy="15" r="0.5" fill="#FCE7F3" stroke="#FCE7F3" strokeWidth="1"/>
        <path d="M12 6C10.5 4 9 3.5 8 3.5C7 3.5 6 4 6 5" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
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
    <div className="min-h-screen font-sans text-gray-800 pb-20 selection:bg-pink-300 selection:text-white overflow-x-hidden">
      
      {/* Navbar - Floating Glass Pill */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-xl border-2 border-white/50 px-8 py-3 rounded-full shadow-lg pointer-events-auto flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-3 font-extrabold text-lg tracking-tight text-gray-800">PhotoSpots.</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 pt-32 relative">
        
        {/* Decorative Background Elements */}
        <div className="fixed top-20 -left-20 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="fixed top-20 -right-20 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        {/* Hero Text 3D */}
        <div className="mb-8 text-center relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-2 text-gray-800" style={{ textShadow: '2px 2px 0px rgba(251,113,133,0.2)' }}>
            Mau foto dimana?
          </h1>
          <p className="text-pink-500 font-bold tracking-wide">
            Temukan photobooth viral & aesthetic ✨
          </p>
        </div>

        {/* View Switcher Tabs - 3D Toggle */}
        <div className="flex justify-center mb-8 relative z-10">
            <div className="bg-white p-1.5 rounded-full inline-flex relative border-2 border-pink-100 shadow-inner-soft">
                <button
                    onClick={() => setViewMode('search')}
                    className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                        viewMode === 'search' 
                        ? 'bg-melon-green text-green-900 shadow-3d-btn shadow-green-shadow -translate-y-0.5' 
                        : 'text-gray-400 hover:text-pink-400'
                    }`}
                >
                    Pencarian
                </button>
                <button
                    onClick={() => setViewMode('favorites')}
                    className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                        viewMode === 'favorites' 
                        ? 'bg-pink-300 text-white shadow-3d-btn shadow-pink-shadow -translate-y-0.5' 
                        : 'text-gray-400 hover:text-pink-400'
                    }`}
                >
                    <svg className={`w-4 h-4 ${viewMode === 'favorites' ? 'fill-current' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    <span>{favorites.length > 0 && `(${favorites.length})`}</span>
                </button>
            </div>
        </div>

        {/* Search Section */}
        {viewMode === 'search' && (
            <div className="mb-8 relative z-40 transition-all space-y-4">
                <SearchBar onSearch={(q) => performSearch(q, coords)} isLoading={state.isLoading} />
                
                <div className="flex justify-center">
                    <button 
                    onClick={handleGeolocationRequest}
                    disabled={state.isLoading}
                    className="group flex items-center gap-2 text-xs font-bold text-pink-500 bg-white hover:bg-pink-50 border-2 border-pink-200 shadow-3d-btn shadow-pink-200 px-5 py-3 rounded-full transition-all hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none disabled:opacity-50"
                    >
                    <div className="text-pink-400 group-hover:text-pink-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    Cari Photobooth Terdekat
                    </button>
                </div>
            </div>
        )}

        {/* Error Feedback */}
        {state.error && viewMode === 'search' && (
          <div className="mb-8 p-6 bg-red-50 text-red-500 text-sm font-bold rounded-3xl border-2 border-red-100 flex items-center gap-4 shadow-3d shadow-red-100">
             <span className="text-2xl">🚨</span>
            {state.error}
          </div>
        )}

        {/* Loading State with Strawberry */}
        {state.isLoading && viewMode === 'search' && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
             <StrawberryIcon />
             <div className="mt-8 px-6 py-2 bg-white rounded-full border-2 border-pink-100 shadow-sm animate-pulse">
                <span className="text-xs font-black tracking-widest uppercase text-pink-400">Searching...</span>
             </div>
          </div>
        )}

        {/* Results */}
        {!state.isLoading && (
          <div className="space-y-6 pb-20 relative z-10"> 
            
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
                <div className="mt-12 pt-8 border-t-2 border-dashed border-pink-200">
                    <div className="flex items-center justify-center gap-2 mb-6">
                         <span className="text-xl">✨</span>
                         <h4 className="text-sm font-black uppercase tracking-widest text-pink-400">Viral Sources</h4>
                         <span className="text-xl">✨</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                        {webChunks.map((chunk, i) => (
                            chunk.web?.uri && (
                                <a 
                                    key={i} 
                                    href={chunk.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block px-4 py-2 rounded-xl bg-white border-2 border-pink-100 text-[10px] font-bold text-pink-500 hover:text-white hover:bg-pink-400 hover:border-pink-400 transition-all shadow-sm active:scale-95"
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
                <div className="py-20 text-center opacity-80">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white border-4 border-pink-100 mb-6 shadow-3d rotate-3">
                        <span className="text-5xl filter hue-rotate-15">🍓</span>
                    </div>
                    <p className="text-lg font-bold text-pink-400">Siap mencari spot lucu?</p>
                </div>
            )}

             {/* Empty State Favorites */}
             {viewMode === 'favorites' && favorites.length === 0 && (
                <div className="py-20 text-center opacity-80">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-pink-100 border-4 border-pink-200 mb-6 text-pink-300 shadow-inner-soft -rotate-3">
                        <svg className="w-10 h-10 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </div>
                    <p className="text-lg font-bold text-pink-400">Belum ada tempat favorit.</p>
                </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;