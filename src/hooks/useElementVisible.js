import { useLayoutEffect, useState } from 'preact/hooks';

export function useElementVisible(element) {

  const [ visible, setVisible ] = useState(!!element && !!element.clientHeight);

  useLayoutEffect(() => {
    if (!element) return;

    const resizeObserver = new ResizeObserver(([ entry ]) => {
      requestAnimationFrame(() => {
        const newVisible = !!entry.contentRect.height;
        if (newVisible !== visible) {
          setVisible(newVisible);
        }
      });
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [ element, visible ]);

  return visible;
}
