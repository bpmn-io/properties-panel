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

import Description from './Description';
import Tooltip from './Tooltip';

import { Input } from '@camunda/design-system/preact/components/input';
import { Label } from '@camunda/design-system/preact/components/label';

const prefixId = (id) => `bio-properties-panel-${ id }`;


function Textfield(props) {
  const {
    debounce,
    disabled = false,
    element,
    id,
    label,
    onInput: commitValue,
    onFocus,
    onBlur,
    onPaste,
    placeholder,
    tooltip,
    value = ''
  } = props;

  const [ localValue, setLocalValue ] = useState(value || '');

  const ref = useShowEntryEvent(id);

  const onInput = useCallback((newValue) => {
    const newModelValue = newValue === '' ? undefined : newValue;
    commitValue(newModelValue);
  }, [ commitValue ]);

  const handleInput = useDebounce(onInput, debounce);

  const handleOnBlur = (e) => {
    const trimmedValue = e.target.value.trim();

    handleInput.cancel?.();
    onInput(trimmedValue);
    setLocalValue(trimmedValue);

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleOnPaste = (e) => {
    const input = e.target;
    const isFieldEmpty = !input.value;
    const isAllSelected = input.selectionStart === 0 && input.selectionEnd === input.value.length;

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

    if (onPaste) {
      onPaste(e);
    }
  };

  const handleLocalInput = (e) => {
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

  const handleOnKeyDown = (e) => {
    if (isCmdWithChar(e)) {
      handleInput.flush?.();
    }
  };

  return (
    <div class="bio-properties-panel-textfield">
      <Label htmlFor={ prefixId(id) } className="bio-properties-panel-label">
        <Tooltip value={ tooltip } forId={ id } element={ element }>
          { label }
        </Tooltip>
      </Label>
      <Input
        ref={ ref }
        id={ prefixId(id) }
        type="text"
        name={ id }
        spellCheck="false"
        autoComplete="off"
        disabled={ disabled }
        onInput={ handleLocalInput }
        onFocus={ onFocus }
        onKeyDown={ handleOnKeyDown }
        onBlur={ handleOnBlur }
        onPaste={ handleOnPaste }
        placeholder={ placeholder }
        value={ localValue }
      />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} [props.description]
 * @param {Boolean} [props.debounce]
 * @param {Boolean} [props.disabled]
 * @param {String} [props.label]
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} [props.onFocus]
 * @param {Function} [props.onBlur]
 * @param {Function} [props.validate]
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

  const value = getValue(element);

  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;

      setLocalError(newValidationError);
    }
  }, [ value, validate ]);

  const onInput = useStaticCallback((newValue) => {
    const currentValue = getValue(element);

    if (newValue !== currentValue) {
      let newValidationError = null;

      if (isFunction(validate)) {
        newValidationError = validate(newValue) || null;
      }

      setValue(newValue, newValidationError);
      setLocalError(newValidationError);
    }
  });

  const error = globalError || localError;

  return (
    <div
      class={ classnames(
        'bio-properties-panel-entry',
        error ? 'has-error' : ''
      ) }
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
        element={ element }
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
