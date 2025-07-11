import Description from '../Description';
import TemplatingEditor from '../templating/TemplatingEditor';

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import { forwardRef } from 'preact/compat';

import classnames from 'classnames';

import { isFunction, isString } from 'min-dash';

import {
  useDebounce,
  useError,
  useShowEntryEvent,
  useStaticCallback
} from '../../../hooks';

import FeelEditor from './FeelEditor';
import { FeelIndicator } from './FeelIndicator';
import FeelIcon from './FeelIcon';

import { EventContext, FeelLanguageContext } from '../../../context';

import { ToggleSwitch } from '../ToggleSwitch';

import { NumberField } from '../NumberField';
import Tooltip from '../Tooltip';

const noop = () => {};

/**
 * @typedef {'required'|'optional'|'static'} FeelType
 */

/**
 * @param {Object} props
 * @param {Boolean} props.debounce
 * @param {String} props.id
 * @param {Object} props.element
 * @param {String} props.label
 * @param {String} props.hostLanguage
 * @param {Function} props.onInput
 * @param {Function} props.onBlur
 * @param {Function} props.onError
 * @param {FeelType} [props.feel]
 * @param {String} props.value
 * @param {Boolean} [props.singleLine]
 * @param {Function} props.tooltipContainer
 * @param {Function | import('preact').Component} props.OptionalComponent
 * @param {Boolean} props.disabled
 * @param {Array} props.variables
 * @param {string} [props.placeholder]
 * @param {string | import('preact').Component} props.tooltip
 */
