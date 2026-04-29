import {
  useCallback,
  useContext,
  useEffect,
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
  // This is what handles the "entry was not mounted when the event fired"
  // case — when the entry finally mounts, this effect picks up the pending
  // request and schedules focus.
  const pendingRequest = showEntryCoordinator && showEntryCoordinator.pendingRequest;

  useEffect(() => {
    if (pendingRequest && pendingRequest.id === id) {
      if (isFunction(onShow)) {
        onShow();
      }

      focus.current = true;
      resolveTokenRef.current = pendingRequest.token;
    }
  }, [ pendingRequest, id, onShow ]);

  useEffect(() => {
    if (!focus.current || !ref.current) {
      return;
    }

    let rafId = null;
    let cancelled = false;

    const tryFocus = () => {
      rafId = null;

      if (cancelled || !focus.current || !ref.current) {
        return;
      }

      // wait until the entry is actually visible before focusing — otherwise
      // .focus() on a `display: none` element is a no-op (groups are hidden
      // via CSS when collapsed). Effects run child-first, so on the same
      // render where pendingRequest arrives this hook would otherwise run
      // before the parent Group/Collapsible has had a chance to open. When
      // not yet visible we retry on the next animation frame — by then the
      // parent's setOpen has been applied and the entry's ancestor chain
      // has display: block.
      if (!isVisible(ref.current)) {
        rafId = requestAnimationFrame(tryFocus);
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
    };

    // try synchronously first — keeps the simple "already visible" case
    // (most common) working without waiting for an animation frame
    tryFocus();

    return () => {
      cancelled = true;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
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
