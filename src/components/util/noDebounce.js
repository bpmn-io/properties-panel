/**
 * Debounce function that does not debounce. Used as a fallback if no
 * `debounce` is provided, i.e. in read-only mode where no edits happen.
 *
 * @param {Function} fn
 *
 * @returns {Function}
 */
export default function noDebounce(fn) {
  return fn;
}
