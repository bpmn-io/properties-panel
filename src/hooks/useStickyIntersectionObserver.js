import {
  useCallback,
  useEffect,
  useState
} from 'preact/hooks';

import {
  query as domQuery
} from 'min-dom';

import { useEvent } from './useEvent';


/**
 * @callback setSticky
 * @param {boolean} value
 */

/**
 * Use IntersectionObserver to identify when DOM element is in sticky mode.
 * If sticky is observered setSticky(true) will be called.
 * If sticky mode is left, setSticky(false) will be called.
 *
 *
 * @param {Object} ref
 * @param {string} scrollContainerSelector
 * @param {setSticky} setSticky
 */
export function useStickyIntersectionObserver(ref, scrollContainerSelector, setSticky) {

  const [ scrollContainer, setScrollContainer ] = useState(domQuery(scrollContainerSelector));

  const updateScrollContainer = useCallback(() => {
    const newScrollContainer = domQuery(scrollContainerSelector);

    if (newScrollContainer !== scrollContainer) {
      setScrollContainer(newScrollContainer);
    }
  }, [ scrollContainerSelector, scrollContainer ]);

  useEffect(() => {
    updateScrollContainer();
  }, [ updateScrollContainer ]);

  useEvent('propertiesPanel.attach', updateScrollContainer);
  useEvent('propertiesPanel.detach', updateScrollContainer);

  useEffect(() => {
    const Observer = IntersectionObserver;

    // return early if IntersectionObserver is not available
    if (!Observer) {
      return;
    }

    // TODO(@barmac): test this
    if (!ref.current || !scrollContainer) {
      return;
    }

    const observer = new Observer((entries) => {

      // scroll container is unmounted, do not update sticky state
      if (scrollContainer.scrollHeight === 0) {
        return;
      }

      entries.forEach(entry => {
        if (entry.intersectionRatio < 1) {
          setSticky(true);
        }
        else if (entry.intersectionRatio === 1) {
          setSticky(false);
        }
      });
    },
    {
      root: scrollContainer,
      rootMargin: '0px 0px 999999% 0px', // Use bottom margin to avoid stickyness when scrolling out to bottom
      threshold: [ 1 ]
    });
    observer.observe(ref.current);

    // Unobserve if unmounted
    return () => {
      observer.unobserve(ref.current);
    };

  }, [ ref.current, scrollContainer, setSticky ]);
}
