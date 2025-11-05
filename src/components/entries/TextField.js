import Description from './Description';
import Tooltip from './Tooltip';

import {
  useCallback,
  useEffect,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import { isFunction } from 'min-dash';

import {
  useDebounce,
  useError,
  useShowEntryEvent,
  useStaticCallback
} from '../../hooks';
import { isCmdWithChar } from '../util/keyboardUtils';

function Textfield(props) {

  const {
    debounce,
    disabled = false,
    id,
    label,
    onInput: commitValue,
    onFocus,
    onBlur,
    onPaste,
    placeholder,
    value = '',
    tooltip
  } = props;

  const [ localValue, setLocalValue ] = useState(value || '');

  const ref = useShowEntryEvent(id);

  const onInput = useCallback(newValue => {
    const newModelValue = newValue === '' ? undefined : newValue;
    commitValue(newModelValue);
  }, [ commitValue ]);

  /**
   * @type { import('min-dash').DebouncedFunction }
   */
  const handleInput = useDebounce(onInput, debounce);

  const handleOnBlur = e => {
    const trimmedValue = e.target.value.trim();

    // trim and commit on blur
    handleInput.cancel?.();
    onInput(trimmedValue);
    setLocalValue(trimmedValue);

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleOnPaste = e => {
    const input = e.target;
    const isFieldEmpty = !input.value;
    const isAllSelected = input.selectionStart === 0 && input.selectionEnd === input.value.length;

    // Trim and handle paste if field is empty or all content is selected (overwrite)
    if (isFieldEmpty || isAllSelected) {
      const trimmedValue = e.clipboardData.getData('text').trim();

      setLocalValue(trimmedValue);
      handleInput(trimmedValue);

      if (onPaste) {
        onPaste(e);
      }

      e.preventDefault();
      return;
    }

    // Allow default paste behavior for normal text editing
    if (onPaste) {
      onPaste(e);
    }
  };

  const handleLocalInput = e => {

    if (e.target.value === localValue) {
      return;
    }

    setLocalValue(e.target.value);
    handleInput(e.target.value);
  };

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    setLocalValue(value);
  }, [ value ]);

  const handleOnKeyDown = e => {
    if (isCmdWithChar(e)) {
      handleInput.flush();
    }
  };

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
        onInput={ handleLocalInput }
        onFocus={ onFocus }
        onKeyDown={ handleOnKeyDown }
        onBlur={ handleOnBlur }
        onPaste={ handleOnPaste }
        placeholder={ placeholder }
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
    onPaste,
    placeholder,
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

  const onInput = useStaticCallback((newValue) => {
    const value = getValue(element);
    let newValidationError = null;

    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }

    if (newValue !== value) {
      setValue(newValue, newValidationError);
    }

    setLocalError(newValidationError);
  });


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
        onPaste={ onPaste }
        placeholder={ placeholder }
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