/**
 * Main Coordinator for VibeWall Extension
 */

async function initVibeWall() {
  try {
    // 1. Load persisted settings
    const settings = await window.StorageManager.getSettings();

    // 2. Initialize Wallpaper
    if (window.WallpaperManager) {
      window.WallpaperManager.init(settings.wallpaper);
    }

    // 3. Initialize Clock
    if (window.ClockManager) {
      window.ClockManager.init(settings.clock);
    }

    // 4. Initialize Search
    if (window.SearchManager) {
      window.SearchManager.init(settings.search);
    }

    // 5. Initialize Shortcuts with persistence callback
    if (window.ShortcutsManager) {
      window.ShortcutsManager.init(settings.shortcuts, async (newShortcutsConfig) => {
        settings.shortcuts = newShortcutsConfig;
        await window.StorageManager.saveSettings(settings);
      });
    }

    // 6. Initialize Weather
    if (window.WeatherManager) {
      window.WeatherManager.init(settings.weather, async (newWeatherConfig) => {
        settings.weather = newWeatherConfig;
        await window.StorageManager.saveSettings(settings);
      });
    }

    // 7. Initialize Tasks / Todo
    if (window.TodoManager) {
      window.TodoManager.init(settings.todo, async (newTodoConfig) => {
        settings.todo = newTodoConfig;
        await window.StorageManager.saveSettings(settings);
      });
    }

    // 8. Initialize Scratchpad Notes
    if (window.NotesManager) {
      window.NotesManager.init(settings.notes, async (newNotesConfig) => {
        settings.notes = newNotesConfig;
        await window.StorageManager.saveSettings(settings);
      });
    }

    // 9. Initialize Customize Drawer with update callback
    if (window.CustomizeDrawer) {
      window.CustomizeDrawer.init(settings, async (updatedSettings) => {
        // Apply updates to active components
        window.WallpaperManager.apply(updatedSettings.wallpaper);
        window.ClockManager.updateConfig(updatedSettings.clock);
        window.SearchManager.apply(updatedSettings.search);
        window.ShortcutsManager.apply(updatedSettings.shortcuts);
        if (window.WeatherManager) window.WeatherManager.apply(updatedSettings.weather);
        window.CustomizeDrawer.applyAppearanceVariables();

        // Persist to sync and local storage
        await window.StorageManager.saveSettings(updatedSettings);
      });

      // 10. Apply global appearance CSS variables
      window.CustomizeDrawer.applyAppearanceVariables();
    }

    document.body.classList.add('ready');

  } catch (err) {
    console.error('Failed initializing VibeWall:', err);
    document.body.classList.add('ready');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVibeWall);
} else {
  initVibeWall();
}
