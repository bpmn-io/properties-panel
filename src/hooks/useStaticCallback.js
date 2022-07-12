import { useCallback, useRef } from 'preact/hooks';

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
 * @param {Function} callback function with changing reference
 * @returns {Function} static function reference
 */
export function useStaticCallback(callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  return useCallback(
    (...args) => callbackRef.current(...args),
    []
  );
}