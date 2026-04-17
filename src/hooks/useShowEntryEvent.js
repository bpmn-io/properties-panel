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
    if (focus.current && ref.current) {
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
    }
  });

  return ref;
}
