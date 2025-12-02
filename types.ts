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
    placeId?: string;
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