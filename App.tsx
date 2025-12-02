import React, { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { searchPhotobooths } from './services/geminiService';
import { SearchState, Coordinates, GroundingChunk } from './types';
import PlaceCard from './components/PlaceCard';
import SearchBar from './components/SearchBar';

const App: React.FC = () => {
  const [state, setState] = useState<SearchState>({
    query: '',
    summary: '',
    places: [],
    isLoading: false,
    error: null,
  });

  const [coords, setCoords] = useState<Coordinates | undefined>(undefined);

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

  const handleGeolocationRequest = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung Geolocation.");
      return;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(newCoords);
        performSearch('photobooth terdekat aesthetic', newCoords);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Lokasi tidak ditemukan." 
        }));
      }
    );
  };

  const performSearch = useCallback(async (query: string, location?: Coordinates) => {
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

  return (
    <div className="min-h-screen font-sans bg-white text-gray-900">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">PhotoSpots.</span>
          <button 
             onClick={handleGeolocationRequest}
             className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
           >
             Lokasi Saya
           </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 pt-32 pb-20">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Photobooth & Studio.
          </h1>
          <p className="text-gray-500 text-lg">
            Temukan lokasi foto estetik terdekat.
          </p>
        </div>

        {/* Search */}
        <div className="mb-12">
          <SearchBar onSearch={(q) => performSearch(q, coords)} isLoading={state.isLoading} />
          
          <div className="mt-4 flex gap-x-4 gap-y-2 flex-wrap text-sm">
            <button onClick={() => performSearch('Photobooth Blok M', coords)} className="text-gray-400 hover:text-black transition-colors">Blok M</button>
            <button onClick={() => performSearch('Selfie Studio Bandung', coords)} className="text-gray-400 hover:text-black transition-colors">Bandung</button>
            <button onClick={() => performSearch('Photobox PIK', coords)} className="text-gray-400 hover:text-black transition-colors">PIK</button>
            <button onClick={() => performSearch('Photobooth Jaksel', coords)} className="text-gray-400 hover:text-black transition-colors">Jaksel</button>
          </div>
        </div>

        {/* Error Message */}
        {state.error && (
          <div className="mb-8 text-red-600 text-sm font-medium">
            {state.error}
          </div>
        )}

        {/* Loading */}
        {state.isLoading && (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
          </div>
        )}

        {/* List */}
        {!state.isLoading && state.places.length > 0 && (
          <div className="flex flex-col">
            {state.places.map((chunk, index) => (
              chunk.maps ? (
                <PlaceCard key={index} chunk={chunk} index={index} />
              ) : null
            ))}
          </div>
        )}

        {/* Empty State */}
        {!state.isLoading && state.places.length === 0 && !state.error && (
           <div className="py-12 text-center">
             <span className="text-gray-300 text-6xl block mb-4">✦</span>
           </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">Powered by Gemini & Google Maps</p>
      </footer>
    </div>
  );
};

export default App;