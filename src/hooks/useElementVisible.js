import { useLayoutEffect, useState } from 'preact/hooks';

export function useElementVisible(element) {

  const [ visible, setVisible ] = useState(false);

  useLayoutEffect(() => {
    if (!element) return;

    const resizeObserver = new ResizeObserver(([ entry ]) => {

      // Prevents ResizeObserver from going into infinite loop.
      requestAnimationFrame(() => {

        const newVisible = !!entry.contentRect.height;
        if (newVisible !== visible) {
          setVisible(newVisible);
        }
      });
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [ element ]);

  return visible;
}
