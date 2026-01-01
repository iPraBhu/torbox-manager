# Cloudflare Worker Deployment from GitHub

This repository is configured for automatic Cloudflare Worker deployment directly from GitHub.

## Quick Deploy (3 Options)

### Option 1: Cloudflare Dashboard (Recommended - Automatic Git Deployment)

1. **Connect GitHub to Cloudflare**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages**
   - Click **Create Application** → **Workers** → **Create Worker**
   - Click **Connect to Git**
   - Select this repository: `iPraBhu/torbox-manager`
   - Cloudflare will automatically detect `wrangler.toml` and `worker.js`

2. **Configure Build Settings**
   - Build command: (leave empty)
   - Root directory: `/`
   - Auto-deploy: Enable (deploys on every push to main)

3. **Deploy**
   - Click **Save and Deploy**
   - Your worker will be deployed at: `https://torbox-proxy.YOUR-SUBDOMAIN.workers.dev`
   - **Copy this URL** - you'll need it for the app

4. **Update Your App**
   - Edit `src/lib/torbox/client.ts` line 4:
     ```typescript
     const TORBOX_API_BASE = 'https://torbox-proxy.YOUR-SUBDOMAIN.workers.dev/v1/api';
     ```
   - Commit and push changes
   - Your Vite app and Worker will auto-deploy!

---

### Option 2: Wrangler CLI (Local Deployment)

```bash
# Install Wrangler (already in package.json)
npm install

# Login to Cloudflare
npx wrangler login

# Deploy worker
npm run deploy:worker

# Your worker URL will be shown in the output
```

---

### Option 3: GitHub Actions (Automated CI/CD)

A GitHub Actions workflow is included that automatically deploys your worker on every push to main.

**Setup:**

1. **Get Cloudflare API Token**
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Click **Create Token**
   - Use template: **Edit Cloudflare Workers**
   - Copy the token

2. **Add Secret to GitHub**
   - Go to your repo: **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: (paste your token)
   - Click **Add secret**

3. **Get Account ID**
   - Go to Cloudflare Dashboard
   - Select **Workers & Pages**
   - Copy your **Account ID** from the right sidebar
   - Add another secret: `CLOUDFLARE_ACCOUNT_ID`

4. **Push to GitHub**
   - The workflow in `.github/workflows/deploy-worker.yml` will run automatically
   - Check **Actions** tab to see deployment progress

---

## Testing Your Worker

Once deployed, test it:

```bash
# Replace with your actual worker URL
WORKER_URL="https://torbox-proxy.YOUR-SUBDOMAIN.workers.dev"
API_KEY="your_torbox_api_key"

curl -H "Authorization: Bearer $API_KEY" \
  "$WORKER_URL/v1/api/user/me"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": 123,
    "email": "you@example.com",
    ...
  }
}
```

---

## Development

Run worker locally:

```bash
npm run dev:worker
```

This starts a local server at `http://localhost:8787`

Test locally:
```typescript
// Temporarily change in src/lib/torbox/client.ts
const TORBOX_API_BASE = 'http://localhost:8787/v1/api';
```

---

## Monitoring

### View Logs
```bash
npx wrangler tail
```

### Dashboard
- Go to **Workers & Pages** → Your Worker
- View real-time metrics, errors, and request analytics

---

## Custom Domain (Optional)

1. **Add domain to Cloudflare** (free)
2. **Update `wrangler.toml`:**
   ```toml
   routes = [
     { pattern = "api.yourdomain.com/*", zone_name = "yourdomain.com" }
   ]
   ```
3. **Deploy:** `npm run deploy:worker`
4. **Update app:** Use `https://api.yourdomain.com/v1/api`

---

## Automatic Deployments

This repo supports automatic deployments:

| Method | Trigger | Deploy Time |
|--------|---------|-------------|
| Cloudflare Git Integration | Push to main | ~30 seconds |
| GitHub Actions | Push to main | ~1 minute |
| Manual | `npm run deploy:worker` | ~10 seconds |

**Recommended:** Use Cloudflare Git Integration for both the worker and the Vite app.

---

## Environment Variables (Optional)

Add secrets to your worker:

```bash
# Set via CLI
npx wrangler secret put CUSTOM_SECRET

# Or via dashboard: Workers → Your Worker → Settings → Variables
```

Access in worker:
```javascript
export default {
  async fetch(request, env, ctx) {
    const secret = env.CUSTOM_SECRET;
    // ... use secret
  }
}
```

---

## Troubleshooting

### Worker Not Found After Deploy
- Wait 30 seconds for propagation
- Check deployment logs
- Verify `wrangler.toml` is in repo root

### Still Getting CORS Errors
- Verify worker URL is correct in app
- Test worker directly with curl
- Check browser console for actual error
- Clear browser cache

### Build Failed
- Ensure `worker.js` exists in repo root
- Check `wrangler.toml` syntax
- View build logs in Cloudflare Dashboard

---

## Cost

- **Free Tier:** 100,000 requests/day (plenty for personal use)
- **Paid Plan:** $5 per 10 million requests (optional)

Most users stay within free tier limits.

---

## Files

- `worker.js` - Worker code (in repo root)
- `wrangler.toml` - Worker configuration
- `.github/workflows/deploy-worker.yml` - CI/CD workflow
- `cloudflare-worker/` - Additional docs and scripts

---

## Support

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Deploy from Git](https://developers.cloudflare.com/workers/platform/deployments/)
