import React from 'react';
import { GroundingChunk } from '../types';

interface PlaceCardProps {
  chunk: GroundingChunk;
  index: number;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ chunk, index }) => {
  const mapData = chunk.maps;

  if (!mapData) return null;

  // Construct direct navigation URL
  // If placeId is available, use direction API, otherwise fallback to the standard URI
  const directionsUrl = mapData.placeId 
    ? `https://www.google.com/maps/dir/?api=1&destination_place_id=${mapData.placeId}&destination=${encodeURIComponent(mapData.title || '')}`
    : mapData.uri || '#';

  const igSearchUrl = `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(mapData.title || '')}`;

  return (
    <div className="group flex flex-col justify-between bg-white border-b border-gray-100 py-6 first:pt-0 hover:bg-gray-50 transition-colors sm:rounded-none sm:border-b sm:px-0">
      
      <div className="mb-4">
        <h3 className="font-sans text-xl font-medium text-gray-900 leading-tight">
          {mapData.title || 'Unknown Location'}
        </h3>
      </div>

      <div className="flex items-center gap-6">
        {/* Direct Route Button */}
        <a 
           href={directionsUrl}
           target="_blank" 
           rel="noopener noreferrer"
           className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors group/route"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover/route:bg-black group-hover/route:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="font-medium">Rute</span>
        </a>

        {/* Instagram Button */}
        <a 
          href={igSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors group/ig"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover/ig:bg-black group-hover/ig:text-white transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="font-medium">Instagram</span>
        </a>
      </div>
    </div>
  );
};

export default PlaceCard;