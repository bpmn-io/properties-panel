import { useContext } from 'preact/hooks';

import { ErrorsContext } from '../context';

/**
 * Accesses the error of a single entry.
 *
 * Only reports diagnostics of severity <error>; warnings and infos are not
 * exposed here.
 *
 * @deprecated use `useDiagnostics` instead
 *
 * @param {String} id
 *
 * @returns {String|undefined}
 */
export function useError(id) {
  const { errors } = useContext(ErrorsContext);

  return errors[ id ];
}

/**
 * Accesses the errors of all entries, keyed by entry ID.
 *
 * Only reports diagnostics of severity <error>; warnings and infos are not
 * exposed here.
 *
 * @deprecated use `useAllDiagnostics` instead
 *
 * @returns {Object<String, String>}
 */
export function useErrors() {
  const { errors } = useContext(ErrorsContext);

  return errors;
}
