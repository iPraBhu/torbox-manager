import { Film, Check, Plus, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { MediaItem } from '@/types';

interface SearchResultsProps {
  result: MediaItem | null | undefined;
  isLoading: boolean;
  onCache?: (magnet: string) => void;
  isCaching?: boolean;
}

export default function SearchResults({ result, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="card p-12 text-center">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Searching...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card p-12 text-center">
        <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No results found</h3>
        <p className="text-slate-400">Try a different search term or check your spelling</p>
      </div>
    );
  }

  const isCached = result.cachedStatus === 'cached';

  return (
    <div className="card overflow-hidden">
      {/* Backdrop */}
      {result.backdropUrl && (
        <div className="relative h-48 bg-slate-800">
          <img
            src={result.backdropUrl}
            alt={result.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>
      )}

      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="w-40 aspect-[2/3] bg-slate-800 rounded-lg overflow-hidden">
              {result.posterUrl ? (
                <img
                  src={result.posterUrl}
                  alt={result.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="w-12 h-12 text-slate-700" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{result.title}</h2>
              {result.year && (
                <p className="text-lg text-slate-400 mt-1">{result.year}</p>
              )}
            </div>

            {/* Cache Status */}
            <div>
              {isCached ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Cached on TorBox</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Not cached</span>
                </div>
              )}
            </div>

            {result.overview && (
              <p className="text-slate-300 leading-relaxed">{result.overview}</p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              {result.type && (
                <div>
                  <span className="text-slate-500">Type:</span>{' '}
                  <span className="text-slate-300">{result.type.toUpperCase()}</span>
                </div>
              )}
              {result.externalIds?.imdb && (
                <div>
                  <span className="text-slate-500">IMDB:</span>{' '}
                  <a
                    href={`https://www.imdb.com/title/${result.externalIds.imdb}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300"
                  >
                    {result.externalIds.imdb}
                  </a>
                </div>
              )}
              {result.externalIds?.tmdb && (
                <div>
                  <span className="text-slate-500">TMDB:</span>{' '}
                  <span className="text-slate-300">{result.externalIds.tmdb}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              {isCached ? (
                <div className="text-sm text-slate-400">
                  ✓ This item is already in your library
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-400 w-full mb-2">
                    Note: This is a demo implementation. In production, you would search for available torrents/usenet sources and add them to TorBox.
                  </p>
                  <button
                    onClick={() => {
                      // In production, this would search for torrents and add the best one
                      toast.error('Torrent search not implemented in this demo. You would integrate with torrent search APIs here.');
                    }}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to TorBox</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
