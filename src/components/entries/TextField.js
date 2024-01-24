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
  useError,
  useShowEntryEvent
} from '../../hooks';

function Textfield(props) {

  const {
    debounce,
    disabled = false,
    id,
    label,
    onInput,
    onFocus,
    onBlur,
    value = '',
    tooltip
  } = props;

  const [ localValue, setLocalValue ] = useState(value || '');

  const ref = useShowEntryEvent(id);

  const handleInputCallback = useMemo(() => {
    return debounce((target) => onInput(target.value.length ? target.value : undefined));
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
    <div class="bio-properties-panel-textfield">
      <label for={ prefixId(id) } class="bio-properties-panel-label">
        <Tooltip value={ tooltip } forId={ id } element={ props.element }>
          { label }
        </Tooltip>
      </label>
      <input
        ref={ ref }
        id={ prefixId(id) }
        type="text"
        name={ id }
        spellCheck="false"
        autoComplete="off"
        disabled={ disabled }
        class="bio-properties-panel-input"
        onInput={ handleInput }
        onFocus={ onFocus }
        onBlur={ onBlur }
        value={ localValue } />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {string|import('preact').Component} props.tooltip
 * @param {Function} props.validate
 */
export default function TextfieldEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    disabled,
    label,
    getValue,
    setValue,
    validate,
    onFocus,
    onBlur,
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
    <div
      class={ classnames(
        'bio-properties-panel-entry',
        error ? 'has-error' : '')
      }
      data-entry-id={ id }>
      <Textfield
        debounce={ debounce }
        disabled={ disabled }
        id={ id }
        key={ element }
        label={ label }
        onInput={ onInput }
        onFocus={ onFocus }
        onBlur={ onBlur }
        value={ value }
        tooltip={ tooltip }
        element={ element } />
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