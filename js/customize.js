/**
 * Customize Drawer Controller for Aura Tab
 * Manages the right-side sliding panel, live input bindings,
 * section tabs, preset pickers, and settings persistence.
 */

const CustomizeDrawer = {
  drawerEl: null,
  backdropEl: null,
  toggleBtn: null,
  closeBtn: null,
  settings: null,
  onUpdateCallback: null,

  init(settings, onUpdate) {
    this.settings = settings;
    this.onUpdateCallback = onUpdate;

    this.drawerEl = document.getElementById('customize-drawer');
    this.backdropEl = document.getElementById('customize-backdrop');
    this.toggleBtn = document.getElementById('customize-toggle-btn');
    this.closeBtn = document.getElementById('customize-close-btn');

    this.bindDrawerToggles();
    this.populateControls();
    this.bindControlEvents();
  },

  open() {
    if (this.drawerEl) this.drawerEl.classList.add('open');
    if (this.backdropEl) this.backdropEl.classList.add('open');
    if (this.toggleBtn) this.toggleBtn.classList.add('active');
  },

  close() {
    if (this.drawerEl) this.drawerEl.classList.remove('open');
    if (this.backdropEl) this.backdropEl.classList.remove('open');
    if (this.toggleBtn) this.toggleBtn.classList.remove('active');
  },

  toggle() {
    if (this.drawerEl && this.drawerEl.classList.contains('open')) {
      this.close();
    } else {
      this.open();
    }
  },

  bindDrawerToggles() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.openPage('page-wallpaper'));
    }

    const todoBtn = document.getElementById('trigger-todo-btn');
    if (todoBtn) {
      todoBtn.addEventListener('click', () => this.openPage('page-tasks'));
    }

    const notesBtn = document.getElementById('trigger-notes-btn');
    if (notesBtn) {
      notesBtn.addEventListener('click', () => this.openPage('page-notes'));
    }

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    if (this.backdropEl) {
      this.backdropEl.addEventListener('click', () => this.close());
    }

    // ESC to close drawer
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.drawerEl && this.drawerEl.classList.contains('open')) {
        this.close();
      }
    });

    // Navigation section tabs
    const tabBtns = document.querySelectorAll('.drawer-nav-tab');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSection = btn.getAttribute('data-target');
        this.switchPage(targetSection);
      });
    });
  },

  switchPage(targetSectionId) {
    const tabBtns = document.querySelectorAll('.drawer-nav-tab');
    tabBtns.forEach(b => {
      if (b.getAttribute('data-target') === targetSectionId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    const sections = document.querySelectorAll('.drawer-section');
    sections.forEach(sec => {
      if (sec.id === targetSectionId) {
        sec.classList.add('active');
      } else {
        sec.classList.remove('active');
      }
    });
  },

  openPage(pageId) {
    this.open();
    this.switchPage(pageId);
  },

  populateControls() {
    const s = this.settings;

    // Wallpaper controls
    const opacitySlider = document.getElementById('setting-overlay-opacity');
    const opacityVal = document.getElementById('val-overlay-opacity');
    if (opacitySlider && opacityVal) {
      opacitySlider.value = Math.round((s.wallpaper.overlayOpacity || 0.35) * 100);
      opacityVal.textContent = `${opacitySlider.value}%`;
    }

    const blurSlider = document.getElementById('setting-wallpaper-blur');
    const blurVal = document.getElementById('val-wallpaper-blur');
    if (blurSlider && blurVal) {
      blurSlider.value = s.wallpaper.blur || 0;
      blurVal.textContent = `${blurSlider.value}px`;
    }

    const fitSelect = document.getElementById('setting-wallpaper-fit');
    if (fitSelect) {
      fitSelect.value = s.wallpaper.fitMode || 'cover';
    }

    this.highlightActiveWallpaperThumbnail();

    // Clock controls
    const clockToggle = document.getElementById('setting-clock-enabled');
    if (clockToggle) clockToggle.checked = s.clock.enabled;

    const clock1224 = document.getElementById('setting-clock-format');
    if (clock1224) clock1224.value = s.clock.format || '12h';

    const clockSec = document.getElementById('setting-clock-seconds');
    if (clockSec) clockSec.checked = !!s.clock.showSeconds;

    const clockDate = document.getElementById('setting-clock-date');
    if (clockDate) clockDate.checked = s.clock.showDate !== false;

    this.highlightActiveClockStyle();

    // Search controls
    const searchToggle = document.getElementById('setting-search-enabled');
    if (searchToggle) searchToggle.checked = s.search.enabled;

    // Shortcut controls
    const shortcutToggle = document.getElementById('setting-shortcuts-enabled');
    if (shortcutToggle) shortcutToggle.checked = s.shortcuts.enabled;

    // Appearance controls
    const glassOpacitySlider = document.getElementById('setting-glass-opacity');
    const glassOpacityVal = document.getElementById('val-glass-opacity');
    if (glassOpacitySlider && glassOpacityVal) {
      glassOpacitySlider.value = Math.round((s.appearance.glassOpacity || 0.12) * 100);
      glassOpacityVal.textContent = `${glassOpacitySlider.value}%`;
    }

    const glassBlurSlider = document.getElementById('setting-glass-blur');
    const glassBlurVal = document.getElementById('val-glass-blur');
    if (glassBlurSlider && glassBlurVal) {
      glassBlurSlider.value = s.appearance.glassBlur || 16;
      glassBlurVal.textContent = `${glassBlurSlider.value}px`;
    }
  },

  highlightActiveWallpaperThumbnail() {
    const thumbs = document.querySelectorAll('.wallpaper-thumb-option');
    thumbs.forEach(thumb => {
      const path = thumb.getAttribute('data-path');
      if (this.settings.wallpaper.type === 'default' && this.settings.wallpaper.value === path) {
        thumb.classList.add('selected');
      } else {
        thumb.classList.remove('selected');
      }
    });

    const customStatus = document.getElementById('custom-wallpaper-status');
    if (customStatus) {
      if (this.settings.wallpaper.type === 'custom') {
        customStatus.textContent = 'Custom Wallpaper Active';
        customStatus.style.display = 'block';
      } else {
        customStatus.style.display = 'none';
      }
    }
  },

  highlightActiveClockStyle() {
    const styleCards = document.querySelectorAll('.clock-style-option');
    const activeStyle = parseInt(this.settings.clock.style, 10) || 1;
    styleCards.forEach(card => {
      const styleId = parseInt(card.getAttribute('data-style'), 10);
      if (styleId === activeStyle) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });
  },

  bindControlEvents() {
    // Wallpaper gallery selection
    const thumbs = document.querySelectorAll('.wallpaper-thumb-option');
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const path = thumb.getAttribute('data-path');
        this.settings.wallpaper.type = 'default';
        this.settings.wallpaper.value = path;
        delete this.settings.wallpaper.customData;
        this.highlightActiveWallpaperThumbnail();
        this.triggerUpdate();
      });
    });

    // Custom Wallpaper Upload
    const uploadInput = document.getElementById('wallpaper-file-input');
    const uploadBtn = document.getElementById('btn-upload-wallpaper');
    if (uploadBtn && uploadInput) {
      uploadBtn.addEventListener('click', () => uploadInput.click());

      uploadInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          try {
            uploadBtn.textContent = 'Processing...';
            const base64 = await window.WallpaperManager.processUploadedFile(file);
            this.settings.wallpaper.type = 'custom';
            this.settings.wallpaper.customData = base64;
            this.settings.wallpaper.fitMode = 'stretch'; // Auto-fit full custom image with 0% cutting!
            const fitSelect = document.getElementById('setting-wallpaper-fit');
            if (fitSelect) fitSelect.value = 'stretch';
            this.highlightActiveWallpaperThumbnail();
            this.triggerUpdate();
          } catch (err) {
            alert(err.message || 'Error uploading wallpaper');
          } finally {
            uploadBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              Upload Custom Image
            `;
            uploadInput.value = '';
          }
        }
      });
    }

    // Reset Wallpaper Button
    const resetWallpaperBtn = document.getElementById('btn-reset-wallpaper');
    if (resetWallpaperBtn) {
      resetWallpaperBtn.addEventListener('click', async () => {
        this.settings.wallpaper.type = 'default';
        this.settings.wallpaper.value = 'assets/wallpapers/wallpaper1.jpg';
        this.settings.wallpaper.fitMode = 'cover';
        delete this.settings.wallpaper.customData;
        await window.StorageManager.clearCustomWallpaper();
        this.highlightActiveWallpaperThumbnail();
        this.triggerUpdate();
      });
    }

    // Overlay Opacity
    const opacitySlider = document.getElementById('setting-overlay-opacity');
    const opacityVal = document.getElementById('val-overlay-opacity');
    if (opacitySlider) {
      opacitySlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.settings.wallpaper.overlayOpacity = val / 100;
        if (opacityVal) opacityVal.textContent = `${val}%`;
        window.WallpaperManager.apply(this.settings.wallpaper);
      });
      opacitySlider.addEventListener('change', () => this.triggerUpdate());
    }

    // Wallpaper Blur
    const blurSlider = document.getElementById('setting-wallpaper-blur');
    const blurVal = document.getElementById('val-wallpaper-blur');
    if (blurSlider) {
      blurSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.settings.wallpaper.blur = val;
        if (blurVal) blurVal.textContent = `${val}px`;
        window.WallpaperManager.apply(this.settings.wallpaper);
      });
      blurSlider.addEventListener('change', () => this.triggerUpdate());
    }

    const fitSelect = document.getElementById('setting-wallpaper-fit');
    if (fitSelect) {
      fitSelect.addEventListener('change', (e) => {
        this.settings.wallpaper.fitMode = e.target.value;
        window.WallpaperManager.apply(this.settings.wallpaper);
        this.triggerUpdate();
      });
    }

    // Clock Style Selection
    const clockStyles = document.querySelectorAll('.clock-style-option');
    clockStyles.forEach(opt => {
      opt.addEventListener('click', () => {
        const st = parseInt(opt.getAttribute('data-style'), 10);
        this.settings.clock.style = st;
        this.highlightActiveClockStyle();
        window.ClockManager.updateConfig(this.settings.clock);
        this.triggerUpdate();
      });
    });

    // Clock toggles
    const clockToggle = document.getElementById('setting-clock-enabled');
    if (clockToggle) {
      clockToggle.addEventListener('change', (e) => {
        this.settings.clock.enabled = e.target.checked;
        window.ClockManager.updateConfig(this.settings.clock);
        this.triggerUpdate();
      });
    }

    const clock1224 = document.getElementById('setting-clock-format');
    if (clock1224) {
      clock1224.addEventListener('change', (e) => {
        this.settings.clock.format = e.target.value;
        window.ClockManager.updateConfig(this.settings.clock);
        this.triggerUpdate();
      });
    }

    const clockSec = document.getElementById('setting-clock-seconds');
    if (clockSec) {
      clockSec.addEventListener('change', (e) => {
        this.settings.clock.showSeconds = e.target.checked;
        window.ClockManager.updateConfig(this.settings.clock);
        this.triggerUpdate();
      });
    }

    const clockDate = document.getElementById('setting-clock-date');
    if (clockDate) {
      clockDate.addEventListener('change', (e) => {
        this.settings.clock.showDate = e.target.checked;
        window.ClockManager.updateConfig(this.settings.clock);
        this.triggerUpdate();
      });
    }

    // Search Toggle
    const searchToggle = document.getElementById('setting-search-enabled');
    if (searchToggle) {
      searchToggle.addEventListener('change', (e) => {
        this.settings.search.enabled = e.target.checked;
        window.SearchManager.apply(this.settings.search);
        this.triggerUpdate();
      });
    }

    // Shortcuts Toggle
    const shortcutToggle = document.getElementById('setting-shortcuts-enabled');
    if (shortcutToggle) {
      shortcutToggle.addEventListener('change', (e) => {
        this.settings.shortcuts.enabled = e.target.checked;
        window.ShortcutsManager.apply(this.settings.shortcuts);
        this.triggerUpdate();
      });
    }

    // Appearance Controls
    const glassOpacitySlider = document.getElementById('setting-glass-opacity');
    const glassOpacityVal = document.getElementById('val-glass-opacity');
    if (glassOpacitySlider) {
      glassOpacitySlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.settings.appearance.glassOpacity = val / 100;
        if (glassOpacityVal) glassOpacityVal.textContent = `${val}%`;
        this.applyAppearanceVariables();
      });
      glassOpacitySlider.addEventListener('change', () => this.triggerUpdate());
    }

    const glassBlurSlider = document.getElementById('setting-glass-blur');
    const glassBlurVal = document.getElementById('val-glass-blur');
    if (glassBlurSlider) {
      glassBlurSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.settings.appearance.glassBlur = val;
        if (glassBlurVal) glassBlurVal.textContent = `${val}px`;
        this.applyAppearanceVariables();
      });
      glassBlurSlider.addEventListener('change', () => this.triggerUpdate());
    }

    // Weather Controls
    const weatherToggle = document.getElementById('setting-weather-enabled');
    if (weatherToggle) {
      weatherToggle.checked = this.settings.weather.enabled !== false;
      weatherToggle.addEventListener('change', (e) => {
        this.settings.weather.enabled = e.target.checked;
        if (window.WeatherManager) window.WeatherManager.apply(this.settings.weather);
        this.triggerUpdate();
      });
    }

    const weatherCityInput = document.getElementById('setting-weather-city-input');
    const saveWeatherCityBtn = document.getElementById('btn-save-weather-city');
    if (weatherCityInput && saveWeatherCityBtn) {
      weatherCityInput.value = this.settings.weather.customCity || '';
      saveWeatherCityBtn.addEventListener('click', async () => {
        const cityVal = weatherCityInput.value.trim();
        saveWeatherCityBtn.textContent = 'Saving...';
        try {
          if (!cityVal) {
            this.settings.weather.customCity = '';
            this.settings.weather.lat = null;
            this.settings.weather.lon = null;
            this.settings.weather.lastFetched = 0;
            if (window.WeatherManager) await window.WeatherManager.fetchWeather();
          } else {
            const geo = await window.WeatherManager.geocodeCity(cityVal);
            this.settings.weather.customCity = cityVal;
            this.settings.weather.city = geo.name;
            this.settings.weather.lat = geo.lat;
            this.settings.weather.lon = geo.lon;
            this.settings.weather.lastFetched = 0;
            if (window.WeatherManager) await window.WeatherManager.fetchWeather();
          }
          this.triggerUpdate();
        } catch (err) {
          alert(err.message || 'Error locating that city');
        } finally {
          saveWeatherCityBtn.textContent = 'Save';
        }
      });
    }

    const weatherUnit = document.getElementById('setting-weather-unit');
    if (weatherUnit) {
      weatherUnit.value = this.settings.weather.unit || 'celsius';
      weatherUnit.addEventListener('change', (e) => {
        this.settings.weather.unit = e.target.value;
        this.settings.weather.lastFetched = 0;
        if (window.WeatherManager) window.WeatherManager.fetchWeather();
        this.triggerUpdate();
      });
    }

    // Toggle on-screen widget buttons
    const toggleScreenTodoBtn = document.getElementById('btn-toggle-screen-todo');
    if (toggleScreenTodoBtn) {
      toggleScreenTodoBtn.addEventListener('click', () => {
        this.settings.todo.showOnScreen = !this.settings.todo.showOnScreen;
        if (window.TodoManager) window.TodoManager.apply(this.settings.todo);
        this.triggerUpdate();
      });
    }

    const toggleScreenNotesBtn = document.getElementById('btn-toggle-screen-notes');
    if (toggleScreenNotesBtn) {
      toggleScreenNotesBtn.addEventListener('click', () => {
        this.settings.notes.showOnScreen = !this.settings.notes.showOnScreen;
        if (window.NotesManager) window.NotesManager.apply(this.settings.notes);
        this.triggerUpdate();
      });
    }

    // Reset All Settings button
    const resetAllBtn = document.getElementById('btn-reset-all-settings');
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', async () => {
        if (confirm('Reset all settings to default?')) {
          this.settings = JSON.parse(JSON.stringify(window.DEFAULT_SETTINGS));
          await window.StorageManager.clearCustomWallpaper();
          this.populateControls();
          this.applyAppearanceVariables();
          this.triggerUpdate();
          location.reload();
        }
      });
    }
  },

  applyAppearanceVariables() {
    const root = document.documentElement;
    const a = this.settings.appearance;
    root.style.setProperty('--glass-opacity', a.glassOpacity || 0.12);
    root.style.setProperty('--glass-blur', `${a.glassBlur || 16}px`);
  },

  triggerUpdate() {
    if (this.onUpdateCallback) {
      this.onUpdateCallback(this.settings);
    }
  }
};

window.CustomizeDrawer = CustomizeDrawer;
