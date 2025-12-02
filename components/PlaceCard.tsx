import React from 'react';
import { GroundingChunk } from '../types';

interface PlaceCardProps {
  chunk: GroundingChunk;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ chunk, index, isFavorite, onToggleFavorite }) => {
  const mapData = chunk.maps as any; // Cast to any to ensure we can access properties flexibly

  if (!mapData) return null;

  // Extract data with fallback to snake_case properties
  const title = mapData.title || 'Unknown Place';
  const placeId = mapData.placeId || mapData.place_id;
  
  // Handle Opening Hours
  const hoursData = (mapData.openingHours || mapData.opening_hours) as any;
  const isOpen = hoursData?.openNow ?? hoursData?.open_now;
  const weekdayText = hoursData?.weekdayText || hoursData?.weekday_text;
  const hoursText = weekdayText?.[0];

  // Logic to determine category
  const titleLower = title.toLowerCase();
  const cafeKeywords = ['cafe', 'coffee', 'kopi', 'roastery', 'bakeshop', 'kitchen', 'eatery', 'lounge', 'house', 'space', 'bakery', 'tea', 'commune'];
  const isCafe = cafeKeywords.some((keyword: string) => titleLower.includes(keyword));

  // Updated label
  const categoryLabel = isCafe ? 'CAFE & PHOTOBOOTH' : 'PHOTOBOOTH';
  
  const directionsUrl = placeId 
    ? `https://www.google.com/maps/dir/?api=1&destination_place_id=${placeId}&destination=${encodeURIComponent(title)}`
    : mapData.uri || '#';

  const igSearchUrl = `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(title)}`;

  return (
    <div className="bg-white border-2 border-pink-100 rounded-[2rem] p-5 shadow-3d hover:shadow-3d-hover hover:-translate-y-1 transition-all duration-300 relative group">
        
        {/* Top Decor - Film Holes or Camera UI */}
        <div className="absolute top-4 right-4 flex gap-1">
             <div className="w-2 h-2 rounded-full bg-pink-100"></div>
             <div className="w-2 h-2 rounded-full bg-pink-100"></div>
             <div className="w-2 h-2 rounded-full bg-pink-100"></div>
        </div>

        {/* Top Section: Category & Favorite */}
        <div className="flex items-center justify-between mb-4 mt-1">
             <div className={`inline-flex items-center px-4 py-1.5 rounded-xl border-2 text-[10px] font-extrabold tracking-wider uppercase shadow-sm ${
                isCafe 
                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                : 'bg-pink-50 border-pink-200 text-pink-500'
            }`}>
               {isCafe ? '☕ Cafe & Foto' : '🎀 Photobooth'}
            </div>
        </div>

        {/* Content Header */}
        <div className="mb-6 relative">
             <div className="absolute -left-2 top-1 w-1 h-full bg-gradient-to-b from-pink-300 to-transparent rounded-full opacity-50"></div>
            <h3 className="text-2xl font-extrabold text-gray-800 leading-none mb-2 pl-3">
                {title}
            </h3>
            
             {/* Simple Hours Status if available */}
             {hoursData && (
                <div className="flex items-center gap-2 pl-3 mt-2">
                    <div className={`w-2 h-2 rounded-full shadow-sm ${isOpen ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                        {isOpen ? (hoursText ? hoursText.split(': ')[1] || 'Open Now' : 'Open Now') : 'Closed'}
                    </span>
                </div>
            )}
        </div>

        {/* Action Buttons - 3D Style */}
        <div className="grid grid-cols-[1fr_auto] gap-3 mt-4">
             <a 
                href={directionsUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-melon-green border-2 border-leaf-green shadow-3d-btn shadow-green-shadow text-green-900 font-bold text-sm hover:translate-y-[2px] hover:shadow-[0px_2px_0px_0px_#059669] active:translate-y-[4px] active:shadow-none transition-all"
             >
                <span className="uppercase tracking-wide">Rute</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
             </a>

             <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite();
                }}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl border-2 shadow-3d-btn hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none transition-all ${
                    isFavorite 
                    ? 'bg-pink-100 border-pink-300 shadow-pink-shadow' 
                    : 'bg-white border-gray-200 shadow-gray-shadow'
                }`}
            >
                <svg 
                    className={`w-6 h-6 transition-transform active:scale-90 ${isFavorite ? 'fill-pink-500 text-pink-500' : 'fill-gray-100 text-gray-300'}`} 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={isFavorite ? 0 : 3}
                >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            </button>
             
             <a 
                href={igSearchUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="col-span-2 mt-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white border-2 border-gray-200 shadow-3d-btn shadow-gray-shadow text-gray-500 font-bold text-sm hover:translate-y-[2px] hover:shadow-[0px_2px_0px_0px_#9CA3AF] active:translate-y-[4px] active:shadow-none transition-all"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                <span>Cek Instagram</span>
             </a>
        </div>
    </div>
  );
};

export default PlaceCard;