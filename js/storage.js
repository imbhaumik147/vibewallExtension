/**
 * Storage Manager for Aura Tab Chrome Extension
 * 
 * Supports both chrome.storage.sync and chrome.storage.local:
 * - Preferences, Clock settings, Shortcuts, and default wallpaper selections
 *   are stored in chrome.storage.sync so when a user signs in to another
 *   Chrome browser with the same Google email/account, their dashboard
 *   and shortcuts sync seamlessly across devices!
 * - Large custom uploaded wallpapers (base64 image strings) are stored in
 *   chrome.storage.local to avoid hitting the 8KB per-item quota of chrome.storage.sync.
 * - Graceful fallback to localStorage when running in standard web preview.
 */

const DEFAULT_SETTINGS = {
  wallpaper: {
    type: 'default', // 'default' or 'custom'
    value: 'assets/wallpapers/wallpaper1.jpg',
    fitMode: 'cover', // 'cover', 'stretch', 'contain', 'center'
    overlayOpacity: 0.35,
    blur: 0
  },
  clock: {
    enabled: true,
    style: 1, // 1: Minimal, 2: Bold, 3: Elegant, 4: Compact Pill, 5: Modern Split
    format: '12h', // '12h' or '24h'
    showSeconds: false,
    showDate: true
  },
  search: {
    enabled: true,
    engine: 'google' // extensible for future phases (bing, duckduckgo, etc.)
  },
  shortcuts: {
    enabled: true,
    items: [
      { id: '1', title: 'Google', url: 'https://www.google.com' },
      { id: '2', title: 'YouTube', url: 'https://www.youtube.com' },
      { id: '3', title: 'GitHub', url: 'https://www.github.com' },
      { id: '4', title: 'Reddit', url: 'https://www.reddit.com' },
      { id: '5', title: 'Gmail', url: 'https://mail.google.com' },
      { id: '6', title: 'Twitter / X', url: 'https://twitter.com' }
    ]
  },
  appearance: {
    glassOpacity: 0.12,
    glassBlur: 16,
    themeBrightness: 1.0
  },
  weather: {
    enabled: true,
    unit: 'celsius',
    city: 'Local Weather',
    lastFetched: 0,
    cachedData: null
  },
  todo: {
    enabled: true,
    showOnScreen: true,
    position: { x: 32, y: 100 },
    items: [
      { id: '1', type: 'goal', text: 'Get 100 Profile Reviews', targetCount: 100, currentCount: 50, completed: false, createdAt: Date.now() },
      { id: '2', type: 'task', text: 'Complete weekly project review', priority: 'high', completed: false, createdAt: Date.now() }
    ]
  },
  notes: {
    enabled: true,
    showOnScreen: true,
    position: { x: null, y: 100, right: 32 }, // right side by default
    content: 'Welcome to your draggable scratchpad! You can move this widget anywhere on your screen.'
  }
};

const StorageManager = {
  isChromeStorageAvailable() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync;
  },

  /**
   * Load entire settings object combining sync and local storage
   */
  async getSettings() {
    if (!this.isChromeStorageAvailable()) {
      try {
        const local = localStorage.getItem('vibewall_settings') || localStorage.getItem('auratab_settings');
        return local ? deepMerge(DEFAULT_SETTINGS, JSON.parse(local)) : JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      } catch (e) {
        console.warn('LocalStorage error, using defaults', e);
        return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      }
    }

    try {
      // 1. Fetch synced preferences (shortcuts, clock settings, default wallpaper choice)
      const syncedData = await new Promise((resolve) => {
        chrome.storage.sync.get(['vibewall_settings', 'auratab_settings'], (res) => {
          if (chrome.runtime.lastError) {
            console.warn('Sync storage get error:', chrome.runtime.lastError);
            resolve(null);
          } else {
            resolve(res ? (res.vibewall_settings || res.auratab_settings) : null);
          }
        });
      });

      // 2. Fetch local storage for potential large custom wallpaper data
      const localData = await new Promise((resolve) => {
        chrome.storage.local.get([
          'vibewall_custom_wallpaper', 
          'vibewall_settings',
          'auratab_custom_wallpaper',
          'auratab_settings'
        ], (res) => {
          if (chrome.runtime.lastError) {
            resolve({});
          } else {
            resolve(res || {});
          }
        });
      });

      const existingSettings = syncedData || localData.vibewall_settings || localData.auratab_settings || {};
      const base = deepMerge(DEFAULT_SETTINGS, existingSettings);

      // If user uploaded a custom wallpaper on this device, attach it from local storage
      const customWall = localData.vibewall_custom_wallpaper || localData.auratab_custom_wallpaper;
      if (base.wallpaper.type === 'custom' && customWall) {
        base.wallpaper.customData = customWall;
      }

      return base;
    } catch (err) {
      console.error('Failed reading settings:', err);
      return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
  },

  /**
   * Save settings, splitting syncable configs from local large assets
   */
  async saveSettings(settings) {
    if (!this.isChromeStorageAvailable()) {
      localStorage.setItem('vibewall_settings', JSON.stringify(settings));
      return true;
    }

    try {
      const syncClone = JSON.parse(JSON.stringify(settings));
      let customWallpaperData = null;

      // Extract large custom wallpaper if present
      if (syncClone.wallpaper && syncClone.wallpaper.customData) {
        customWallpaperData = syncClone.wallpaper.customData;
        delete syncClone.wallpaper.customData; // Keep sync payload lightweight (<8KB)
      }

      // Save syncable settings to chrome.storage.sync for cross-device synchronization
      await new Promise((resolve, reject) => {
        chrome.storage.sync.set({ vibewall_settings: syncClone }, () => {
          if (chrome.runtime.lastError) {
            console.warn('Chrome storage sync error, falling back to local:', chrome.runtime.lastError);
            chrome.storage.local.set({ vibewall_settings: syncClone }, resolve);
          } else {
            resolve();
          }
        });
      });

      // Save large image data to chrome.storage.local
      if (customWallpaperData !== null) {
        await new Promise((resolve) => {
          chrome.storage.local.set({ vibewall_custom_wallpaper: customWallpaperData }, resolve);
        });
      }

      return true;
    } catch (err) {
      console.error('Failed saving settings:', err);
      return false;
    }
  },

  /**
   * Remove custom wallpaper image from storage
   */
  async clearCustomWallpaper() {
    if (this.isChromeStorageAvailable()) {
      await new Promise((resolve) => {
        chrome.storage.local.remove(['vibewall_custom_wallpaper', 'auratab_custom_wallpaper'], resolve);
      });
    }
  }
};

function deepMerge(target, source) {
  const output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Export to window
window.StorageManager = StorageManager;
window.DEFAULT_SETTINGS = DEFAULT_SETTINGS;
