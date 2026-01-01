// Unified metadata resolver with multiple sources and fallbacks

import { createTMDBClient, TMDBClient } from './tmdb';
import { RPDBClient } from './rpdb';
import type { MediaItem, MediaType, ExternalIds, Settings } from '@/types';

export class MetadataResolver {
  private tmdb: TMDBClient | null;
  private rpdb: RPDBClient | null;

  constructor(settings?: Settings) {
    this.tmdb = createTMDBClient();
    this.rpdb = settings?.rpdbEnabled && settings.rpdbApiKey
      ? new RPDBClient(settings.rpdbApiKey)
      : null;
  }

  async resolveByQuery(query: string, type?: MediaType): Promise<MediaItem | null> {
    if (!this.tmdb) {
      return this.createFallbackItem(query, type);
    }

    try {
      // Try to parse year from query
      const yearMatch = query.match(/\((\d{4})\)|\b(\d{4})\b/);
      const year = yearMatch ? parseInt(yearMatch[1] || yearMatch[2]) : undefined;
      const cleanQuery = query.replace(/\(?\d{4}\)?/, '').trim();

      let results;
      
      if (type === 'movie') {
        results = await this.tmdb.searchMovie(cleanQuery, year);
      } else if (type === 'show' || type === 'anime') {
        results = await this.tmdb.searchTV(cleanQuery, year);
      } else {
        results = await this.tmdb.searchMulti(cleanQuery);
      }

      if (results.results.length === 0) {
        return this.createFallbackItem(query, type);
      }

      const first = results.results[0];
      return this.tmdbResultToMediaItem(first);
    } catch (error) {
      console.error('TMDB search error:', error);
      return this.createFallbackItem(query, type);
    }
  }

  async resolveByIMDB(imdbId: string): Promise<MediaItem | null> {
    if (!this.tmdb) return null;

    try {
      const results = await this.tmdb.findByIMDB(imdbId);
      
      if (results.movie_results.length > 0) {
        return this.tmdbResultToMediaItem(results.movie_results[0]);
      }
      
      if (results.tv_results.length > 0) {
        return this.tmdbResultToMediaItem(results.tv_results[0]);
      }
      
      return null;
    } catch (error) {
      console.error('TMDB find by IMDB error:', error);
      return null;
    }
  }

  async resolvePoster(externalIds: ExternalIds, defaultPoster?: string): Promise<string | undefined> {
    // Try RPDB first if enabled
    if (this.rpdb) {
      if (externalIds.imdb) {
        const rpdbPoster = await this.rpdb.getPosterByIMDB(externalIds.imdb);
        if (rpdbPoster) return rpdbPoster;
      }
      
      if (externalIds.tmdb) {
        const type = 'movie'; // Could be enhanced to detect type
        const rpdbPoster = await this.rpdb.getPosterByTMDB(externalIds.tmdb, type);
        if (rpdbPoster) return rpdbPoster;
      }
    }

    // Return default poster (TMDB or other)
    return defaultPoster;
  }

  private tmdbResultToMediaItem(result: any): MediaItem {
    const isMovie = 'title' in result;
    const title = isMovie ? result.title : result.name;
    const year = isMovie
      ? result.release_date ? new Date(result.release_date).getFullYear() : undefined
      : result.first_air_date ? new Date(result.first_air_date).getFullYear() : undefined;

    const posterUrl = this.tmdb?.getPosterUrl(result.poster_path || null);
    const backdropUrl = this.tmdb?.getBackdropUrl(result.backdrop_path || null);

    const externalIds: ExternalIds = {
      tmdb: result.id,
      imdb: result.imdb_id,
    };

    return {
      id: `tmdb-${result.id}`,
      type: isMovie ? 'movie' : 'show',
      title,
      year,
      overview: result.overview,
      externalIds,
      posterUrl,
      backdropUrl,
      cachedStatus: 'unknown',
    };
  }

  private createFallbackItem(query: string, type?: MediaType): MediaItem {
    return {
      id: `fallback-${Date.now()}`,
      type: type || 'other',
      title: query,
      cachedStatus: 'unknown',
    };
  }
}

export function createMetadataResolver(settings?: Settings): MetadataResolver {
  return new MetadataResolver(settings);
}
