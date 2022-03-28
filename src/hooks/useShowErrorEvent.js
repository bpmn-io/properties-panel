import {
  useCallback,
  useContext,
  useEffect,
  useState
} from 'preact/hooks';

import { EventContext } from '../context';

import { useEvent } from './useEvent';

/**
 * Subscribe to `propertiesPanel.showError`. On `propertiesPanel.showError` set
 * temporary error. Unset error on inputs change. Fire
 * `propertiesPanel.showEntry` for temporary error to be visible.
 *
 * @param {Function} show
 * @param {any[]} [inputs]
 *
 * @returns {import('preact').Ref}
 */
export function useShowErrorEvent(show, inputs = []) {
  const { eventBus } = useContext(EventContext);

  const [ temporaryError, setTemporaryError ] = useState(null);

  useEffect(() => setTemporaryError(null), inputs);

  const onShowError = useCallback((event) => {
    setTemporaryError(null);

    if (show(event)) {
      eventBus.fire('propertiesPanel.showEntry', event);

      setTemporaryError(event.message);
    }
  }, [ show ]);

  useEvent('propertiesPanel.showError', onShowError);

  return temporaryError;
}