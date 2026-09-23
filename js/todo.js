/**
 * Todo Manager for VibeWall
 * Supports both on-screen floating draggable widget and drawer page.
 */

const TodoManager = {
  config: null,
  onSaveCallback: null,

  init(config, onSave) {
    this.config = config || { enabled: true, showOnScreen: true, position: { x: 32, y: 100 }, items: [] };
    this.onSaveCallback = onSave;

    this.bindEvents();
    this.initDraggableWidget();
    this.render();
  },

  apply(config) {
    this.config = config;
    const screenEl = document.getElementById('screen-todo-widget');
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
    const screenEl = document.getElementById('screen-todo-widget');
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
      if (this.config.position.right) screenEl.style.right = `${this.config.position.right}px`;
    }

    screenEl.style.display = this.config.showOnScreen !== false ? 'block' : 'none';
  },

  bindEvents() {
    // Form submit handlers (binds to both screen and drawer forms)
    document.querySelectorAll('.todo-form-instance').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.todo-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const newItem = {
          id: Date.now().toString(),
          text,
          completed: false,
          createdAt: Date.now()
        };

        this.config.items = this.config.items || [];
        this.config.items.unshift(newItem);
        document.querySelectorAll('.todo-input').forEach(inp => inp.value = '');
        this.render();
        this.save();
      });
    });

    // Clear completed buttons
    document.querySelectorAll('.todo-clear-completed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.config.items = (this.config.items || []).filter(item => !item.completed);
        this.render();
        this.save();
      });
    });
  },

  toggleItem(id) {
    const item = (this.config.items || []).find(it => it.id === id);
    if (item) {
      item.completed = !item.completed;
      this.render();
      this.save();
    }
  },

  deleteItem(id) {
    this.config.items = (this.config.items || []).filter(it => it.id !== id);
    this.render();
    this.save();
  },

  render() {
    const items = this.config.items || [];
    const remaining = items.filter(it => !it.completed).length;

    // Update counter badges
    document.querySelectorAll('.todo-counter-badge').forEach(badge => {
      badge.textContent = remaining > 0 ? remaining : '';
      badge.style.display = remaining > 0 ? 'inline-block' : 'none';
    });

    // Render lists in both instances (screen widget and drawer page)
    const lists = document.querySelectorAll('.todo-list-instance');
    lists.forEach(listEl => {
      listEl.innerHTML = '';

      if (items.length === 0) {
        listEl.innerHTML = `
          <div class="todo-empty-state">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p style="font-size: 12.5px;">No tasks. Add one above!</p>
          </div>
        `;
        return;
      }

      items.forEach(item => {
        const li = document.createElement('li');
        li.className = `todo-item ${item.completed ? 'completed' : ''}`;
        li.innerHTML = `
          <label class="todo-item-label">
            <input type="checkbox" class="todo-checkbox" ${item.completed ? 'checked' : ''} />
            <span class="todo-item-check-custom"></span>
            <span class="todo-item-text">${this.escapeHtml(item.text)}</span>
          </label>
          <button class="todo-delete-btn" title="Delete task" aria-label="Delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        `;

        li.querySelector('.todo-checkbox').addEventListener('change', () => this.toggleItem(item.id));
        li.querySelector('.todo-delete-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteItem(item.id);
        });

        listEl.appendChild(li);
      });
    });
  },

  save() {
    if (this.onSaveCallback) {
      this.onSaveCallback(this.config);
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
};

window.TodoManager = TodoManager;
