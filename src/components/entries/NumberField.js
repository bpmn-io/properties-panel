import Description from './Description';
import Tooltip from './Tooltip';

import {
  useEffect,
  useMemo,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import { isFunction } from 'min-dash';

import {
  useError
} from '../../hooks';

export function NumberField(props) {

  const {
    debounce,
    disabled,
    displayLabel = true,
    id,
    inputRef,
    label,
    max,
    min,
    onInput,
    step,
    value = '',
    onFocus,
    onBlur,
    tooltip
  } = props;

  const [ localValue, setLocalValue ] = useState(value);

  const handleInputCallback = useMemo(() => {
    return debounce((target) => {

      if (target.validity.valid) {
        onInput(target.value ? parseFloat(target.value) : undefined);
      }
    });
  }, [ onInput, debounce ]);

  const handleInput = e => {
    handleInputCallback(e.target);
    setLocalValue(e.target.value);
  };

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    setLocalValue(value);
  }, [ value ]);

  return (
    <div class="bio-properties-panel-numberfield">
      {displayLabel && (
        <label for={ prefixId(id) } class="bio-properties-panel-label">
          <Tooltip value={ tooltip } forId={ id } element={ props.element }>
            { label }
          </Tooltip>
        </label>
      )}
      <input
        id={ prefixId(id) }
        ref={ inputRef }
        type="number"
        name={ id }
        spellCheck="false"
        autoComplete="off"
        disabled={ disabled }
        class="bio-properties-panel-input"
        max={ max }
        min={ min }
        onInput={ handleInput }
        onFocus={ onFocus }
        onBlur={ onBlur }
        step={ step }
        value={ localValue } />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Boolean} props.debounce
 * @param {String} props.description
 * @param {Boolean} props.disabled
 * @param {Object} props.element
 * @param {Function} props.getValue
 * @param {String} props.id
 * @param {String} props.label
 * @param {String} props.max
 * @param {String} props.min
 * @param {Function} props.setValue
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {String} props.step
 * @param {Function} props.validate
 */
export default function NumberFieldEntry(props) {
  const {
    debounce,
    description,
    disabled,
    element,
    getValue,
    id,
    label,
    max,
    min,
    setValue,
    step,
    onFocus,
    onBlur,
    validate,
    tooltip
  } = props;

  const globalError = useError(id);
  const [ localError, setLocalError ] = useState(null);

  let value = getValue(element);

  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;

      setLocalError(newValidationError);
    }
  }, [ value, validate ]);

  const onInput = (newValue) => {
    let newValidationError = null;

    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }

    setValue(newValue, newValidationError);
    setLocalError(newValidationError);
  };

  const error = globalError || localError;

  return (
    <div class={ classnames(
      'bio-properties-panel-entry',
      error ? 'has-error' : '') } data-entry-id={ id }>
      <NumberField
        debounce={ debounce }
        disabled={ disabled }
        id={ id }
        key={ element }
        label={ label }
        onFocus={ onFocus }
        onBlur={ onBlur }
        onInput={ onInput }
        max={ max }
        min={ min }
        step={ step }
        value={ value }
        tooltip={ tooltip }
      />
      { error && <div class="bio-properties-panel-error">{ error }</div> }
      <Description forId={ id } element={ element } value={ description } />
    </div>
  );
}

export function isEdited(node) {
  return node && !!node.value;
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${ id }`;
}
