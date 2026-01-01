# CORS Workarounds for TorBox Media Manager

The TorBox API does not allow direct browser requests due to CORS (Cross-Origin Resource Sharing) restrictions. This document provides several solutions.

## Why CORS Errors Occur

When a web application runs in a browser and tries to make API requests to a different domain (like `api.torbox.app`), the browser checks for CORS headers. If the API server doesn't include `Access-Control-Allow-Origin` headers, the browser blocks the request for security reasons.

## Solutions

### 1. Browser Extension (Recommended for Development)

The easiest solution for local development and personal use.

#### Chrome
1. Install [Allow CORS: Access-Control-Allow-Origin](https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf)
2. Click the extension icon
3. Toggle it ON
4. Refresh the TorBox Media Manager page

#### Firefox
1. Install [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)
2. Click the extension icon
3. Enable it
4. Refresh the TorBox Media Manager page

**Pros:**
- Quick and easy
- No code changes needed
- Works immediately

**Cons:**
- Security risk (disables CORS for all sites)
- Not suitable for sharing with others
- Extension-dependent

---

### 2. Chrome in Development Mode

Run Chrome with CORS disabled (development only).

#### macOS
```bash
open -na Google\ Chrome --args --disable-web-security --user-data-dir=/tmp/chrome-dev
```

#### Linux
```bash
google-chrome --disable-web-security --user-data-dir=/tmp/chrome-dev
```

#### Windows
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir=C:\tmp\chrome-dev
```

**Pros:**
- No extensions needed
- Full control

**Cons:**
- Separate browser instance
- Not for regular browsing (security risk)
- Need to remember command

---

### 3. Cloudflare Workers Proxy (Recommended for Production)

Deploy a tiny proxy on Cloudflare's edge network (free tier available).

#### Setup Steps

1. **Create Cloudflare Worker**
   - Go to [Cloudflare Workers](https://workers.cloudflare.com/)
   - Create a new worker

2. **Add Proxy Code**
```javascript
export default {
  async fetch(request) {
    // Parse the request URL
    const url = new URL(request.url);
    
    // Build TorBox API URL
    const torboxUrl = 'https://api.torbox.app' + url.pathname + url.search;
    
    // Forward request to TorBox
    const torboxRequest = new Request(torboxUrl, {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' 
        ? request.body 
        : undefined,
    });
    
    // Get response from TorBox
    const response = await fetch(torboxRequest);
    
    // Clone response and add CORS headers
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    
    return newResponse;
  }
}
```

3. **Deploy Worker**
   - Click "Save and Deploy"
   - Note your worker URL: `https://torbox-proxy.your-subdomain.workers.dev`

4. **Update App Configuration**

Edit `src/lib/torbox/client.ts`:
```typescript
// Change this:
const TORBOX_API_BASE = 'https://api.torbox.app/v1/api';

// To this:
const TORBOX_API_BASE = 'https://torbox-proxy.your-subdomain.workers.dev/v1/api';
```

**Pros:**
- Free tier (100,000 requests/day)
- Production-ready
- Fast (edge network)
- No browser dependencies

**Cons:**
- Requires Cloudflare account
- Extra setup step
- Public endpoint (consider adding authentication)

---

### 4. Vercel Edge Functions

If deploying to Vercel, use Edge Functions as a proxy.

#### Setup Steps

1. **Create API Route**

Create `api/torbox/[...path].ts`:
```typescript
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/torbox', '');
  const torboxUrl = `https://api.torbox.app${path}${url.search}`;

  const response = await fetch(torboxUrl, {
    method: req.method,
    headers: req.headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    },
  });
}
```

2. **Update App Configuration**
```typescript
// In src/lib/torbox/client.ts
const TORBOX_API_BASE = '/api/torbox/v1/api'; // Use relative URL
```

**Pros:**
- Integrated with Vercel deployment
- Serverless
- Free tier

**Cons:**
- Vercel-specific
- Requires Next.js or Vercel deployment

---

### 5. Self-Hosted Proxy

Use nginx, Caddy, or any reverse proxy.

#### Nginx Example

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/torbox/ {
        proxy_pass https://api.torbox.app/;
        proxy_set_header Host api.torbox.app;
        proxy_set_header Authorization $http_authorization;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type';
    }
}
```

#### Caddy Example

```
your-domain.com {
    reverse_proxy /api/torbox/* https://api.torbox.app {
        header_up Host api.torbox.app
        header_down Access-Control-Allow-Origin *
        header_down Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        header_down Access-Control-Allow-Headers "Authorization, Content-Type"
    }
}
```

---

## Security Considerations

### ⚠️ Important Notes

1. **API Key Exposure**: When using a public proxy, your API requests go through a third-party server. Never hardcode your API key in the app.

2. **Proxy Authentication**: If deploying a public proxy, consider adding authentication:
```javascript
// Cloudflare Worker with basic auth
if (request.headers.get('X-Proxy-Key') !== 'your-secret-key') {
  return new Response('Unauthorized', { status: 401 });
}
```

3. **Rate Limiting**: Add rate limiting to your proxy to prevent abuse.

4. **HTTPS Only**: Always use HTTPS for production deployments.

---

## Quick Decision Guide

- **Just testing locally?** → Use browser extension
- **Deploying to Cloudflare?** → Use Workers proxy
- **Deploying to Vercel?** → Use Edge Functions
- **Have your own server?** → Use nginx/Caddy proxy
- **Quick development?** → Chrome with CORS disabled

---

## Troubleshooting

### Extension Not Working
- Make sure it's enabled
- Try reloading the page
- Check browser console for errors

### Proxy Returning Errors
- Verify proxy URL is correct
- Check proxy logs
- Test proxy directly with curl:
  ```bash
  curl -H "Authorization: Bearer YOUR_API_KEY" \
    https://your-proxy-url/v1/api/user/me
  ```

### Still Getting CORS Errors
- Clear browser cache
- Check browser console for actual error
- Verify the proxy is adding CORS headers
- Try in incognito mode

---

## Need Help?

- Check browser console (F12) for detailed error messages
- Verify your API key is valid at https://torbox.app/settings
- Test TorBox API directly: https://api.torbox.app/docs
