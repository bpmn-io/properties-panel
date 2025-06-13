import {
  debounce as _debounce,
  isNumber
} from 'min-dash';

const DEFAULT_DEBOUNCE_TIME = 600;

/**
 * Creates a debounced version of a function, delaying its execution based on `debounceDelay`.
 *
 * - If `debounceDelay` is `false`, the function executes immediately without debouncing.
 * - If a number is provided, the function execution is delayed by the given time in milliseconds.
 *
 * @param { Boolean | Number } [debounceDelay=300]
 *
 * @example
 * const debounce = debounceInput();
 * const debouncedFn = debounce(fn);
 *
 * debouncedFn(); // Executes after 300ms (default) if no further calls occur.
 */
export default function debounceInput(debounceDelay) {

  /**
   * Applies debounce to the provided function, with a previously setup delay.
   *
   * @template { (...args: any[]) => any } T
   *
   * @param {T} fn
   *
   * @return { (...p: Parameters<T>) => any }
   */
  return function debounce(fn) {
    if (debounceDelay === false) {
      return fn;
    }

    var debounceTime =
      isNumber(debounceDelay) ?
        debounceDelay :
        DEFAULT_DEBOUNCE_TIME;

    return _debounce(fn, debounceTime);
  };
}

debounceInput.$inject = [ 'config.debounceInput' ];
