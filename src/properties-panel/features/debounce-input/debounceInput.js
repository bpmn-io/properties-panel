import {
  debounce,
  isNumber
} from 'min-dash';

const DEFAULT_DEBOUNCE_TIME = 300;

export default function debounceInput(debounceDelay) {
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
