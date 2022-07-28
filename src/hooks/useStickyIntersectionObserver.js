import {
  useEffect
} from 'preact/hooks';

import {
  query as domQuery
} from 'min-dom';


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
  useEffect(() => {

    /**
     * @pinussilvestrus Note: we exclude the sticky header feature until we
     * find a proper fix for https://github.com/bpmn-io/bpmn-js-properties-panel/issues/726
     */
    const Observer = false /* IntersectionObserver */;

    // return early if IntersectionObserver is not available
    if (!Observer) {
      return;
    }

    let observer;

    if (ref.current) {
      const scrollContainer = domQuery(scrollContainerSelector);

      observer = new Observer((entries) => {
        if (entries[0].intersectionRatio < 1) {
          setSticky(true);
        }
        else if (entries[0].intersectionRatio === 1) {
          setSticky(false);
        }
      },
      {
        root: scrollContainer,
        rootMargin: '0px 0px 999999% 0px', // Use bottom margin to avoid stickyness when scrolling out to bottom
        threshold: [ 1 ]
      });
      observer.observe(ref.current);
    }

    // Unobserve if unmounted
    return () => {
      if (ref.current && observer) {
        observer.unobserve(ref.current);
      }
    };

  }, [ ref ]);
}
