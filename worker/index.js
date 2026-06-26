// Cloudflare Worker — Instagram Posts + Image Proxy via RapidAPI
// All image requests go through RapidAPI (shows in your dashboard ✓)
// RAPIDAPI_KEY must be set as a Worker secret: wrangler secret put RAPIDAPI_KEY

const RAPIDAPI_HOST = 'instagram120.p.rapidapi.com';
const RAPIDAPI_BASE = `https://${RAPIDAPI_HOST}`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function rapidHeaders(apiKey) {
  return {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': RAPIDAPI_HOST,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0',
  };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    const url = new URL(request.url);

    // ── /proxy?url=ENCODED_URL ────────────────────────────────────────────
    // Fetches any image through RapidAPI (url_wrapped paths need the API key)
    if (url.pathname === '/proxy') {
      const targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return new Response('Missing url', { status: 400, headers: CORS });
      }

      try {
        const imgRes = await fetch(targetUrl, {
          headers: rapidHeaders(env.RAPIDAPI_KEY),
        });

        if (!imgRes.ok) {
          return new Response('Image fetch failed: ' + imgRes.status, {
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
    // Fetches posts and returns proxied image URLs (all go through RapidAPI)
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
            ...rapidHeaders(env.RAPIDAPI_KEY),
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

        const images = [];

        for (const edge of edges) {
          const node = edge.node;

          // Carousel posts — grab every slide
          if (node.carousel_media?.length > 0) {
            for (const slide of node.carousel_media) {
              const img = bestImage(slide, url.origin);
              if (img) images.push(img);
            }
          } else {
            // Single photo or video thumbnail
            const img = bestImage(node, url.origin);
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

// Pick the best image candidate and build a proxied URL through RapidAPI.
// url_wrapped paths like "/api/instagram/get?__sig=...&uri=..." are served
// by instagram120.p.rapidapi.com and count as RapidAPI requests ✓
function bestImage(node, workerOrigin) {
  const candidates = node?.image_versions2?.candidates || [];
  if (candidates.length === 0) return null;

  // Prefer url_wrapped (goes through RapidAPI) → falls back to direct url
  // Pick the highest resolution candidate that has a wrapped version
  const withWrapped = candidates.filter(c => c.url_wrapped);
  const pick = withWrapped[0] || candidates[0]; // first = highest res

  if (!pick) return null;

  // Build full RapidAPI URL from url_wrapped relative path
  const rapidApiImageUrl = pick.url_wrapped
    ? `${RAPIDAPI_BASE}${pick.url_wrapped}`
    : pick.url;

  // Return a proxied URL so the browser fetches via our Worker
  // (which adds the x-rapidapi-key header automatically)
  const proxied = `${workerOrigin}/proxy?url=${encodeURIComponent(rapidApiImageUrl)}`;

  return {
    url: proxied,           // what the <img> tag uses
    width: pick.width,
    height: pick.height,
  };
}
