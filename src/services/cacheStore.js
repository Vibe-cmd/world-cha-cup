const MEMORY_CACHE = new Map();
const LOCAL_PREFIX = 'world-cha-cup-cache:';

function now() {
  return Date.now();
}

function readLocal(key) {
  try {
    const cached = JSON.parse(localStorage.getItem(`${LOCAL_PREFIX}${key}`));
    if (!cached || cached.expiresAt <= now()) {
      return null;
    }
    return cached.payload;
  } catch {
    return null;
  }
}

function writeLocal(key, payload, ttlMs) {
  localStorage.setItem(
    `${LOCAL_PREFIX}${key}`,
    JSON.stringify({
      payload,
      expiresAt: now() + ttlMs,
    }),
  );
}

export async function getCachedData(key) {
  const memoryItem = MEMORY_CACHE.get(key);
  if (memoryItem?.expiresAt > now()) {
    return memoryItem.payload;
  }

  const localPayload = readLocal(key);
  if (localPayload) {
    return localPayload;
  }

  return null;
}

export async function setCachedData(key, payload, ttlMs) {
  const expiresAt = now() + ttlMs;
  MEMORY_CACHE.set(key, { payload, expiresAt });
  writeLocal(key, payload, ttlMs);

}

export async function cachedRequest(key, ttlMs, fetcher) {
  const cached = await getCachedData(key);
  if (cached) {
    return cached;
  }

  const payload = await fetcher();
  await setCachedData(key, payload, ttlMs);
  return payload;
}
