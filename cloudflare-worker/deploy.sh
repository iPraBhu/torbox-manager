#!/bin/bash

# Quick deploy script for Cloudflare Worker
# Run: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 TorBox Proxy Worker Deployment"
echo "=================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found"
    echo "📦 Installing wrangler..."
    npm install -g wrangler
fi

echo "✅ Wrangler found"
echo ""

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Not logged in to Cloudflare"
    echo "🌐 Opening browser for authentication..."
    wrangler login
else
    echo "✅ Already logged in to Cloudflare"
fi

echo ""
echo "📤 Deploying worker..."

cd "$(dirname "$0")"
wrangler deploy

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your worker URL from the output above"
echo "2. Edit ../src/lib/torbox/client.ts"
echo "3. Update TORBOX_API_BASE to your worker URL"
echo "4. Run 'npm run build' in the main project"
echo ""
echo "Example:"
echo "  const TORBOX_API_BASE = 'https://torbox-proxy.YOUR-SUBDOMAIN.workers.dev/v1/api';"
echo ""
