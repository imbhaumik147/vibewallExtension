/**
 * Helper to make any element draggable on the viewport
 * with automatic boundary constraints and position saving.
 */
function makeDraggable(element, handle, onPositionSaved) {
  let isDragging = false;
  let startX, startY;
  let initialLeft, initialTop;

  handle.addEventListener('mousedown', startDrag);

  function startDrag(e) {
    // Only left click
    if (e.button !== 0) return;
    isDragging = true;
    element.classList.add('dragging');

    const rect = element.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    startX = e.clientX;
    startY = e.clientY;

    // Reset right/bottom positioning to explicit left/top
    element.style.left = `${initialLeft}px`;
    element.style.top = `${initialTop}px`;
    element.style.right = 'auto';
    element.style.bottom = 'auto';

    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', stopDrag);
    e.preventDefault();
  }

  function onDrag(e) {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newLeft = initialLeft + dx;
    let newTop = initialTop + dy;

    // Viewport boundaries
    const maxLeft = window.innerWidth - element.offsetWidth - 10;
    const maxTop = window.innerHeight - element.offsetHeight - 10;

    newLeft = Math.max(10, Math.min(newLeft, maxLeft));
    newTop = Math.max(10, Math.min(newTop, maxTop));

    element.style.left = `${newLeft}px`;
    element.style.top = `${newTop}px`;
  }

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    element.classList.remove('dragging');

    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', stopDrag);

    const finalRect = element.getBoundingClientRect();
    if (onPositionSaved) {
      onPositionSaved({
        x: Math.round(finalRect.left),
        y: Math.round(finalRect.top)
      });
    }
  }
}

/**
 * Helper to make any element resizable by dragging from edges/corners
 */
function makeResizable(element, handle, onSizeSaved) {
  let isResizing = false;
  let startX, startY;
  let startWidth, startHeight;

  handle.addEventListener('mousedown', startResize);

  function startResize(e) {
    if (e.button !== 0) return;
    isResizing = true;
    element.classList.add('resizing');

    startX = e.clientX;
    startY = e.clientY;
    startWidth = element.offsetWidth;
    startHeight = element.offsetHeight;

    document.addEventListener('mousemove', onResize);
    document.addEventListener('mouseup', stopResize);
    e.preventDefault();
    e.stopPropagation();
  }

  function onResize(e) {
    if (!isResizing) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const minWidth = 260;
    const maxWidth = Math.min(800, window.innerWidth - 40);
    const minHeight = 180;
    const maxHeight = Math.min(800, window.innerHeight - 40);

    const newWidth = Math.max(minWidth, Math.min(startWidth + dx, maxWidth));
    const newHeight = Math.max(minHeight, Math.min(startHeight + dy, maxHeight));

    element.style.width = `${newWidth}px`;
    element.style.height = `${newHeight}px`;

    // Adjust inner wrapper heights dynamically
    const body = element.querySelector('.widget-body');
    if (body) {
      body.style.maxHeight = `${newHeight - 45}px`;
    }
    const listWrapper = element.querySelector('.todo-list-wrapper');
    if (listWrapper) {
      listWrapper.style.maxHeight = `${newHeight - 140}px`;
    }
    const textarea = element.querySelector('.notes-textarea');
    if (textarea) {
      textarea.style.height = `${newHeight - 90}px`;
    }
  }

  function stopResize() {
    if (!isResizing) return;
    isResizing = false;
    element.classList.remove('resizing');

    document.removeEventListener('mousemove', onResize);
    document.removeEventListener('mouseup', stopResize);

    if (onSizeSaved) {
      onSizeSaved({
        width: element.offsetWidth,
        height: element.offsetHeight
      });
    }
  }
}

window.makeDraggable = makeDraggable;
window.makeResizable = makeResizable;
