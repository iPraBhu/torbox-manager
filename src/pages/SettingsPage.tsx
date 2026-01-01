import { useState } from 'react';
import { Save, Image, Grid3x3, User, Settings as SettingsIcon, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { createTorBoxAPI } from '@/lib/torbox/endpoints';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const apiKey = useAuthStore((state) => state.apiKey);
  const settings = useSettingsStore();
  const [localSettings, setLocalSettings] = useState({
    rpdbEnabled: settings.rpdbEnabled,
    rpdbApiKey: settings.rpdbApiKey,
    posterPreference: settings.posterPreference,
    gridSize: settings.gridSize,
    showBadges: settings.showBadges,
  });

  // TorBox account data
  const { data: user } = useQuery({
    queryKey: ['torbox-user', apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error('No API key');
      const api = createTorBoxAPI(apiKey);
      return api.getUser();
    },
    enabled: !!apiKey,
  });

  const { data: accountStats } = useQuery({
    queryKey: ['torbox-stats', apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error('No API key');
      const api = createTorBoxAPI(apiKey);
      return api.getAccountStats();
    },
    enabled: !!apiKey,
  });

  const { data: userSettings } = useQuery({
    queryKey: ['torbox-settings', apiKey],
    queryFn: async () => {
      if (!apiKey) throw new Error('No API key');
      const api = createTorBoxAPI(apiKey);
      return api.getUserSettings();
    },
    enabled: !!apiKey,
  });

  const handleSave = () => {
    settings.updateSettings(localSettings);
    toast.success('Settings saved!');
  };

  const hasChanges = JSON.stringify(localSettings) !== JSON.stringify({
    rpdbEnabled: settings.rpdbEnabled,
    rpdbApiKey: settings.rpdbApiKey,
    posterPreference: settings.posterPreference,
    gridSize: settings.gridSize,
    showBadges: settings.showBadges,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-400 mt-2">
          Customize your TorBox Media Manager experience
        </p>
      </div>

      {/* Poster Settings */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <Image className="w-5 h-5 text-primary-500" />
          <h2 className="text-xl font-semibold">Poster Settings</h2>
        </div>

        {/* RPDB Toggle */}
        <div>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-medium">Use RPDB Posters</div>
              <div className="text-sm text-slate-400 mt-1">
                Enhanced posters from RatingPosterDB (requires API key)
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={localSettings.rpdbEnabled}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, rpdbEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </div>
          </label>
        </div>

        {/* RPDB API Key */}
        {localSettings.rpdbEnabled && (
          <div className="animate-slide-up">
            <label className="block text-sm font-medium mb-2">RPDB API Key</label>
            <input
              type="password"
              value={localSettings.rpdbApiKey}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, rpdbApiKey: e.target.value })
              }
              placeholder="Enter your RPDB API key"
              className="input"
            />
            <p className="text-xs text-slate-400 mt-2">
              Get your API key from{' '}
              <a
                href="https://ratingposterdb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300"
              >
                ratingposterdb.com
              </a>
            </p>
          </div>
        )}

        {/* Poster Preference */}
        <div>
          <label className="block text-sm font-medium mb-2">Poster Source Priority</label>
          <select
            value={localSettings.posterPreference}
            onChange={(e) =>
              setLocalSettings({
                ...localSettings,
                posterPreference: e.target.value as any,
              })
            }
            className="input"
          >
            <option value="tmdb">TMDB (Default)</option>
            <option value="rpdb">RPDB (if available)</option>
            <option value="torbox">TorBox</option>
          </select>
        </div>
      </div>

      {/* TorBox Account Settings */}
      {apiKey && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <User className="w-5 h-5 text-primary-500" />
            <h2 className="text-xl font-semibold">TorBox Account</h2>
          </div>

          {/* Account Info */}
          {user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-lg">
              <div>
                <div className="text-sm text-slate-400">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Plan</div>
                <div className="font-medium capitalize">{user.plan}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Member Since</div>
                <div className="font-medium">{new Date(user.created_at).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Account Status</div>
                <div className="font-medium text-green-400">Active</div>
              </div>
            </div>
          )}

          {/* Account Stats */}
          {accountStats && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                <BarChart3 className="w-4 h-4 text-primary-500" />
                <h3 className="font-medium">Account Statistics</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-400">{accountStats.total_torrents}</div>
                  <div className="text-xs text-slate-400">Torrents</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-400">{accountStats.total_usenet}</div>
                  <div className="text-xs text-slate-400">Usenet</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-400">{accountStats.total_webdownloads}</div>
                  <div className="text-xs text-slate-400">Web Downloads</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-400">{(accountStats.total_size / (1024 ** 4)).toFixed(1)} TB</div>
                  <div className="text-xs text-slate-400">Total Size</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Downloaded:</span>
                  <span>{(accountStats.total_downloaded / (1024 ** 3)).toFixed(1)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Uploaded:</span>
                  <span>{(accountStats.total_uploaded / (1024 ** 3)).toFixed(1)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ratio:</span>
                  <span>{accountStats.current_ratio.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TorBox Settings */}
          {userSettings && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-2 border-b border-slate-800">
                <SettingsIcon className="w-4 h-4 text-primary-500" />
                <h3 className="font-medium">TorBox Settings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Download Directory:</span>
                  <span className="truncate ml-2">{userSettings.download_directory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Concurrent Downloads:</span>
                  <span>{userSettings.max_concurrent_downloads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Torrent Size:</span>
                  <span>{(userSettings.max_torrent_size / (1024 ** 3)).toFixed(0)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Usenet Size:</span>
                  <span>{(userSettings.max_usenet_size / (1024 ** 3)).toFixed(0)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Web Download Size:</span>
                  <span>{(userSettings.max_webdownload_size / (1024 ** 3)).toFixed(0)} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seed Until Ratio:</span>
                  <span>{userSettings.seed_until_ratio}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Display Settings */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <Grid3x3 className="w-5 h-5 text-primary-500" />
          <h2 className="text-xl font-semibold">Display Settings</h2>
        </div>

        {/* Grid Size */}
        <div>
          <label className="block text-sm font-medium mb-3">Poster Grid Size</label>
          <div className="grid grid-cols-3 gap-3">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setLocalSettings({ ...localSettings, gridSize: size })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  localSettings.gridSize === size
                    ? 'border-primary-500 bg-primary-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-center">
                  <div className="font-medium capitalize">{size}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {size === 'small' && '8 per row'}
                    {size === 'medium' && '6 per row'}
                    {size === 'large' && '5 per row'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Show Badges */}
        <div>
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <div className="font-medium">Show Status Badges</div>
              <div className="text-sm text-slate-400 mt-1">
                Display cached status and media type badges on posters
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={localSettings.showBadges}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, showBadges: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </div>
          </label>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="sticky bottom-4 animate-slide-up">
          <button
            onClick={handleSave}
            className="btn btn-primary w-full flex items-center justify-center gap-2 shadow-lg"
          >
            <Save className="w-5 h-5" />
            <span>Save Settings</span>
          </button>
        </div>
      )}

      {/* Environment Info */}
      <div className="card p-6 space-y-3">
        <h3 className="font-semibold">Environment</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">TMDB API Key:</span>
            <span className={import.meta.env.VITE_TMDB_API_KEY ? 'text-green-400' : 'text-slate-500'}>
              {import.meta.env.VITE_TMDB_API_KEY ? 'Configured' : 'Not configured'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">RPDB API Key:</span>
            <span className={localSettings.rpdbApiKey ? 'text-green-400' : 'text-slate-500'}>
              {localSettings.rpdbApiKey ? 'Configured' : 'Not configured'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
