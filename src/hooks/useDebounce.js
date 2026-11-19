import {
  useCallback,
  useEffect
} from 'preact/hooks';

import noDebounce from '../components/util/noDebounce';

export function useDebounce(callback, debounceFn = noDebounce) {
  const debouncedCallback = useCallback(debounceFn(callback), [ callback, debounceFn ]);

  // flush pending calls before unmount the debounced function
  useEffect(() => {
    return () => {
      debouncedCallback.flush?.();
    };
  }, [ debouncedCallback ]);

  return debouncedCallback;
}
