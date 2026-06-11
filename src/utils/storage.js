const PROFILE_KEY = 'world-cha-cup-profile';
const SETTINGS_KEY = 'world-cha-cup-settings';

export function getLocalProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) ?? null;
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearLocalProfile() {
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
