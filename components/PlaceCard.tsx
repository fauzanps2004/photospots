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
    <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 shadow-soft border-2 border-white hover:border-pink-200 transition-all duration-300 relative overflow-hidden group hover:-translate-y-1">
        
        {/* Decorative background element */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-pink-50 rounded-full opacity-50 blur-xl group-hover:bg-pink-100 transition-colors"></div>

        {/* Top Bar: Status (Left) & Favorite (Right) */}
        <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none">
            {/* Status Indicator (Left) */}
            <div className="pointer-events-auto">
                {hoursData ? (
                    <div className="flex items-center gap-2 bg-white/90 pl-2 pr-3 py-1.5 rounded-full border border-pink-100 shadow-sm">
                        <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-melon-green animate-pulse' : 'bg-red-300'}`}></span>
                        <span className={`text-[10px] font-bold tracking-widest uppercase ${isOpen ? 'text-green-600' : 'text-red-400'}`}>
                            {isOpen ? 'Open' : 'Closed'}
                        </span>
                    </div>
                ) : <div />}
            </div>

            {/* Favorite Button (Top Right) */}
            <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite();
                }}
                className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white border border-pink-100 text-pink-300 hover:text-deep-pink hover:bg-pink-50 hover:border-pink-200 transition-all active:scale-90 shadow-sm"
                title={isFavorite ? "Hapus dari Favorit" : "Simpan ke Favorit"}
            >
                <svg 
                    className={`w-5 h-5 transition-colors duration-300 ${isFavorite ? 'fill-deep-pink text-deep-pink' : 'fill-none stroke-current'}`} 
                    viewBox="0 0 24 24" 
                    strokeWidth={2.5}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
        </div>

        {/* Content Header */}
        <div className="mb-6 mt-10 pr-2 relative z-10">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 ${
                isCafe ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-pink-50 text-pink-500 border border-pink-100'
            }`}>
               {isCafe ? '☕ Cafe & Photobooth' : '🎀 Photobooth'}
            </div>

            <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2">
                {title}
            </h3>
        </div>

        {/* Info Section - Removed Address, kept hours if needed, but mostly clean */}
        <div className="space-y-3 mb-6 relative z-10">
            {/* Hours - Simplified */}
            {hoursText && (
                <div className="flex items-center gap-2 text-gray-500">
                     <svg className="w-4 h-4 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     <p className="text-xs font-medium">
                        {hoursText.split(': ')[1] || hoursText}
                     </p>
                </div>
            )}
        </div>

        {/* Action Buttons - Green Primary, Pink Secondary */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
             <a 
                href={directionsUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-melon-green text-green-900 font-bold text-sm hover:bg-leaf-green transition-transform active:scale-95 shadow-md shadow-green-100 border border-green-300/20"
             >
                <span>Rute</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
             </a>

             <a 
                href={igSearchUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white text-pink-500 border-2 border-pink-100 font-bold text-sm hover:bg-pink-50 hover:border-pink-200 transition-colors"
             >
                <span>Sosmed</span>
                <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
             </a>
        </div>
    </div>
  );
};

export default PlaceCard;