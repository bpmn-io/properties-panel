import Description from './Description';

import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
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
import { OpenPopupButton } from '../OpenPopupButton';
import { EventContext } from '../../context';
import { isCmdWithChar } from '../util/keyboardUtils';
import translateFallback from '../util/translateFallback';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

function resizeToContents(element) {
  element.style.height = 'auto';

  // a 2px pixel offset is required to prevent scrollbar from
  // appearing on OS with a full length scroll bar (Windows/Linux)
  element.style.height = `${ element.scrollHeight + 2 }px`;
}

function TextArea(props) {

  const {
    id,
    element,
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
    tooltip,
    translate = translateFallback
  } = props;

  const [ localValue, setLocalValue ] = useState(value);

  const ref = useShowEntryEvent(id);
  const containerRef = useRef();

  const { eventBus } = useContext(EventContext);

  const [ isPopupOpen, setIsPopupOpen ] = useState(false);

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
      handleInput.flush?.();
    }
  };

  const handlePopupInput = newValue => {
    if (newValue === localValue) {
      return;
    }

    setLocalValue(newValue);
    handleInput(newValue);
  };

  const handleOpenPopup = () => {
    const isOpen = eventBus.fire('propertiesPanel.openPopup', {
      element,
      entryId: id,
      label,
      onInput: handlePopupInput,
      sourceElement: ref.current,
      value: localValue
    });

    if (isOpen) {
      eventBus.once('propertiesPanelPopup.close', () => {
        handleInput.flush?.();
        setIsPopupOpen(false);
      });
    }

    setIsPopupOpen(isOpen === true);
  };

  useEffect(() => {
    return () => {
      eventBus && eventBus.fire('propertiesPanel.closePopup');
    };
  }, []);

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
        <Tooltip value={ tooltip } forId={ id } element={ element }>
          { label }
        </Tooltip>
      </label>
      <div
        class={ classnames(
          'bio-properties-panel-textarea-container',
          isPopupOpen ? 'popupOpen' : null)
        }
        ref={ containerRef }
      >
        {
          isPopupOpen &&
            <div class="bio-properties-panel-textarea__open-popup-placeholder">
              { translate('Opened in editor') }
            </div>
        }
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
        {
          eventBus && !disabled &&
            <OpenPopupButton
              onClick={ handleOpenPopup }
              translate={ translate }
            />
        }
      </div>
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
 * @param {Function} [props.translate]
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
    tooltip,
    translate
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

    if (newValue !== value) {
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
        translate={ translate }
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
