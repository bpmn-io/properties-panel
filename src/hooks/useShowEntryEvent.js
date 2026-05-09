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
 * Pull-based: on every commit, the entry checks whether it should focus
 * itself and whether it is currently visible. If both, it focuses + clears
 * the request. If not (entry hidden behind a still-collapsed group, or not
 * yet mounted), it does nothing — the next commit will check again.
 * Whatever sequence of renders / event fires it takes for the entry to
 * become visible (group opening, host re-renders, un-batched fires), the
 * entry will focus itself on the first commit where it is both targeted
 * and visible. No tokens, no rAF, no assumptions about effect ordering
 * across the tree.
 *
 * The entry latches its "wants focus" state when it observes itself as the
 * coordinator's pending target, so that a panel-level cancellation (e.g.
 * when the selected element changes in the same render batch as the
 * `showEntry` event) does not silently drop the request before the entry
 * had a chance to react. The latch is released only when a *different*
 * request arrives or when focus is performed.
 *
 * The legacy `useEvent('propertiesPanel.showEntry', …)` subscription is
 * kept for consumers that use the hook outside of a `<PropertiesPanel>`
 * (no coordinator available); it sets the same latch.
 *
 * @param {string} id
 *
 * @returns {import('preact').Ref}
 */
export function useShowEntryEvent(id) {
  const { onShow } = useContext(PropertiesPanelContext);
  const showEntryCoordinator = useContext(ShowEntryContext);

  const ref = useRef();

  // latch: set when this entry observes itself as the focus target
  // (coordinator pendingRequest matches OR legacy event-bus fired with
  // matching id); cleared on focus or when a competing request arrives
  const focusFlag = useRef(false);

  // legacy event-bus path: subscribe directly so consumers that embed
  // entries outside of a <PropertiesPanel> (no coordinator) keep working
  const onShowEntry = useCallback((event) => {
    if (event && event.id === id) {
      if (isFunction(onShow)) {
        onShow();
      }

      focusFlag.current = true;
    }
  }, [ id, onShow ]);

  useEvent('propertiesPanel.showEntry', onShowEntry);

  const pendingRequest = showEntryCoordinator && showEntryCoordinator.pendingRequest;
  const resolve = showEntryCoordinator && showEntryCoordinator.resolve;

  const isTarget = !!(pendingRequest && pendingRequest.id === id);

  // notify ancestor `onShow` once per target transition (legacy
  // PropertiesPanelContext.onShow path; still useful for consumers
  // without the coordinator-aware Group/Collapsible)
  const notifiedRef = useRef(false);

  useLayoutEffect(() => {

    // update latch based on the current coordinator state
    if (isTarget) {
      focusFlag.current = true;

      if (!notifiedRef.current) {
        notifiedRef.current = true;

        if (isFunction(onShow)) {
          onShow();
        }
      }
    } else {
      notifiedRef.current = false;

      // a competing request (different id) arrived — drop our claim
      if (pendingRequest) {
        focusFlag.current = false;
      }
    }

    // attempt focus — only when we have a claim and we're visible
    if (!focusFlag.current || !ref.current) {
      return;
    }

    if (!isVisible(ref.current)) {
      return;
    }

    doFocus(ref.current);
    focusFlag.current = false;

    // clear the coordinator's pending request if it's still ours
    if (isTarget && isFunction(resolve)) {
      resolve();
    }
  });

  return ref;
}


function doFocus(node) {
  if (isFunction(node.focus)) {
    node.focus();
  }

  if (isFunction(node.select)) {
    node.select();
  }
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
