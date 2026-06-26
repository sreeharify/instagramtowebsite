// Cloudflare Worker — Instagram Posts + Image Proxy
// RAPIDAPI_KEY must be set: wrangler secret put RAPIDAPI_KEY

const RAPIDAPI_HOST = 'instagram120.p.rapidapi.com';
const RAPIDAPI_BASE = `https://${RAPIDAPI_HOST}`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    // ── /proxy?url=ENCODED_URL ────────────────────────────────────────────
    // Smart proxy: uses RapidAPI key for RapidAPI URLs, browser headers for CDN
    if (url.pathname === '/proxy') {
      const targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return new Response('Missing url', { status: 400, headers: CORS });
      }

      try {
        // Only send RapidAPI auth to RapidAPI endpoints — NOT to Instagram CDN
        const isRapidAPI = targetUrl.includes('rapidapi.com');
        const fetchHeaders = isRapidAPI
          ? {
              'x-rapidapi-key': env.RAPIDAPI_KEY,
              'x-rapidapi-host': RAPIDAPI_HOST,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
            }
          : {
              // For Instagram CDN — mimic a browser loading from instagram.com
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36',
              'Referer': 'https://www.instagram.com/',
              'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'sec-fetch-dest': 'image',
              'sec-fetch-mode': 'no-cors',
              'sec-fetch-site': 'cross-site',
            };

        const imgRes = await fetch(targetUrl, { headers: fetchHeaders });

        if (!imgRes.ok) {
          return new Response(`Image fetch failed: ${imgRes.status}`, {
            status: imgRes.status,
            headers: CORS,
          });
        }

        const ct = imgRes.headers.get('content-type') || 'image/jpeg';
        return new Response(imgRes.body, {
          status: 200,
          headers: {
            'Content-Type': ct,
            'Cache-Control': 'public, max-age=86400',
            ...CORS,
          },
        });
      } catch (err) {
        return new Response('Proxy error: ' + err.message, { status: 500, headers: CORS });
      }
    }

    // ── /api/instagram?username=X ─────────────────────────────────────────
    if (url.pathname === '/api/instagram') {
      const username = url.searchParams.get('username');
      if (!username) {
        return json({ error: 'username is required' }, 400);
      }

      try {
        const apiRes = await fetch(`${RAPIDAPI_BASE}/api/instagram/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-key': env.RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST,
          },
          body: JSON.stringify({ username, maxId: '' }),
        });

        if (!apiRes.ok) {
          const txt = await apiRes.text();
          return json({ error: 'RapidAPI error', detail: txt }, apiRes.status);
        }

        const data = await apiRes.json();
        const edges = data?.result?.edges || [];

        if (edges.length === 0) {
          return json({ error: 'No posts found. Make sure the account is public.' }, 404);
        }

        const workerBase = `${url.protocol}//${url.host}`;
        const images = [];

        for (const edge of edges) {
          const node = edge.node;
          if (node.carousel_media?.length > 0) {
            for (const slide of node.carousel_media) {
              const img = pickImage(slide, workerBase);
              if (img) images.push(img);
            }
          } else {
            const img = pickImage(node, workerBase);
            if (img) images.push(img);
          }
        }

        return json({ images, username });
      } catch (err) {
        return json({ error: err.message }, 500);
      }
    }

    return new Response('Not found', { status: 404, headers: CORS });
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

function pickImage(node, workerBase) {
  const candidates = node?.image_versions2?.candidates || [];
  if (!candidates.length) return null;

  // Prefer url_wrapped (goes via RapidAPI CDN) — fall back to direct CDN url
  const withWrapped = candidates.filter(c => c.url_wrapped);
  const pick = withWrapped[0] || candidates[0];
  if (!pick) return null;

  // Build the actual image URL — prefer url_wrapped (served by RapidAPI)
  const imageUrl = pick.url_wrapped
    ? `${RAPIDAPI_BASE}${pick.url_wrapped}`  // e.g. https://instagram120.p.rapidapi.com/api/instagram/get?__sig=...
    : pick.url;                               // fallback: direct Instagram CDN URL

  // Always route through /proxy so the Worker adds appropriate headers
  return {
    url: `${workerBase}/proxy?url=${encodeURIComponent(imageUrl)}`,
    width: pick.width,
    height: pick.height,
  };
}
