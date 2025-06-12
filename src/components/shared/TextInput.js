import { useCallback } from 'preact/hooks';
import { isFunction } from 'min-dash';
import { useDebounce } from '../../hooks';

export function TextInput({
  debounce,
  element,
  id,
  getValue,
  onBlur,
  setValue,
  validate,
  Component,
  ...props
}) {
  const modelValue = getValue(element);

  const setModelValue = useCallback((newValue, error) => {
    if (isFunction(validate)) {
      error = validate(newValue) || null;
    }

    setValue(newValue, error);
  }, [ setValue, validate ]);

  const debouncedSetValue = useDebounce(setModelValue, debounce);

  const handleInput = useCallback(newValue => {
    if (newValue !== modelValue) {
      debouncedSetValue(newValue);
    }
  }, [ modelValue, debouncedSetValue ]);

  const handleBlur = useCallback(value => {
    const newValue = value.trim?.() || value;

    if (newValue !== modelValue) {
      setModelValue(newValue);
    }

    if (isFunction(onBlur)) {
      onBlur(newValue);
    }
  }, [ modelValue, setModelValue ]);

  return (
    <Component
      { ...props }
      debounce={ debounce }
      element={ element }
      id={ id }
      onInput={ handleInput }
      onBlur={ handleBlur }
      value={ modelValue }
    />
  );
}
