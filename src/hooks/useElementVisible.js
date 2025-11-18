import { useLayoutEffect, useState } from 'preact/hooks';

export function useElementVisible(ref) {

  const [ visible, setVisible ] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    setVisible(!!element.clientHeight);

    const resizeObserver = new ResizeObserver(([ entry ]) => {
      requestAnimationFrame(() => {
        const newVisible = !!entry.contentRect.height;
        setVisible(newVisible);
      });
    });

    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [ ref ]);

  return visible;
}
