import { useState } from 'react';
import { AlertCircle, Film, ChevronRight, HardDrive, Clock, Download } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import type { MediaItem, MediaType } from '@/types';
import MediaDetailModal from './MediaDetailModal';
import { parseReleaseName, getGroupKey } from '@/lib/utils/releaseParser';
import { motion, AnimatePresence } from 'framer-motion';

interface GroupedMediaGridProps {
  items: MediaItem[];
  isLoading: boolean;
  error: Error | null;
}

interface GroupedMedia {
  key: string;
  title: string;
  year?: number;
  season?: number;
  type: MediaType;
  posterUrl?: string;
  items: MediaItem[];
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export default function GroupedMediaGrid({ items, isLoading, error }: GroupedMediaGridProps) {
  const gridSize = useSettingsStore((state) => state.gridSize);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const gridCols = {
    small: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8',
    medium: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
    large: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  };

  // Group items by title, year, and season
  const groupedItems: GroupedMedia[] = [];
  const groupMap = new Map<string, GroupedMedia>();

  items.forEach((item) => {
    const parsed = parseReleaseName(item.torbox?.name || item.title);
    const groupKey = getGroupKey(parsed);

    let group = groupMap.get(groupKey);
    if (!group) {
      group = {
        key: groupKey,
        title: parsed.title || item.title,
        year: parsed.year || item.year,
        season: parsed.season,
        type: item.type,
        posterUrl: item.posterUrl,
        items: [],
      };
      groupMap.set(groupKey, group);
      groupedItems.push(group);
    }

    // Use the best poster from the group
    if (item.posterUrl && !group.posterUrl) {
      group.posterUrl = item.posterUrl;
    }

    group.items.push(item);
  });

  // Sort groups by latest added date
  groupedItems.sort((a, b) => {
    const aLatest = Math.max(...a.items.map(i => new Date(i.torbox?.addedAt || 0).getTime()));
    const bLatest = Math.max(...b.items.map(i => new Date(i.torbox?.addedAt || 0).getTime()));
    return bLatest - aLatest;
  });

  const toggleGroup = (key: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedGroups(newExpanded);
  };

  if (error) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load library</h3>
        <p className="text-slate-400">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`grid ${gridCols[gridSize]} gap-4`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[2/3] bg-slate-800 rounded-lg" />
            <div className="h-4 bg-slate-800 rounded mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (groupedItems.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Film className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-300 mb-2">No media found</h3>
        <p className="text-slate-400">Your library is empty or no items match your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groupedItems.map((group) => {
        const isExpanded = expandedGroups.has(group.key);
        const totalSize = group.items.reduce((sum, item) => sum + (item.torbox?.size || 0), 0);
        const latestDate = new Date(Math.max(...group.items.map(i => new Date(i.torbox?.addedAt || 0).getTime())));

        return (
          <motion.div
            key={group.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card overflow-hidden"
          >
            {/* Group Header */}
            <div
              className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
              onClick={() => toggleGroup(group.key)}
            >
              {/* Poster Thumbnail */}
              <div className="w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-slate-800">
                {group.posterUrl ? (
                  <img
                    src={group.posterUrl}
                    alt={group.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-8 h-8 text-slate-600" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold truncate">
                    {group.title}
                    {group.year && <span className="text-slate-400 ml-2">({group.year})</span>}
                    {group.season && <span className="text-primary-400 ml-2">Season {group.season}</span>}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary-500/20 text-primary-400 flex-shrink-0">
                    {group.items.length} {group.items.length === 1 ? 'version' : 'versions'}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-4 h-4" />
                    {formatFileSize(totalSize)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {latestDate.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Expand Icon */}
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </motion.div>
              </div>
            </div>

            {/* Expanded Streams List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-slate-800 bg-slate-900/50">
                    <div className="p-4 space-y-2">
                      {group.items.map((item, idx) => {
                        const parsed = parseReleaseName(item.torbox?.name || item.title);
                        const quality = [parsed.resolution, parsed.quality].filter(Boolean).join(' • ');
                        
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-slate-200 truncate">
                                  {item.torbox?.name || item.title}
                                </span>
                                {quality && (
                                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-500/20 text-primary-400 flex-shrink-0">
                                    {quality}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span>{formatFileSize(item.torbox?.size || 0)}</span>
                                <span>{new Date(item.torbox?.addedAt || 0).toLocaleDateString()}</span>
                                {item.torbox?.files && Array.isArray(item.torbox.files) && (
                                  <span>{item.torbox.files.length} {item.torbox.files.length === 1 ? 'file' : 'files'}</span>
                                )}
                              </div>
                            </div>
                            <button
                              className="p-2 rounded-lg bg-primary-500/10 text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedItem(item);
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Detail Modal */}
      {selectedItem && (
        <MediaDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
