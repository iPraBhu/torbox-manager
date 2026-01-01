import { useState } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { createTorBoxAPI } from '@/lib/torbox/endpoints';
import { createMetadataResolver } from '@/lib/search/resolver';

import SearchResults from '@/components/SearchResults';
import toast from 'react-hot-toast';

export default function SearchPage() {
  const apiKey = useAuthStore((state) => state.apiKey);
  const settings = useSettingsStore();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', submittedQuery, settings],
    queryFn: async () => {
      if (!submittedQuery) return null;
      
      const resolver = createMetadataResolver(settings);
      const result = await resolver.resolveByQuery(submittedQuery);
      
      if (!result) return null;

      // Check if cached in TorBox
      if (apiKey && result.externalIds?.imdb) {
        try {
          const api = createTorBoxAPI(apiKey);
          // This is a simplified check - in production you'd search for actual torrents
          const torrents = await api.getTorrents();
          const cached = torrents.some((t) =>
            t.name.toLowerCase().includes(result.title.toLowerCase())
          );
          result.cachedStatus = cached ? 'cached' : 'not_cached';
        } catch (err) {
          console.error('Failed to check cache status:', err);
        }
      }

      // Resolve poster with RPDB
      if (result.externalIds && result.posterUrl) {
        result.posterUrl = await resolver.resolvePoster(
          result.externalIds,
          result.posterUrl
        );
      }

      return result;
    },
    enabled: !!submittedQuery,
  });

  const cacheMutation = useMutation({
    mutationFn: async (magnet: string) => {
      if (!apiKey) throw new Error('Not authenticated');
      const api = createTorBoxAPI(apiKey);
      return await api.createTorrent(magnet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
      toast.success('Added to TorBox! Starting download...');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add: ${error.message}`);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSubmittedQuery(query.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Search Media</h1>
        <p className="text-slate-400">
          Search for movies, TV shows, and check if they're cached on TorBox
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="card p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, IMDB ID, or TMDB ID..."
              className="input pl-10"
            />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="btn btn-primary px-8"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>

      {/* Search Tips */}
      {!submittedQuery && (
        <div className="card p-6">
          <h3 className="font-semibold mb-3">Search Tips</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li>• Search by title: "Inception" or "Breaking Bad"</li>
            <li>• Include year for better results: "Inception 2010"</li>
            <li>• Search by IMDB ID: "tt1375666"</li>
            <li>• Search by TMDB ID: "tmdb:27205"</li>
          </ul>
        </div>
      )}

      {/* Results */}
      {submittedQuery && (
        <SearchResults
          result={searchResults}
          isLoading={isLoading}
          onCache={cacheMutation.mutate}
          isCaching={cacheMutation.isPending}
        />
      )}
    </div>
  );
}
