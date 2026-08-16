import {
  useCallback,
  useEffect,
  useState
} from 'preact/hooks';

import {
  closest as domClosest
} from 'min-dom';

import { useEvent } from './useEvent';


/**
 * @callback setSticky
 * @param {boolean} value
 */

/**
 * Resolve scroll container closest to the referenced element.
 */
function getScrollContainer(ref, scrollContainerSelector) {
  return ref.current ? domClosest(ref.current, scrollContainerSelector, true) : null;
}

/**
 * Use IntersectionObserver to identify when DOM element is in sticky mode.
 *
 * If sticky is observered setSticky(true) will be called.
 * If sticky mode is left, setSticky(false) will be called.
 *
 * @param {Object} ref
 * @param {string} scrollContainerSelector
 * @param {setSticky} setSticky
 */
export function useStickyIntersectionObserver(ref, scrollContainerSelector, setSticky) {

  // resolved from the observed element after mount (see effect below)
  const [ scrollContainer, setScrollContainer ] = useState(null);

  const updateScrollContainer = useCallback(() => {
    const newScrollContainer = getScrollContainer(ref, scrollContainerSelector);

    if (newScrollContainer !== scrollContainer) {
      setScrollContainer(newScrollContainer);
    }
  }, [ ref, scrollContainerSelector, scrollContainer ]);

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

    const element = ref.current;

    if (!element || !scrollContainer) {
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
    observer.observe(element);

    // Unobserve if unmounted
    return () => {
      observer.unobserve(element);
    };

  }, [ ref, scrollContainer, setSticky ]);
}
