import { Film, Check } from 'lucide-react';
import type { MediaItem } from '@/types';
import { useSettingsStore } from '@/stores/settingsStore';

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
}

export default function MediaCard({ item, onClick }: MediaCardProps) {
  const showBadges = useSettingsStore((state) => state.showBadges);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const gb = bytes / 1024 / 1024 / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg transition-all duration-200 hover:scale-105 hover:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      {/* Poster */}
      <div className="aspect-[2/3] bg-slate-800 relative overflow-hidden">
        {item.posterUrl ? (
          <img
            src={item.posterUrl}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-12 h-12 text-slate-700" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        {/* Badges */}
        {showBadges && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {item.cachedStatus === 'cached' && (
              <div className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                <span>Cached</span>
              </div>
            )}
            {item.type && item.type !== 'other' && (
              <div className="bg-slate-900/80 text-slate-200 px-2 py-0.5 rounded text-xs font-medium">
                {item.type.toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2 text-left">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary-400 transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
          {item.year && <span>{item.year}</span>}
          {item.torbox?.size && <span>• {formatSize(item.torbox.size)}</span>}
        </div>
      </div>
    </button>
  );
}
