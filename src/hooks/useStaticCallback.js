import { useCallback, useLayoutEffect, useRef } from 'preact/hooks';

/**
 * Creates a static function reference with changing body.
 * This is necessary when external libraries require a callback function
 * that has references to state variables.
 *
 * Usage:
 * const callback = useStaticCallback((val) => {val === currentState});
 *
 * The `callback` reference is static and can be safely used in external
 * libraries or as a prop that does not cause rerendering of children.
 *
 * The ref update is deferred to useLayoutEffect to prevent stale-closure
 * bugs when Chrome fires blur on elements removed during re-render.
 *
 * @param {Function} callback function with changing reference
 * @returns {Function} static function reference
 */
export function useStaticCallback(callback) {
  const callbackRef = useRef(callback);

  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    (...args) => callbackRef.current(...args),
    []
  );
}