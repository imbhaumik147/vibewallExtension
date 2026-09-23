/**
 * Shortcuts Manager for Aura Tab
 * Handles shortcut rendering, favicon auto-resolution, addition,
 * editing, deletion, modal dialog management, and drag-and-drop / click navigation.
 */

const ShortcutsManager = {
  containerEl: null,
  listEl: null,
  modalEl: null,
  formEl: null,
  config: null,
  editingId: null,
  onSaveCallback: null,

  init(config, onSave) {
    this.containerEl = document.getElementById('shortcuts-container');
    this.listEl = document.getElementById('shortcuts-list');
    this.modalEl = document.getElementById('shortcut-modal');
    this.formEl = document.getElementById('shortcut-form');
    this.config = config;
    this.onSaveCallback = onSave;

    this.apply(config);
    this.bindModalEvents();
  },

  apply(config) {
    this.config = config;
    if (!this.containerEl) return;
    this.containerEl.style.display = config && config.enabled ? 'block' : 'none';
    this.render();
  },

  render() {
    if (!this.listEl || !this.config) return;

    const items = this.config.items || [];
    this.listEl.innerHTML = '';

    items.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'shortcut-card glass-panel';
      card.setAttribute('data-id', item.id);

      // Extract domain for favicon
      const domain = this.extractDomain(item.url);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;

      card.innerHTML = `
        <a href="${this.escapeHtml(item.url)}" class="shortcut-link" target="_self" rel="noopener noreferrer">
          <div class="shortcut-icon-wrapper">
            <img class="shortcut-icon" src="${faviconUrl}" alt="${this.escapeHtml(item.title)}" loading="lazy" />
          </div>
          <span class="shortcut-title">${this.escapeHtml(item.title)}</span>
        </a>
        <div class="shortcut-actions">
          <button class="shortcut-action-btn edit-btn" title="Edit Shortcut" aria-label="Edit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="shortcut-action-btn delete-btn" title="Delete Shortcut" aria-label="Delete">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;

      // Fallback for failed favicon image
      const img = card.querySelector('.shortcut-icon');
      img.onerror = () => {
        img.style.display = 'none';
        const fallback = document.createElement('span');
        fallback.className = 'shortcut-icon-fallback';
        fallback.textContent = (item.title || 'W').charAt(0).toUpperCase();
        img.parentNode.appendChild(fallback);
      };

      // Card click fallback navigation
      card.addEventListener('click', (e) => {
        // If clicking action buttons, do nothing
        if (e.target.closest('.shortcut-actions')) return;
        // Navigate
        if (item.url) {
          window.location.href = item.url;
        }
      });

      // Edit click handler
      card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openModal(item);
      });

      // Delete click handler
      card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.deleteShortcut(item.id);
      });

      this.listEl.appendChild(card);
    });

    // Add Shortcut Button card
    const addCard = document.createElement('div');
    addCard.className = 'shortcut-card add-shortcut-card glass-panel';
    addCard.title = 'Add new shortcut';
    addCard.role = 'button';
    addCard.tabIndex = 0;
    addCard.innerHTML = `
      <div class="shortcut-icon-wrapper add-icon-wrapper">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </div>
      <span class="shortcut-title">Add</span>
    `;
    addCard.addEventListener('click', () => this.openModal(null));
    addCard.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openModal(null);
      }
    });
    this.listEl.appendChild(addCard);

    // Also re-render drawer shortcut list if present
    this.renderDrawerList();
  },

  openModal(item) {
    if (!this.modalEl) return;
    this.editingId = item ? item.id : null;
    const titleInput = document.getElementById('shortcut-modal-title');
    const urlInput = document.getElementById('shortcut-modal-url');
    const heading = document.getElementById('shortcut-modal-heading');

    if (item) {
      heading.textContent = 'Edit Shortcut';
      titleInput.value = item.title;
      urlInput.value = item.url;
    } else {
      heading.textContent = 'Add Shortcut';
      titleInput.value = '';
      urlInput.value = '';
    }

    this.modalEl.classList.add('open');
    setTimeout(() => titleInput.focus(), 100);
  },

  closeModal() {
    if (this.modalEl) {
      this.modalEl.classList.remove('open');
      this.editingId = null;
    }
  },

  bindModalEvents() {
    if (!this.modalEl) return;

    // Close on cancel click
    const cancelBtn = document.getElementById('shortcut-modal-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeModal());
    }

    // Close on outside click
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.closeModal();
      }
    });

    // Handle form submit
    if (this.formEl) {
      this.formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        const titleInput = document.getElementById('shortcut-modal-title');
        const urlInput = document.getElementById('shortcut-modal-url');

        let title = titleInput.value.trim();
        let url = urlInput.value.trim();

        if (!url) return;

        // Auto prepend protocol if user enters e.g. "reddit.com"
        if (!/^https?:\/\//i.test(url)) {
          url = 'https://' + url;
        }

        if (!title) {
          title = this.extractDomain(url) || 'Site';
        }

        if (this.editingId) {
          // Edit existing
          this.config.items = this.config.items.map(it => {
            if (it.id === this.editingId) {
              return { ...it, title, url };
            }
            return it;
          });
        } else {
          // Add new
          const newItem = {
            id: Date.now().toString(),
            title,
            url
          };
          this.config.items = this.config.items || [];
          this.config.items.push(newItem);
        }

        this.closeModal();
        this.render();
        if (this.onSaveCallback) this.onSaveCallback(this.config);
      });
    }

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('open')) {
        this.closeModal();
      }
    });

    // Drawer Add Shortcut Button
    const drawerAddBtn = document.getElementById('btn-drawer-add-shortcut');
    if (drawerAddBtn) {
      drawerAddBtn.addEventListener('click', () => this.openModal(null));
    }
  },

  renderDrawerList() {
    const drawerListEl = document.getElementById('drawer-shortcuts-list');
    if (!drawerListEl || !this.config) return;

    const items = this.config.items || [];
    drawerListEl.innerHTML = '';

    if (items.length === 0) {
      drawerListEl.innerHTML = '<li style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 12px;">No shortcuts added yet.</li>';
      return;
    }

    items.forEach((item) => {
      const li = document.createElement('li');
      li.className = 'drawer-shortcut-item';

      const domain = this.extractDomain(item.url);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`;

      li.innerHTML = `
        <div class="drawer-shortcut-info">
          <img class="drawer-shortcut-icon" src="${faviconUrl}" alt="" loading="lazy" />
          <div class="drawer-shortcut-texts">
            <span class="drawer-shortcut-title">${this.escapeHtml(item.title)}</span>
            <span class="drawer-shortcut-url">${this.escapeHtml(item.url)}</span>
          </div>
        </div>
        <div class="drawer-shortcut-actions">
          <button class="shortcut-action-btn edit-btn" title="Edit Shortcut">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="shortcut-action-btn delete-btn" title="Delete Shortcut">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      `;

      // Fallback for drawer favicon
      const img = li.querySelector('.drawer-shortcut-icon');
      img.onerror = () => {
        img.style.display = 'none';
      };

      // Edit click handler
      li.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openModal(item);
      });

      // Delete click handler
      li.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.deleteShortcut(item.id);
      });

      drawerListEl.appendChild(li);
    });
  },

  deleteShortcut(id) {
    if (!this.config || !this.config.items) return;
    this.config.items = this.config.items.filter(it => it.id !== id);
    this.render();
    if (this.onSaveCallback) this.onSaveCallback(this.config);
  },

  extractDomain(urlStr) {
    try {
      const u = new URL(urlStr);
      return u.hostname;
    } catch {
      return urlStr.replace(/^(?:https?:\/\/)?(?:www\.)?/i, '').split('/')[0];
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

window.ShortcutsManager = ShortcutsManager;
