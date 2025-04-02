import {
  debounce,
  isNumber
} from 'min-dash';

const DEFAULT_DEBOUNCE_TIME = 300;

/**
 * Creates a debounced version of a function, delaying its execution based on `debounceDelay`.
 *
 * - If `debounceDelay` is `false`, the function executes immediately without debouncing.
 * - If a number is provided, the function execution is delayed by the given time in milliseconds.
 *
 * @param {Boolean | Number} debounceDelay
 *
 * @return {Function} _debounceInput
 *
 * @example
 * const debouncedFn = debounceInput()(fn);
 * debouncedFn(); // Executes after 300ms (default) if no further calls occur.
 */
export default function debounceInput(debounceDelay) {

  /**
   * Applies debounce to the provided function based on the specified delay.
   *
   * @param {Function} fn
   * @return { import('min-dash').DebouncedFunction }
   */

  return function _debounceInput(fn) {
    if (debounceDelay !== false) {

      var debounceTime =
        isNumber(debounceDelay) ?
          debounceDelay :
          DEFAULT_DEBOUNCE_TIME;

      return debounce(fn, debounceTime);
    } else {
      return fn;
    }
  };
}

debounceInput.$inject = [ 'config.debounceInput' ];
