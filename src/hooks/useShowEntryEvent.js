import {
  useCallback,
  useContext,
  useEffect,
  useRef
} from 'preact/hooks';

import { isFunction } from 'min-dash';

import { PropertiesPanelContext } from '../context';

import { useEvent } from './useEvent';

/**
 * Subscribe to `propertiesPanel.showEntry`.
 *
 * @param {string} id
 *
 * @returns {import('preact').Ref}
 */
export function useShowEntryEvent(id) {
  const { onShow } = useContext(PropertiesPanelContext);

  const ref = useRef();

  const focus = useRef(false);

  const onShowEntry = useCallback((event) => {
    if (event.id === id) {
      onShow();

      if (!focus.current) {
        focus.current = true;
      }
    }
  }, [ id ]);

  useEffect(() => {
    if (focus.current && ref.current) {
      if (isFunction(ref.current.focus)) {
        ref.current.focus();
      }

      if (isFunction(ref.current.select)) {
        ref.current.select();
      }

      focus.current = false;
    }
  });

  useEvent('propertiesPanel.showEntry', onShowEntry);

  return ref;
}