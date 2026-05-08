import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState
} from 'preact/hooks';

import classnames from 'classnames';

import { isFunction } from 'min-dash';

import {
  useDebounce,
  useElementVisible,
  useError,
  useShowEntryEvent,
  useStaticCallback
} from '../../hooks';

import { isCmdWithChar } from '../util/keyboardUtils';

import Description from './Description';
import Tooltip from './Tooltip';

import { Textarea } from '@camunda/design-system/preact/components/textarea';
import { Label } from '@camunda/design-system/preact/components/label';

const prefixId = (id) => `bio-properties-panel-${ id }`;

function resizeToContents(element) {
  if (!element) return;

  // Clear any previous inline height so we measure the natural content height
  // against the CSS-defined min-height — not against our own previous setting.
  element.style.height = '';

  // If the content fits within the CSS-controlled box (no scrollbar needed),
  // leave the inline style off — the textarea sizes via min-h-9 / rows, same
  // as Input. We only force an explicit height when the content actually
  // overflows and we need to grow.
  if (element.scrollHeight <= element.clientHeight) {
    return;
  }

  // a 2px pixel offset is required to prevent scrollbar from
  // appearing on OS with a full length scroll bar (Windows/Linux)
  element.style.height = `${ element.scrollHeight + 2 }px`;
}


function TextAreaInner(props) {
  const {
    debounce,
    disabled,
    element,
    id,
    label,
    monospace,
    onInput: commitValue,
    onFocus,
    onBlur,
    onPaste,
    autoResize = true,
    placeholder,
    rows = autoResize ? 1 : 2,
    tooltip,
    value = ''
  } = props;

  const [ localValue, setLocalValue ] = useState(value);

  const ref = useShowEntryEvent(id);

  const onInput = useCallback((newValue) => {
    const newModelValue = newValue === '' ? undefined : newValue;
    commitValue(newModelValue);
  }, [ commitValue ]);

  const visible = useElementVisible(ref.current);

  const handleInput = useDebounce(onInput, debounce);

  const handleLocalInput = (e) => {
    autoResize && resizeToContents(e.target);

    if (e.target.value === localValue) {
      return;
    }

    setLocalValue(e.target.value);
    handleInput(e.target.value);
  };

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

  const handleOnKeyDown = (e) => {
    if (isCmdWithChar(e)) {
      handleInput.flush?.();
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
      <Label htmlFor={ prefixId(id) } className="bio-properties-panel-label">
        <Tooltip value={ tooltip } forId={ id } element={ element }>
          { label }
        </Tooltip>
      </Label>
      <Textarea
        ref={ ref }
        id={ prefixId(id) }
        name={ id }
        spellCheck="false"
        className={ classnames(
          monospace ? 'bio-properties-panel-input-monospace' : '',
          autoResize ? 'auto-resize' : ''
        ) }
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
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} [props.description]
 * @param {Boolean} [props.debounce]
 * @param {String} [props.label]
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} [props.onFocus]
 * @param {Function} [props.onBlur]
 * @param {Function} [props.onPaste]
 * @param {Number} [props.rows]
 * @param {Boolean} [props.monospace]
 * @param {Function} [props.validate]
 * @param {Boolean} [props.disabled]
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
      <TextAreaInner
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
        element={ element }
      />
      { error && <div class="bio-properties-panel-error">{ error }</div> }
      <Description forId={ id } element={ element } value={ description } />
    </div>
  );
}

export function isEdited(node) {
  return node && !!node.value;
}
