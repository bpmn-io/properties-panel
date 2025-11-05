import Description from './Description';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import {
  useDebounce,
  useElementVisible,
  useError,
  useShowEntryEvent,
  useStaticCallback
} from '../../hooks';

import { isFunction } from 'min-dash';
import Tooltip from './Tooltip';
import { isCmdWithChar } from '../util/keyboardUtils';

function resizeToContents(element) {
  element.style.height = 'auto';

  // a 2px pixel offset is required to prevent scrollbar from
  // appearing on OS with a full length scroll bar (Windows/Linux)
  element.style.height = `${ element.scrollHeight + 2 }px`;
}

function TextArea(props) {

  const {
    id,
    label,
    debounce,
    onInput: commitValue,
    value = '',
    disabled,
    monospace,
    onFocus,
    onBlur,
    onPaste,
    autoResize = true,
    placeholder,
    rows = autoResize ? 1 : 2,
    tooltip
  } = props;

  const [ localValue, setLocalValue ] = useState(value);

  const ref = useShowEntryEvent(id);

  const onInput = useCallback(newValue => {
    const newModelValue = newValue === '' ? undefined : newValue;
    commitValue(newModelValue);
  }, [ commitValue ]);

  const visible = useElementVisible(ref.current);

  /**
   * @type { import('min-dash').DebouncedFunction }
   */
  const handleInput = useDebounce(onInput, debounce);

  const handleLocalInput = e => {
    autoResize && resizeToContents(e.target);

    if (e.target.value === localValue) {
      return;
    }

    setLocalValue(e.target.value);
    handleInput(e.target.value);
  };

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

    // Trim and handle paste if field is empty or all content is selected
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

  const handleOnKeyDown = e => {
    if (isCmdWithChar(e)) {
      handleInput.flush();
    }
  };

  useLayoutEffect(() => {
    autoResize && resizeToContents(ref.current);
  }, []);

  useLayoutEffect(() => {
    visible && autoResize && resizeToContents(ref.current);
  }, [ visible ]);

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    setLocalValue(value);
  }, [ value ]);

  return (
    <div class="bio-properties-panel-textarea">
      <label for={ prefixId(id) } class="bio-properties-panel-label">
        <Tooltip value={ tooltip } forId={ id } element={ props.element }>
          { label }
        </Tooltip>
      </label>
      <textarea
        ref={ ref }
        id={ prefixId(id) }
        name={ id }
        spellCheck="false"
        class={ classnames(
          'bio-properties-panel-input',
          monospace ? 'bio-properties-panel-input-monospace' : '',
          autoResize ? 'auto-resize' : '')
        }
        onInput={ handleLocalInput }
        onFocus={ onFocus }
        onKeyDown={ handleOnKeyDown }
        onBlur={ handleOnBlur }
        onPaste={ handleOnPaste }
        placeholder={ placeholder }
        rows={ rows }
        value={ localValue }
        disabled={ disabled }
        data-gramm="false"
      />
    </div>
  );
}

/**
 * @param {object} props
 * @param {object} props.element
 * @param {string} props.id
 * @param {string} props.description
 * @param {boolean} props.debounce
 * @param {string} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {Function} props.onPaste
 * @param {number} props.rows
 * @param {boolean} props.monospace
 * @param {Function} [props.validate]
 * @param {boolean} [props.disabled]
 */
export default function TextAreaEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    label,
    getValue,
    setValue,
    rows,
    monospace,
    disabled,
    validate,
    onFocus,
    onBlur,
    onPaste,
    placeholder,
    autoResize,
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
      <TextArea
        id={ id }
        key={ element }
        label={ label }
        value={ value }
        onInput={ onInput }
        onFocus={ onFocus }
        onBlur={ onBlur }
        onPaste={ onPaste }
        rows={ rows }
        debounce={ debounce }
        monospace={ monospace }
        disabled={ disabled }
        placeholder={ placeholder }
        autoResize={ autoResize }
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
