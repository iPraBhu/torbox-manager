// Cloudflare Worker to proxy TorBox API requests and bypass CORS restrictions
// Deploy this worker and update TORBOX_API_BASE in src/lib/torbox/client.ts

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Build the TorBox API URL
    const torboxUrl = 'https://api.torbox.app' + url.pathname + url.search;

    try {
      // Forward the request to TorBox API
      const torboxRequest = new Request(torboxUrl, {
        method: request.method,
        headers: request.headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' 
          ? await request.arrayBuffer() 
          : undefined,
      });

      // Fetch from TorBox API
      const response = await fetch(torboxRequest);

      // Clone the response
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      // Add CORS headers
      newResponse.headers.set('Access-Control-Allow-Origin', '*');
      newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newResponse.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');

      return newResponse;
    } catch (error) {
      // Return error with CORS headers
      return new Response(
        JSON.stringify({ 
          error: 'Proxy error', 
          message: error.message 
        }), 
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
