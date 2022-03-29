import {
  useCallback,
  useContext,
  useState
} from 'preact/hooks';

import { EventContext } from '../context';

import { useEvent } from './useEvent';

/**
 * Subscribe to `propertiesPanel.showError`. On `propertiesPanel.showError` set
 * temporary error. Fire `propertiesPanel.showEntry` for temporary error to be
 * visible. Unset error on `propertiesPanel.updated`.
 *
 * @param {Function} show
 *
 * @returns {import('preact').Ref}
 */
export function useShowErrorEvent(show) {
  const { eventBus } = useContext(EventContext);

  const [ temporaryError, setTemporaryError ] = useState(null);

  const onPropertiesPanelUpdated = useCallback(() => setTemporaryError(null), []);

  useEvent('propertiesPanel.updated', onPropertiesPanelUpdated);

  const onShowError = useCallback((event) => {
    setTemporaryError(null);

    if (show(event)) {
      if (eventBus) {
        eventBus.fire('propertiesPanel.showEntry', event);
      }

      setTemporaryError(event.message);
    }
  }, [ show ]);

  useEvent('propertiesPanel.showError', onShowError);

  return temporaryError;
}