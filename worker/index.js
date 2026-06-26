// Cloudflare Worker — Instagram Posts Proxy
// Deploys to workers.dev. RAPIDAPI_KEY is set as a Worker secret.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const username = url.searchParams.get('username');
    const maxId = url.searchParams.get('maxId') || '';

    if (!username) {
      return new Response(JSON.stringify({ error: 'username is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    try {
      const apiRes = await fetch('https://instagram120.p.rapidapi.com/api/instagram/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': 'instagram120.p.rapidapi.com',
          'x-rapidapi-key': env.RAPIDAPI_KEY,
        },
        body: JSON.stringify({ username, maxId }),
      });

      if (!apiRes.ok) {
        const text = await apiRes.text();
        return new Response(JSON.stringify({ error: 'API error', detail: text }), {
          status: apiRes.status,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        });
      }

      const data = await apiRes.json();
      const edges = data?.result?.edges || [];

      // Extract image URLs — skip videos/reels that have no photo, take best resolution jpg
      const images = [];
      for (const edge of edges) {
        const node = edge.node;

        // If it's a carousel post, grab each slide's image
        if (node.carousel_media && node.carousel_media.length > 0) {
          for (const slide of node.carousel_media) {
            const candidates = slide?.image_versions2?.candidates || [];
            // Pick highest resolution (first candidate)
            const best = candidates.find(c => c.url && c.url.includes('.jpg'));
            if (best) images.push({ url: best.url, width: best.width, height: best.height });
          }
        } else {
          // Regular photo or video thumbnail
          const candidates = node?.image_versions2?.candidates || [];
          const best = candidates.find(c => c.url && c.url.includes('.jpg'));
          if (best) images.push({ url: best.url, width: best.width, height: best.height });
        }
      }

      return new Response(JSON.stringify({ images, username }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }
  },
};
