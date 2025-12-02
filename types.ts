
export interface PlaceSource {
  uri?: string;
  title?: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
    
    // Support both SDK (camelCase) and Raw API (snake_case)
    placeId?: string;
    place_id?: string;
    
    formattedAddress?: string;
    formatted_address?: string;
    vicinity?: string; // Add vicinity
    address?: string;  // Add generic address
    
    openingHours?: {
      openNow?: boolean;
      open_now?: boolean;
      weekdayText?: string[];
      weekday_text?: string[];
    };
    opening_hours?: {
      open_now?: boolean;
      weekday_text?: string[];
    };
    
    photos?: {
      name: string;
      widthPx: number;
      heightPx: number;
      authorAttributions: {
        displayName: string;
        uri: string;
        photoUri: string;
      }[];
    }[];
    placeAnswerSources?: {
      reviewSnippets?: {
        content?: string;
      }[];
    };
  };
}

export interface SearchState {
  query: string;
  summary: string;
  places: GroundingChunk[];
  isLoading: boolean;
  error: string | null;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
