import { useContext, useEffect } from 'preact/hooks';

import { EventContext } from '../context';

const DEFAULT_PRIORITY = 1000;


/**
 * Subscribe to an event.
 *
 * @param {string} event
 * @param {Function} callback
 * @param {number} [priority]
 *
 * @returns {import('preact').Ref}
 */
export function useEvent(event, callback, priority = DEFAULT_PRIORITY) {
  const { eventBus } = useContext(EventContext);

  useEffect(() => {
    if (!eventBus) {
      return;
    }

    eventBus.on(event, priority, callback);

    return () => eventBus.off(event, callback);
  }, [ callback, event, eventBus, priority ]);
}
