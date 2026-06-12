import { getServerCachedData, setServerCachedData } from './_sharedCache.js';

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

export default async function handler(request, response) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY || process.env.VITE_FOOTBALL_DATA_API_KEY;
  const path = String(request.query.path || '').replace(/^\/+/, '');
  const query = new URLSearchParams(request.query);
  query.delete('path');

  if (!apiKey) {
    return response.status(500).json({ error: 'Missing FOOTBALL_DATA_API_KEY on Vercel.' });
  }

  if (!path) {
    return response.status(400).json({ error: 'Missing football-data path.' });
  }

  const cacheKey = `proxy:football-data:${path}?${query}`;
  const cached = await getServerCachedData(cacheKey);
  if (cached) {
    response.setHeader('cache-control', 's-maxage=21600, stale-while-revalidate=86400');
    return response.status(200).json(cached);
  }

  const upstreamUrl = `https://api.football-data.org/v4/${path}${query.size ? `?${query}` : ''}`;
  const upstream = await fetch(upstreamUrl, {
    headers: {
      'X-Auth-Token': apiKey,
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
