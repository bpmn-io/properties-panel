import { useContext } from 'preact/hooks';

import { ErrorsContext } from '../context';

/**
 * @typedef {Object} ErrorAction
 * @property {String} label - label of the action button
 * @property {String} [tooltip] - tooltip shown on hover/focus of the action button
 * @property {Function} onClick - callback invoked when the action is triggered
 */

/**
 * @typedef {String|{ message: String, action?: ErrorAction }} EntryError
 */

/**
 * @param {String} id
 * @returns {EntryError}
 */
export function useError(id) {
  const { errors } = useContext(ErrorsContext);

  return errors[ id ];
}

export function useErrors() {
  const { errors } = useContext(ErrorsContext);

  return errors;
}