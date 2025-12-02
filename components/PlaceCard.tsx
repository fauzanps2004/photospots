import React from 'react';
import { GroundingChunk } from '../types';

interface PlaceCardProps {
  chunk: GroundingChunk;
  index: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ chunk, index, isFavorite, onToggleFavorite }) => {
  const mapData = chunk.maps;

  if (!mapData) return null;

  // Extract data with fallback to snake_case properties
  const title = mapData.title || 'Unknown Place';
  const placeId = mapData.placeId || mapData.place_id;
  
  // Robust address extraction: try formattedAddress, formatted_address, vicinity, then generic address
  const address = mapData.formattedAddress || 
                 mapData.formatted_address || 
                 mapData.vicinity || 
                 mapData.address || 
                 'Alamat tidak tersedia';
  
  // Handle Opening Hours
  const hoursData = (mapData.openingHours || mapData.opening_hours) as any;
  const isOpen = hoursData?.openNow ?? hoursData?.open_now;
  const weekdayText = hoursData?.weekdayText || hoursData?.weekday_text;
  const hoursText = weekdayText?.[0];

  // Logic to determine category
  const titleLower = title.toLowerCase();
  const cafeKeywords = ['cafe', 'coffee', 'kopi', 'roastery', 'bakeshop', 'kitchen', 'eatery', 'lounge', 'house', 'space', 'bakery', 'tea', 'commune'];
  const isCafe = cafeKeywords.some(keyword => titleLower.includes(keyword));

  // Updated label to reflect "Instant Photobooth" vs "Studio"
  const categoryLabel = isCafe ? 'CAFE & PHOTOBOOTH' : 'PHOTOBOOTH';
  const categoryBadgeStyle = isCafe 
    ? 'bg-amber-50 text-amber-700 border-amber-100' 
    : 'bg-gray-100 text-gray-600 border-gray-200';
  
  const categoryIcon = isCafe ? (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 1v3M10 1v3M14 1v3" /></svg>
  ) : (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
  );

  const directionsUrl = placeId 
    ? `https://www.google.com/maps/dir/?api=1&destination_place_id=${placeId}&destination=${encodeURIComponent(title)}`
    : mapData.uri || '#';

  const igSearchUrl = `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(title)}`;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft border border-gray-100 hover:border-gray-300 transition-colors duration-300 relative overflow-hidden group">
        
        {/* Top Bar: Status (Left) & Favorite (Right) */}
        <div className="absolute top-6 left-6 right-6 flex items-start justify-between pointer-events-none">
            {/* Status Indicator (Now on Left) */}
            <div className="pointer-events-auto">
                {hoursData ? (
                    <div className="flex items-center gap-2 bg-gray-50 pl-2 pr-3 py-1 rounded-full border border-gray-100">
                        <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`}></span>
                        <span className={`text-xs font-bold tracking-wide ${isOpen ? 'text-green-700' : 'text-red-500'}`}>
                            {isOpen ? 'BUKA' : 'TUTUP'}
                        </span>
                    </div>
                ) : (
                    // Spacer if no hours data, to keep alignment if needed, or empty
                    <div />
                )}
            </div>

            {/* Favorite Button (Top Right) */}
            <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite();
                }}
                className="pointer-events-auto w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all active:scale-90"
                title={isFavorite ? "Hapus dari Favorit" : "Simpan ke Favorit"}
            >
                <svg 
                    className={`w-5 h-5 transition-colors duration-300 ${isFavorite ? 'fill-red-500 text-red-500' : 'fill-none stroke-current'}`} 
                    viewBox="0 0 24 24" 
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>
        </div>

        {/* Content Header (Added top padding to clear status badge) */}
        <div className="mb-6 mt-8 pr-2">
            <h3 className="text-xl font-bold text-gray-900 leading-tight mb-2">
                {title}
            </h3>
            
            {/* Category Badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-bold tracking-widest uppercase ${categoryBadgeStyle}`}>
                {categoryIcon}
                <span>{categoryLabel}</span>
            </div>
        </div>

        {/* Info Section */}
        <div className="space-y-3 mb-8">
            {/* Address */}
            <div className="flex items-start gap-3">
                 <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </div>
                 <p className="text-sm text-gray-600 font-medium leading-snug">
                    {address}
                 </p>
            </div>

            {/* Hours */}
            {hoursText && (
                <div className="flex items-start gap-3">
                     <div className="mt-0.5 w-5 h-5 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     </div>
                     <p className="text-sm text-gray-500">
                        {hoursText.split(': ')[1] || hoursText}
                     </p>
                </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
             <a 
                href={directionsUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-black transition-transform active:scale-95 shadow-md shadow-gray-200"
             >
                <span>Rute</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
             </a>

             <a 
                href={igSearchUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white text-gray-700 border border-gray-200 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 transition-colors"
             >
                <span>Instagram</span>
                <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
             </a>
        </div>
    </div>
  );
};

export default PlaceCard;