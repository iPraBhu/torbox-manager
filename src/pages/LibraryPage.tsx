import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Grid3x3, Grid2x2, LayoutGrid } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { createTorBoxAPI } from '@/lib/torbox/endpoints';
import { createMetadataResolver } from '@/lib/search/resolver';
import type { MediaItem } from '@/types';
import MediaGrid from '@/components/MediaGrid';
import toast from 'react-hot-toast';

export default function LibraryPage() {
  const apiKey = useAuthStore((state) => state.apiKey);
  const settings = useSettingsStore();
  const [sortBy, setSortBy] = useState<'added' | 'title' | 'size'>('added');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'show'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: torrents, isLoading, error, refetch } = useQuery({
    queryKey: ['library', apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error('No API key');
      const api = createTorBoxAPI(apiKey);
      const data = await api.getTorrents();
      return data;
    },
    enabled: !!apiKey,
  });

  const { data: mediaItems } = useQuery({
    queryKey: ['library-metadata', torrents, settings],
    queryFn: async () => {
      if (!torrents || torrents.length === 0) return [];
      
      const resolver = createMetadataResolver(settings);
      const items: MediaItem[] = [];

      for (const torrent of torrents) {
        try {
          // Try to resolve metadata
          let metadata = await resolver.resolveByQuery(torrent.name);
          
          if (!metadata) {
            // Fallback: create basic item
            metadata = {
              id: `torbox-${torrent.id}`,
              type: 'other',
              title: torrent.name,
              cachedStatus: 'cached',
            };
          }

          // Resolve poster with RPDB if enabled
          if (metadata.externalIds && metadata.posterUrl) {
            metadata.posterUrl = await resolver.resolvePoster(
              metadata.externalIds,
              metadata.posterUrl
            );
          }

          // Add TorBox data
          metadata.torbox = {
            id: torrent.id,
            hash: torrent.hash,
            addedAt: torrent.created_at,
            size: torrent.size,
            files: torrent.files,
            status: torrent.download_state,
            progress: torrent.progress,
            name: torrent.name,
          };

          metadata.cachedStatus = 'cached';
          
          items.push(metadata);
        } catch (err) {
          console.error(`Failed to resolve metadata for ${torrent.name}:`, err);
          // Add fallback item
          items.push({
            id: `torbox-${torrent.id}`,
            type: 'other',
            title: torrent.name,
            cachedStatus: 'cached',
            torbox: {
              id: torrent.id,
              hash: torrent.hash,
              addedAt: torrent.created_at,
              size: torrent.size,
              files: torrent.files,
              status: torrent.download_state,
              progress: torrent.progress,
              name: torrent.name,
            },
          });
        }
      }

      return items;
    },
    enabled: !!torrents,
  });

  const handleRefresh = async () => {
    toast.promise(refetch(), {
      loading: 'Refreshing library...',
      success: 'Library refreshed!',
      error: 'Failed to refresh library',
    });
  };

  // Filter and sort
  const filteredItems = mediaItems?.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }) || [];

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'size':
        return (b.torbox?.size || 0) - (a.torbox?.size || 0);
      case 'added':
      default:
        return new Date(b.torbox?.addedAt || 0).getTime() - new Date(a.torbox?.addedAt || 0).getTime();
    }
  });

  const lastSync = torrents ? new Date().toLocaleString() : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Library</h1>
          {lastSync && (
            <p className="text-sm text-slate-400 mt-1">
              Last synced: {lastSync}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Filter by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="input md:w-40"
          >
            <option value="all">All Types</option>
            <option value="movie">Movies</option>
            <option value="show">Shows</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input md:w-40"
          >
            <option value="added">Date Added</option>
            <option value="title">Title</option>
            <option value="size">Size</option>
          </select>

          {/* Grid Size */}
          <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
            {(['small', 'medium', 'large'] as const).map((size) => {
              const Icon = size === 'small' ? Grid3x3 : size === 'medium' ? Grid2x2 : LayoutGrid;
              return (
                <button
                  key={size}
                  onClick={() => settings.updateSettings({ gridSize: size })}
                  className={`p-2 rounded transition-colors ${
                    settings.gridSize === size
                      ? 'bg-slate-700 text-primary-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={size.charAt(0).toUpperCase() + size.slice(1)}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Count */}
      {mediaItems && (
        <div className="text-sm text-slate-400">
          Showing {sortedItems.length} of {mediaItems.length} items
        </div>
      )}

      {/* Media Grid */}
      <MediaGrid items={sortedItems} isLoading={isLoading} error={error as Error} />
    </div>
  );
}
