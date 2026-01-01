// Core data models for the application

export type MediaType = 'movie' | 'show' | 'anime' | 'other';

export type CachedStatus = 'cached' | 'not_cached' | 'processing' | 'unknown';

export interface ExternalIds {
  imdb?: string;
  tmdb?: number;
  tvdb?: number;
}

export interface TorBoxData {
  id: number;
  hash?: string;
  addedAt: string;
  size: number;
  files?: TorBoxFile[];
  downloadLinks?: string[];
  streamLinks?: string[];
  status?: string;
  progress?: number;
  name: string;
}

export interface TorBoxFile {
  id: number;
  name: string;
  size: number;
  path?: string;
}

export interface MediaItem {
  id: string;
  type: MediaType;
  title: string;
  year?: number;
  overview?: string;
  externalIds?: ExternalIds;
  posterUrl?: string;
  backdropUrl?: string;
  cachedStatus: CachedStatus;
  torbox?: TorBoxData;
}

export interface Settings {
  rpdbEnabled: boolean;
  rpdbApiKey: string;
  posterPreference: 'rpdb' | 'tmdb' | 'torbox';
  gridSize: 'small' | 'medium' | 'large';
  showBadges: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  rpdbEnabled: false,
  rpdbApiKey: '',
  posterPreference: 'tmdb',
  gridSize: 'medium',
  showBadges: true,
};

// TorBox API Response Types
export interface TorBoxUser {
  id: number;
  email: string;
  plan: string;
  created_at: string;
}

export interface TorBoxTorrent {
  id: number;
  hash: string;
  name: string;
  size: number;
  progress: number;
  download_speed: number;
  upload_speed: number;
  eta: number;
  seeds: number;
  peers: number;
  ratio: number;
  created_at: string;
  updated_at: string;
  download_state: string;
  files?: TorBoxFile[];
}

export interface TorBoxUsenetDownload {
  id: number;
  name: string;
  size: number;
  progress: number;
  download_speed: number;
  eta: number;
  created_at: string;
  updated_at: string;
  download_state: string;
}

export interface TorBoxWebDownload {
  id: number;
  name: string;
  size: number;
  progress: number;
  download_speed: number;
  eta: number;
  created_at: string;
  updated_at: string;
  download_state: string;
}

export interface SearchResult {
  title: string;
  year?: number;
  type: MediaType;
  overview?: string;
  posterUrl?: string;
  backdropUrl?: string;
  externalIds?: ExternalIds;
  magnet?: string;
  hash?: string;
  size?: number;
  seeders?: number;
  cached?: boolean;
}

// TMDB Types
export interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  release_date: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  imdb_id?: string;
}

export interface TMDBShow {
  id: number;
  name: string;
  original_name: string;
  first_air_date: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
}

export interface TMDBSearchResult {
  page: number;
  results: (TMDBMovie | TMDBShow)[];
  total_pages: number;
  total_results: number;
}
