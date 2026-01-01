// RPDB (RatingPosterDB) client for enhanced posters

const RPDB_API_BASE = 'https://api.ratingposterdb.com';

export class RPDBClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getPosterByIMDB(imdbId: string): Promise<string | null> {
    try {
      const url = `${RPDB_API_BASE}/${this.apiKey}/imdb/poster-default/${imdbId}.jpg`;
      
      // Check if the poster exists
      const response = await fetch(url, { method: 'HEAD' });
      
      if (response.ok) {
        return url;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  async getPosterByTMDB(tmdbId: number, type: 'movie' | 'tv'): Promise<string | null> {
    try {
      const url = `${RPDB_API_BASE}/${this.apiKey}/tmdb/poster-default/${type === 'movie' ? 'movie' : 'show'}-${tmdbId}.jpg`;
      
      const response = await fetch(url, { method: 'HEAD' });
      
      if (response.ok) {
        return url;
      }
      
      return null;
    } catch {
      return null;
    }
  }
}
