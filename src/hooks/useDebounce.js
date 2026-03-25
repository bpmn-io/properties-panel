import {
  useCallback,
  useEffect
} from 'preact/hooks';

export function useDebounce(callback, debounceFn) {
  const debouncedCallback = useCallback(debounceFn(callback), [ callback, debounceFn ]);

  // flush pending calls before unmount the debounced function
  useEffect(() => {
    return () => {
      debouncedCallback.flush?.();
    };
  }, [ debouncedCallback ]);

  return debouncedCallback;
}
