import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { createTorBoxAPI } from '@/lib/torbox/endpoints';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('Please enter your TorBox API key');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate API key by fetching user info
      const api = createTorBoxAPI(apiKey.trim());
      await api.getUser();
      
      // If successful, save and redirect
      login(apiKey.trim());
      toast.success('Logged in successfully!');
      navigate('/library');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // CORS errors show up as TypeError with 'Failed to fetch' message
      if (err instanceof TypeError || err.message?.includes('fetch')) {
        setError('CORS Error: TorBox API blocks browser requests. See workarounds below.');
      } else if (err.status === 401 || err.status === 403) {
        setError('Invalid API key. Please check and try again.');
      } else if (err.message?.includes('CORS')) {
        setError('CORS Error: TorBox API blocks browser requests. See workarounds below.');
      } else {
        setError(`Connection failed: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-4 rounded-2xl">
              <Film className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            TorBox Media Manager
          </h1>
          <p className="mt-2 text-slate-400">
            Sign in with your TorBox API key
          </p>
        </div>

        {/* Login Form */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
                TorBox API Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  id="apiKey"
                  name="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter your API key"
                  className="input pl-10"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start space-x-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="space-y-3 text-sm text-slate-400">
              <p className="flex items-start space-x-2">
                <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Your API key is stored locally on this device only</span>
              </p>
              <p className="text-xs">
                Don't have an API key?{' '}
                <a
                  href="https://torbox.app/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300"
                >
                  Get one from TorBox settings
                </a>
              </p>
            </div>
          </div>

          {/* CORS Workaround Notice */}
          {error?.includes('CORS') && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg animate-fade-in">
              <h4 className="text-yellow-400 font-semibold mb-2 text-sm">CORS Workaround Options:</h4>
              <ul className="text-xs text-yellow-300 space-y-2">
                <li>
                  <strong>1. Browser Extension:</strong> Install a CORS unblock extension (
                  <a
                    href="https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-200"
                  >
                    Chrome
                  </a>
                  {' / '}
                  <a
                    href="https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-200"
                  >
                    Firefox
                  </a>
                  )
                </li>
                <li>
                  <strong>2. Development:</strong> Run Chrome with{' '}
                  <code className="bg-slate-900 px-1 rounded">--disable-web-security --user-data-dir=/tmp/chrome</code>
                </li>
                <li>
                  <strong>3. Production:</strong> Deploy with a reverse proxy (Cloudflare Worker, Vercel Edge, etc.)
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
