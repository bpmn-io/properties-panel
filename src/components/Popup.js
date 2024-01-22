import { createPortal, forwardRef } from 'preact/compat';

import { useEffect, useMemo, useRef } from 'preact/hooks';

import classNames from 'classnames';

import { query as domQuery } from 'min-dom';

import * as focusTrap from 'focus-trap';

import { DragIcon } from './icons';

import { createDragger } from './util/dragger';
import { useEvent } from '../hooks/useEvent';


const noop = () => {};

/**
 * A generic popup component.
 *
 * @param {Object} props
 * @param {HTMLElement} [props.container]
 * @param {string} [props.className]
 * @param {boolean} [props.delayInitialFocus]
 * @param {{x: number, y: number}} [props.position]
 * @param {number} [props.width]
 * @param {number} [props.height]
 * @param {Function} props.onClose
 * @param {Function} [props.onPostActivate]
 * @param {Function} [props.onPostDeactivate]
 * @param {boolean} [props.returnFocus]
 * @param {boolean} [props.closeOnEscape]
 * @param {string} props.title
 * @param {Ref} [ref]
 */
function PopupComponent(props, globalRef) {

  const {
    container,
    className,
    delayInitialFocus,
    position,
    width,
    height,
    onClose,
    onPostActivate = noop,
    onPostDeactivate = noop,
    returnFocus = true,
    closeOnEscape = true,
    title
  } = props;

  const focusTrapRef = useRef(null);
  const localRef = useRef(null);
  const popupRef = globalRef || localRef;

  const containerNode = useMemo(() => getContainerNode(container), [ container ]);

  const handleKeydown = event => {

    // do not allow keyboard events to bubble
    event.stopPropagation();

    if (closeOnEscape && event.key === 'Escape') {
      onClose();
    }
  };

  // re-activate focus trap on focus
  const handleFocus = () => {
    if (focusTrapRef.current) {
      focusTrapRef.current.activate();
    }
  };

  let style = {};

  if (position) {
    style = {
      ...style,
      top: position.top + 'px',
      left: position.left + 'px'
    };
  }

  if (width) {
    style.width = width + 'px';
  }

  if (height) {
    style.height = height + 'px';
  }

  useEffect(() => {
    if (popupRef.current) {
      popupRef.current.addEventListener('focusin', handleFocus);
    }

    return () => { popupRef.current.removeEventListener('focusin', handleFocus); };
  }, [ popupRef ]);

  useEffect(() => {
    if (popupRef.current) {
      focusTrapRef.current = focusTrap.createFocusTrap(popupRef.current, {
        clickOutsideDeactivates: true,
        delayInitialFocus,
        fallbackFocus: popupRef.current,
        onPostActivate,
        onPostDeactivate,
        returnFocusOnDeactivate: returnFocus
      });

      focusTrapRef.current.activate();
    }

    return () => focusTrapRef.current && focusTrapRef.current.deactivate();
  }, [ popupRef ]);

  useEvent('propertiesPanel.detach', onClose);

  return createPortal(
    <div
      aria-label={ title }
      tabIndex={ -1 }
      ref={ popupRef }
      onKeyDown={ handleKeydown }
      role="dialog"
      class={ classNames('bio-properties-panel-popup', className) }
      style={ style }>{ props.children }</div>
    , containerNode || document.body
  );
}

export const Popup = forwardRef(PopupComponent);

Popup.Title = Title;
Popup.Body = Body;
Popup.Footer = Footer;

function Title(props) {
  const {
    children,
    className,
    draggable,
    emit = () => {},
    title,
    ...rest
  } = props;

  // we can't use state as we need to
  // manipulate this inside dragging events
  const context = useRef({
    startPosition: null,
    newPosition: null
  });

  const dragPreviewRef = useRef();

  const titleRef = useRef();

  const onMove = (event, delta) => {
    cancel(event);

    const { x: dx, y: dy } = delta;

    const newPosition = {
      x: context.current.startPosition.x + dx,
      y: context.current.startPosition.y + dy
    };

    const popupParent = getPopupParent(titleRef.current);

    popupParent.style.top = newPosition.y + 'px';
    popupParent.style.left = newPosition.x + 'px';

    // notify interested parties
    emit('dragover', { newPosition, delta });
  };

  const onMoveStart = (event) => {

    // initialize drag handler
    const onDragStart = createDragger(onMove, dragPreviewRef.current);
    onDragStart(event);

    event.stopPropagation();

    const popupParent = getPopupParent(titleRef.current);

    const bounds = popupParent.getBoundingClientRect();
    context.current.startPosition = {
      x: bounds.left,
      y: bounds.top
    };

    // notify interested parties
    emit('dragstart');
  };

  const onMoveEnd = () => {
    context.current.newPosition = null;

    // notify interested parties
    emit('dragend');
  };

  return (
    <div
      class={ classNames(
        'bio-properties-panel-popup__header',
        draggable && 'draggable',
        className
      ) }
      ref={ titleRef }
      draggable={ draggable }
      onDragStart={ onMoveStart }
      onDragEnd={ onMoveEnd }
      { ...rest }>
      { draggable && (
        <>
          <div ref={ dragPreviewRef } class="bio-properties-panel-popup__drag-preview"></div>
          <div class="bio-properties-panel-popup__drag-handle">
            <DragIcon />
          </div>
        </>
      )}
      <div class="bio-properties-panel-popup__title">{ title }</div>
      { children }
    </div>
  );
}

function Body(props) {
  const {
    children,
    className,
    ...rest
  } = props;

  return (
    <div class={ classNames('bio-properties-panel-popup__body', className) } { ...rest }>
      { children }
    </div>
  );
}

function Footer(props) {
  const {
    children,
    className,
    ...rest
  } = props;

  return (
    <div class={ classNames('bio-properties-panel-popup__footer', className) } { ...rest }>
      { props.children }
    </div>
  );
}


// helpers //////////////////////

function getPopupParent(node) {
  return node.closest('.bio-properties-panel-popup');
}

function cancel(event) {
  event.preventDefault();
  event.stopPropagation();
}

function getContainerNode(node) {
  if (typeof node === 'string') {
    return domQuery(node);
  }

  return node;
}