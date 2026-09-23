/**
 * Search Manager for Aura Tab
 * Handles live web searches with smooth animations, clear button,
 * focus shortcuts, and extensible search engine provider architecture.
 */

const SearchManager = {
  containerEl: null,
  inputEl: null,
  clearBtn: null,
  config: null,

  ENGINES: {
    google: 'https://www.google.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    bing: 'https://www.bing.com/search?q='
  },

  init(config) {
    this.containerEl = document.getElementById('search-container');
    this.inputEl = document.getElementById('search-input');
    this.clearBtn = document.getElementById('search-clear-btn');
    this.config = config;

    this.apply(config);
    this.bindEvents();
  },

  apply(config) {
    this.config = config;
    if (!this.containerEl) return;
    this.containerEl.style.display = config && config.enabled ? 'flex' : 'none';
  },

  bindEvents() {
    if (!this.inputEl) return;

    // Search submission on Enter
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = this.inputEl.value.trim();
        if (query) {
          this.executeSearch(query);
        }
      } else if (e.key === 'Escape') {
        this.inputEl.value = '';
        this.toggleClearButton();
        this.inputEl.blur();
      }
    });

    // Input changes for clear button visibility
    this.inputEl.addEventListener('input', () => {
      this.toggleClearButton();
    });

    // Clear button action
    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => {
        this.inputEl.value = '';
        this.toggleClearButton();
        this.inputEl.focus();
      });
    }

    // Global keyboard shortcut '/' to focus search bar quickly
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== this.inputEl && !this.isEditingInput(document.activeElement)) {
        e.preventDefault();
        this.inputEl.focus();
        this.inputEl.select();
      }
    });
  },

  toggleClearButton() {
    if (this.clearBtn) {
      this.clearBtn.style.opacity = this.inputEl.value.length > 0 ? '1' : '0';
      this.clearBtn.style.pointerEvents = this.inputEl.value.length > 0 ? 'auto' : 'none';
    }
  },

  isEditingInput(el) {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  },

  executeSearch(query) {
    const engine = (this.config && this.config.engine) || 'google';
    const baseUrl = this.ENGINES[engine] || this.ENGINES.google;
    const encoded = encodeURIComponent(query);

    // Direct navigation or URL check
    if (this.isDirectUrl(query)) {
      let target = query;
      if (!/^https?:\/\//i.test(target)) {
        target = 'https://' + target;
      }
      window.location.href = target;
    } else {
      window.location.href = `${baseUrl}${encoded}`;
    }
  },

  isDirectUrl(str) {
    return /^((https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/\S*)?)$/i.test(str);
  }
};

window.SearchManager = SearchManager;
