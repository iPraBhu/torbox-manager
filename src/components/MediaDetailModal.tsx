import { X, Download, Trash2, Film, Calendar, HardDrive, File } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { createTorBoxAPI } from '@/lib/torbox/endpoints';
import type { MediaItem } from '@/types';
import toast from 'react-hot-toast';

interface MediaDetailModalProps {
  item: MediaItem;
  onClose: () => void;
}

export default function MediaDetailModal({ item, onClose }: MediaDetailModalProps) {
  const apiKey = useAuthStore((state) => state.apiKey);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!apiKey || !item.torbox) throw new Error('Missing data');
      const api = createTorBoxAPI(apiKey);
      await api.deleteTorrent(item.torbox.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library'] });
      toast.success('Removed from library');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove: ${error.message}`);
    },
  });

  const downloadMutation = useMutation({
    mutationFn: async () => {
      if (!apiKey || !item.torbox) throw new Error('Missing data');
      const api = createTorBoxAPI(apiKey);
      const link = await api.requestDownloadLink('torrent', item.torbox.id, undefined, true);
      return link;
    },
    onSuccess: (link) => {
      window.open(link, '_blank');
      toast.success('Download started');
    },
    onError: (error: Error) => {
      toast.error(`Failed to get download link: ${error.message}`);
    },
  });

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const gb = bytes / 1024 / 1024 / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-800 animate-slide-up">
        {/* Header with backdrop */}
        <div className="relative h-64 bg-slate-800">
          {item.backdropUrl ? (
            <img
              src={item.backdropUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-24 h-24 text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-900/80 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="w-48 aspect-[2/3] bg-slate-800 rounded-lg overflow-hidden">
                {item.posterUrl ? (
                  <img
                    src={item.posterUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-16 h-16 text-slate-700" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-3xl font-bold">{item.title}</h2>
                {item.year && (
                  <p className="text-lg text-slate-400 mt-1">{item.year}</p>
                )}
              </div>

              {item.overview && (
                <p className="text-slate-300 leading-relaxed">{item.overview}</p>
              )}

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {item.torbox?.addedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-slate-400">Added</div>
                      <div className="font-medium">{formatDate(item.torbox.addedAt)}</div>
                    </div>
                  </div>
                )}
                
                {item.torbox?.size && (
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-slate-400">Size</div>
                      <div className="font-medium">{formatSize(item.torbox.size)}</div>
                    </div>
                  </div>
                )}

                {item.torbox?.files && (
                  <div className="flex items-center gap-2 text-sm">
                    <File className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="text-slate-400">Files</div>
                      <div className="font-medium">{item.torbox.files.length}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4">
                <button
                  onClick={() => downloadMutation.mutate()}
                  disabled={downloadMutation.isPending}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to remove this from your library?')) {
                      deleteMutation.mutate();
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="btn btn-secondary flex items-center gap-2 hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>

          {/* Files List */}
          {item.torbox?.files && item.torbox.files.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-800">
              <h3 className="text-xl font-semibold mb-4">Files ({item.torbox.files.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {item.torbox.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-slate-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <File className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <span className="text-sm text-slate-400 flex-shrink-0 ml-4">
                      {formatSize(file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
