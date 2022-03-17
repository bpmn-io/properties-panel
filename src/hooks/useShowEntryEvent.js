import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import { isFunction } from 'min-dash';

import { PropertiesPanelContext } from '../context';

import { useEvent } from './useEvent';

/**
 * Subscribe to `propertiesPanel.showEntry`.
 *
 * @param {Function} show
 *
 * @returns {import('preact').Ref}
 */
export function useShowEntryEvent(show) {
  const { onShow } = useContext(PropertiesPanelContext);

  const ref = useRef();

  const [ focus, setFocus ] = useState(false);

  const onShowEntry = useCallback((event) => {
    if (show(event)) {
      if (isFunction(onShow)) {
        onShow();
      }

      if (event.focus) {
        setFocus(true);
      }
    }
  }, [ show ]);

  useEffect(() => {
    if (focus && ref.current) {
      if (isFunction(ref.current.focus)) {
        ref.current.focus();
      }

      if (isFunction(ref.current.select)) {
        ref.current.select();
      }

      setFocus(false);
    }
  }, [ focus ]);

  useEvent('propertiesPanel.showEntry', onShowEntry);

  return ref;
}