function FeelTextfield(props) {
  const {
    debounce,
    id,
    element,
    label,
    hostLanguage,
    onInput,
    onBlur,
    onError,
    placeholder,
    feel,
    value = '',
    disabled = false,
    variables,
    singleLine,
    tooltipContainer,
    OptionalComponent = OptionalFeelInput,
    tooltip
  } = props;

  const [ localValue, setLocalValue ] = useState(value);

  const editorRef = useShowEntryEvent(id);
  const containerRef = useRef();

  const feelActive = (isString(localValue) && localValue.startsWith('=')) || feel === 'required';
  const feelOnlyValue = (isString(localValue) && localValue.startsWith('=')) ? localValue.substring(1) : localValue;
  const feelLanguageContext = useContext(FeelLanguageContext);

  const [ focus, _setFocus ] = useState(undefined);

  const {
    eventBus
  } = useContext(EventContext);

  const [ isPopupOpen, setIsPopupOpen ] = useState(false);

  const setFocus = (offset = 0) => {
    const hasFocus = containerRef.current.contains(document.activeElement);

    // Keep caret position if it is already focused, otherwise focus at the end
    const position = hasFocus ? document.activeElement.selectionStart : Infinity;

    _setFocus(position + offset);
  };

  /**
   * @type { import('min-dash').DebouncedFunction }
   */
  const handleInputCallback = useDebounce(onInput, debounce);

  const handleInput = newValue => {

    // we don't commit empty FEEL expressions,
    // but instead serialize them as <undefined>
    const newModelValue = (newValue === '' || newValue === '=') ? undefined : newValue;

    handleInputCallback(newModelValue);
  };

  const handleFeelToggle = useStaticCallback(() => {
    if (feel === 'required') {
      return;
    }

    if (!feelActive) {
      setLocalValue('=' + localValue);
      handleInput('=' + localValue);
    } else {
      setLocalValue(feelOnlyValue);
      handleInput(feelOnlyValue);
    }
  });

  const handleLocalInput = (newValue) => {
    if (feelActive) {
      newValue = '=' + newValue;
    }

    if (newValue === localValue) {
      return;
    }

    setLocalValue(newValue);
    handleInput(newValue);

    if (!feelActive && isString(newValue) && newValue.startsWith('=')) {

      // focus is behind `=` sign that will be removed
      setFocus(-1);
    }
  };

  const handleOnBlur = (e) => {
    if (e.target.type === 'checkbox') {
      onInput(e.target.checked);
    } else {
      const trimmedValue = e.target.value.trim();
      onInput(trimmedValue);
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleLint = useStaticCallback((lint = []) => {

    const syntaxError = lint.some(report => report.type === 'Syntax Error');

    if (syntaxError) {
      onError('Unparsable FEEL expression.');
    } else {
      onError(undefined);
    }
  });

  const handleOpenPopup = (type = 'feel') => {
    const isOpen = eventBus.fire('propertiesPanel.openPopup', {
      element,
      entryId: id,
      hostLanguage,
      label,
      onInput: handleLocalInput,
      singleLine,
      sourceElement: editorRef.current,
      tooltipContainer,
      type,
      value: feelOnlyValue,
      variables,
      feelLanguageContext,
    });

    if (isOpen) {
      eventBus.once('propertiesPanelPopup.close', () => {
        setIsPopupOpen(false);
      });
    }

    setIsPopupOpen(isOpen === true);
  };

  useEffect(() => {
    if (typeof focus !== 'undefined') {
      editorRef.current.focus(focus);
      _setFocus(undefined);
    }
  }, [ focus ]);

  useEffect(() => {
    if (value === localValue) {
      return;
    }

    // External value change removed content => keep FEEL configuration
    if (!value) {
      setLocalValue(feelActive ? '=' : '');
      return;
    }

    setLocalValue(value);
  }, [ value ]);

  useEffect(() => {
    return () => {
      eventBus.fire('propertiesPanel.closePopup');
    };
  }, []);

  // copy-paste integration
  useEffect(() => {
    const copyHandler = event => {
      if (!feelActive) {
        return;
      }
      event.clipboardData.setData('application/FEEL', event.clipboardData.getData('text'));
    };

    const pasteHandler = event => {
      if (feelActive || isPopupOpen) {
        return;
      }

      const data = event.clipboardData.getData('application/FEEL');

      if (data) {
        setTimeout(() => {
          handleFeelToggle();
          setFocus();
        });
      }
    };
    containerRef.current.addEventListener('copy', copyHandler);
    containerRef.current.addEventListener('cut', copyHandler);
    containerRef.current.addEventListener('paste', pasteHandler);

    return () => {
      containerRef.current.removeEventListener('copy', copyHandler);
      containerRef.current.removeEventListener('cut', copyHandler);
      containerRef.current.removeEventListener('paste', pasteHandler);
    };
  }, [ containerRef, feelActive, handleFeelToggle, setFocus ]);

  return (
    <div class={ classnames(
      'bio-properties-panel-feel-entry',
      { 'feel-active': feelActive }
    ) }>
      <label for={ prefixId(id) } class="bio-properties-panel-label" onClick={ () => setFocus() }>
        <Tooltip value={ tooltip } forId={ id } element={ props.element }>
          {label}
        </Tooltip>
        <FeelIcon
          label={ label }
          feel={ feel }
          onClick={ handleFeelToggle }
          active={ feelActive }></FeelIcon>
      </label>

      <div class="bio-properties-panel-feel-container" ref={ containerRef }>
        <FeelIndicator
          active={ feelActive }
          disabled={ feel !== 'optional' || disabled }
          onClick={ handleFeelToggle }
        />
        {feelActive ?
          <FeelEditor
            name={ id }
            onInput={ handleLocalInput }
            contentAttributes={ { 'id': prefixId(id), 'aria-label': label } }
            disabled={ disabled }
            popupOpen={ isPopupOpen }
            onFeelToggle={ () => {
              handleFeelToggle();
              setFocus(true);
            } }
            onLint={ handleLint }
            onOpenPopup={ handleOpenPopup }
            placeholder={ placeholder }
            value={ feelOnlyValue }
            variables={ variables }
            feelLanguageContext={ feelLanguageContext }
            ref={ editorRef }
            tooltipContainer={ tooltipContainer }
          /> :
          <OptionalComponent
            { ...props }
            popupOpen={ isPopupOpen }
            onInput={ handleLocalInput }
            onBlur={ handleOnBlur }
            contentAttributes={ { 'id': prefixId(id), 'aria-label': label } }
            value={ localValue }
            ref={ editorRef }
            onOpenPopup={ handleOpenPopup }
            containerRef={ containerRef }
          />
        }
      </div>
    </div>
  );
}


const OptionalFeelInput = forwardRef((props, ref) => {
  const {
    id,
    disabled,
    onInput,
    value,
    onFocus,
    onBlur,
    placeholder
  } = props;

  const inputRef = useRef();

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: (position) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      input.focus();
      if (typeof position === 'number') {
        if (position > value.length) {
          position = value.length;
        }
        input.setSelectionRange(position, position);
      }

    }
  };

  return <input
    id={ prefixId(id) }
    type="text"
    ref={ inputRef }
    name={ id }
    spellCheck="false"
    autoComplete="off"
    disabled={ disabled }
    class="bio-properties-panel-input"
    onInput={ e => onInput(e.target.value) }
    onFocus={ onFocus }
    onBlur={ onBlur }
    placeholder={ placeholder }
    value={ value || '' } />;
});

