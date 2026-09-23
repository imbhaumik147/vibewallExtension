/**
 * Notes Manager for VibeWall
 * Supports main scratchpad note and multiple individual floating draggable note cards.
 */

const NotesManager = {
  config: null,
  saveTimeout: null,
  onSaveCallback: null,

  init(config, onSave) {
    this.config = config || { enabled: true, showOnScreen: true, position: { right: 32, y: 100 }, content: '', extraNotes: [] };
    if (!Array.isArray(this.config.extraNotes)) {
      this.config.extraNotes = [];
    }
    this.onSaveCallback = onSave;

    this.bindEvents();
    this.initDraggableWidget();
    this.render();
  },

  apply(config) {
    this.config = config;
    if (!Array.isArray(this.config.extraNotes)) {
      this.config.extraNotes = [];
    }
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

  addExtraNote(title = 'Note', content = '') {
    const newNote = {
      id: Date.now().toString(),
      title: title,
      content: content,
      position: { x: 700 + (this.config.extraNotes.length * 20), y: 100 + (this.config.extraNotes.length * 20) }
    };
    this.config.extraNotes.push(newNote);
    this.save();
    this.render();
  },

  deleteExtraNote(id) {
    this.config.extraNotes = this.config.extraNotes.filter(n => n.id !== id);
    this.save();
    this.render();
  },

  bindEvents() {
    const textareas = document.querySelectorAll('.notes-textarea-instance');

    textareas.forEach(ta => {
      ta.addEventListener('input', (e) => {
        const val = e.target.value;
        this.config.content = val;

        // Sync other main textareas
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
        if (confirm('Clear main note content?')) {
          this.config.content = '';
          textareas.forEach(t => t.value = '');
          this.updateStats('');
          this.save();
        }
      });
    });

    // Add note buttons
    const addNoteBtn = document.getElementById('btn-add-note');
    if (addNoteBtn) {
      addNoteBtn.addEventListener('click', () => {
        this.addExtraNote('Note', '');
      });
    }
    const addNoteDrawerBtn = document.getElementById('btn-add-note-drawer');
    if (addNoteDrawerBtn) {
      addNoteDrawerBtn.addEventListener('click', () => {
        this.addExtraNote('Note', '');
      });
    }
  },

  editNoteTitle(id) {
    const note = (this.config.extraNotes || []).find(n => n.id === id);
    if (!note) return;

    const newTitle = prompt('Edit Note Title:', note.title || 'Note');
    if (newTitle !== null && newTitle.trim() !== '') {
      note.title = newTitle.trim();
      this.save();
      this.render();
    }
  },

  renderIndividualFloatingNoteWidgets() {
    const container = document.getElementById('floating-notes-container');
    if (!container) return;

    const notes = this.config.extraNotes || [];
    const activeWidgetIds = new Set();

    notes.forEach((note, index) => {
      const widgetId = `widget-note-${note.id}`;
      activeWidgetIds.add(widgetId);

      let widgetEl = document.getElementById(widgetId);
      const isNew = !widgetEl;

      if (isNew) {
        widgetEl = document.createElement('div');
        widgetEl.id = widgetId;
        widgetEl.className = 'screen-widget standalone-note-card glass-panel';
        container.appendChild(widgetEl);

        if (!note.position) {
          note.position = { x: 700 + (index * 20), y: 100 + (index * 20) };
        }
      }

      if (note.position) {
        if (typeof note.position.x === 'number') widgetEl.style.left = `${note.position.x}px`;
        if (typeof note.position.y === 'number') widgetEl.style.top = `${note.position.y}px`;
      }
      if (note.size) {
        if (typeof note.size.width === 'number') widgetEl.style.width = `${note.size.width}px`;
        if (typeof note.size.height === 'number') widgetEl.style.height = `${note.size.height}px`;
      }

      widgetEl.innerHTML = `
        <div class="widget-header">
          <div class="widget-title-group" style="flex: 1; overflow: hidden;">
            <span class="widget-drag-handle">⠿</span>
            <span class="note-title-text" style="font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">📝 ${this.escapeHtml(note.title || 'Note')}</span>
          </div>
          <div class="widget-controls">
            <button class="widget-btn note-card-edit-btn" title="Edit Note Title">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="widget-btn note-card-delete-btn" title="Delete Note">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="widget-body" style="padding: 8px;">
          <textarea class="notes-textarea extra-note-textarea" placeholder="Type your note here..." style="width: 100%; height: 120px; background: transparent; border: none; color: #fff; font-family: inherit; font-size: 13px; resize: none; outline: none;">${this.escapeHtml(note.content || '')}</textarea>
        </div>
        <div class="widget-resize-handle" title="Drag to resize note card">◢</div>
      `;

      const ta = widgetEl.querySelector('.extra-note-textarea');
      ta.addEventListener('input', (e) => {
        note.content = e.target.value;
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
          this.save();
        }, 500);
      });

      widgetEl.querySelector('.note-card-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.editNoteTitle(note.id);
      });

      widgetEl.querySelector('.note-card-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteExtraNote(note.id);
      });

      const handle = widgetEl.querySelector('.widget-header');
      if (handle && typeof makeDraggable === 'function') {
        makeDraggable(widgetEl, handle, (pos) => {
          note.position = pos;
          this.save();
        });
      }
      const resizeHandle = widgetEl.querySelector('.widget-resize-handle');
      if (resizeHandle && typeof makeResizable === 'function') {
        makeResizable(widgetEl, resizeHandle, (size) => {
          note.size = size;
          this.save();
        });
      }
    });

    Array.from(container.children).forEach(child => {
      if (!activeWidgetIds.has(child.id)) {
        child.remove();
      }
    });
  },

  render() {
    const content = this.config.content || '';
    document.querySelectorAll('.notes-textarea-instance').forEach(t => {
      t.value = content;
    });
    this.updateStats(content);

    this.renderIndividualFloatingNoteWidgets();
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
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.NotesManager = NotesManager;
