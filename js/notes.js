/**
 * Notes Manager for VibeWall
 * Supports both on-screen floating draggable scratchpad and drawer page.
 */

const NotesManager = {
  config: null,
  saveTimeout: null,
  onSaveCallback: null,

  init(config, onSave) {
    this.config = config || { enabled: true, showOnScreen: true, position: { right: 32, y: 100 }, content: '' };
    this.onSaveCallback = onSave;

    this.bindEvents();
    this.initDraggableWidget();
    this.render();
  },

  apply(config) {
    this.config = config;
    const screenEl = document.getElementById('screen-notes-widget');
    if (screenEl) {
      screenEl.style.display = config && config.showOnScreen !== false ? 'block' : 'none';
      if (config && config.position) {
        if (typeof config.position.x === 'number') screenEl.style.left = `${config.position.x}px`;
        if (typeof config.position.y === 'number') screenEl.style.top = `${config.position.y}px`;
      }
    }
    this.render();
  },

  initDraggableWidget() {
    const screenEl = document.getElementById('screen-notes-widget');
    if (!screenEl) return;

    const handle = screenEl.querySelector('.widget-header');
    if (handle && typeof makeDraggable === 'function') {
      makeDraggable(screenEl, handle, (pos) => {
        this.config.position = pos;
        this.save();
      });
    }

    // Close button on floating widget
    const closeBtn = screenEl.querySelector('.widget-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.config.showOnScreen = false;
        screenEl.style.display = 'none';
        this.save();
      });
    }

    // Apply saved position
    if (this.config.position) {
      if (typeof this.config.position.x === 'number') screenEl.style.left = `${this.config.position.x}px`;
      if (typeof this.config.position.y === 'number') screenEl.style.top = `${this.config.position.y}px`;
      if (this.config.position.right && typeof this.config.position.x !== 'number') {
        screenEl.style.right = `${this.config.position.right}px`;
      }
    }

    screenEl.style.display = this.config.showOnScreen !== false ? 'block' : 'none';
  },

  bindEvents() {
    const textareas = document.querySelectorAll('.notes-textarea-instance');

    textareas.forEach(ta => {
      ta.addEventListener('input', (e) => {
        const val = e.target.value;
        this.config.content = val;

        // Sync other textareas
        textareas.forEach(other => {
          if (other !== e.target) other.value = val;
        });

        this.updateStats(val);

        document.querySelectorAll('.notes-status-instance').forEach(st => {
          st.textContent = 'Saving...';
          st.style.opacity = '1';
        });

        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
          this.save();
        }, 500);
      });
    });

    // Clear buttons
    document.querySelectorAll('.notes-clear-btn-instance').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Clear note content?')) {
          this.config.content = '';
          textareas.forEach(t => t.value = '');
          this.updateStats('');
          this.save();
        }
      });
    });
  },

  render() {
    const content = this.config.content || '';
    document.querySelectorAll('.notes-textarea-instance').forEach(t => {
      t.value = content;
    });
    this.updateStats(content);
  },

  updateStats(text) {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    document.querySelectorAll('.notes-char-count-instance').forEach(cnt => {
      cnt.textContent = `${words}w · ${chars}c`;
    });
  },

  save() {
    if (this.onSaveCallback) {
      this.onSaveCallback(this.config);
    }
    document.querySelectorAll('.notes-status-instance').forEach(st => {
      st.textContent = 'Saved';
      setTimeout(() => {
        st.style.opacity = '0';
      }, 1500);
    });
  }
};

window.NotesManager = NotesManager;
