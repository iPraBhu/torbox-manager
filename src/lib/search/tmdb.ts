// TMDB API client for metadata and posters

import type { TMDBMovie, TMDBShow, TMDBSearchResult } from '@/types';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export class TMDBClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${TMDB_API_BASE}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async searchMulti(query: string): Promise<TMDBSearchResult> {
    return this.request<TMDBSearchResult>(
      `/search/multi?query=${encodeURIComponent(query)}&include_adult=false`
    );
  }

  async searchMovie(query: string, year?: number): Promise<TMDBSearchResult> {
    let endpoint = `/search/movie?query=${encodeURIComponent(query)}&include_adult=false`;
    if (year) {
      endpoint += `&year=${year}`;
    }
    return this.request<TMDBSearchResult>(endpoint);
  }

  async searchTV(query: string, year?: number): Promise<TMDBSearchResult> {
    let endpoint = `/search/tv?query=${encodeURIComponent(query)}&include_adult=false`;
    if (year) {
      endpoint += `&first_air_date_year=${year}`;
    }
    return this.request<TMDBSearchResult>(endpoint);
  }

  async getMovie(id: number): Promise<TMDBMovie> {
    return this.request<TMDBMovie>(`/movie/${id}`);
  }

  async getTV(id: number): Promise<TMDBShow> {
    return this.request<TMDBShow>(`/tv/${id}`);
  }

  async findByIMDB(imdbId: string): Promise<{ movie_results: TMDBMovie[]; tv_results: TMDBShow[] }> {
    return this.request(`/find/${imdbId}?external_source=imdb_id`);
  }

  getPosterUrl(path: string | null, size: 'w185' | 'w342' | 'w500' | 'original' = 'w500'): string | undefined {
    if (!path) return undefined;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }

  getBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string | undefined {
    if (!path) return undefined;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }
}

export function createTMDBClient(): TMDBClient | null {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey) return null;
  return new TMDBClient(apiKey);
}
