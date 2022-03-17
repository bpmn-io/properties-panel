import {
  useEffect,
  useRef
} from 'preact/hooks';

const HIGH_PRIORITY = 10000;


/**
 * Buffer events and re-fire during passive effect phase.
 *
 * @param {string[]} bufferedEvents
 * @param {Object} [eventBus]
 */
export function useEventBuffer(bufferedEvents, eventBus) {
  const buffer = useRef([]),
        buffering = useRef(true);

  const createCallback = (event) => (data) => {
    if (buffering.current === true) {
      buffer.current.unshift([ event, data ]);
    }
  };

  // (1) buffer events
  useEffect(() => {
    if (!eventBus) {
      return;
    }

    const listeners = bufferedEvents.map((event) => {
      return [ event, createCallback(event) ];
    });

    listeners.forEach(([ event, callback ]) => {
      eventBus.on(event, HIGH_PRIORITY, callback);
    });

    return () => {
      listeners.forEach(([ event, callback ]) => {
        eventBus.off(event, callback);
      });
    };
  }, [ bufferedEvents, eventBus ]);

  // (2) re-fire events
  useEffect(() => {
    if (!eventBus) {
      return;
    }

    buffering.current = false;

    while (buffer.current.length) {
      const [ event, data ] = buffer.current.pop();

      eventBus.fire(event, data);
    }

    buffering.current = true;
  });
}