import { domify } from 'min-dom';

/**
 * Add a dragger that calls back the passed function with
 * { event, delta } on drag.
 *
 * @example
 *
 * function dragMove(event, delta) {
 *   // we are dragging (!!)
 * }
 *
 * domElement.addEventListener('dragstart', dragger(dragMove));
 *
 * @param {Function} fn
 * @param {Element} [dragPreview]
 *
 * @return {Function} drag start callback function
 */
export function createDragger(fn, dragPreview) {

  let self;

  let startX, startY;

  /** drag start */
  function onDragStart(event) {

    self = this;

    startX = event.clientX;
    startY = event.clientY;

    // (1) prevent preview image
    if (event.dataTransfer) {
      event.dataTransfer.setDragImage(dragPreview || emptyCanvas(), 0, 0);
    }

    // (2) setup drag listeners

    // attach drag + cleanup event
    // we need to do this to make sure we track cursor
    // movements before we reach other drag event handlers,
    // e.g. in child containers.
    document.addEventListener('dragover', onDrag, true);
    document.addEventListener('dragenter', preventDefault, true);

    document.addEventListener('dragend', onEnd);
    document.addEventListener('drop', preventDefault);
  }

  function onDrag(event) {
    const delta = {
      x: event.clientX - startX,
      y: event.clientY - startY
    };

    // call provided fn with event, delta
    return fn.call(self, event, delta);
  }

  function onEnd() {
    document.removeEventListener('dragover', onDrag, true);
    document.removeEventListener('dragenter', preventDefault, true);

    document.removeEventListener('dragend', onEnd);
    document.removeEventListener('drop', preventDefault);
  }

  return onDragStart;
}

function preventDefault(event) {
  event.preventDefault();
  event.stopPropagation();
}

function emptyCanvas() {
  return domify('<canvas width="0" height="0" />');
}