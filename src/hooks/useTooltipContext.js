import {
  useContext
} from 'preact/hooks';

import {
  TooltipContext
} from '../context';

/**
 * Accesses the global TooltipContext and returns a tooltip for a given id and element.
 *
 * @example
 * ```jsx
 * function TextField(props) {
 *   const tooltip = useTooltipContext('input1', element);
 * }
 * ```
 *
 * @param {string} id
 * @param {object} element
 *
 * @returns {string}
 */
export function useTooltipContext(id, element) {
  const {
    getTooltipForId
  } = useContext(TooltipContext);

  return getTooltipForId(id, element);
}