const OptionalFeelNumberField = forwardRef((props, ref) => {
  const {
    id,
    debounce,
    disabled,
    onInput,
    value,
    min,
    max,
    step,
    onFocus,
    onBlur
  } = props;

  const inputRef = useRef();

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: (position) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      input.focus();
      if (typeof position === 'number' && position !== Infinity) {
        if (position > value.length) {
          position = value.length;
        }
        input.setSelectionRange(position, position);
      }

    }
  };

  return <NumberField
    id={ id }
    debounce={ debounce }
    disabled={ disabled }
    displayLabel={ false }
    inputRef={ inputRef }
    max={ max }
    min={ min }
    onInput={ onInput }
    step={ step }
    value={ value }
    onFocus={ onFocus }
    onBlur={ onBlur }
  />;
});

const OptionalFeelTextArea = forwardRef((props, ref) => {
  const {
    id,
    disabled,
    onInput,
    value,
    onFocus,
    onBlur,
    placeholder
  } = props;

  const inputRef = useRef();

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: () => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      input.focus();
      input.setSelectionRange(0, 0);
    }
  };

  return <textarea
    id={ prefixId(id) }
    type="text"
    ref={ inputRef }
    name={ id }
    spellCheck="false"
    autoComplete="off"
    disabled={ disabled }
    class="bio-properties-panel-input"
    onInput={ e => onInput(e.target.value) }
    onFocus={ onFocus }
    onBlur={ onBlur }
    placeholder={ placeholder }
    value={ value || '' }
    data-gramm="false"
  />;
});

const OptionalFeelToggleSwitch = forwardRef((props, ref) => {
  const {
    id,
    onInput,
    value,
    onFocus,
    onBlur,
    switcherLabel
  } = props;

  const inputRef = useRef();

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: () => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      input.focus();
    }
  };

  return <ToggleSwitch
    id={ id }
    value={ value }
    inputRef={ inputRef }
    onInput={ onInput }
    onFocus={ onFocus }
    onBlur={ onBlur }
    switcherLabel={ switcherLabel } />;
});

const OptionalFeelCheckbox = forwardRef((props, ref) => {
  const {
    id,
    disabled,
    onInput,
    value,
    onFocus,
    onBlur
  } = props;

  const inputRef = useRef();

  const handleChange = ({ target }) => {
    onInput(target.checked);
  };

  // To be consistent with the FEEL editor, set focus at start of input
  // this ensures clean editing experience when switching with the keyboard
  ref.current = {
    focus: () => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      input.focus();
    }
  };

  return <input
    ref={ inputRef }
    id={ prefixId(id) }
    name={ id }
    onFocus={ onFocus }
    onBlur={ onBlur }
    type="checkbox"
    class="bio-properties-panel-input"
    onChange={ handleChange }
    checked={ value }
    disabled={ disabled } />;
});


/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {FeelType} [props.feel]
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Array} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {string} [props.placeholder]
 * @param {string|import('preact').Component} props.tooltip
 */
