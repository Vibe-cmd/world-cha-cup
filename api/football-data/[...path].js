export default async function handler(request, response) {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY || process.env.VITE_FOOTBALL_DATA_API_KEY;
  const path = Array.isArray(request.query.path) ? request.query.path.join('/') : request.query.path || '';
  const query = new URLSearchParams(request.query);
  query.delete('path');

  if (!apiKey) {
    return response.status(500).json({ error: 'Missing FOOTBALL_DATA_API_KEY on Vercel.' });
  }

  const upstreamUrl = `https://api.football-data.org/v4/${path}${query.size ? `?${query}` : ''}`;
  const upstream = await fetch(upstreamUrl, {
    headers: {
      'X-Auth-Token': apiKey,
    },
  });

  const body = await upstream.text();
  response.setHeader('content-type', upstream.headers.get('content-type') || 'application/json');
  response.setHeader('cache-control', 's-maxage=21600, stale-while-revalidate=86400');
  return response.status(upstream.status).send(body);
}
