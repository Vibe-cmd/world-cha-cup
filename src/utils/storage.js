const PROFILE_KEY = 'world-cha-cup-profile';
const SETTINGS_KEY = 'world-cha-cup-settings';

function profileKey(userId) {
  return userId ? `${PROFILE_KEY}:${userId}` : PROFILE_KEY;
}

export function getLocalProfile(userId) {
  try {
    return JSON.parse(localStorage.getItem(profileKey(userId))) ?? null;
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile, userId = profile?.id) {
  if (!userId) {
    return;
  }
  localStorage.setItem(profileKey(userId), JSON.stringify(profile));
}

export function clearLocalProfile(userId) {
  if (userId) {
    localStorage.removeItem(profileKey(userId));
  }
  localStorage.removeItem(PROFILE_KEY);
}

export function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) ?? {};
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
