# TorBox Media Manager

A polished, 100% client-side web application for managing your TorBox media library. Built with React, TypeScript, and Vite.

![TorBox Media Manager](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

### Core Functionality
- 🔐 **Secure Authentication** - TorBox API key stored locally in browser
- 📚 **Library Browser** - View all your TorBox content with beautiful posters
- 🔍 **Smart Search** - Search for media and check cache availability
- 🎨 **Rich Metadata** - Integration with TMDB for posters and details
- ⚡ **Offline Support** - PWA with offline capability
- 📱 **Fully Responsive** - Mobile-first design that works everywhere

### Advanced Features
- **RPDB Integration** - Enhanced poster quality with RatingPosterDB
- **Flexible Grid Views** - Small, medium, or large poster grids
- **Smart Filtering** - Filter by type, search, and sort options
- **Download Management** - Download files directly from TorBox
- **Real-time Sync** - Always up-to-date with your TorBox library

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand + TanStack Query
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa + Workbox

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- TorBox account with API key ([Get one here](https://torbox.app/settings))
- (Optional) TMDB API key for enhanced metadata ([Get one here](https://www.themoviedb.org/settings/api))
- (Optional) RPDB API key for premium posters ([Get one here](https://ratingposterdb.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd torbox-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment (optional)**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your TMDB API key:
   ```
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```
   
   > **Note**: RPDB API key is configured in the app's Settings page, not in `.env`

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173)

5. **Build for production**
   ```bash
   npm run build
   ```
   
   The built files will be in the `dist` folder.

6. **Preview production build**
   ```bash
   npm run preview
   ```

## Usage

### First Time Setup

1. Open the app and you'll see the login page
2. Enter your TorBox API key
3. Click "Sign In"
4. Your API key is validated and stored locally (never sent anywhere else)

### Library Management

- **View Library**: Browse all your TorBox content with rich metadata
- **Filter & Sort**: Use the controls to filter by type and sort by date/title/size
- **View Details**: Click any poster to see full details, files, and actions
- **Download**: Click the download button to get direct download links
- **Remove**: Remove items from your TorBox library

### Search

- Search for any movie or TV show by title
- Include year for better results: "Inception 2010"
- Search by IMDB ID: "tt1375666"
- See cache status instantly
- Add uncached items to TorBox (requires torrent/magnet integration)

### Settings

- **RPDB Posters**: Enable and configure RPDB for enhanced posters
- **Grid Size**: Choose small, medium, or large poster grids
- **Show Badges**: Toggle cache status and media type badges
- **Poster Priority**: Set your preferred poster source

## Privacy & Security

🔒 **Your data stays on your device:**
- API keys are stored in browser localStorage only
- No backend server - all API calls are made directly from your browser
- No analytics or tracking
- No data is sent to third parties (except TorBox, TMDB, and RPDB APIs)

## Troubleshooting

### CORS Errors (Most Common Issue)

**The TorBox API does not support direct browser requests due to CORS restrictions.** This is expected and a known limitation of client-side applications.

#### Workarounds:

**Option 1: Browser Extension (Easiest for Development)**
- Install a CORS unblock extension:
  - Chrome: [Allow CORS: Access-Control-Allow-Origin](https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)
  - Firefox: [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)
- Enable the extension for `https://api.torbox.app`
- Refresh the page and try logging in again

**Option 2: Chrome with CORS Disabled (Development Only)**
```bash
# macOS/Linux
google-chrome --disable-web-security --user-data-dir=/tmp/chrome-dev

# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir=C:\tmp\chrome-dev
```

**Option 3: Deploy with Reverse Proxy (Production)**

For production deployment, use a reverse proxy to bypass CORS. We've included a **ready-to-deploy Cloudflare Worker** in the `cloudflare-worker/` directory.

**Quick Deploy (5 minutes):**

1. Go to [Cloudflare Workers Dashboard](https://dash.cloudflare.com/)
2. Create a new Worker
3. Copy code from `cloudflare-worker/worker.js` and paste it
4. Click "Save and Deploy"
5. Copy your worker URL (e.g., `https://torbox-proxy.your-subdomain.workers.dev`)
6. Update `src/lib/torbox/client.ts`:
   ```typescript
   const TORBOX_API_BASE = 'https://torbox-proxy.your-subdomain.workers.dev/v1/api';
   ```
7. Rebuild: `npm run build`

**Or use CLI:**
```bash
cd cloudflare-worker
npm install -g wrangler
wrangler login
wrangler deploy
```

See [cloudflare-worker/README.md](cloudflare-worker/README.md) for full instructions, security enhancements, and custom domain setup.

### API Key Invalid

- Double-check your API key from TorBox settings
- Ensure no extra spaces when pasting
- Try generating a new API key

### No Posters Showing

- **Without TMDB**: You'll see placeholder icons instead of posters
- **Add TMDB Key**: Get a free API key from TMDB and add to `.env`
- **RPDB Not Working**: Verify your RPDB API key in Settings

### Library Not Loading

1. Check browser console for errors (F12)
2. Verify your TorBox account has content
3. Try the refresh button
4. Clear browser cache and reload

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Layout.tsx
│   ├── Navbar.tsx
│   ├── MediaGrid.tsx
│   ├── MediaCard.tsx
│   ├── MediaDetailModal.tsx
│   └── SearchResults.tsx
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── LibraryPage.tsx
│   ├── SearchPage.tsx
│   └── SettingsPage.tsx
├── lib/                # API clients and utilities
│   ├── torbox/
│   │   ├── client.ts
│   │   └── endpoints.ts
│   └── search/
│       ├── tmdb.ts
│       ├── rpdb.ts
│       └── resolver.ts
├── stores/             # Zustand stores
│   ├── authStore.ts
│   └── settingsStore.ts
├── types/              # TypeScript types
│   └── index.ts
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

### Key APIs

- **TorBox**: https://api.torbox.app/docs
- **TMDB**: https://developers.themoviedb.org/3
- **RPDB**: https://ratingposterdb.com

### Adding Features

The codebase is structured for easy extension:

1. **New API endpoint**: Add to `src/lib/torbox/endpoints.ts`
2. **New metadata source**: Create provider in `src/lib/search/`
3. **New page**: Add component in `src/pages/` and route in `App.tsx`
4. **New setting**: Update types and add to `SettingsPage.tsx`

## Known Limitations

- **Torrent Search**: Search page shows results but doesn't include torrent search (requires integration with torrent indexers)
- **Streaming**: No built-in streaming player (downloads only)
- **Batch Operations**: No multi-select for batch actions
- **Real-time Updates**: Uses polling instead of WebSocket for status updates

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Disclaimer

This is a library management tool for content you own or are authorized to access. The developers are not responsible for how you use this software. Please respect copyright laws and terms of service.

## Support

- **TorBox Support**: https://torbox.app/support
- **Issues**: Open an issue on GitHub
- **Documentation**: See inline code comments

---

Built with ❤️ using React, TypeScript, and Vite