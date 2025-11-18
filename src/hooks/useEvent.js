import { useContext, useEffect } from 'preact/hooks';

import { EventContext } from '../context';


/**
 * Subscribe to an event immediately. Update subscription after inputs changed.
 *
 * @param {string} event
 * @param {Function} callback
 */
export function useEvent(event, callback, eventBus) {
  const eventContext = useContext(EventContext);

  const bus = eventBus || eventContext.eventBus;

  useEffect(() => {
    if (!bus) {
      return;
    }

    bus.on(event, callback);

    return () => {
      bus.off(event, callback);
    };
  }, [ callback, event, bus ]);
}
