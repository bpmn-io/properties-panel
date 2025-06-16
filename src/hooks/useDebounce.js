import {
  useCallback,
  useEffect
} from 'preact/hooks';

export function useDebounce(callback, debounceFn) {
  const debouncedCallback = useCallback(debounceFn(callback), [ callback, debounceFn ]);

  // make sure previous call is not stalled
  useEffect(() => {
    return () => {
      debouncedCallback.cancel?.();
    };
  }, [ debouncedCallback ]);

  return debouncedCallback;
}
