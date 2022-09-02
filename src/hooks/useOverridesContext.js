import {
  useContext
} from 'preact/hooks';

import {
  OverridesContext
} from '../context';

/**
 * Accesses the global OverridesContext and returns custom handlers for a given id and element.
 *
 * @example
 * ```jsx
 * function TextField(props) {
 *   const { getValue } = OverridesContext('input1');
 * }
 * ```
 *
 * @param {string} id
 *
 * @returns {string}
 */
export function useOverridesContext(id) {
  const {
    getOverridesForId
  } = useContext(OverridesContext);

  return getOverridesForId(id);
}
