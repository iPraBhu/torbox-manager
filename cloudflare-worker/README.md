# Cloudflare Worker Deployment Guide

This directory contains a Cloudflare Worker that proxies TorBox API requests to bypass CORS restrictions.

## Prerequisites

- Cloudflare account (free tier works)
- Node.js and npm installed

## Quick Start (Cloudflare Dashboard)

### Option 1: Deploy via Dashboard (Easiest)

1. **Go to Cloudflare Workers Dashboard**
   - Visit https://dash.cloudflare.com/
   - Navigate to **Workers & Pages** → **Create Application** → **Create Worker**

2. **Copy and Paste Worker Code**
   - Copy the contents of `worker.js` 
   - Paste into the Cloudflare editor
   - Click **Save and Deploy**

3. **Note Your Worker URL**
   - You'll get a URL like: `https://torbox-proxy.your-subdomain.workers.dev`
   - Copy this URL

4. **Update Your App**
   - Edit `/workspaces/torbox-manager/src/lib/torbox/client.ts`
   - Change line 4:
     ```typescript
     // From:
     const TORBOX_API_BASE = 'https://api.torbox.app/v1/api';
     
     // To:
     const TORBOX_API_BASE = 'https://torbox-proxy.your-subdomain.workers.dev/v1/api';
     ```
   - Rebuild your app: `npm run build`

---

## Advanced: Deploy via Wrangler CLI

### Option 2: CLI Deployment

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Deploy the Worker**
   ```bash
   cd cloudflare-worker
   wrangler deploy
   ```

4. **Get Your Worker URL**
   ```bash
   # Output will show:
   # Published torbox-proxy (X.XX sec)
   #   https://torbox-proxy.your-subdomain.workers.dev
   ```

5. **Update Your App** (same as above)

---

## Custom Domain (Optional)

### Using Your Own Domain

1. **Add Domain to Cloudflare**
   - Add your domain to Cloudflare (free)
   - Update nameservers

2. **Configure Route in wrangler.toml**
   ```toml
   routes = [
     { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
   ]
   ```

3. **Deploy**
   ```bash
   wrangler deploy
   ```

4. **Update App to Use Custom Domain**
   ```typescript
   const TORBOX_API_BASE = 'https://api.yourdomain.com/v1/api';
   ```

---

## Testing Your Worker

### Test with curl

```bash
# Replace with your worker URL
WORKER_URL="https://torbox-proxy.your-subdomain.workers.dev"
API_KEY="your_torbox_api_key"

# Test user endpoint
curl -H "Authorization: Bearer $API_KEY" \
  "$WORKER_URL/v1/api/user/me"
```

### Test in Browser Console

```javascript
fetch('https://torbox-proxy.your-subdomain.workers.dev/v1/api/user/me', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(r => r.json())
.then(console.log);
```

---

## Monitoring

### View Logs
```bash
wrangler tail
```

### Dashboard Analytics
- Go to Cloudflare Dashboard → Workers → Your Worker
- View request counts, errors, CPU time

---

## Security Enhancements (Optional)

### Add Rate Limiting

Edit `worker.js`:

```javascript
const RATE_LIMIT = 100; // requests per minute
const rateLimitStore = new Map();

export default {
  async fetch(request, env, ctx) {
    const ip = request.headers.get('CF-Connecting-IP');
    const key = `rate:${ip}`;
    
    // Simple in-memory rate limiting (resets on worker restart)
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const rateKey = `${key}:${minute}`;
    
    const count = rateLimitStore.get(rateKey) || 0;
    if (count >= RATE_LIMIT) {
      return new Response('Rate limit exceeded', { status: 429 });
    }
    rateLimitStore.set(rateKey, count + 1);
    
    // ... rest of the code
  }
};
```

### Add Authentication

Require a custom header:

```javascript
const PROXY_KEY = 'your-secret-key'; // Store in env variable

export default {
  async fetch(request, env, ctx) {
    const proxyKey = request.headers.get('X-Proxy-Key');
    if (proxyKey !== PROXY_KEY) {
      return new Response('Unauthorized', { status: 401 });
    }
    // ... rest of the code
  }
};
```

Then update your app to send the header:

```typescript
// In src/lib/torbox/client.ts
const headers: HeadersInit = {
  'Authorization': `Bearer ${this.apiKey}`,
  'Content-Type': 'application/json',
  'X-Proxy-Key': 'your-secret-key', // Add this
  ...options.headers,
};
```

---

## Troubleshooting

### Worker Not Deploying
- Check you're logged in: `wrangler whoami`
- Verify wrangler.toml syntax
- Try `wrangler deploy --dry-run` first

### CORS Still Not Working
- Verify worker URL in app code
- Check browser console for actual URL being called
- Test worker directly with curl
- Clear browser cache

### High Latency
- Workers run on Cloudflare's edge network (usually <50ms)
- Check TorBox API status: https://status.torbox.app
- View worker analytics in dashboard

### Rate Limits
- Free tier: 100,000 requests/day
- Upgrade to Workers Paid for unlimited ($5/10M requests)

---

## Cost Estimation

### Free Tier (Sufficient for Personal Use)
- **100,000 requests/day**
- **10ms CPU time per request**
- Cost: **$0/month**

### Paid Plan (If Needed)
- **Unlimited requests**
- **$5 per 10 million requests**
- Example: 1 million requests/month = **$0.50/month**

Personal use typically stays well within free tier limits.

---

## Alternative: Workers KV for Caching (Advanced)

Add caching to reduce TorBox API calls:

1. **Enable Workers KV**
   ```bash
   wrangler kv:namespace create "CACHE"
   ```

2. **Update wrangler.toml**
   ```toml
   [[kv_namespaces]]
   binding = "CACHE"
   id = "your-kv-namespace-id"
   ```

3. **Add Caching Logic**
   ```javascript
   const cacheKey = `cache:${url.pathname}`;
   const cached = await env.CACHE.get(cacheKey);
   
   if (cached) {
     return new Response(cached, { headers: corsHeaders });
   }
   
   // ... fetch from TorBox ...
   
   // Cache for 5 minutes
   await env.CACHE.put(cacheKey, responseText, { expirationTtl: 300 });
   ```

---

## Support

- **Cloudflare Workers Docs**: https://developers.cloudflare.com/workers/
- **Wrangler CLI Docs**: https://developers.cloudflare.com/workers/wrangler/
- **Community Discord**: https://discord.cloudflare.com/

---

## Summary

1. ✅ Copy `worker.js` code to Cloudflare Dashboard
2. ✅ Deploy and get your worker URL
3. ✅ Update `TORBOX_API_BASE` in your app
4. ✅ Rebuild and deploy your app
5. ✅ No more CORS errors!
