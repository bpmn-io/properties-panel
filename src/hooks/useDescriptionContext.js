import {
  useContext
} from 'preact/hooks';

import {
  DescriptionContext
} from '../context';

/**
 * Accesses the global DescriptionContext and returns a description for a given id and element.
 *
 * @example
 * ```jsx
 * function TextField(props) {
 *   const description = useDescriptionContext('input1', element);
 * }
 * ```
 *
 * @param {string} id
 * @param {object} element
 *
 * @returns {string}
 */
export function useDescriptionContext(id, element) {
  const {
    getDescriptionForId
  } = useContext(DescriptionContext);

  return getDescriptionForId(id, element);
}
