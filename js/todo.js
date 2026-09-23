/**
 * Todo & Goal Manager for VibeWall
 * Supports Standard Tasks (with Due Dates & Priority) and Goal Tracking (with progress & daily updates).
 */

const TodoManager = {
  config: null,
  onSaveCallback: null,
  activeFilter: 'all', // 'all', 'task', 'goal', 'completed'

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
    // 1. Setup Tasks Widget (#screen-todo-widget)
    const taskWidget = document.getElementById('screen-todo-widget');
    if (taskWidget) {
      const handle = taskWidget.querySelector('.widget-header');
      if (handle && typeof makeDraggable === 'function') {
        makeDraggable(taskWidget, handle, (pos) => {
          this.config.position = pos;
          this.save();
        });
      }
      const resizeHandle = taskWidget.querySelector('.widget-resize-handle');
      if (resizeHandle && typeof makeResizable === 'function') {
        makeResizable(taskWidget, resizeHandle, (size) => {
          this.config.size = size;
          this.save();
        });
      }
      const closeBtn = taskWidget.querySelector('.widget-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.config.showOnScreen = false;
          taskWidget.style.display = 'none';
          this.save();
        });
      }
      if (this.config.position) {
        if (typeof this.config.position.x === 'number') taskWidget.style.left = `${this.config.position.x}px`;
        if (typeof this.config.position.y === 'number') taskWidget.style.top = `${this.config.position.y}px`;
      }
      if (this.config.size) {
        if (typeof this.config.size.width === 'number') taskWidget.style.width = `${this.config.size.width}px`;
        if (typeof this.config.size.height === 'number') taskWidget.style.height = `${this.config.size.height}px`;
      }
      taskWidget.style.display = this.config.showOnScreen !== false ? 'block' : 'none';
    }

    // 2. Setup Standalone Goals Widget (#screen-goals-widget)
    const goalsWidget = document.getElementById('screen-goals-widget');
    if (goalsWidget) {
      this.config.goalsWidget = this.config.goalsWidget || { showOnScreen: true, position: { x: 32, y: 380 } };

      const handle = goalsWidget.querySelector('.widget-header');
      if (handle && typeof makeDraggable === 'function') {
        makeDraggable(goalsWidget, handle, (pos) => {
          this.config.goalsWidget.position = pos;
          this.save();
        });
      }
      const resizeHandle = goalsWidget.querySelector('.widget-resize-handle');
      if (resizeHandle && typeof makeResizable === 'function') {
        makeResizable(goalsWidget, resizeHandle, (size) => {
          this.config.goalsWidget.size = size;
          this.save();
        });
      }
      const closeBtn = goalsWidget.querySelector('.widget-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.config.goalsWidget.showOnScreen = false;
          goalsWidget.style.display = 'none';
          this.save();
        });
      }
      if (this.config.goalsWidget.position) {
        if (typeof this.config.goalsWidget.position.x === 'number') goalsWidget.style.left = `${this.config.goalsWidget.position.x}px`;
        if (typeof this.config.goalsWidget.position.y === 'number') goalsWidget.style.top = `${this.config.goalsWidget.position.y}px`;
      }
      if (this.config.goalsWidget.size) {
        if (typeof this.config.goalsWidget.size.width === 'number') goalsWidget.style.width = `${this.config.goalsWidget.size.width}px`;
        if (typeof this.config.goalsWidget.size.height === 'number') goalsWidget.style.height = `${this.config.goalsWidget.size.height}px`;
      }
      goalsWidget.style.display = this.config.goalsWidget.showOnScreen !== false ? 'block' : 'none';
    }

    // Header & Drawer Trigger Buttons for Goals Widget
    const triggerGoalsBtn = document.getElementById('trigger-goals-btn');
    const drawerGoalsBtn = document.getElementById('btn-toggle-screen-goals-drawer');
    const toggleGoalsHandler = () => {
      if (!goalsWidget) return;
      const isHidden = goalsWidget.style.display === 'none';
      goalsWidget.style.display = isHidden ? 'block' : 'none';
      this.config.goalsWidget = this.config.goalsWidget || {};
      this.config.goalsWidget.showOnScreen = isHidden;
      this.save();
    };

    if (triggerGoalsBtn) triggerGoalsBtn.addEventListener('click', toggleGoalsHandler);
    if (drawerGoalsBtn) drawerGoalsBtn.addEventListener('click', toggleGoalsHandler);

    // 3. Setup Notes Widget Resizing (#screen-notes-widget)
    const notesWidget = document.getElementById('screen-notes-widget');
    if (notesWidget) {
      const resizeHandle = notesWidget.querySelector('.widget-resize-handle');
      if (resizeHandle && typeof makeResizable === 'function') {
        makeResizable(notesWidget, resizeHandle, (size) => {
          if (window.NotesManager && window.NotesManager.config) {
            window.NotesManager.config.size = size;
            window.NotesManager.save();
          }
        });
      }
    }
  },

  bindEvents() {
    // Filter bar tab clicks
    document.querySelectorAll('.todo-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.currentTarget.getAttribute('data-filter');
        this.activeFilter = filter || 'all';

        // Update active class on all filter buttons
        document.querySelectorAll('.todo-filter-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-filter') === this.activeFilter);
        });

        this.render();
      });
    });

    // Form setup & type toggles
    document.querySelectorAll('.todo-form-instance').forEach(form => {
      const typeLabels = form.querySelectorAll('.todo-type-label');
      const taskOptions = form.querySelector('.todo-task-options');
      const goalOptions = form.querySelector('.todo-goal-options');
      const toggleOptionsBtn = form.querySelector('.todo-toggle-options-btn');
      const optionsPanel = form.querySelector('.todo-options-panel');

      // Task / Goal type toggle radio buttons
      typeLabels.forEach(label => {
        label.addEventListener('click', () => {
          typeLabels.forEach(l => l.classList.remove('active'));
          label.classList.add('active');
          const radio = label.querySelector('input[type="radio"]');
          if (radio) radio.checked = true;

          const selectedType = label.getAttribute('data-type');
          if (taskOptions && goalOptions) {
            if (selectedType === 'goal') {
              taskOptions.style.display = 'none';
              goalOptions.style.display = 'flex';
            } else {
              taskOptions.style.display = 'flex';
              goalOptions.style.display = 'none';
            }
          }
        });
      });

      // Toggle Options expander panel
      if (toggleOptionsBtn && optionsPanel) {
        toggleOptionsBtn.addEventListener('click', () => {
          const isHidden = optionsPanel.style.display === 'none';
          optionsPanel.style.display = isHidden ? 'block' : 'none';
          toggleOptionsBtn.classList.toggle('active', isHidden);
        });
      }

      // Submit form handler
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.todo-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        // Determine type ('task' or 'goal')
        const activeTypeLabel = form.querySelector('.todo-type-label.active');
        const type = activeTypeLabel ? activeTypeLabel.getAttribute('data-type') : 'task';

        let newItem = {
          id: Date.now().toString(),
          type: type,
          text: text,
          completed: false,
          createdAt: Date.now()
        };

        if (type === 'task') {
          const dueDateInput = form.querySelector('.todo-duedate-input');
          const prioritySelect = form.querySelector('.todo-priority-select');

          if (dueDateInput && dueDateInput.value) {
            newItem.dueDate = dueDateInput.value;
          }
          if (prioritySelect) {
            newItem.priority = prioritySelect.value || 'medium';
          }
        } else if (type === 'goal') {
          const targetInput = form.querySelector('.todo-target-input');
          const currentInput = form.querySelector('.todo-current-input');
          const goalDueDateInput = form.querySelector('.todo-goal-duedate-input');

          const targetCount = targetInput && targetInput.value ? Math.max(1, parseInt(targetInput.value, 10)) : 100;
          const currentCount = currentInput && currentInput.value ? Math.max(0, parseInt(currentInput.value, 10)) : 0;

          newItem.targetCount = targetCount;
          newItem.currentCount = currentCount;
          if (currentCount >= targetCount) {
            newItem.completed = true;
          }
          if (goalDueDateInput && goalDueDateInput.value) {
            newItem.dueDate = goalDueDateInput.value;
          }
        }

        this.config.items = this.config.items || [];
        this.config.items.unshift(newItem);

        // Reset form inputs
        document.querySelectorAll('.todo-input').forEach(inp => inp.value = '');
        if (optionsPanel) optionsPanel.style.display = 'none';
        if (toggleOptionsBtn) toggleOptionsBtn.classList.remove('active');

        this.render();
        this.save();
      });
    });

    // Standalone Goals form handler (.goals-form-instance)
    document.querySelectorAll('.goals-form-instance').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = form.querySelector('.goal-title-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        const targetInput = form.querySelector('.todo-target-input');
        const currentInput = form.querySelector('.todo-current-input');
        const targetCount = targetInput && targetInput.value ? Math.max(1, parseInt(targetInput.value, 10)) : 100;
        const currentCount = currentInput && currentInput.value ? Math.max(0, parseInt(currentInput.value, 10)) : 0;

        const newItem = {
          id: Date.now().toString(),
          type: 'goal',
          text: text,
          targetCount: targetCount,
          currentCount: currentCount,
          completed: currentCount >= targetCount,
          createdAt: Date.now()
        };

        this.config.items = this.config.items || [];
        this.config.items.unshift(newItem);

        input.value = '';
        this.render();
        this.save();
      });
    });

    // Clear completed items button
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
      if (item.type === 'goal' && item.targetCount) {
        if (item.completed) {
          item.currentCount = item.targetCount;
        }
      }
      this.render();
      this.save();
    }
  },

  incrementGoal(id, delta) {
    const item = (this.config.items || []).find(it => it.id === id);
    if (item && item.type === 'goal') {
      const target = item.targetCount || 100;
      let current = (typeof item.currentCount === 'number' ? item.currentCount : 0) + delta;
      if (current < 0) current = 0;

      item.currentCount = current;
      if (current >= target) {
        item.completed = true;
      } else {
        item.completed = false;
      }
      this.render();
      this.save();
    }
  },

  updateGoalCount(id, newCount) {
    const item = (this.config.items || []).find(it => it.id === id);
    if (item && item.type === 'goal') {
      const target = item.targetCount || 100;
      let count = parseInt(newCount, 10);
      if (isNaN(count) || count < 0) count = 0;

      item.currentCount = count;
      item.completed = count >= target;
      this.render();
      this.save();
    }
  },

  editGoal(id) {
    const item = (this.config.items || []).find(it => it.id === id);
    if (!item || item.type !== 'goal') return;

    const newTitle = prompt('Edit Goal Title:', item.text);
    if (newTitle === null) return;

    const targetStr = prompt('Edit Target Goal Count:', (item.targetCount || 100).toString());
    if (targetStr === null) return;

    const currentStr = prompt('Edit Current Progress Count:', (typeof item.currentCount === 'number' ? item.currentCount : 0).toString());
    if (currentStr === null) return;

    const newTarget = Math.max(1, parseInt(targetStr, 10) || 100);
    const newCurrent = Math.max(0, parseInt(currentStr, 10) || 0);

    item.text = newTitle.trim() || item.text;
    item.targetCount = newTarget;
    item.currentCount = newCurrent;
    item.completed = newCurrent >= newTarget;

    this.render();
    this.save();
  },

  editTask(id) {
    const item = (this.config.items || []).find(it => it.id === id);
    if (!item) return;

    const newText = prompt('Edit Task Title:', item.text);
    if (newText !== null && newText.trim() !== '') {
      item.text = newText.trim();
      this.render();
      this.save();
    }
  },

  deleteItem(id) {
    this.config.items = (this.config.items || []).filter(it => it.id !== id);
    this.render();
    this.save();
  },

  getDueDateBadge(dueDateStr) {
    if (!dueDateStr) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = dueDateStr.split('-');
    if (parts.length !== 3) return null;
    const due = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));

    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
    let text = '';
    let statusClass = '';

    if (diffDays < 0) {
      text = `Overdue (${due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})`;
      statusClass = 'overdue';
    } else if (diffDays === 0) {
      text = 'Due Today';
      statusClass = 'due-today';
    } else if (diffDays === 1) {
      text = 'Due Tomorrow';
      statusClass = 'due-soon';
    } else {
      text = `Due ${due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
      statusClass = 'due-future';
    }

    return { text, statusClass };
  },

  createGoalElement(item) {
    const li = document.createElement('li');
    li.className = `todo-item goal-item ${item.completed ? 'completed' : ''}`;
    const target = item.targetCount || 100;
    const current = typeof item.currentCount === 'number' ? item.currentCount : 0;
    const pct = Math.min(100, Math.round((current / target) * 100));
    const dueBadge = this.getDueDateBadge(item.dueDate);

    li.innerHTML = `
      <div class="goal-item-container">
        <div class="goal-header">
          <div class="goal-title-group">
            <span class="goal-icon">🎯</span>
            <span class="todo-item-text goal-title">${this.escapeHtml(item.text)}</span>
          </div>
          <div class="goal-header-actions" style="display: flex; gap: 4px; align-items: center;">
            <button class="todo-edit-btn" title="Edit Goal" aria-label="Edit">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="todo-delete-btn" title="Delete goal" aria-label="Delete">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="goal-progress-stats">
          <span class="goal-count-label">
            <strong class="goal-current-text">${current}</strong> / ${target} Completed
          </span>
          <span class="goal-pct-badge">${pct}%</span>
        </div>

        <div class="goal-progress-track">
          <div class="goal-progress-fill" style="width: ${pct}%;"></div>
        </div>

        <div class="goal-footer">
          ${dueBadge ? `<span class="duedate-badge ${dueBadge.statusClass}">📅 ${dueBadge.text}</span>` : '<span></span>'}
          <div class="goal-action-btns">
            <button type="button" class="goal-btn goal-btn-sub" title="Decrease progress (-1)">-1</button>
            <button type="button" class="goal-btn goal-btn-add" title="Increase progress (+1)">+1</button>
            <button type="button" class="goal-btn goal-btn-edit" title="Set progress value">Set</button>
          </div>
        </div>
      </div>
    `;

    // Goal Action Event Handlers
    li.querySelector('.goal-btn-sub').addEventListener('click', (e) => {
      e.stopPropagation();
      this.incrementGoal(item.id, -1);
    });
    li.querySelector('.goal-btn-add').addEventListener('click', (e) => {
      e.stopPropagation();
      this.incrementGoal(item.id, 1);
    });
    li.querySelector('.goal-btn-edit').addEventListener('click', (e) => {
      e.stopPropagation();
      const val = prompt(`Update current progress count for "${item.text}":`, current.toString());
      if (val !== null) {
        this.updateGoalCount(item.id, val);
      }
    });

    const editBtn = li.querySelector('.todo-edit-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.editGoal(item.id);
      });
    }

    const deleteBtn = li.querySelector('.todo-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteItem(item.id);
      });
    }

    return li;
  },

  renderIndividualFloatingGoalWidgets() {
    const container = document.getElementById('floating-goals-container');
    if (!container) return;

    const allItems = this.config.items || [];
    const goalItems = allItems.filter(it => it.type === 'goal');
    const activeWidgetIds = new Set();

    goalItems.forEach((item, index) => {
      const widgetId = `widget-goal-${item.id}`;
      activeWidgetIds.add(widgetId);

      let widgetEl = document.getElementById(widgetId);
      const isNew = !widgetEl;

      if (isNew) {
        widgetEl = document.createElement('div');
        widgetEl.id = widgetId;
        widgetEl.className = 'screen-widget standalone-goal-card glass-panel';
        container.appendChild(widgetEl);

        if (!item.position) {
          item.position = { x: 32 + (index * 24), y: 380 + (index * 20) };
        }
      }

      if (item.position) {
        if (typeof item.position.x === 'number') widgetEl.style.left = `${item.position.x}px`;
        if (typeof item.position.y === 'number') widgetEl.style.top = `${item.position.y}px`;
      }
      if (item.size) {
        if (typeof item.size.width === 'number') widgetEl.style.width = `${item.size.width}px`;
        if (typeof item.size.height === 'number') widgetEl.style.height = `${item.size.height}px`;
      }

      const target = item.targetCount || 100;
      const current = typeof item.currentCount === 'number' ? item.currentCount : 0;
      const pct = Math.min(100, Math.round((current / target) * 100));
      const dueBadge = this.getDueDateBadge(item.dueDate);

      widgetEl.innerHTML = `
        <div class="widget-header">
          <div class="widget-title-group">
            <span class="widget-drag-handle">⠿</span>
            <span class="goal-icon">🎯</span>
            <span class="goal-title-text">${this.escapeHtml(item.text)}</span>
          </div>
          <div class="widget-controls">
            <button class="widget-btn goal-card-edit-btn" title="Edit Goal">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="widget-btn goal-card-delete-btn" title="Delete Goal">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="widget-body">
          <div class="goal-item-container" style="padding: 4px 0;">
            <div class="goal-progress-stats">
              <span class="goal-count-label">
                <strong class="goal-current-text">${current}</strong> / ${target} Completed
              </span>
              <span class="goal-pct-badge">${pct}%</span>
            </div>

            <div class="goal-progress-track">
              <div class="goal-progress-fill" style="width: ${pct}%;"></div>
            </div>

            <div class="goal-footer">
              ${dueBadge ? `<span class="duedate-badge ${dueBadge.statusClass}">📅 ${dueBadge.text}</span>` : '<span></span>'}
              <div class="goal-action-btns">
                <button type="button" class="goal-btn goal-btn-sub" title="Decrease progress (-1)">-1</button>
                <button type="button" class="goal-btn goal-btn-add" title="Increase progress (+1)">+1</button>
                <button type="button" class="goal-btn goal-btn-edit" title="Set progress value">Set</button>
              </div>
            </div>
          </div>
        </div>
        <div class="widget-resize-handle" title="Drag to resize goal card">◢</div>
      `;

      widgetEl.querySelector('.goal-btn-sub').addEventListener('click', (e) => {
        e.stopPropagation();
        this.incrementGoal(item.id, -1);
      });
      widgetEl.querySelector('.goal-btn-add').addEventListener('click', (e) => {
        e.stopPropagation();
        this.incrementGoal(item.id, 1);
      });
      widgetEl.querySelector('.goal-btn-edit').addEventListener('click', (e) => {
        e.stopPropagation();
        const val = prompt(`Update current progress count for "${item.text}":`, current.toString());
        if (val !== null) {
          this.updateGoalCount(item.id, val);
        }
      });
      widgetEl.querySelector('.goal-card-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.editGoal(item.id);
      });
      widgetEl.querySelector('.goal-card-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteItem(item.id);
      });

      const handle = widgetEl.querySelector('.widget-header');
      if (handle && typeof makeDraggable === 'function') {
        makeDraggable(widgetEl, handle, (pos) => {
          item.position = pos;
          this.save();
        });
      }
      const resizeHandle = widgetEl.querySelector('.widget-resize-handle');
      if (resizeHandle && typeof makeResizable === 'function') {
        makeResizable(widgetEl, resizeHandle, (size) => {
          item.size = size;
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

  renderIndividualFloatingTaskWidgets() {
    const container = document.getElementById('floating-tasks-container');
    if (!container) return;

    const allItems = this.config.items || [];
    const taskItems = allItems.filter(it => (it.type || 'task') === 'task' && !it.completed);
    const activeWidgetIds = new Set();

    taskItems.forEach((item, index) => {
      const widgetId = `widget-task-${item.id}`;
      activeWidgetIds.add(widgetId);

      let widgetEl = document.getElementById(widgetId);
      const isNew = !widgetEl;

      if (isNew) {
        widgetEl = document.createElement('div');
        widgetEl.id = widgetId;
        widgetEl.className = 'screen-widget standalone-task-card glass-panel';
        container.appendChild(widgetEl);

        if (!item.position) {
          item.position = { x: 380 + (index * 24), y: 100 + (index * 20) };
        }
      }

      if (item.position) {
        if (typeof item.position.x === 'number') widgetEl.style.left = `${item.position.x}px`;
        if (typeof item.position.y === 'number') widgetEl.style.top = `${item.position.y}px`;
      }
      if (item.size) {
        if (typeof item.size.width === 'number') widgetEl.style.width = `${item.size.width}px`;
        if (typeof item.size.height === 'number') widgetEl.style.height = `${item.size.height}px`;
      }

      const dueBadge = this.getDueDateBadge(item.dueDate);
      const priority = item.priority || 'medium';

      widgetEl.innerHTML = `
        <div class="widget-header">
          <div class="widget-title-group" style="flex: 1; overflow: hidden;">
            <span class="widget-drag-handle">⠿</span>
            <input type="checkbox" class="todo-checkbox task-card-checkbox" ${item.completed ? 'checked' : ''} />
            <span class="task-title-text ${item.completed ? 'completed' : ''}">${this.escapeHtml(item.text)}</span>
          </div>
          <div class="widget-controls">
            <button class="widget-btn task-card-edit-btn" title="Edit Task">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="widget-btn task-card-delete-btn" title="Delete Task">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="widget-body" style="padding: 8px 12px;">
          <div class="task-card-meta" style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
            <span class="priority-badge priority-${priority}">${priority.toUpperCase()}</span>
            ${dueBadge ? `<span class="duedate-badge ${dueBadge.statusClass}">📅 ${dueBadge.text}</span>` : ''}
          </div>
        </div>
        <div class="widget-resize-handle" title="Drag to resize task card">◢</div>
      `;

      widgetEl.querySelector('.task-card-checkbox').addEventListener('change', () => this.toggleItem(item.id));
      widgetEl.querySelector('.task-card-edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.editTask(item.id);
      });
      widgetEl.querySelector('.task-card-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteItem(item.id);
      });

      const handle = widgetEl.querySelector('.widget-header');
      if (handle && typeof makeDraggable === 'function') {
        makeDraggable(widgetEl, handle, (pos) => {
          item.position = pos;
          this.save();
        });
      }
      const resizeHandle = widgetEl.querySelector('.widget-resize-handle');
      if (resizeHandle && typeof makeResizable === 'function') {
        makeResizable(widgetEl, resizeHandle, (size) => {
          item.size = size;
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
    const allItems = this.config.items || [];
    const remainingTasks = allItems.filter(it => !it.completed && (it.type || 'task') === 'task').length;
    const remainingGoals = allItems.filter(it => !it.completed && it.type === 'goal').length;

    // Update counter badges
    document.querySelectorAll('.todo-counter-badge').forEach(badge => {
      badge.textContent = remainingTasks > 0 ? remainingTasks : '';
      badge.style.display = remainingTasks > 0 ? 'inline-block' : 'none';
    });
    document.querySelectorAll('.goals-counter-badge').forEach(badge => {
      badge.textContent = remainingGoals > 0 ? remainingGoals : '';
      badge.style.display = remainingGoals > 0 ? 'inline-block' : 'none';
    });

    // Render individual standalone floating goal & task widgets on screen!
    this.renderIndividualFloatingGoalWidgets();
    this.renderIndividualFloatingTaskWidgets();

    // Render Standalone Goals Instances (.goals-list-instance)
    const goalItems = allItems.filter(it => it.type === 'goal');
    document.querySelectorAll('.goals-list-instance').forEach(goalsListEl => {
      goalsListEl.innerHTML = '';
      if (goalItems.length === 0) {
        goalsListEl.innerHTML = `
          <div class="todo-empty-state">
            <span style="font-size: 24px;">🎯</span>
            <p style="font-size: 12.5px; opacity: 0.7;">No goals added yet. Set your goal above!</p>
          </div>
        `;
      } else {
        goalItems.forEach(item => {
          goalsListEl.appendChild(this.createGoalElement(item));
        });
      }
    });

    // Render Tasks Instances (.todo-list-instance) - Tasks Only!
    let taskItems = allItems.filter(it => (it.type || 'task') === 'task');
    if (this.activeFilter === 'completed') {
      taskItems = allItems.filter(it => (it.type || 'task') === 'task' && it.completed);
    } else if (this.activeFilter === 'pending') {
      taskItems = allItems.filter(it => (it.type || 'task') === 'task' && !it.completed);
    }

    const lists = document.querySelectorAll('.todo-list-instance');
    lists.forEach(listEl => {
      listEl.innerHTML = '';

      if (taskItems.length === 0) {
        listEl.innerHTML = `
          <div class="todo-empty-state">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p style="font-size: 12.5px; opacity: 0.7;">No tasks found. Add a task above!</p>
          </div>
        `;
        return;
      }

      taskItems.forEach(item => {
        const li = document.createElement('li');
        li.className = `todo-item task-item ${item.completed ? 'completed' : ''}`;
        const dueBadge = this.getDueDateBadge(item.dueDate);
        const priority = item.priority || 'medium';

        li.innerHTML = `
          <div class="todo-item-main">
            <label class="todo-item-label">
              <input type="checkbox" class="todo-checkbox" ${item.completed ? 'checked' : ''} />
              <span class="todo-item-check-custom"></span>
              <div class="todo-text-wrapper">
                <span class="todo-item-text">${this.escapeHtml(item.text)}</span>
                <div class="todo-item-meta">
                  <span class="priority-badge priority-${priority}">${priority.toUpperCase()}</span>
                  ${dueBadge ? `<span class="duedate-badge ${dueBadge.statusClass}">📅 ${dueBadge.text}</span>` : ''}
                </div>
              </div>
            </label>
            <div class="todo-item-actions" style="display: flex; gap: 4px; align-items: center;">
              <button class="todo-edit-btn" title="Edit task title" aria-label="Edit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button class="todo-delete-btn" title="Delete task" aria-label="Delete">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        `;

        li.querySelector('.todo-checkbox').addEventListener('change', () => this.toggleItem(item.id));
        const editBtn = li.querySelector('.todo-edit-btn');
        if (editBtn) {
          editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.editTask(item.id);
          });
        }
        const deleteBtn = li.querySelector('.todo-delete-btn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteItem(item.id);
          });
        }

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
