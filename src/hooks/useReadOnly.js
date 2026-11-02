import {
  useContext
} from 'preact/hooks';

import {
  ReadOnlyContext
} from '../context';

/**
 * Check whether the properties panel is in read-only mode.
 *
 * @example
 * ```jsx
 * function CustomEntry(props) {
 *   const readOnly = useReadOnly();
 * }
 * ```
 *
 * @returns {boolean}
 */
export function useReadOnly() {
  return useContext(ReadOnlyContext);
}

/**
 * Check whether an entry is disabled, either on its own
 * or because the properties panel is read-only.
 *
 * @param {boolean} [disabled]
 *
 * @returns {boolean}
 */
export function useDisabled(disabled) {
  const readOnly = useReadOnly();

  return !!disabled || readOnly;
}
