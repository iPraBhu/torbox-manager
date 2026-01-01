import { useState } from 'react';
import { AlertCircle, Film } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import type { MediaItem } from '@/types';
import MediaCard from './MediaCard';
import MediaDetailModal from './MediaDetailModal';

interface MediaGridProps {
  items: MediaItem[];
  isLoading: boolean;
  error: Error | null;
}

export default function MediaGrid({ items, isLoading, error }: MediaGridProps) {
  const gridSize = useSettingsStore((state) => state.gridSize);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const gridCols = {
    small: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8',
    medium: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
    large: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
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

  if (items.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Film className="w-16 h-16 text-slate-700 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No items found</h3>
        <p className="text-slate-400">Your library is empty or no items match your filters</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid ${gridCols[gridSize]} gap-4`}>
        {items.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            onClick={() => setSelectedItem(item)}
          />
        ))}
      </div>

      {selectedItem && (
        <MediaDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
