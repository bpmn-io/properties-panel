import { useCallback, useRef } from 'preact/hooks';

export function useStaticCallback(callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    (...args) => callbackRef.current(...args),
    []
  );
}