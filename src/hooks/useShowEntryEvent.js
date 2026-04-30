import {
  useCallback,
  useContext,
  useLayoutEffect,
  useRef
} from 'preact/hooks';

import { isFunction } from 'min-dash';

import { PropertiesPanelContext, ShowEntryContext } from '../context';

import { useEvent } from './useEvent';

/**
 * Subscribe to `propertiesPanel.showEntry`.
 *
 * The hook listens to the `propertiesPanel.showEntry` event via the injected
 * event bus (legacy path, preserved for backward compatibility) AND reacts to
 * the panel-level `ShowEntryContext` coordinator. The coordinator path ensures
 * that entries which are mounted *after* the event fires (e.g. because their
 * parent group just opened) also receive the focus request.
 *
 * Focus is performed in a layout effect so it runs synchronously after DOM
 * mutations but before paint. When the entry is not yet visible (parent group
 * still collapsed), the request is left pending; the parent's
 * `useLayoutEffect` then calls `setOpen(true)` synchronously, which triggers
 * a synchronous re-render. The next layout effect pass picks up the now
 * visible entry and focuses it — all in the same browser frame, no async
 * scheduling.
 *
 * @param {string} id
 *
 * @returns {import('preact').Ref}
 */
export function useShowEntryEvent(id) {
  const { onShow } = useContext(PropertiesPanelContext);
  const showEntryCoordinator = useContext(ShowEntryContext);

  const ref = useRef();

  const focus = useRef(false);
  const resolveTokenRef = useRef(null);

  // legacy path: subscribe directly to the event bus so that consumers
  // who embed entries outside of a <PropertiesPanel> (or in older setups
  // without a coordinator) keep working unchanged
  const onShowEntry = useCallback((event) => {
    if (event && event.id === id) {
      if (isFunction(onShow)) {
        onShow();
      }

      focus.current = true;
    }
  }, [ id, onShow ]);

  useEvent('propertiesPanel.showEntry', onShowEntry);

  // coordinator path: react to a pending show-entry request from the panel.
  // This handles the "entry was not mounted when the event fired" case —
  // when the entry finally mounts, this effect picks up the pending request
  // and marks it for focusing.
  const pendingRequest = showEntryCoordinator && showEntryCoordinator.pendingRequest;

  useLayoutEffect(() => {
    if (pendingRequest && pendingRequest.id === id) {
      if (isFunction(onShow)) {
        onShow();
      }

      focus.current = true;
      resolveTokenRef.current = pendingRequest.token;
    }
  }, [ pendingRequest, id, onShow ]);

  // Focus pass — runs as a layout effect on every render (no deps) so it
  // re-runs synchronously after the parent group's `setOpen(true)` triggers
  // a re-render. Preact runs layout effects child-first, so on the first
  // commit after a request arrives this hook sees the entry as still hidden
  // (parent's display: none); we leave `focus.current = true` and do NOT
  // resolve. The parent's layout effect then calls `setOpen(true)`, which
  // schedules a synchronous re-render before paint; this effect then re-runs
  // with the entry visible and performs the focus.
  useLayoutEffect(() => {
    if (!focus.current || !ref.current) {
      return;
    }

    if (!isVisible(ref.current)) {
      return;
    }

    if (isFunction(ref.current.focus)) {
      ref.current.focus();
    }

    if (isFunction(ref.current.select)) {
      ref.current.select();
    }

    focus.current = false;

    // resolve the pending request on the coordinator so rapid
    // subsequent calls (with a different token) are not clobbered
    if (showEntryCoordinator && resolveTokenRef.current != null) {
      const token = resolveTokenRef.current;
      resolveTokenRef.current = null;
      showEntryCoordinator.resolve(token);
    }
  });

  return ref;
}


function isVisible(node) {
  if (!node || typeof node.getRootNode !== 'function') {
    return true;
  }

  // detached node — treat as not visible
  const root = node.getRootNode();
  if (root !== node.ownerDocument && root.host === undefined) {
    return false;
  }

  // `display: none` (anywhere in the chain) yields a null offsetParent
  // for non-positioned elements, which is the case for our entries
  if (node.offsetParent === null && node.tagName !== 'BODY') {

    // fall back to a getClientRects check for edge cases (fixed positioning,
    // body-level elements). Hidden elements have no client rects.
    if (typeof node.getClientRects === 'function' && node.getClientRects().length === 0) {
      return false;
    }
  }

  return true;
}
