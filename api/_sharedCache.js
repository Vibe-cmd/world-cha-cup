const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function getServerCachedData(cacheKey) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return null;
  }

  const url = `${SUPABASE_URL}/rest/v1/api_cache?cache_key=eq.${encodeURIComponent(cacheKey)}&expires_at=gt.${encodeURIComponent(
    new Date().toISOString(),
  )}&select=payload`;
  const response = await fetch(url, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const rows = await response.json();
  return rows[0]?.payload ?? null;
}

export async function setServerCachedData(cacheKey, payload, ttlMs) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return;
  }

  await fetch(`${SUPABASE_URL}/rest/v1/api_cache?on_conflict=cache_key`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify({
      cache_key: cacheKey,
      payload,
      expires_at: new Date(Date.now() + ttlMs).toISOString(),
      updated_at: new Date().toISOString(),
    }),
  });
}
