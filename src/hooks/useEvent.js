import { useContext, useEffect, useRef } from 'preact/hooks';

import { EventContext } from '../context';


/**
 * Subscribe to an event immediately. Update subscription after inputs changed.
 *
 * @param {string} event
 * @param {Function} callback
 */
export function useEvent(event, callback, eventBus) {
  const eventContext = useContext(EventContext);

  if (!eventBus) {
    ({ eventBus } = eventContext);
  }

  const didMount = useRef(false);

  // (1) subscribe immediately
  if (eventBus && !didMount.current) {
    eventBus.on(event, callback);
  }

  // (2) update subscription after inputs changed
  useEffect(() => {
    if (eventBus && didMount.current) {
      eventBus.on(event, callback);
    }

    didMount.current = true;

    return () => {
      if (eventBus) {
        eventBus.off(event, callback);
      }
    };
  }, [ callback, event, eventBus ]);
}
