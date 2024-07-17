import { useLayoutEffect, useState } from 'preact/hooks';

export function useElementVisible(element) {

  const [ visible, setVisible ] = useState(false);

  useLayoutEffect(() => {
    if (!element) return;

    const resizeObserver = new ResizeObserver(([ entry ]) => {

      // Prevents ResizeObserver from going into infinite loop.
      requestAnimationFrame(() => setVisible(!!entry.contentRect.height));
    });
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [ element ]);

  return visible;
}
