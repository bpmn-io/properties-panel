import {
  useContext
} from 'preact/hooks';

import {
  AutoCompletionContext
} from '../context';

/**
 * @returns {Function}
 */
export function useAutoCompletionContext() {
  const {
    getCompletions
  } = useContext(AutoCompletionContext);

  return getCompletions || (() => []);
}