export default function FeelEntry(props) {
  const {
    element,
    id,
    description,
    debounce,
    disabled,
    feel,
    label,
    getValue,
    setValue,
    tooltipContainer,
    hostLanguage,
    singleLine,
    validate,
    show = noop,
    example,
    variables,
    onFocus,
    onBlur,
    placeholder,
    tooltip
  } = props;

  const [ validationError, setValidationError ] = useState(null);
  const [ localError, setLocalError ] = useState(null);

  let value = getValue(element);

  useEffect(() => {
    if (isFunction(validate)) {
      const newValidationError = validate(value) || null;

      setValidationError(newValidationError);
    }
  }, [ value, validate ]);

  const onInput = useStaticCallback((newValue) => {
    const value = getValue(element);
    let newValidationError = null;

    if (isFunction(validate)) {
      newValidationError = validate(newValue) || null;
    }

    // don't create multiple commandStack entries for the same value
    if (newValue !== value) {
      setValue(newValue, newValidationError);
    }

    setValidationError(newValidationError);
  });

  const onError = useCallback(err => {
    setLocalError(err);
  }, []);

  const temporaryError = useError(id);

  const error = temporaryError || localError || validationError;

  return (
    <div
      class={ classnames(
        props.class,
        'bio-properties-panel-entry',
        error ? 'has-error' : '')
      }
      data-entry-id={ id }>
      <FeelTextfield
        { ...props }
        debounce={ debounce }
        disabled={ disabled }
        feel={ feel }
        id={ id }
        key={ element }
        label={ label }
        onInput={ onInput }
        onError={ onError }
        onFocus={ onFocus }
        onBlur={ onBlur }
        placeholder={ placeholder }
        example={ example }
        hostLanguage={ hostLanguage }
        singleLine={ singleLine }
        show={ show }
        value={ value }
        variables={ variables }
        tooltipContainer={ tooltipContainer }
        OptionalComponent={ props.OptionalComponent }
        tooltip={ tooltip } />
      {error && <div class="bio-properties-panel-error">{error}</div>}
      <Description forId={ id } element={ element } value={ description } />
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
 * @param {String} props.max
 * @param {String} props.min
 * @param {String} props.step
 * @param {FeelType} [props.feel]
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Array} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 */
export function FeelNumberEntry(props) {
  return <FeelEntry class="bio-properties-panel-feel-number" OptionalComponent={ OptionalFeelNumberField } { ...props } />;
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {FeelType} [props.feel]
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Array} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 * @param {string} [props.placeholder]
 */
export function FeelTextAreaEntry(props) {
  return <FeelEntry class="bio-properties-panel-feel-textarea" OptionalComponent={ OptionalFeelTextArea } { ...props } />;
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {FeelType} [props.feel]
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Array} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 */
export function FeelToggleSwitchEntry(props) {
  return <FeelEntry class="bio-properties-panel-feel-toggle-switch" OptionalComponent={ OptionalFeelToggleSwitch } { ...props } />;
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {FeelType} [props.feel]
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Array} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 */
export function FeelCheckboxEntry(props) {
  return <FeelEntry class="bio-properties-panel-feel-checkbox" OptionalComponent={ OptionalFeelCheckbox } { ...props } />;
}

/**
 * @param {Object} props
 * @param {Object} props.element
 * @param {String} props.id
 * @param {String} props.description
 * @param {String} props.hostLanguage
 * @param {Boolean} props.singleLine
 * @param {Boolean} props.debounce
 * @param {Boolean} props.disabled
 * @param {FeelType} [props.feel]
 * @param {String} props.label
 * @param {Function} props.getValue
 * @param {Function} props.setValue
 * @param {Function} props.tooltipContainer
 * @param {Function} props.validate
 * @param {Function} props.show
 * @param {Function} props.example
 * @param {Array} props.variables
 * @param {Function} props.onFocus
 * @param {Function} props.onBlur
 */
export function FeelTemplatingEntry(props) {
  return <FeelEntry class="bio-properties-panel-feel-templating" OptionalComponent={ TemplatingEditor } { ...props } />;
}

export function isEdited(node) {
  if (!node) {
    return false;
  }

  if (node.type === 'checkbox') {
    return !!node.checked || node.classList.contains('edited');
  }

  return !!node.value || node.classList.contains('edited');
}


// helpers /////////////////

function prefixId(id) {
  return `bio-properties-panel-${id}`;
}
