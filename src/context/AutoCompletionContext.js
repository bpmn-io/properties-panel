import {
  createContext
} from 'preact';

/**
 * @typedef { {
 *   value: string,
 *   text?: string
 * } } Completion
 */

const AutocompletionContext = createContext({

  /**
   * Get completions for value.
   *
   * @param {string} value
   * @param {string} id
   * @param {Object} element
   *
   * @param {Array<Completion>}
   */
  getCompletions: (value, id, element) => {
    return [];
  }
});

export default AutocompletionContext;
