const SETTINGS_KEY = 'rp:settings';

const defaultSettings = {
  storyEnabled: true,
  reducedMotion: false,
};

export function readSettings() {
  try {
    return {
      ...defaultSettings,
      ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'),
    };
  } catch {
    return { ...defaultSettings };
  }
}

export function applySettings(settings) {
  globalThis.rpSettings = settings;
  document.body.classList.toggle('reduced-motion', settings.reducedMotion);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {}
}
