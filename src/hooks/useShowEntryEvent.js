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

  const focusRef = useRef(false);

  const onShowEntry = useCallback((event) => {
    if (event.id === id) {
      onShow();

      if (!focusRef.current) {
        focusRef.current = true;
      }
    }
  }, [ id, onShow ]);

  useEffect(() => {
    if (focusRef.current && ref.current) {
      if (isFunction(ref.current.focus)) {
        ref.current.focus();
      }

      if (isFunction(ref.current.select)) {
        ref.current.select();
      }

      focusRef.current = false;
    }
  });

  useEvent('propertiesPanel.showEntry', onShowEntry);

  return ref;
}