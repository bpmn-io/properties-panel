import {
  useCallback,
  useEffect
} from 'preact/hooks';


/**
 * @type { import('min-dash').DebouncedFunction }
 */
export function useDebounce(callback, debounceFn) {
  const debouncedCallback = useCallback(debounceFn(callback), [ callback, debounceFn ]);

  useEffect(() => {
    return () => {
      debouncedCallback.cancel?.();
    };
  }, [ debouncedCallback ]);

  return debouncedCallback;
}
