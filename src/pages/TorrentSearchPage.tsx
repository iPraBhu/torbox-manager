import { useState } from 'react';
import { Search as SearchIcon, Loader2, Download, Magnet, FileText, Users, HardDrive, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { createTorBoxAPI } from '@/lib/torbox/endpoints';
import toast from 'react-hot-toast';

export default function TorrentSearchPage() {
  const apiKey = useAuthStore((state) => state.apiKey);
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState(20);

  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['torrent-search', query, category, limit],
    queryFn: async () => {
      if (!query.trim()) return [];
      if (!apiKey) throw new Error('No API key');

      const api = createTorBoxAPI(apiKey);
      const results = await api.searchTorrents(query.trim(), category || undefined, limit);
      return results;
    },
    enabled: !!query.trim() && !!apiKey,
  });

  const addTorrentMutation = useMutation({
    mutationFn: async (magnet: string) => {
      if (!apiKey) throw new Error('No API key');
      const api = createTorBoxAPI(apiKey);
      return api.addMagnet(magnet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Torrent added to library!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add torrent: ${error.message}`);
    },
  });

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 ** 3);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 ** 2);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Trigger search by updating the query key
    }
  };

  const handleAddTorrent = (magnet: string) => {
    addTorrentMutation.mutate(magnet);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Torrent Search</h1>
        <p className="text-slate-400 mt-2">
          Search and add torrents directly to your TorBox library
        </p>
      </div>

      {/* Search Form */}
      <div className="card p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search for torrents..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input"
                required
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input md:w-48"
            >
              <option value="">All Categories</option>
              <option value="movies">Movies</option>
              <option value="tv">TV Shows</option>
              <option value="music">Music</option>
              <option value="games">Games</option>
              <option value="software">Software</option>
              <option value="anime">Anime</option>
              <option value="books">Books</option>
              <option value="xxx">Adult</option>
            </select>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="input md:w-32"
            >
              <option value={10}>10 results</option>
              <option value={20}>20 results</option>
              <option value={50}>50 results</option>
              <option value={100}>100 results</option>
            </select>
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="btn btn-primary flex items-center gap-2 px-6"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SearchIcon className="w-4 h-4" />
              )}
              <span>Search</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {error && (
        <div className="card p-6 text-center">
          <div className="text-red-400 mb-2">Search failed</div>
          <div className="text-slate-400">{(error as Error).message}</div>
        </div>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-slate-400">
            Found {searchResults.length} results
          </div>

          <div className="space-y-3">
            {searchResults.map((result: any) => (
              <div key={result.id} className="card p-4">
                <div className="flex items-start gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg mb-2 truncate">
                      {result.name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-4 h-4" />
                        {formatSize(result.size)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {result.seeders} seeders
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {result.leechers} leechers
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(result.added)}
                      </span>
                      {result.category && (
                        <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs">
                          {result.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAddTorrent(result.magnet)}
                      disabled={addTorrentMutation.isPending}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(result.magnet)}
                      className="btn btn-secondary flex items-center gap-2"
                      title="Copy magnet link"
                    >
                      <Magnet className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchResults && searchResults.length === 0 && query.trim() && !isLoading && (
        <div className="card p-12 text-center">
          <FileText className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No results found</h3>
          <p className="text-slate-400">
            Try adjusting your search terms or category filter
          </p>
        </div>
      )}

      {!searchResults && !isLoading && !error && (
        <div className="card p-12 text-center">
          <SearchIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">Search for torrents</h3>
          <p className="text-slate-400">
            Enter a search query above to find torrents to add to your library
          </p>
        </div>
      )}
    </div>
  );
}