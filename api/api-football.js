import { getServerCachedData, setServerCachedData } from './_sharedCache.js';

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

export default async function handler(request, response) {
  const apiKey = process.env.API_FOOTBALL_KEY || process.env.VITE_API_FOOTBALL_KEY;
  const path = String(request.query.path || '').replace(/^\/+/, '');
  const query = new URLSearchParams(request.query);
  query.delete('path');

  if (!apiKey) {
    return response.status(500).json({ error: 'Missing API_FOOTBALL_KEY on Vercel.' });
  }

  if (!path) {
    return response.status(400).json({ error: 'Missing API-Football path.' });
  }

  const cacheKey = `proxy:api-football:${path}?${query}`;
  const cached = await getServerCachedData(cacheKey);
  if (cached) {
    response.setHeader('cache-control', 's-maxage=21600, stale-while-revalidate=86400');
    return response.status(200).json(cached);
  }

  const upstreamUrl = `https://v3.football.api-sports.io/${path}${query.size ? `?${query}` : ''}`;
  const upstream = await fetch(upstreamUrl, {
    headers: {
      'x-apisports-key': apiKey,
    },
  });

  const body = await upstream.text();
  const contentType = upstream.headers.get('content-type') || 'application/json';
  response.setHeader('content-type', contentType);
  response.setHeader('cache-control', 's-maxage=21600, stale-while-revalidate=86400');

  if (upstream.ok && contentType.includes('application/json')) {
    try {
      await setServerCachedData(cacheKey, JSON.parse(body), CACHE_TTL_MS);
    } catch {
      // Cache failures should never break live data.
    }
  }

  return response.status(upstream.status).send(body);
}
