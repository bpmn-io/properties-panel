import {
  useCallback,
  useEffect
} from 'preact/hooks';

export function useDebounce(callback, debounceFn) {
  const debouncedCallback = useCallback(debounceFn(callback), [ callback, debounceFn ]);

  // cancel previous function when new is created
  useEffect(() => {
    return () => {
      debouncedCallback.flush?.();
    };
  }, [ debouncedCallback ]);

  return debouncedCallback;
}
